import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { order_db_id } = await req.json();

    if (!order_db_id) return NextResponse.json({ error: 'Missing order_db_id' }, { status: 400 });

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Mark as payment_failed ONLY if it belongs to the user and is 'pending'
    const { error } = await supabase
      .from('orders')
      .update({ status: 'payment_failed' })
      .eq('id', order_db_id)
      .eq('user_id', user.id)
      .eq('status', 'pending');

    if (error) {
      console.error('[abandon] Failed to mark order failed:', error);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[abandon] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
