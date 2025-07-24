from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login
from django.db.models import Q
from django.core.cache import cache
from .models import Product, Category, Cart, CartItem, Order, OrderItem, User
from .serializers import (
    ProductSerializer, ProductListSerializer, CategorySerializer,
    CartSerializer, CartItemSerializer, OrderSerializer,
    UserRegistrationSerializer, UserLoginSerializer
)
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

@api_view(['POST'])
def sync_user(request):
    data = request.data
    uid = data.get('uid')
    email = data.get('email')
    name = data.get('name')  # or first_name, last_name separately

    if not uid or not email:
        return Response({'error': 'Missing uid or email'}, status=400)

    user, created = User.objects.get_or_create(
        id=uid,
        defaults={
            'email': email,
            'username': email,
            'first_name': name or '',
        }
    )
    return Response({'status': 'synced', 'created': created}, status=200)


# Product Views
class ProductListView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    
    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True).select_related('category')
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        
        # Category filter
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)
        
        # Featured filter
        featured = self.request.query_params.get('featured')
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)
        
        # Ordering
        ordering = self.request.query_params.get('ordering', '-created_at')
        if ordering in ['price', '-price', 'name', '-name', 'created_at', '-created_at']:
            queryset = queryset.order_by(ordering)
        
        return queryset

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True).select_related('category')
    serializer_class = ProductSerializer
    lookup_field = 'id'

class FeaturedProductsView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True, is_featured=True).select_related('category')[:4]
    serializer_class = ProductListSerializer

# Category Views
class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

# Cart Views
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_cart(request):
    cart, created = Cart.objects.get_or_create(user=request.user)
    serializer = CartSerializer(cart)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_to_cart(request):
    cart, created = Cart.objects.get_or_create(user=request.user)
    
    product_id = request.data.get('product_id')
    size = request.data.get('size')
    quantity = int(request.data.get('quantity', 1))
    
    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if size not in product.sizes:
        return Response({'error': 'Invalid size'}, status=status.HTTP_400_BAD_REQUEST)
    
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        size=size,
        defaults={'quantity': quantity}
    )
    
    if not created:
        cart_item.quantity += quantity
        cart_item.save()
    
    return Response({'message': 'Item added to cart'}, status=status.HTTP_201_CREATED)

@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def update_cart_item(request, item_id):
    try:
        cart_item = CartItem.objects.get(id=item_id, cart__user=request.user)
        quantity = int(request.data.get('quantity', 1))
        
        if quantity <= 0:
            cart_item.delete()
            return Response({'message': 'Item removed from cart'})
        
        cart_item.quantity = quantity
        cart_item.save()
        
        return Response({'message': 'Cart updated'})
    except CartItem.DoesNotExist:
        return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def remove_from_cart(request, item_id):
    try:
        cart_item = CartItem.objects.get(id=item_id, cart__user=request.user)
        cart_item.delete()
        return Response({'message': 'Item removed from cart'})
    except CartItem.DoesNotExist:
        return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)

# Order Views
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_order(request):
    cart = Cart.objects.get(user=request.user)
    
    if not cart.items.exists():
        return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Calculate totals
    subtotal = sum(item.quantity * item.product.price for item in cart.items.all())
    shipping_cost = 0 if subtotal > 75 else 9.99
    tax = subtotal * 0.08
    total = subtotal + shipping_cost + tax
    
    # Create order
    order = Order.objects.create(
        user=request.user,
        shipping_first_name=request.data.get('shipping_first_name'),
        shipping_last_name=request.data.get('shipping_last_name'),
        shipping_address=request.data.get('shipping_address'),
        shipping_city=request.data.get('shipping_city'),
        shipping_state=request.data.get('shipping_state'),
        shipping_zip_code=request.data.get('shipping_zip_code'),
        subtotal=subtotal,
        shipping_cost=shipping_cost,
        tax=tax,
        total=total
    )
    
    # Create order items
    for cart_item in cart.items.all():
        OrderItem.objects.create(
            order=order,
            product=cart_item.product,
            size=cart_item.size,
            quantity=cart_item.quantity,
            price=cart_item.product.price
        )
    
    # Clear cart
    cart.items.all().delete()
    
    serializer = OrderSerializer(order)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_orders(request):
    orders = Order.objects.filter(user=request.user).prefetch_related('items__product')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

# Authentication Views
@api_view(['POST'])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_view(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name
            }
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Successfully logged out'})
    except:
        return Response({'error': 'Error logging out'}, status=status.HTTP_400_BAD_REQUEST)
