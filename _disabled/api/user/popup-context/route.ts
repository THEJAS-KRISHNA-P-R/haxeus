import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { cached } from "@/lib/redis";
import type { UserContext } from "@/types/popup";

export const revalidate = 0;

async function getUserPopupContext(userId: string) {
    const supabase = await createClient();

    const { count: orderCount, error: orderError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'confirmed');

    if (orderError) {
        console.error(`Error fetching order count for user ${userId}:`, orderError);
        // Decide on fallback behavior. Here, we'll proceed with 0.
    }

    const { data: emailCaptureData, error: emailError } = await supabase
        .from('popup_email_captures')
        .select('id')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

    if (emailError) {
        console.error(`Error checking email capture for user ${userId}:`, emailError);
    }

    return {
        isLoggedIn: true,
        orderCount: orderCount ?? 0,
        emailCaptured: !!emailCaptureData,
    };
}


export async function GET() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({
      isLoggedIn: false,
      orderCount: 0,
      emailCaptured: false,
    });
  }

  const userId = session.user.id;

  try {
    const context = await cached(
      `popup:context:${userId}`,
      120,
      () => getUserPopupContext(userId)
    );
    return NextResponse.json(context);
  } catch (error) {
    console.error(`Failed to get/set cache for user popup context ${userId}:`, error);
    // If cache fails, fetch directly
    const context = await getUserPopupContext(userId);
    return NextResponse.json(context);
  }
}
