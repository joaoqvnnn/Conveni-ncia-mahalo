import { Plus, Heart } from "lucide-react";

const products = [
  { id: 1, name: "Produto exemplo 1", price: 9.9, oldPrice: 12.9, category: "Bebidas" },
  { id: 2, name: "Produto exemplo 2", price: 14.9, category: "Mercearia" },
  { id: 3, name: "Produto exemplo 3", price: 7.5, oldPrice: 9.9, category: "Snacks" },
  { id: 4, name: "Produto exemplo 4", price: 22.9, category: "Doces" },
];

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function FeaturedProducts() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16 border-t border-gray-100">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Produtos em destaque
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Selecionados pela loja.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="border border-gray-200 hover:border-black transition-colors flex flex-col"
          >
            <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
              <span className="text-xs text-gray-400">foto do produto</span>
              <button
                className="absolute top-2 right-2 p-1.5 bg-white border border-gray-200 rounded-full hover:border-black"
                aria-label="Favoritar"
              >
                <Heart size={14} />
              </button>
            </div>
            <div className="p-4 flex flex-col gap-1 flex-1">
              <span className="text-[10px] uppercase tracking-wider text-gray-500">
                {p.category}
              </span>
              <h3 className="text-sm font-medium leading-tight">{p.name}</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-base font-bold">{brl(p.price)}</span>
                {p.oldPrice && (
                  <span className="text-xs text-gray-400 line-through">
                    {brl(p.oldPrice)}
                  </span>
                )}
              </div>
              <button className="mt-3 w-full bg-black text-white text-xs font-medium py-2 flex items-center justify-center gap-1.5 hover:bg-black/90 transition-colors">
                <Plus size={14} />
                ADICIONAR
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
