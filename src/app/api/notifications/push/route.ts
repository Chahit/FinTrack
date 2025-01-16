import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// Configure web-push with your VAPID keys
webpush.setVapidDetails(
  'mailto:' + process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { subscription, message } = await req.json();

    const payload = JSON.stringify({
      title: 'FinTrack Alert',
      body: message,
      icon: '/icons/notification-icon.png',
      badge: '/icons/notification-badge.png',
      data: {
        url: '/'
      }
    });

    await webpush.sendNotification(subscription, payload);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send push notification' },
      { status: 500 }
    );
  }
} 