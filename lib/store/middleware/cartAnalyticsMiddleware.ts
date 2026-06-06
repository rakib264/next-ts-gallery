import {
  mapCartItemToGA4Item,
  trackAddToCart,
  trackRemoveFromCart,
} from '@/lib/analytics';
import type { Middleware } from '@reduxjs/toolkit';

interface CartItemLike {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
  category?: string;
}

interface StateLike {
  cart?: {
    items?: CartItemLike[];
  };
}

interface AddToCartActionPayload {
  id?: string;
  name?: string;
  price?: number;
  quantity?: number;
  variant?: string;
  category?: string;
}

interface RemoveFromCartActionPayload {
  id?: string;
  variant?: string;
}

interface UpdateQuantityActionPayload {
  id?: string;
  variant?: string;
  quantity?: number;
}

const getCartItemsFromState = (state: unknown): CartItemLike[] => {
  const typedState = state as StateLike;
  return typedState.cart?.items ?? [];
};

const isMatchingItem = (
  item: CartItemLike,
  id: string,
  variant?: string,
): boolean => {
  const currentVariant = item.variant ?? undefined;
  const targetVariant = variant ?? undefined;

  return item.id === id && currentVariant === targetVariant;
};

const findItemFromCart = (
  items: CartItemLike[],
  id: string,
  variant?: string,
): CartItemLike | undefined => {
  return items.find((item) => isMatchingItem(item, id, variant));
};

const findItemQuantity = (
  items: CartItemLike[],
  id: string,
  variant?: string,
): number => {
  const item = findItemFromCart(items, id, variant);
  return item?.quantity ?? 0;
};

const trackQuantityDelta = (
  item: CartItemLike,
  delta: number,
): void => {
  if (delta === 0) {
    return;
  }

  const gaItem = mapCartItemToGA4Item({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: Math.abs(delta),
    category: item.category,
  });

  if (!gaItem) {
    return;
  }

  const value = gaItem.price * gaItem.quantity;

  if (delta > 0) {
    trackAddToCart({ items: [gaItem], value });
    return;
  }

  trackRemoveFromCart({ items: [gaItem], value });
};

export const cartAnalyticsMiddleware: Middleware =
  (storeApi) => (next) => (action) => {
    const actionPayload = action as { type?: unknown; payload?: unknown };

    if (typeof actionPayload.type !== 'string') {
      return next(action);
    }

    const previousCartItems = getCartItemsFromState(storeApi.getState());
    const result = next(action);
    const nextCartItems = getCartItemsFromState(storeApi.getState());

    if (actionPayload.type === 'cart/addToCart') {
      const payload = actionPayload.payload as AddToCartActionPayload | undefined;

      if (!payload?.id || !payload.name || typeof payload.price !== 'number') {
        return result;
      }

      const previousQuantity = findItemQuantity(
        previousCartItems,
        payload.id,
        payload.variant,
      );
      const currentQuantity = findItemQuantity(
        nextCartItems,
        payload.id,
        payload.variant,
      );

      const addedQuantity = currentQuantity - previousQuantity;
      if (addedQuantity <= 0) {
        return result;
      }

      const gaItem = mapCartItemToGA4Item({
        id: payload.id,
        name: payload.name,
        price: payload.price,
        quantity: addedQuantity,
        category: payload.category,
      });

      if (!gaItem) {
        return result;
      }

      trackAddToCart({
        items: [gaItem],
        value: gaItem.price * gaItem.quantity,
      });

      return result;
    }

    if (actionPayload.type === 'cart/removeFromCart') {
      const payload = actionPayload.payload as
        | RemoveFromCartActionPayload
        | undefined;

      if (!payload?.id) {
        return result;
      }

      const removedItem = findItemFromCart(
        previousCartItems,
        payload.id,
        payload.variant,
      );

      if (!removedItem) {
        return result;
      }

      const gaItem = mapCartItemToGA4Item(removedItem);
      if (!gaItem) {
        return result;
      }

      trackRemoveFromCart({
        items: [gaItem],
        value: gaItem.price * gaItem.quantity,
      });

      return result;
    }

    if (actionPayload.type === 'cart/updateQuantity') {
      const payload = actionPayload.payload as
        | UpdateQuantityActionPayload
        | undefined;

      if (!payload?.id) {
        return result;
      }

      const previousItem = findItemFromCart(
        previousCartItems,
        payload.id,
        payload.variant,
      );
      const currentItem = findItemFromCart(
        nextCartItems,
        payload.id,
        payload.variant,
      );

      if (!previousItem || !currentItem) {
        return result;
      }

      const delta = currentItem.quantity - previousItem.quantity;
      trackQuantityDelta(currentItem, delta);
      return result;
    }

    if (actionPayload.type === 'cart/clearCart') {
      if (previousCartItems.length === 0) {
        return result;
      }

      const removedItems = previousCartItems
        .map((item) => mapCartItemToGA4Item(item))
        .filter((item): item is NonNullable<typeof item> => item !== null);

      if (removedItems.length === 0) {
        return result;
      }

      const value = removedItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      );

      trackRemoveFromCart({
        items: removedItems,
        value,
      });
    }

    return result;
  };
