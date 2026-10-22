import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
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
    // Google Apps Script requires redirect: 'follow'
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
  } catch (error: any) {
    console.error("Checkout submission failed:", error.message);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
