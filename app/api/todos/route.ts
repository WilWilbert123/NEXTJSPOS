// API ROUTE - Backend endpoint
// Located at: /api/todos
// Accessible at: GET/POST/PUT/DELETE https://yoursite.com/api/todos

import { NextRequest, NextResponse } from 'next/server';

// Mock database
let todos: any[] = [
  { id: 1, title: 'Learn Next.js', completed: false },
  { id: 2, title: 'Build CRUD app', completed: false },
];

// GET - Read all todos or find by ID
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (id) {
    const todo = todos.find((t) => t.id === parseInt(id));
    return todo
      ? NextResponse.json(todo)
      : NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(todos);
}

// POST - Create new todo
export async function POST(request: NextRequest) {
  const body = await request.json();

  const newTodo = {
    id: todos.length + 1,
    title: body.title,
    completed: false,
  };

  todos.push(newTodo);
  return NextResponse.json(newTodo, { status: 201 });
}

// PUT - Update todo
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;

  const todoIndex = todos.findIndex((t) => t.id === id);
  if (todoIndex === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  todos[todoIndex] = { ...todos[todoIndex], ...updates };
  return NextResponse.json(todos[todoIndex]);
}

// DELETE - Remove todo
export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  const todoIndex = todos.findIndex((t) => t.id === parseInt(id!));
  if (todoIndex === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const deleted = todos.splice(todoIndex, 1);
  return NextResponse.json(deleted[0]);
}
