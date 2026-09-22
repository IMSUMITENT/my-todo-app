"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { todayDateString } from "@/lib/date";
import { LogoutButton } from "./logout-button";
import { CalendarView } from "./calendar-view";
import type {
  GetTodosResponse,
  CreateTodoRequest,
  CreateTodoResponse,
  TodoDto,
} from "./api/todos/route";
import type {
  UpdateTodoRequest,
  UpdateTodoResponse,
} from "./api/todos/[id]/route";

type Tab = "list" | "calendar";

export default function Home() {
  const [email, setEmail] = useState<string | null>(null);
  const [todos, setTodos] = useState<TodoDto[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("list");

  const today = todayDateString();

  const sortedTodos = useMemo(() => {
    return [...todos].sort((a, b) => {
      const aDueToday = a.dueDate === today ? 0 : 1;
      const bDueToday = b.dueDate === today ? 0 : 1;
      return aDueToday - bDueToday;
    });
  }, [todos, today]);

  async function loadTodos() {
    try {
      const res = await fetch("/api/todos");
      if (!res.ok) throw new Error("failed");
      const data: GetTodosResponse = await res.json();
      setTodos(data);
    } catch {
      setError("TODO の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial client-side fetch on mount; loadTodos only sets state after the awaited fetch resolves
    void loadTodos();
  }, []);

  async function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    setAdding(true);
    setError(null);
    try {
      const body: CreateTodoRequest = {
        title,
        dueDate: newDueDate || null,
      };
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("failed");
      const created: CreateTodoResponse = await res.json();
      setTodos((prev) => [created, ...prev]);
      setNewTitle("");
      setNewDueDate("");
    } catch {
      setError("TODO の追加に失敗しました");
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(todo: TodoDto) {
    setError(null);
    try {
      const body: UpdateTodoRequest = { isCompleted: !todo.isCompleted };
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("failed");
      const updated: UpdateTodoResponse = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch {
      setError("TODO の更新に失敗しました");
    }
  }

  async function handleDueDateChange(todo: TodoDto, dueDate: string) {
    setError(null);
    try {
      const body: UpdateTodoRequest = { dueDate: dueDate || null };
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("failed");
      const updated: UpdateTodoResponse = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch {
      setError("期限日の更新に失敗しました");
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("failed");
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("TODO の削除に失敗しました");
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-950">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold text-zinc-50">My TODO App</h1>
        <div className="flex items-center gap-3 sm:gap-4">
          {email && (
            <span className="max-w-[45vw] truncate text-sm text-zinc-400 sm:max-w-none">
              {email}
            </span>
          )}
          <LogoutButton />
        </div>
      </header>

      <main className="flex flex-1 justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-lg">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-xl sm:p-6">
            <form onSubmit={handleAdd} className="flex flex-wrap gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="新しい TODO を入力"
                className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-50 outline-none focus:border-zinc-400"
              />
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                aria-label="期限日"
                className="shrink-0 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-50 outline-none focus:border-zinc-400"
              />
              <button
                type="submit"
                disabled={adding || newTitle.trim() === ""}
                className="shrink-0 rounded-lg bg-zinc-50 px-4 py-2 font-medium text-zinc-900 transition-colors hover:bg-zinc-300 disabled:opacity-50"
              >
                追加
              </button>
            </form>

            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

            <div className="mt-6 flex gap-1 border-b border-zinc-800">
              <button
                onClick={() => setTab("list")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  tab === "list"
                    ? "border-b-2 border-zinc-50 text-zinc-50"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                リスト
              </button>
              <button
                onClick={() => setTab("calendar")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  tab === "calendar"
                    ? "border-b-2 border-zinc-50 text-zinc-50"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                カレンダー
              </button>
            </div>

            {tab === "list" ? (
              <ul className="mt-4 flex flex-col gap-2">
                {loading ? (
                  <li className="text-sm text-zinc-500">読み込み中...</li>
                ) : sortedTodos.length === 0 ? (
                  <li className="text-sm text-zinc-500">
                    TODO はまだありません。
                  </li>
                ) : (
                  sortedTodos.map((todo) => {
                    const isDueToday = todo.dueDate === today;
                    return (
                      <li
                        key={todo.id}
                        className={`flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2 ${
                          isDueToday
                            ? "border-red-500 bg-red-500/5"
                            : "border-zinc-800 bg-zinc-950"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={todo.isCompleted}
                          onChange={() => handleToggle(todo)}
                          className="h-4 w-4 shrink-0 accent-zinc-50"
                        />
                        <span
                          className={`min-w-0 flex-1 break-words ${
                            todo.isCompleted
                              ? "text-zinc-500 line-through"
                              : isDueToday
                                ? "text-red-400"
                                : "text-zinc-50"
                          }`}
                        >
                          {todo.title}
                        </span>
                        <input
                          type="date"
                          value={todo.dueDate ?? ""}
                          onChange={(e) =>
                            handleDueDateChange(todo, e.target.value)
                          }
                          aria-label="期限日を変更"
                          className={`shrink-0 rounded-md border bg-zinc-800 px-2 py-1 text-xs outline-none focus:border-zinc-400 ${
                            isDueToday
                              ? "border-red-500 text-red-400"
                              : "border-zinc-700 text-zinc-300"
                          }`}
                        />
                        <button
                          onClick={() => handleDelete(todo.id)}
                          className="shrink-0 rounded-md px-2 py-1 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                        >
                          削除
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            ) : (
              <div className="mt-4">
                <CalendarView todos={todos} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
