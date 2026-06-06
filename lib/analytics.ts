'use client';

export const GA4_CURRENCY = 'BDT' as const;
export type GA4Currency = typeof GA4_CURRENCY;

const DEFAULT_ITEM_CATEGORY = 'Uncategorized';

type Gtag = (...args: [command: string, ...params: unknown[]]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

export interface GA4Item {
  item_id: string;
  item_name: string;
  item_category: string;
  price: number;
  quantity: number;
  currency: GA4Currency;
}

interface GA4EventParamsMap {
  page_view: {
    page_title?: string;
    page_location?: string;
    page_path?: string;
  };
  view_item_list: {
    item_list_id?: string;
    item_list_name?: string;
    items: GA4Item[];
  };
  view_item: {
    currency: GA4Currency;
    value: number;
    items: GA4Item[];
  };
  add_to_cart: {
    currency: GA4Currency;
    value: number;
    items: GA4Item[];
  };
  remove_from_cart: {
    currency: GA4Currency;
    value: number;
    items: GA4Item[];
  };
  view_cart: {
    currency: GA4Currency;
    value: number;
    items: GA4Item[];
  };
  begin_checkout: {
    currency: GA4Currency;
    value: number;
    coupon?: string;
    items: GA4Item[];
  };
  add_shipping_info: {
    currency: GA4Currency;
    value: number;
    shipping_tier?: string;
    coupon?: string;
    items: GA4Item[];
  };
  add_payment_info: {
    currency: GA4Currency;
    value: number;
    payment_type?: string;
    coupon?: string;
    items: GA4Item[];
  };
  purchase: {
    transaction_id: string;
    value: number;
    currency: GA4Currency;
    shipping?: number;
    tax?: number;
    coupon?: string;
    items: GA4Item[];
  };
  login: {
    method: string;
  };
  sign_up: {
    method: string;
  };
}

type GA4EventName = keyof GA4EventParamsMap;

export interface AnalyticsProductLike {
  _id?: string;
  id?: string;
  name?: string;
  price?: number;
  quantity?: number;
  category?: string | { name?: string | null } | null;
}

export interface AnalyticsCartItemLike {
  id?: string;
  name?: string;
  price?: number;
  quantity?: number;
  category?: string | null;
}

interface BuildGA4ItemInput {
  itemId: string;
  itemName: string;
  itemCategory?: string | null;
  price: number;
  quantity?: number;
  currency?: GA4Currency;
}

const isAnalyticsReady = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    process.env.NODE_ENV === 'production' &&
    Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) &&
    typeof window.gtag === 'function'
  );
};

const sendGA4Event = <TEventName extends GA4EventName>(
  eventName: TEventName,
  eventParams: GA4EventParamsMap[TEventName],
): void => {
  if (!isAnalyticsReady()) {
    return;
  }

  window.gtag?.('event', eventName, eventParams);
};

const normalizeItemCategory = (itemCategory?: string | null): string => {
  if (!itemCategory?.trim()) {
    return DEFAULT_ITEM_CATEGORY;
  }

  return itemCategory.trim();
};

const getItemsValue = (items: GA4Item[]): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

export const buildGA4Item = ({
  itemId,
  itemName,
  itemCategory,
  price,
  quantity = 1,
  currency = GA4_CURRENCY,
}: BuildGA4ItemInput): GA4Item => {
  return {
    item_id: itemId,
    item_name: itemName,
    item_category: normalizeItemCategory(itemCategory),
    price,
    quantity,
    currency,
  };
};

export const mapProductToGA4Item = (
  product: AnalyticsProductLike,
  options?: { quantity?: number; fallbackCategory?: string },
): GA4Item | null => {
  const itemId = product.id ?? product._id;
  const itemName = product.name;
  const itemPrice = product.price;

  if (!itemId || !itemName || typeof itemPrice !== 'number') {
    return null;
  }

  const productCategory =
    typeof product.category === 'string'
      ? product.category
      : product.category?.name;

  return buildGA4Item({
    itemId,
    itemName,
    itemCategory: productCategory ?? options?.fallbackCategory,
    price: itemPrice,
    quantity: options?.quantity ?? product.quantity ?? 1,
  });
};

export const mapCartItemToGA4Item = (
  item: AnalyticsCartItemLike,
  options?: { quantity?: number; fallbackCategory?: string },
): GA4Item | null => {
  if (!item.id || !item.name || typeof item.price !== 'number') {
    return null;
  }

  return buildGA4Item({
    itemId: item.id,
    itemName: item.name,
    itemCategory: item.category ?? options?.fallbackCategory,
    price: item.price,
    quantity: options?.quantity ?? item.quantity ?? 1,
  });
};

