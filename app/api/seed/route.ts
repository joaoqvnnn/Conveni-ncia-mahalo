import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const categories = [
  { name: "Bebidas", slug: "bebidas", icon: "Beer", order: 1 },
  { name: "Mercearia", slug: "mercearia", icon: "ShoppingBasket", order: 2 },
  { name: "Snacks", slug: "snacks", icon: "Package", order: 3 },
  { name: "Doces", slug: "doces", icon: "Candy", order: 4 },
  { name: "Gelo", slug: "gelo", icon: "Snowflake", order: 5 },
  { name: "Café", slug: "cafe", icon: "Coffee", order: 6 },
];

const products = [
  { name: "Cerveja Lata 350ml", slug: "cerveja-lata-350ml", price: 3.99, oldPrice: 5.49, category: "bebidas", stock: 120, featured: true, sales: 340 },
  { name: "Refrigerante 2L", slug: "refrigerante-2l", price: 8.9, category: "bebidas", stock: 80, featured: true, sales: 210 },
  { name: "Água Mineral 500ml", slug: "agua-mineral-500ml", price: 2.5, category: "bebidas", stock: 200, sales: 180 },
  { name: "Energético 250ml", slug: "energetico-250ml", price: 9.9, oldPrice: 12.9, category: "bebidas", stock: 60, featured: true, sales: 150 },
  { name: "Arroz 5kg", slug: "arroz-5kg", price: 24.9, category: "mercearia", stock: 40, sales: 90 },
  { name: "Feijão 1kg", slug: "feijao-1kg", price: 7.49, category: "mercearia", stock: 55, sales: 75 },
  { name: "Óleo de Soja 900ml", slug: "oleo-soja-900ml", price: 6.89, category: "mercearia", stock: 70, sales: 60 },
  { name: "Macarrão 500g", slug: "macarrao-500g", price: 4.29, category: "mercearia", stock: 90, sales: 50 },
  { name: "Salgadinho 100g", slug: "salgadinho-100g", price: 5.9, oldPrice: 7.9, category: "snacks", stock: 100, featured: true, sales: 220 },
  { name: "Biscoito Recheado", slug: "biscoito-recheado", price: 3.49, category: "snacks", stock: 130, sales: 140 },
  { name: "Amendoim 150g", slug: "amendoim-150g", price: 4.9, category: "snacks", stock: 80, sales: 40 },
  { name: "Chocolate ao Leite 90g", slug: "chocolate-ao-leite-90g", price: 6.5, category: "doces", stock: 75, featured: true, sales: 190 },
  { name: "Bala de Goma 500g", slug: "bala-de-goma-500g", price: 9.9, category: "doces", stock: 40, sales: 30 },
  { name: "Sorvete 1L", slug: "sorvete-1l", price: 18.9, oldPrice: 22.9, category: "doces", stock: 25, sales: 55 },
  { name: "Gelo em Cubos 2kg", slug: "gelo-em-cubos-2kg", price: 8.9, category: "gelo", stock: 60, featured: true, sales: 130 },
  { name: "Gelo em Barra 5kg", slug: "gelo-em-barra-5kg", price: 14.9, category: "gelo", stock: 30, sales: 45 },
  { name: "Café em Pó 500g", slug: "cafe-em-po-500g", price: 16.9, category: "cafe", stock: 50, featured: true, sales: 110 },
  { name: "Cápsula de Café (10un)", slug: "capsula-de-cafe-10un", price: 21.9, category: "cafe", stock: 35, sales: 70 },
];

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("secret") !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const existing = await prisma.product.count();
  if (existing > 0) {
    return NextResponse.json({ ok: true, message: "already seeded", count: existing });
  }

  const createdCats: Record<string, string> = {};
  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    createdCats[c.slug] = cat.id;
  }

  for (const p of products) {
    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.name,
        price: p.price,
        oldPrice: p.oldPrice ?? null,
        stock: p.stock,
        featured: p.featured ?? false,
        salesCount: p.sales ?? 0,
        categoryId: createdCats[p.category],
      },
    });
  }

  return NextResponse.json({ ok: true, message: "seeded", products: products.length });
}
