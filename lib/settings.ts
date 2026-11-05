import { prisma } from "./db";

export const DEFAULT_SETTINGS: Record<string, string> = {
  storeName: "Conveniência",
  whatsapp: "5544999999999",
  hours: "18h às 02h",
  region: "Paranavaí e região",
  deliveryFee: "5.00",
  freeDeliveryAbove: "80.00",
  minOrder: "15.00",
  autoConfirmOrders: "false",
  telegramChatId: "",
};

export type Settings = Record<string, string>;

export async function getSettings(): Promise<Settings> {
  const rows = await prisma.setting.findMany();
  const out: Settings = { ...DEFAULT_SETTINGS };
  for (const r of rows) out[r.key] = r.value;
  return out;
}

export async function setSetting(key: string, value: string) {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