export const trackPageView = (params: {
  pagePath: string;
  pageTitle?: string;
  pageLocation?: string;
}): void => {
  const fallbackLocation =
    typeof window !== 'undefined'
      ? `${window.location.origin}${params.pagePath}`
      : undefined;

  sendGA4Event('page_view', {
    page_path: params.pagePath,
    page_title: params.pageTitle,
    page_location: params.pageLocation ?? fallbackLocation,
  });
};

export const trackViewItemList = (params: {
  items: GA4Item[];
  itemListId?: string;
  itemListName?: string;
}): void => {
  if (params.items.length === 0) {
    return;
  }

  sendGA4Event('view_item_list', {
    item_list_id: params.itemListId,
    item_list_name: params.itemListName,
    items: params.items,
  });
};

export const trackViewItem = (params: {
  items: GA4Item[];
  value?: number;
  currency?: GA4Currency;
}): void => {
  if (params.items.length === 0) {
    return;
  }

  sendGA4Event('view_item', {
    currency: params.currency ?? GA4_CURRENCY,
    value: params.value ?? getItemsValue(params.items),
    items: params.items,
  });
};

export const trackAddToCart = (params: {
  items: GA4Item[];
  value?: number;
  currency?: GA4Currency;
}): void => {
  if (params.items.length === 0) {
    return;
  }

  sendGA4Event('add_to_cart', {
    currency: params.currency ?? GA4_CURRENCY,
    value: params.value ?? getItemsValue(params.items),
    items: params.items,
  });
};

export const trackRemoveFromCart = (params: {
  items: GA4Item[];
  value?: number;
  currency?: GA4Currency;
}): void => {
  if (params.items.length === 0) {
    return;
  }

  sendGA4Event('remove_from_cart', {
    currency: params.currency ?? GA4_CURRENCY,
    value: params.value ?? getItemsValue(params.items),
    items: params.items,
  });
};

export const trackViewCart = (params: {
  items: GA4Item[];
  value?: number;
  currency?: GA4Currency;
}): void => {
  sendGA4Event('view_cart', {
    currency: params.currency ?? GA4_CURRENCY,
    value: params.value ?? getItemsValue(params.items),
    items: params.items,
  });
};

export const trackBeginCheckout = (params: {
  items: GA4Item[];
  value?: number;
  currency?: GA4Currency;
  coupon?: string;
}): void => {
  if (params.items.length === 0) {
    return;
  }

  sendGA4Event('begin_checkout', {
    currency: params.currency ?? GA4_CURRENCY,
    value: params.value ?? getItemsValue(params.items),
    coupon: params.coupon,
    items: params.items,
  });
};

export const trackAddShippingInfo = (params: {
  items: GA4Item[];
  value?: number;
  currency?: GA4Currency;
  coupon?: string;
  shippingTier?: string;
}): void => {
  if (params.items.length === 0) {
    return;
  }

  sendGA4Event('add_shipping_info', {
    currency: params.currency ?? GA4_CURRENCY,
    value: params.value ?? getItemsValue(params.items),
    shipping_tier: params.shippingTier,
    coupon: params.coupon,
    items: params.items,
  });
};

export const trackAddPaymentInfo = (params: {
  items: GA4Item[];
  value?: number;
  currency?: GA4Currency;
  coupon?: string;
  paymentType?: string;
}): void => {
  if (params.items.length === 0) {
    return;
  }

  sendGA4Event('add_payment_info', {
    currency: params.currency ?? GA4_CURRENCY,
    value: params.value ?? getItemsValue(params.items),
    payment_type: params.paymentType,
    coupon: params.coupon,
    items: params.items,
  });
};

export const trackPurchase = (params: {
  transactionId: string;
  items: GA4Item[];
  value?: number;
  currency?: GA4Currency;
  shipping?: number;
  tax?: number;
  coupon?: string;
}): void => {
  if (!params.transactionId || params.items.length === 0) {
    return;
  }

  sendGA4Event('purchase', {
    transaction_id: params.transactionId,
    value: params.value ?? getItemsValue(params.items),
    currency: params.currency ?? GA4_CURRENCY,
    shipping: params.shipping,
    tax: params.tax,
    coupon: params.coupon,
    items: params.items,
  });
};

export const trackLogin = (method: string): void => {
  if (!method) {
    return;
  }

  sendGA4Event('login', { method });
};

export const trackSignUp = (method: string): void => {
  if (!method) {
    return;
  }

  sendGA4Event('sign_up', { method });
};
