"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setDone(true);
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-950 px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
        <h1 className="mb-6 text-center text-2xl font-semibold text-zinc-50">
          新規登録
        </h1>

        {done ? (
          <p className="text-center text-sm text-zinc-300">
            確認メールを送信しました。メール内のリンクを開いて登録を完了してください。
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm text-zinc-400">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-50 outline-none focus:border-zinc-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm text-zinc-400">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-50 outline-none focus:border-zinc-400"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-lg bg-zinc-50 px-4 py-2 font-medium text-zinc-900 transition-colors hover:bg-zinc-300 disabled:opacity-50"
            >
              {loading ? "登録中..." : "登録する"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-zinc-400">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" className="font-medium text-zinc-50 hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
