import { createHash, randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import type { MetaCapiUserData, MetaEventRequestBody, MetaUserDataInput } from '@/types/meta';

const META_EVENT_ENDPOINT = 'https://graph.facebook.com/v19.0/700795142428628/events';

const hashValue = (value: string): string => {
  return createHash('sha256').update(value).digest('hex');
};

const hashEmail = (email?: string): string | undefined => {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }

  return hashValue(normalized);
};

const hashPhone = (phone?: string): string | undefined => {
  const normalized = phone?.replace(/\D/g, '');
  if (!normalized) {
    return undefined;
  }

  return hashValue(normalized);
};

const hashName = (name?: string): string | undefined => {
  const normalized = name?.trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }

  return hashValue(normalized);
};

const sanitizeUserData = (userData: MetaUserDataInput, request: NextRequest): MetaCapiUserData => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const clientIpAddress = forwardedFor?.split(',')[0]?.trim();
  const clientUserAgent = request.headers.get('user-agent') ?? undefined;

  const metaUserData: MetaCapiUserData = {
    em: hashEmail(userData.email),
    ph: hashPhone(userData.phone),
    fn: hashName(userData.firstName),
    ln: hashName(userData.lastName),
    fbp: userData.fbp,
    fbc: userData.fbc,
    client_ip_address: clientIpAddress,
    client_user_agent: clientUserAgent,
  };

  return Object.fromEntries(
    Object.entries(metaUserData).filter(([, value]) => Boolean(value)),
  ) as MetaCapiUserData;
};

export async function POST(request: NextRequest) {
  try {
    const accessToken = process.env.META_PIXEL_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'META_PIXEL_ACCESS_TOKEN is not configured' },
        { status: 500 },
      );
    }

    const body = (await request.json()) as MetaEventRequestBody;
    const { eventName, eventData, eventId, userData = {} } = body;

    if (!eventName || typeof eventName !== 'string') {
      return NextResponse.json(
        { success: false, error: 'eventName is required' },
        { status: 400 },
      );
    }

    if (!eventData || typeof eventData !== 'object') {
      return NextResponse.json(
        { success: false, error: 'eventData must be an object' },
        { status: 400 },
      );
    }

    const dedupeEventId = eventId || randomUUID();
    const payload = {
      ...(process.env.META_PIXEL_TEST_CODE && {
        test_event_code: process.env.META_PIXEL_TEST_CODE,
      }),
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: dedupeEventId,
          action_source: 'website',
          event_source_url: request.headers.get('referer') ?? undefined,
          user_data: sanitizeUserData(userData, request),
          custom_data: eventData,
        },
      ],
    };

    const metaResponse = await fetch(
      `${META_EVENT_ENDPOINT}?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      },
    );

    const responseData = await metaResponse.json().catch(() => null);

    if (!metaResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send event to Meta Conversions API',
          details: responseData,
        },
        { status: metaResponse.status },
      );
    }

    return NextResponse.json({
      success: true,
      eventId: dedupeEventId,
      data: responseData,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error while sending Meta event' },
      { status: 500 },
    );
  }
}
