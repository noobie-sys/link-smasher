import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({ links: [] });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: "Link created" });
}
