// src/app/api/telegram/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Read the secret keys from your environment
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return NextResponse.json({ error: 'Telegram credentials missing' }, { status: 500 });
    }

    // Parse the incoming job data
    const body = await request.json();
    let { title, company, location, salary, jobId } = body;

    // Filter to remove Myanmar phone numbers from title and company
    const phoneRegex = /(?:\+?95|0)\s*9[\d\s-]{7,11}/g;
    title = title.replace(phoneRegex, '[Contact on Website]');
    company = company?.replace(phoneRegex, '[Contact on Website]');

    // Format the message with bold text and emojis (Telegram supports HTML formatting)
    const message = `
🚨 <b>New Job Alert!</b> 🚨

💼 <b>${title}</b>
🏢 ${company}
📍 ${location}
💰 ${salary}

👉 <a href="https://parttimemm.com/jobs/${jobId}">Click here to apply or view details</a>
    `;

    // Send the request directly to Telegram's official API
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.description);
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Telegram API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}