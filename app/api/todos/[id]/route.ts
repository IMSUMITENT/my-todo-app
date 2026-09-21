import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/prisma/db";
import type { TodoDto, ApiErrorResponse } from "../route";

export type UpdateTodoRequest = {
  isCompleted: boolean;
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

  const todo = await db.orm.public.Todo.where({ id, userId }).update({
    isCompleted: body.isCompleted,
  });

  if (!todo) {
    const errorBody: ApiErrorResponse = { error: "Not found" };
    return NextResponse.json(errorBody, { status: 404 });
  }

  const response: UpdateTodoResponse = {
    id: todo.id,
    title: todo.title,
    isCompleted: todo.isCompleted,
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
