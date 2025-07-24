"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { LogOut } from "lucide-react";


export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      fetch(`/api/orders?user_id=${user.id}`)
        .then((res) => res.json())
        .then((data) => setOrders(data))
        .catch(() => setOrders([]));
    });
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!user) return <div className="pt-16 text-center">Loading...</div>;

  return (
    <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-lg p-10 w-full max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Your  <span className="text-red-600">HAXEUZ  </span><span className="text-gradient">Profile</span>
        </h2>
        <div className="mb-8 text-center">
          <div className="text-xl font-semibold mb-1">{user.user_metadata?.full_name || user.email}</div>
          <div className="text-gray-600 mb-2">{user.email}</div>
          <Link href="/cart" className="btn-primary inline-block mt-2 items-center justify-center gap-2 px-4 py-2 rounded-2xl border border-gray-300 bg-white hover:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow-md">
            Go to Cart
          </Link>
        </div>
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4">Past Orders</h3>
          {orders.length === 0 ? (
            <div className="text-gray-500">No orders yet.</div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="font-semibold">
                      Order ID: <span className="text-red-600">{order.order_number}</span>
                    </div>
                    <div className="text-gray-600 text-sm">{order.created_at?.slice(0, 10)}</div>
                  </div>
                  <div className="flex flex-col md:items-end mt-2 md:mt-0">
                    <div className="font-medium">
                      Status: <span className="text-green-600">{order.status}</span>
                    </div>
                    <div className="text-gray-700">Total: ₹{order.total}</div>
                    <Link href={`/orders/${order.id}`} className="btn-secondary mt-2 text-sm">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="text-center">
            <button
              onClick={handleSignOut}
              className="w-full max-w flex items-center justify-center gap-2 px-4 py-2 rounded-2xl border border-gray-300 bg-white text-red-800 hover:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
        </div>
      </div>
    </div>
  );
}