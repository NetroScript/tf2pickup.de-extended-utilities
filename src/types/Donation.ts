import { z } from 'zod';

export const shippingSchema = z.object({
  full_name: z.string(),
  street_address: z.string(),
  city: z.string(),
  state_or_province: z.string(),
  postal_code: z.string(),
  country: z.string(),
  country_code: z.string(),
  telephone: z.string()
});

export const shopItemSchema = z.object({
  direct_link_code: z.string(),
  variation_name: z.string(),
  quantity: z.number()
});

export const KOFIDonationSchema = z.object({
  verification_token: z.string(),
  message_id: z.string(),
  timestamp: z.string().datetime(),
  type: z.string(),
  is_public: z.boolean(),
  from_name: z.string().nullable(),
  message: z.string().nullable(),
  amount: z.string(),
  url: z.string(),
  email: z.string(),
  currency: z.string(),
  is_subscription_payment: z.boolean(),
  is_first_subscription_payment: z.boolean(),
  kofi_transaction_id: z.string(),
  shop_items: z.array(shopItemSchema).nullable(),
  tier_name: z.string().nullable(),
  shipping: shippingSchema.nullable()
});

export type KOFIDonation = typeof KOFIDonationSchema._output;

export type Shipping = typeof shippingSchema._output;
export type ShopItem = typeof shopItemSchema._output;
