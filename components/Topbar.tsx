import { MapPin, Clock, Phone, Truck } from "lucide-react";
import { store } from "@/lib/store";

export default function Topbar() {
  return (
    <div className="bg-black text-white text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <MapPin size={14} />
            <span className="hidden sm:inline">Atendemos {store.region}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} />
            {store.hours}
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                store.isOpen ? "bg-white" : "bg-white/40"
              }`}
            />
            {store.isOpen ? "Aberto" : "Fechado"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:flex items-center gap-1.5">
            <Truck size={14} />
            Entrega em toda a região
          </span>
          <a
            href={`https://wa.me/${store.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:underline"
          >
            <Phone size={14} />
            {store.whatsappDisplay}
          </a>
        </div>
      </div>
    </div>
  );
}
