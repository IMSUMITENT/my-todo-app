"use client";

import { useState } from "react";
import { toDateString, todayDateString } from "@/lib/date";
import type { TodoDto } from "./api/todos/route";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

type CalendarViewProps = {
  todos: TodoDto[];
};

export function CalendarView({ todos }: CalendarViewProps) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const today = todayDateString();

  const todosByDate = new Map<string, TodoDto[]>();
  for (const todo of todos) {
    if (!todo.dueDate) continue;
    const list = todosByDate.get(todo.dueDate) ?? [];
    list.push(todo);
    todosByDate.set(todo.dueDate, list);
  }

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = firstDayOfMonth.getDay();

  const cells: Array<{ date: Date; dateStr: string } | null> = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    cells.push({ date, dateStr: toDateString(date) });
  }

  function goToPrevMonth() {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  }

  function goToNextMonth() {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={goToPrevMonth}
          className="rounded-md px-2 py-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-50"
          aria-label="前の月"
        >
          ‹
        </button>
        <span className="text-sm font-medium text-zinc-50">
          {year}年 {month + 1}月
        </span>
        <button
          onClick={goToNextMonth}
          className="rounded-md px-2 py-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-50"
          aria-label="次の月"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-500">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={`blank-${i}`} />;
          const dayTodos = todosByDate.get(cell.dateStr) ?? [];
          const isToday = cell.dateStr === today;
          return (
            <div
              key={cell.dateStr}
              className={`min-h-[4.5rem] rounded-lg border p-1 text-left ${
                isToday
                  ? "border-red-500 bg-red-500/5"
                  : "border-zinc-800 bg-zinc-950"
              }`}
            >
              <div
                className={`text-xs ${
                  isToday ? "font-semibold text-red-400" : "text-zinc-500"
                }`}
              >
                {cell.date.getDate()}
              </div>
              <div className="mt-1 flex flex-col gap-0.5">
                {dayTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`truncate rounded px-1 py-0.5 text-[11px] ${
                      todo.isCompleted
                        ? "text-zinc-600 line-through"
                        : "bg-zinc-800 text-zinc-200"
                    }`}
                    title={todo.title}
                  >
                    {todo.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
