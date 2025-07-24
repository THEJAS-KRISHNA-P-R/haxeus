from django.urls import path, include
from django.contrib import admin
from . import views
from django.urls import path
from .views import sync_user

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    path('api/sync-user/', sync_user, name='sync_user'),
    
    # API endpoints
    path('api/', include([
        # Products
        path('products/', views.ProductListView.as_view(), name='product-list'),
        path('products/<int:id>/', views.ProductDetailView.as_view(), name='product-detail'),
        path('products/featured/', views.FeaturedProductsView.as_view(), name='featured-products'),
        
        # Categories
        path('categories/', views.CategoryListView.as_view(), name='category-list'),
        
        # Cart
        path('cart/', views.get_cart, name='get-cart'),
        path('cart/add/', views.add_to_cart, name='add-to-cart'),
        path('cart/update/<int:item_id>/', views.update_cart_item, name='update-cart-item'),
        path('cart/remove/<int:item_id>/', views.remove_from_cart, name='remove-from-cart'),
        
        # Orders
        path('orders/', views.get_orders, name='get-orders'),
        path('orders/create/', views.create_order, name='create-order'),
        
        # Authentication
        path('auth/register/', views.register, name='register'),
        path('auth/login/', views.login_view, name='login'),
        path('auth/logout/', views.logout_view, name='logout'),
    ])),
]
