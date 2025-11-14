import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Debug API funcionando",
    time: new Date().toISOString(),
    random: Math.random(),
  });
}
