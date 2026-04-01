import { test as setup, expect } from "@playwright/test"
import { createClient } from "@supabase/supabase-js"
import path from "path"
import dotenv from "dotenv"

// Load env vars from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

const authFile = path.join(__dirname, ".auth/admin.json")
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

setup("authenticate as admin via session injection", async ({ page, context }) => {
    console.log("🚀 Starting HAXEUS session injection...");

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // 1. Sign in via API for maximum efficiency and stability
    const { data, error } = await supabase.auth.signInWithPassword({
        email: "e2e-stabilize@haxeus.in",
        password: "HaxeusTest!123",
    })

    if (error || !data.session) {
        throw new Error(`❌ API Login failed: ${error?.message || "No session"}`)
    }

    const { session } = data
    const userId = session.user.id
    const token = session.access_token
    const refreshToken = session.refresh_token
    
    // 2. Prepare cookies for the App Domain
    const storageKey = `sb-hexzhuaifunjowwqkxcy-auth-token`
    const expirationDate = session.expires_at || (Math.floor(Date.now() / 1000) + 3600)

    console.log(`✓ Session acquired for ${userId}`);

    // 3. Inject Cookies into Browser Context
    await context.addCookies([
        {
            name: `${storageKey}-code-verifier`,
            value: "e2e-verifier", // placeholder if needed
            domain: "localhost",
            path: "/",
            expires: expirationDate,
            httpOnly: false,
            secure: false,
            sameSite: "Lax"
        }
    ])

    // 4. Navigate to a blank page on the domain to set LocalStorage
    await page.goto("/favicon.ico") // lightweight page on the same domain
    
    await page.evaluate(({ key, session }) => {
        localStorage.setItem(key, JSON.stringify(session));
    }, { key: storageKey, session });

    console.log("✓ Session injected into browser storage");

    // 5. Navigate to Admin and Verify
    await page.goto("/admin", { waitUntil: "networkidle" })
    
    try {
        await expect(page.getByText("Admin Dashboard")).toBeVisible({ timeout: 20_000 })
        console.log("✓ Admin Dashboard reached and verified via injection");
    } catch (e) {
        console.log("❌ Dashboard still not visible. Storage state:");
        const storage = await page.evaluate(() => JSON.stringify(localStorage, null, 2));
        console.log(storage);
        throw e;
    }

    // 6. Save State
    await page.context().storageState({ path: authFile })
    console.log("✓ HAXEUS session state finalized and saved")
})
