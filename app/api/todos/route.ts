import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/prisma/db";

export type TodoDto = {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: string;
};

export type GetTodosResponse = TodoDto[];

export type CreateTodoRequest = {
  title: string;
};

export type CreateTodoResponse = TodoDto;

export type ApiErrorResponse = {
  error: string;
};

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    const body: ApiErrorResponse = { error: "Unauthorized" };
    return NextResponse.json(body, { status: 401 });
  }

  const todos = await db.orm.public.Todo.where({ userId })
    .orderBy((t) => t.createdAt.desc())
    .all();

  const response: GetTodosResponse = todos.map((todo) => ({
    id: todo.id,
    title: todo.title,
    isCompleted: todo.isCompleted,
    createdAt: todo.createdAt,
  }));

  return NextResponse.json(response);
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    const body: ApiErrorResponse = { error: "Unauthorized" };
    return NextResponse.json(body, { status: 401 });
  }

  const body: CreateTodoRequest = await request.json();
  const title = body.title?.trim();
  if (!title) {
    const errorBody: ApiErrorResponse = { error: "title is required" };
    return NextResponse.json(errorBody, { status: 400 });
  }

  const todo = await db.orm.public.Todo.create({
    userId,
    title,
  });

  const response: CreateTodoResponse = {
    id: todo.id,
    title: todo.title,
    isCompleted: todo.isCompleted,
    createdAt: todo.createdAt,
  };

  return NextResponse.json(response, { status: 201 });
}
