import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/prisma/db";
import type { TodoDto, ApiErrorResponse } from "../route";

export type UpdateTodoRequest = {
  isCompleted?: boolean;
  dueDate?: string | null;
};

export type UpdateTodoResponse = TodoDto;

export type DeleteTodoResponse = {
  id: string;
};

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    const body: ApiErrorResponse = { error: "Unauthorized" };
    return NextResponse.json(body, { status: 401 });
  }

  const { id } = await params;
  const body: UpdateTodoRequest = await request.json();

  const data: { isCompleted?: boolean; dueDate?: string | null } = {};
  if (body.isCompleted !== undefined) data.isCompleted = body.isCompleted;
  if (body.dueDate !== undefined) data.dueDate = body.dueDate;

  const todo = await db.orm.public.Todo.where({ id, userId }).update(data);

  if (!todo) {
    const errorBody: ApiErrorResponse = { error: "Not found" };
    return NextResponse.json(errorBody, { status: 404 });
  }

  const response: UpdateTodoResponse = {
    id: todo.id,
    title: todo.title,
    isCompleted: todo.isCompleted,
    dueDate: todo.dueDate,
    createdAt: todo.createdAt,
  };

  return NextResponse.json(response);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    const body: ApiErrorResponse = { error: "Unauthorized" };
    return NextResponse.json(body, { status: 401 });
  }

  const { id } = await params;

  const deleted = await db.orm.public.Todo.where({ id, userId }).delete();

  if (!deleted) {
    const errorBody: ApiErrorResponse = { error: "Not found" };
    return NextResponse.json(errorBody, { status: 404 });
  }

  const response: DeleteTodoResponse = { id };
  return NextResponse.json(response);
}
