"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-50"
    >
      {loading ? "ログアウト中..." : "ログアウト"}
    </button>
  );
}
