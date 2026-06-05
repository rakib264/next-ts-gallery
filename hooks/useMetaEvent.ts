'use client';

import { useCallback } from 'react';
import type {
  EventDataForName,
  MetaEventData,
  MetaEventName,
  MetaEventRequestBody,
  MetaUserDataInput,
  TrackMetaEventOptions,
} from '@/types/meta';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const getCookieValue = (cookieName: string): string | undefined => {
  if (typeof document === 'undefined') {
    return undefined;
  }

  const target = `${cookieName}=`;
  const cookie = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(target));

  if (!cookie) {
    return undefined;
  }

  return decodeURIComponent(cookie.slice(target.length));
};

const buildUserData = (userData: MetaUserDataInput = {}): MetaUserDataInput => {
  const fbp = getCookieValue('_fbp');
  const fbc = getCookieValue('_fbc');

  return {
    ...userData,
    fbp: userData.fbp ?? fbp,
    fbc: userData.fbc ?? fbc,
  };
};

export function useMetaEvent() {
  const trackMetaEvent = useCallback(
    <TEventName extends MetaEventName>(
      eventName: TEventName,
      eventData: EventDataForName<TEventName>,
      options: TrackMetaEventOptions = {},
    ): string => {
      const eventId = options.eventId ?? crypto.randomUUID();
      const userData = buildUserData(options.userData);

      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', eventName, eventData, { eventID: eventId });
      }

      const payload: MetaEventRequestBody = {
        eventName,
        eventData: eventData as MetaEventData,
        eventId,
        userData,
      };

      void fetch('/api/meta-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => undefined);

      return eventId;
    },
    [],
  );

  return { trackMetaEvent };
}
