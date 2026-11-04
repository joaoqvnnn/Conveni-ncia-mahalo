import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";

export default function Offers() {
  return (
    <section className="bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-black text-white">
            <Tag size={22} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Ofertas especiais
            </h2>
            <p className="text-gray-500 text-sm mt-1 max-w-md">
              Descontos por tempo limitado em produtos selecionados.
            </p>
          </div>
        </div>
        <Link
          href="/ofertas"
          className="inline-flex items-center gap-2 text-sm font-medium border-b border-black pb-1 hover:gap-3 transition-all"
        >
          Ver todas as ofertas
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
