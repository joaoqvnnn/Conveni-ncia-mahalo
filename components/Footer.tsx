import Link from "next/link";
import { Instagram, MapPin, Phone, Clock } from "lucide-react";
import { store } from "@/lib/store";

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-tight">
              {store.name}
            </span>
            <span className="text-[10px] tracking-[0.2em] text-white/50">
              {store.tagline}
            </span>
          </div>
          <p className="mt-4 text-xs text-white/60 leading-relaxed">
            Delivery e conveniência com praticidade. Pedidos online, pagamento
            por PIX ou combinado pelo WhatsApp.
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wider text-white/50 mb-4">
            Navegação
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/produtos" className="hover:underline">Produtos</Link></li>
            <li><Link href="/categorias" className="hover:underline">Categorias</Link></li>
            <li><Link href="/ofertas" className="hover:underline">Ofertas</Link></li>
            <li><Link href="/sobre" className="hover:underline">Sobre nós</Link></li>
            <li><Link href="/contato" className="hover:underline">Contato</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wider text-white/50 mb-4">
            Atendimento
          </h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 shrink-0" />
              {store.address}
            </li>
            <li className="flex items-start gap-2">
              <Clock size={14} className="mt-0.5 shrink-0" />
              {store.hours}
            </li>
            <li className="flex items-start gap-2">
              <Phone size={14} className="mt-0.5 shrink-0" />
              <a href={`https://wa.me/${store.whatsapp}`} className="hover:underline">
                {store.whatsappDisplay}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Instagram size={14} className="mt-0.5 shrink-0" />
              {store.instagram}
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wider text-white/50 mb-4">
            Legal
          </h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link href="/privacidade" className="hover:underline">Política de privacidade</Link></li>
            <li><Link href="/termos" className="hover:underline">Termos de uso</Link></li>
            <li><Link href="/entrega" className="hover:underline">Política de entrega</Link></li>
            <li><Link href="/cancelamento" className="hover:underline">Cancelamento</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <span>© {new Date().getFullYear()} {store.name}. Todos os direitos reservados.</span>
          <span>CNPJ {store.cnpj}</span>
        </div>
      </div>
    </footer>
  );
}
