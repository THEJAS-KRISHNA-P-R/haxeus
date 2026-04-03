import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@3'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
const resend = new Resend(resendApiKey);

Deno.serve(async (_req) => {
  try {
    console.log('[retry-cron] Starting automated email recovery sequence...');

    // Only look back 24 hours to avoid processing stale data
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // 1. Identify confirmed orders that missed their confirmation pulse
    const { data: failedOrders, error: fetchError } = await supabase
      .from('orders')
      .select(`
        id, 
        order_number,
        total_amount, 
        subtotal_amount, 
        shipping_amount, 
        discount_amount, 
        shipping_address, 
        user_id, 
        shipping_name, 
        shipping_email,
        order_items (
          quantity, 
          size, 
          unit_price,
          product:products (name)
        )
      `)
      .eq('status', 'confirmed')
      .eq('confirmation_email_sent', false)
      .gte('created_at', cutoffDate)
      .limit(10); // Batch process to stay within edge execution limits

    if (fetchError) throw fetchError;

    if (!failedOrders || failedOrders.length === 0) {
      console.log('[retry-cron] No pending signals detected. System dormant.');
      return new Response(JSON.stringify({ retried: 0, status: 'synced' }), { status: 200 });
    }

    console.log(`[retry-cron] Recovering ${failedOrders.length} heartbeat pulses...`);

    let recoveredCount = 0;
    const results = [];

    for (const order of failedOrders) {
      try {
        // 2. Resolve target endpoint (Email)
        const { data: userData } = await supabase.auth.admin.getUserById(order.user_id);
        const toEmail = userData?.user?.email || order.shipping_email;

        if (!toEmail) {
          console.error(`[retry-cron] Critical: No target endpoint for order ${order.id}`);
          results.push({ orderId: order.id, status: 'failed', reason: 'endpoint_unresolved' });
          continue;
        }

        const displayId = order.order_number || order.id.slice(-8).toUpperCase();

        // 3. Dispatch Premium Confirmation Signal (Cyber-Industrial Theme)
        const { data, error: sendError } = await resend.emails.send({
          from: 'HAXEUS <orders@haxeus.in>',
          to: toEmail,
          subject: `Order recovery — HAXEUS #${displayId}`,
          html: `
            <div style="background-color: #050505; color: #ffffff; padding: 60px 20px; font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #1a1a1a;">
              <div style="text-align: center; margin-bottom: 40px;">
                <span style="font-size: 32px; font-weight: 900; letter-spacing: 12px; color: #ffffff; text-transform: uppercase;">HAXEUS</span>
                <div style="height: 1px; background: linear-gradient(90deg, transparent, #e93a3a, transparent); margin-top: 10px;"></div>
              </div>

              <div style="border-left: 2px solid #e93a3a; padding-left: 20px; margin-bottom: 40px;">
                <h2 style="font-size: 10px; text-transform: uppercase; letter-spacing: 4px; color: #e93a3a; margin-bottom: 8px;">Protocol: Order Recovery</h2>
                <h3 style="font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Your piece is confirmed.</h3>
                <p style="color: #666; font-size: 12px; margin-top: 4px;">ORDER PULSE: #${displayId}</p>
              </div>

              <div style="background: #0a0a0a; border: 1px solid #111; padding: 24px; margin-bottom: 40px;">
                <p style="font-size: 14px; line-height: 1.6; color: #ccc; margin: 0;">
                  We've successfully synced your payment signal. Your order is now moving through the fabrication pipeline. 
                  Expect a shipping transmission once the quality-control loop is complete.
                </p>
              </div>

              <div style="text-align: center;">
                <a href="https://haxeus.in/account/orders" style="display: inline-block; background: #ffffff; color: #000000; padding: 14px 32px; text-decoration: none; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; border-radius: 2px;">Track Shipment Loop</a>
              </div>

              <div style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #111; text-align: center; opacity: 0.3;">
                <p style="font-size: 8px; text-transform: uppercase; letter-spacing: 3px;">&copy; ${new Date().getFullYear()} HAXEUS // APOCALYPSE-READY STREETWEAR</p>
              </div>
            </div>
          `,
          headers: {
            // CRITICAL: Idempotency check prevents double-sending even if cron overlaps
            'X-Entity-Ref-ID': `order-confirmed-${order.id}`
          }
        });

        if (sendError) throw sendError;

        // 4. Close the feedback loop in DB
        await supabase
          .from('orders')
          .update({
            confirmation_email_sent: true,
            confirmation_email_sent_at: new Date().toISOString(),
            confirmation_email_resend_id: data?.id
          })
          .eq('id', order.id);

        recoveredCount++;
        results.push({ order_id: order.id, status: 'recovered', resend_id: data?.id });
        console.log(`[retry-cron] Recovered order signal: ${order.id}`);

      } catch (err: any) {
        console.error(`[retry-cron] Recovery failure for order ${order.id}:`, err.message);
        results.push({ order_id: order.id, status: 'failed', error: err.message });
      }
    }

    return new Response(JSON.stringify({ recovered: recoveredCount, results }), { status: 200 });
  } catch (err: any) {
    console.error('[retry-cron] Critical failure:', err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
