import { MapPin, Clock, ShieldCheck } from "lucide-react";
import { store } from "@/lib/store";

export default function About() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs tracking-[0.3em] text-gray-500">
            SOBRE NÓS
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">
            Praticidade do começo ao fim.
          </h2>
          <p className="mt-4 text-gray-600 text-sm leading-relaxed">
            Atendemos {store.region} com entrega rápida e produtos de qualidade.
            Faça seu pedido pelo site, pague por PIX ou combine pelo WhatsApp, e
            receba onde estiver.
          </p>
        </div>
        <div className="grid gap-4">
          <div className="flex items-start gap-4 border border-gray-200 p-5">
            <MapPin size={20} strokeWidth={1.5} />
            <div>
              <h3 className="text-sm font-medium">Atendemos {store.region}</h3>
              <p className="text-xs text-gray-500 mt-1">
                {store.address}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 border border-gray-200 p-5">
            <Clock size={20} strokeWidth={1.5} />
            <div>
              <h3 className="text-sm font-medium">Funcionamento</h3>
              <p className="text-xs text-gray-500 mt-1">{store.hours}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 border border-gray-200 p-5">
            <ShieldCheck size={20} strokeWidth={1.5} />
            <div>
              <h3 className="text-sm font-medium">Compra protegida</h3>
              <p className="text-xs text-gray-500 mt-1">
                Dados tratados conforme a LGPD.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
