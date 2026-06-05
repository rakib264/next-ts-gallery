export type MetaCurrency = 'BDT';

export interface ViewContentMetaEventData {
  content_ids: string[];
  content_type: string;
  value: number;
  currency: MetaCurrency;
}

export interface AddToCartMetaEventData {
  content_ids: string[];
  value: number;
  currency: MetaCurrency;
}

export interface InitiateCheckoutMetaEventData {
  num_items: number;
  value: number;
  currency: MetaCurrency;
}

export interface PurchaseMetaEventData {
  value: number;
  currency: MetaCurrency;
  content_ids: string[];
  num_items: number;
}

export interface MetaEventPayloadMap {
  ViewContent: ViewContentMetaEventData;
  AddToCart: AddToCartMetaEventData;
  InitiateCheckout: InitiateCheckoutMetaEventData;
  Purchase: PurchaseMetaEventData;
}

export type KnownMetaEventName = keyof MetaEventPayloadMap;
export type MetaEventName = KnownMetaEventName | (string & {});
export type MetaEventData = Record<string, unknown>;

export type EventDataForName<TEventName extends MetaEventName> =
  TEventName extends KnownMetaEventName
    ? MetaEventPayloadMap[TEventName]
    : MetaEventData;

export interface MetaUserDataInput {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  fbp?: string;
  fbc?: string;
  [key: string]: string | undefined;
}

export interface MetaCapiUserData {
  em?: string;
  ph?: string;
  fn?: string;
  ln?: string;
  fbp?: string;
  fbc?: string;
  client_ip_address?: string;
  client_user_agent?: string;
}

export interface MetaEventRequestBody<
  TEventName extends MetaEventName = MetaEventName,
  TEventData extends MetaEventData = MetaEventData,
> {
  eventName: TEventName;
  eventData: TEventData;
  eventId?: string;
  userData?: MetaUserDataInput;
}

export interface TrackMetaEventOptions {
  eventId?: string;
  userData?: MetaUserDataInput;
}
