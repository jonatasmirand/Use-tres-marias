import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json(
        {
            status: "ok",
            timestamp: new Date().toISOString(),
            service: "Use Três Marias API",
            version: "0.1.0",
        },
        { status: 200 }
    );
}
