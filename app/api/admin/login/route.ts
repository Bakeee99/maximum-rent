import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  expectedAdminToken,
  passwordMatches,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

const WEEK = 60 * 60 * 24 * 7;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const password =
    typeof (body as { password?: unknown })?.password === "string"
      ? ((body as { password: string }).password)
      : "";

  const ok = await passwordMatches(password);
  if (!ok) {
    // Uniform error; no hint whether ADMIN_PASSWORD is unset or wrong input.
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const token = await expectedAdminToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: WEEK,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
