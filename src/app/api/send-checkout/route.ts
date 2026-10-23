import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error("Missing GOOGLE_SHEETS_WEBHOOK_URL environment variable.");
      return NextResponse.json(
        { error: "Webhook URL configuration missing" },
        { status: 500 }
      );
    }

    // Forward the checkout payload directly to Google Apps Script
    const gasResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      redirect: 'follow',
    });

    const result = await gasResponse.json();

    if (result.status === "error") {
      throw new Error(result.message || "Google Sheets webhook error");
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    console.error("Checkout submission failed:", errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
