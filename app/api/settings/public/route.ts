import { getSettings } from "@/lib/settings";
import { NextResponse } from "next/server";

export async function GET() {
  const s = await getSettings();
  return NextResponse.json({
    storeName: s.storeName,
    whatsapp: s.whatsapp,
    hours: s.hours,
    region: s.region,
    deliveryFee: Number(s.deliveryFee),
    freeDeliveryAbove: Number(s.freeDeliveryAbove),
    minOrder: Number(s.minOrder),
  });
}
