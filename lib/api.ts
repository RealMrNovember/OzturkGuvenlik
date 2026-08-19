import { NextResponse } from "next/server";

export function jsonOk<T>(data: T) {
  return NextResponse.json({ ok: true, data });
}

export function jsonErr(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    return (await req.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}