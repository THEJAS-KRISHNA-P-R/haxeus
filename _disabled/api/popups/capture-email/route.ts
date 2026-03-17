import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { redis } from "@/lib/redis";
import { createHash } from "crypto";
import type { PopupCampaign } from "@/types/popup";

export const revalidate = 0;

const DISPOSABLE_DOMAINS = new Set([
    "mailinator.com","tempmail.com","guerrillamail.com","10minutemail.com",
    "throwam.com","yopmail.com","trashmail.com","sharklasers.com",
    "guerrillamailblock.com","grr.la","guerrillamail.info","spam4.me",
    "maildrop.cc","dispostable.com","fakeinbox.com"
]);

function getIP(request: Request) {
    const xff = request.headers.get('x-forwarded-for');
    return xff ? xff.split(',')[0].trim() : '127.0.0.1';
}

function hashIP(ip: string) {
    const salt = process.env.IP_HASH_SALT;
    if (!salt) {
        console.error("IP_HASH_SALT is not defined in .env. IP hashing will be insecure.");
        return createHash('sha256').update(ip).digest('hex');
    }
    return createHash('sha256').update(ip + salt).digest('hex');
}

async function getCampaign(campaignId: string): Promise<PopupCampaign | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("store_settings")
        .select("value")
        .eq("key", "popup_campaigns")
        .maybeSingle();

    if (error || !data || !Array.isArray(data.value)) {
        return null;
    }
    
    const campaigns = data.value as PopupCampaign[];
    return campaigns.find(c => c.id === campaignId) ?? null;
}


export async function POST(request: Request) {
    const body = await request.json();
    const { campaign_id, email, honeypot_value } = body;

    // 1. HONEYPOT CHECK
    if (honeypot_value) {
        console.log(`Honeypot triggered for email: ${email}`);
        return NextResponse.json({ success: true });
    }

    if (!campaign_id || !email) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const campaign = await getCampaign(campaign_id);
    if (!campaign) {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const ip = getIP(request);
    const ipHash = hashIP(ip);

    // 2. RATE LIMIT CHECK
    const rateLimitKey = `popup:ratelimit:${ipHash}`;
    try {
        const currentCount = await redis.get(rateLimitKey);
        const count = Number(currentCount ?? 0);
        
        if (count >= campaign.security.max_email_submissions_per_ip_per_hour) {
            return NextResponse.json({ error: "rate_limited" }, { status: 429 });
        }
        await redis.incr(rateLimitKey);
        await redis.expire(rateLimitKey, 3600); // 1 hour
    } catch (e) {
        console.error("Redis error during rate limit check:", e);
    }

    // 3. EMAIL VALIDATION
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: "invalid_email_format" }, { status: 400 });
    }

    if (campaign.security.block_disposable_emails) {
        const domain = email.split('@')[1];
        if (DISPOSABLE_DOMAINS.has(domain)) {
            return NextResponse.json({ error: "disposable_email" }, { status: 400 });
        }
    }
    
    const supabase = await createClient();

    // 4. DUPLICATE CHECK
    const { count: duplicateCount, error: duplicateError } = await supabase
        .from('popup_email_captures')
        .select('*', { count: 'exact', head: true })
        .eq('email', email)
        .eq('campaign_id', campaign_id);

    if (duplicateError) {
        console.error("Error checking for duplicate email:", duplicateError);
    }
    if (duplicateCount && duplicateCount > 0) {
        return NextResponse.json({ error: "already_captured" }, { status: 409 });
    }

    // 5. GET SESSION
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id ?? null;

    // 6. INSERT
    const { error: insertError } = await supabase
        .from('popup_email_captures')
        .insert({
            campaign_id,
            email,
            user_id: userId,
            ip_hash: ipHash,
            coupon_shown: campaign.coupon_code,
            honeypot_hit: false,
        });

    if (insertError) {
        console.error("Error inserting email capture:", insertError);
        return NextResponse.json({ error: "database_error" }, { status: 500 });
    }

    // 7. NEWSLETTER (Optional - check if table exists)
    // This is a simplified check. A more robust solution might involve checking schema cache.
    const { error: newsletterError } = await supabase
        .from('newsletter_subscribers')
        .upsert({ email }, { onConflict: 'email' });

    if (newsletterError && newsletterError.code !== '42P01') { // 42P01 = undefined_table
        console.warn("Could not upsert to newsletter:", newsletterError.message);
    }

    // 8. REVEAL COUPON
    return NextResponse.json({ success: true, coupon_code: campaign.coupon_code });
}
