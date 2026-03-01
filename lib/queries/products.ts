import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';

function createClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
}

export const getFeaturedProducts = cache(async () => {
    const supabase = createClient();
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
        return data.map((product: any) => {
            const primaryImg = product.product_images?.find((img: any) => img.is_primary);
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
});
