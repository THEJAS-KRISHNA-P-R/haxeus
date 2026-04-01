import { supabase, Product, ProductImage } from '@/lib/supabase';

export const getFeaturedProducts = async () => {
    const { data, error } = await supabase
        .from('products')
        .select(`
      id,
      name,
      price,
      front_image,
      product_images (
        image_url,
        is_primary,
        display_order
      )
    `)
        .order('id')
        .limit(3);

    if (error) throw error;

    if (data) {
        return (data as unknown as Product[]).map((product: Product) => {
            const primaryImg = product.product_images?.find((img: ProductImage) => img.is_primary);
            const firstImg = product.product_images?.[0];
            const galleryImage = primaryImg?.image_url || firstImg?.image_url;

            return {
                id: product.id,
                name: product.name,
                price: product.price,
                image: galleryImage || product.front_image || "/placeholder.svg"
            };
        });
    }
    return [];
};
