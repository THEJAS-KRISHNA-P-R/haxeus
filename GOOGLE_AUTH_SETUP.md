# Google OAuth Setup Guide

## ✅ What's Been Implemented

The Google sign-up/sign-in functionality is now fully integrated into your auth page:

- **Sign Up tab**: Shows "Sign up with Google" button
- **Sign In tab**: Shows "Sign in with Google" button  
- **Welcome emails**: Automatically sent to new users who sign up via Google
- **Callback handling**: Properly handles OAuth redirects

## 🔧 Supabase Configuration Required

To enable Google authentication, you need to configure it in your Supabase dashboard:

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure OAuth consent screen if prompted:
   - User Type: External
   - App name: HAXEUZ
   - User support email: Your email
   - Developer contact: Your email
6. Select **Application type**: Web application
7. Set **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://your-production-domain.com
   ```
8. Set **Authorized redirect URIs**:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
   
   To find your Supabase project URL:
   - Go to Supabase Dashboard → Project Settings → API
   - Copy the **URL** (it looks like: `https://abc123xyz.supabase.co`)
   - Your redirect URI will be: `https://abc123xyz.supabase.co/auth/v1/callback`

9. Click **Create**
10. Copy your **Client ID** and **Client Secret**

### Step 2: Configure Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list
5. Enable the Google provider
6. Paste your **Client ID** (from Google Cloud Console)
7. Paste your **Client Secret** (from Google Cloud Console)
8. Click **Save**

### Step 3: Add Site URL (Important!)

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:3000` (for development)
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://your-production-domain.com/auth/callback` (for production)
4. Click **Save**

## 🧪 Testing

### Test Sign Up with Google:

1. Navigate to `/auth`
2. Click on the **Sign Up** tab
3. Click **Sign up with Google**
4. You should be redirected to Google's login page
5. Select a Google account
6. After authorization, you'll be redirected back to your app
7. Welcome email will be queued in the `email_queue` table
8. You'll be redirected to the home page

### Test Sign In with Google:

1. Navigate to `/auth`
2. Click on the **Sign In** tab  
3. Click **Sign in with Google**
4. Select your Google account
5. You'll be redirected to the home page (no welcome email for existing users)

## 📋 Troubleshooting

### "Invalid redirect URI" error
- Make sure your redirect URI in Google Cloud Console matches exactly:
  `https://your-project-ref.supabase.co/auth/v1/callback`
- Check there are no trailing slashes or typos

### "Unauthorized client" error
- Verify Client ID and Client Secret are correctly copied to Supabase
- Make sure the Google provider is enabled in Supabase

### User redirects but not logged in
- Check browser console for errors
- Verify Site URL is set correctly in Supabase
- Check that redirect URL is added to allowed URLs

### Welcome email not sending
- Check the `email_queue` table in Supabase
- The email should appear with `email_type: 'welcome'`
- Processing the queue requires email setup (see EMAIL_SETUP.md)

## 🎯 How It Works

1. **User clicks "Sign up with Google"**
   - App calls `supabase.auth.signInWithOAuth({ provider: 'google' })`
   - User is redirected to Google's OAuth consent screen

2. **User authorizes**
   - Google redirects back to: `https://your-project.supabase.co/auth/v1/callback`
   - Supabase processes the OAuth response
   - Supabase redirects to your app's callback: `/auth/callback`

3. **Callback page processes**
   - Retrieves the user session
   - Checks if user is new (created in last 5 seconds)
   - Sends welcome email for new users
   - Redirects to home page

4. **User is logged in**
   - User data stored in `auth.users` table
   - Session created automatically
   - Cart and profile features work immediately

## 📝 User Data from Google

When users sign up with Google, Supabase stores:

```typescript
{
  id: "uuid",
  email: "user@gmail.com",
  user_metadata: {
    name: "John Doe",
    full_name: "John Doe",
    avatar_url: "https://...",
    email_verified: true,
    provider_id: "google-oauth-id",
    sub: "google-oauth-id"
  },
  app_metadata: {
    provider: "google",
    providers: ["google"]
  }
}
```

## 🚀 Production Deployment

Before going live:

1. ✅ Update Google OAuth credentials with production domain
2. ✅ Add production redirect URI: `https://your-domain.com/auth/callback`
3. ✅ Update Site URL in Supabase to production domain
4. ✅ Test Google login on production
5. ✅ Verify welcome emails are sent
6. ✅ Check OAuth consent screen is configured properly

## 📚 Additional Resources

- [Supabase Google OAuth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)

---

**All set!** Google sign-up is now fully functional. Just complete the Supabase configuration and you're ready to go! 🎉
