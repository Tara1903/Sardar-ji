const { z } = require('zod');

const addressSchema = z.object({
  name: z.string().min(2),
  phoneNumber: z.string().min(10),
  fullAddress: z.string().min(10),
  landmark: z.string().optional().default(''),
  pincode: z.string().min(6),
});

const productSchema = z.object({
  name: z.string().min(2),
  price: z.number().min(1),
  description: z.string().min(4),
  category: z.string().min(2),
  image: z.string().optional().default(''),
  badge: z.string().optional().default(''),
  isAvailable: z.boolean().default(true),
});

const categorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().default(''),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2),
  phoneNumber: z.string().min(10),
  role: z.enum(['customer', 'admin', 'delivery']).default('customer'),
  referralCode: z.string().optional().or(z.literal('')),
});

const orderItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().min(1),
  image: z.string(),
  quantity: z.number().min(1),
});

const orderCreateSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  address: addressSchema,
  paymentMethod: z.enum(['COD', 'ONLINE']).default('COD'),
  couponCode: z.string().optional().default(''),
  note: z.string().optional().default(''),
});

const orderStatusSchema = z.object({
  status: z.enum(['Order Placed', 'Preparing', 'Out for Delivery', 'Delivered']),
  assignedDeliveryBoyId: z.string().optional(),
});

const referralApplySchema = z.object({
  referralCode: z.string().min(4),
});

const deliveryLocationSchema = z.object({
  orderId: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});

const settingsSchema = z.object({
  businessName: z.string().optional(),
  tagline: z.string().optional(),
  whatsappNumber: z.string().optional(),
  phoneNumber: z.string().optional(),
  timings: z.string().optional(),
  mapsEmbedUrl: z.string().optional(),
  deliveryRules: z
    .object({
      freeDeliveryThreshold: z.number().optional(),
      deliveryFeeBelowThreshold: z.number().optional(),
      handlingFeeBelowThreshold: z.number().optional(),
      estimatedDeliveryMinutes: z.number().optional(),
    })
    .optional(),
  offers: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
      }),
    )
    .optional(),
});

module.exports = {
  addressSchema,
  categorySchema,
  deliveryLocationSchema,
  loginSchema,
  orderCreateSchema,
  orderStatusSchema,
  productSchema,
  referralApplySchema,
  registerSchema,
  settingsSchema,
};
