export interface EmailSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  logo?: string;
  primaryColor: string;
  secondaryColor?: string;
}

export interface EmailTemplateData extends EmailSettings {
  customerName?: string;
  orderNumber?: string;
  orderDate?: string;
  total?: string;
  paymentMethod?: string;
  deliveryType?: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
    variant?: string;
  }>;
  invoicePath?: string;
  content?: string;
  subject?: string;
}
