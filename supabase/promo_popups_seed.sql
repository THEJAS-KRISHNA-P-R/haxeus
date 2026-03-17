INSERT INTO public.store_settings (key, value)
VALUES ('promo_popups', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;
