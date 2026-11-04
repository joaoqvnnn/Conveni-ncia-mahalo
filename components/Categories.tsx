import {
  Beer,
  Coffee,
  Candy,
  ShoppingBasket,
  Snowflake,
  Package,
} from "lucide-react";

const categories = [
  { name: "Bebidas", icon: Beer, href: "/categorias/bebidas" },
  { name: "Mercearia", icon: ShoppingBasket, href: "/categorias/mercearia" },
  { name: "Snacks", icon: Package, href: "/categorias/snacks" },
  { name: "Doces", icon: Candy, href: "/categorias/doces" },
  { name: "Gelo", icon: Snowflake, href: "/categorias/gelo" },
  { name: "Café", icon: Coffee, href: "/categorias/cafe" },
];

export default function Categories() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Categorias
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Navegue por tipo de produto.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((c) => (
          <a
            key={c.name}
            href={c.href}
            className="group border border-gray-200 p-5 flex flex-col items-center gap-3 hover:border-black hover:bg-gray-50 transition-colors"
          >
            <c.icon size={28} strokeWidth={1.5} />
            <span className="text-sm font-medium">{c.name}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
