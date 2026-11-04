import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 flex flex-col items-center text-center">
        <span className="text-xs tracking-[0.3em] text-white/60 mb-4">
          PEDIDOS ONLINE
        </span>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight max-w-3xl">
          Tudo o que você precisa, em um só lugar.
        </h1>
        <p className="mt-6 text-white/70 max-w-xl text-sm sm:text-base">
          Faça seu pedido sem sair de casa. Escolha seus produtos e receba com
          praticidade.
        </p>
        <Link
          href="/produtos"
          className="mt-8 inline-flex items-center gap-2 bg-white text-black px-6 py-3 text-sm font-medium hover:bg-white/90 transition-colors"
        >
          FAÇA SEU PEDIDO
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
