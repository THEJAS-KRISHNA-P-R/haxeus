from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from backendm.backend.models import Category, Product, ProductVariant, Coupon
from decimal import Decimal
import json

User = get_user_model()

class Command(BaseCommand):
    help = 'Setup initial data for Supabase database'

    def handle(self, *args, **options):
        self.stdout.write('Setting up Supabase database...')
        
        # Create superuser
        if not User.objects.filter(email='admin@haxeuz.com').exists():
            admin = User.objects.create_superuser(
                username='admin',
                email='admin@haxeuz.com',
                password='admin123',
                first_name='Admin',
                last_name='User'
            )
            self.stdout.write(f'Created admin user: {admin.email}')

        # Create categories
        categories_data = [
            {'name': 'Eco-Conscious', 'slug': 'eco-conscious', 'description': 'Environmentally friendly designs'},
            {'name': 'Statement', 'slug': 'statement', 'description': 'Bold designs that make a statement'},
            {'name': 'Artistic', 'slug': 'artistic', 'description': 'Creative and artistic expressions'},
            {'name': 'Streetwear', 'slug': 'streetwear', 'description': 'Urban and contemporary fashion'},
            {'name': 'Gothic', 'slug': 'gothic', 'description': 'Dark aesthetic with gothic elements'},
        ]

        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            if created:
                self.stdout.write(f'Created category: {category.name}')

        # Create products
        products_data = [
            {
                'name': 'Save The Flower Tee',
                'slug': 'save-the-flower-tee',
                'description': 'Eco-conscious design featuring delicate hand and flower artwork with environmental message.',
                'price': Decimal('54.99'),
                'compare_price': Decimal('69.99'),
                'front_image': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1f-PO7xQ7I8HF26HRWofpY6L39QDQ8OnP.jpeg',
                'back_image': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1b-MpdDMRsUDA86BlxL6xwRcKw7yeqSE2.jpeg',
                'category_slug': 'eco-conscious',
                'is_featured': True,
            },
            {
                'name': 'Busted Vintage Wash',
                'slug': 'busted-vintage-wash',
                'description': 'Bold statement piece with distressed tie-dye effect and striking red typography.',
                'price': Decimal('64.99'),
                'compare_price': Decimal('79.99'),
                'front_image': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2f-DkFVl8oaL8xVEhTa2EXa6dlMvmfLEV.jpeg',
                'back_image': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2b-mh4ewfS8eKVY089pTmPMvRFQFTiA0G.jpeg',
                'category_slug': 'statement',
                'is_featured': True,
            },
            {
                'name': 'Renaissance Fusion',
                'slug': 'renaissance-fusion',
                'description': 'Artistic blend of classical sculpture with modern sunflower and typography elements.',
                'price': Decimal('59.99'),
                'compare_price': Decimal('74.99'),
                'front_image': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3f-LwkJuGmcpkcEVKdCYLdRrm4MZHigAo.jpeg',
                'back_image': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3b-7gJj08D5fJc9WeJiy5nWWotHkmUM3Y.jpeg',
                'category_slug': 'artistic',
                'is_featured': True,
            },
            {
                'name': 'UFO Flame Wash',
                'slug': 'ufo-flame-wash',
                'description': 'Otherworldly design featuring UFO with flame details on premium tie-dye base.',
                'price': Decimal('62.99'),
                'compare_price': Decimal('77.99'),
                'front_image': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4f-ffIlWf3FhcLCrc1GVgV6ccAZKd96kZ.jpeg',
                'back_image': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4b-CL6PlhUyvPnMLB6OuoXhACtVs9aTw9.jpeg',
                'category_slug': 'streetwear',
                'is_featured': True,
            },
            {
                'name': 'Soul Gothic Wash',
                'slug': 'soul-gothic-wash',
                'description': 'Dark aesthetic with gothic typography on premium tie-dye background.',
                'price': Decimal('58.99'),
                'compare_price': Decimal('72.99'),
                'front_image': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5f-e12aNnSjhPsJy9Cl6b74CxK2rJ2ZX3.jpeg',
                'back_image': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5b-5xjSIbjs95Vv63ZwzPCN286hRHPvOY.jpeg',
                'category_slug': 'gothic',
                'is_featured': False,
            },
        ]

        sizes = ['S', 'M', 'L', 'XL', 'XXL']
        
        for prod_data in products_data:
            category = Category.objects.get(slug=prod_data.pop('category_slug'))
            
            product, created = Product.objects.get_or_create(
                slug=prod_data['slug'],
                defaults={
                    **prod_data,
                    'category': category,
                    'available_sizes': sizes,
                    'total_stock': 100,
                }
            )
            
            if created:
                self.stdout.write(f'Created product: {product.name}')
                
                # Create variants for each size
                for size in sizes:
                    stock = 20
                    price_adj = Decimal('2.00') if size == 'XXL' else Decimal('0.00')
                    
                    ProductVariant.objects.create(
                        product=product,
                        size=size,
                        sku=f'HX{product.id:03d}-{size}',
                        stock=stock,
                        price_adjustment=price_adj
                    )

        # Create sample coupons
        coupons_data = [
            {
                'code': 'WELCOME10',
                'description': 'Welcome 10% discount for new customers',
                'discount_type': 'percentage',
                'discount_value': Decimal('10.00'),
                'minimum_amount': Decimal('50.00'),
            },
            {
                'code': 'FREESHIP',
                'description': 'Free shipping on orders over $75',
                'discount_type': 'fixed',
                'discount_value': Decimal('9.99'),
                'minimum_amount': Decimal('75.00'),
            },
        ]

        for coupon_data in coupons_data:
            from datetime import datetime, timedelta
            coupon, created = Coupon.objects.get_or_create(
                code=coupon_data['code'],
                defaults={
                    **coupon_data,
                    'valid_from': datetime.now(),
                    'valid_until': datetime.now() + timedelta(days=30),
                }
            )
            if created:
                self.stdout.write(f'Created coupon: {coupon.code}')

        self.stdout.write(self.style.SUCCESS('Successfully set up Supabase database!'))
