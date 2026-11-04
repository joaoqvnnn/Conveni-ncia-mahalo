import { MercadoPagoConfig, Payment } from "mercadopago";

if (!process.env.MP_ACCESS_TOKEN) {
  throw new Error("MP_ACCESS_TOKEN não configurado");
}

export const mpConfig = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { timeout: 8000 },
});

export const mpPayment = new Payment(mpConfig);

export const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET || "";
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
