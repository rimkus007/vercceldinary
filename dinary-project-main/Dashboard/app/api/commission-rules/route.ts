import { NextRequest, NextResponse } from "next/server";
import type { CommissionRule } from "@/types/commission";

// This is a placeholder. Replace with real DB or backend API integration.
let rules: CommissionRule[] = [];

export async function GET() {
  return NextResponse.json(rules);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const newRule: CommissionRule = {
    ...data,
    id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  rules.push(newRule);
  return NextResponse.json(newRule, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const idx = rules.findIndex((r) => r.id === data.id);
  if (idx === -1)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  rules[idx] = { ...rules[idx], ...data, updatedAt: new Date().toISOString() };
  return NextResponse.json(rules[idx]);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  rules = rules.filter((r) => r.id !== id);
  return NextResponse.json({ success: true });
}
