import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactRequestSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = contactRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }
  const d = parsed.data;

  try {
    const rec = await prisma.contactRequest.create({
      data: {
        type: d.type === "business" ? "BUSINESS" : "CONTACT",
        firstName: d.firstName,
        lastName: d.lastName,
        email: d.email,
        phone: d.phone,
        company: d.company || null,
        message: d.message || null,
        locale: d.locale === "en" ? "EN" : "HR",
      },
    });

    return NextResponse.json({ ok: true, reference: rec.reference });
  } catch (err) {
    console.error("[contact] create failed:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
