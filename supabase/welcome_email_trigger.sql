    -- AUTOMATIC WELCOME EMAIL ON USER SIGNUP
    -- This trigger automatically queues a welcome email when a new user signs up

    -- Function to queue welcome email
    CREATE OR REPLACE FUNCTION queue_welcome_email()
    RETURNS TRIGGER AS $$
    DECLARE
    user_email TEXT;
    user_name TEXT;
    BEGIN
    -- Get user email directly from NEW record (no need for SELECT)
    user_email := NEW.email;
    
    -- Try to get name from raw_user_meta_data
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        split_part(user_email, '@', 1) -- fallback to email username
    );
    
    -- Queue the welcome email (wrap in exception handler to not block signup)
    BEGIN
        INSERT INTO email_queue (
        email_type,
        recipient_email,
        recipient_name,
        subject,
        template_data,
        status
        ) VALUES (
        'welcome',
        user_email,
        user_name,
        'Welcome to HAXEUZ!',
        jsonb_build_object(
            'name', user_name,
            'email', user_email
        ),
        'pending'
        );
    EXCEPTION
        WHEN OTHERS THEN
        -- Log error but don't block signup
        RAISE WARNING 'Failed to queue welcome email for %: %', user_email, SQLERRM;
    END;
    
    RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Create trigger on auth.users table
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION queue_welcome_email();

    COMMENT ON FUNCTION queue_welcome_email() IS 'Automatically queues welcome email when new user signs up';
