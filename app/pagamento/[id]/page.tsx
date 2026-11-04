"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Copy, Check, Loader2, QrCode } from "lucide-react";
import Link from "next/link";

export default function PagamentoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [pix, setPix] = useState<{
    qrCode: string;
    copiaECola: string;
    expiresAt: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);

  // Cria o PIX ao montar
  useEffect(() => {
    fetch("/api/pix/criar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: id }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setPix(d);
      })
      .catch(() => setError("Erro ao gerar PIX."));
  }, [id]);

  // Polling: verifica se o pedido já foi pago
  useEffect(() => {
    if (!pix) return;
    const interval = setInterval(async () => {
      setChecking(true);
      try {
        const res = await fetch(`/api/pix/status?orderId=${id}`);
        const d = await res.json();
        if (d.status === "PAGO") {
          clearInterval(interval);
          router.push(`/pedido/${d.number}?paid=1`);
        }
      } catch {}
      setChecking(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [pix, id, router]);

  function copy() {
    if (!pix) return;
    navigator.clipboard.writeText(pix.copiaECola);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (error) {
    return (
      <section className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 p-3">
          {error}
        </p>
        <Link href="/carrinho" className="mt-6 inline-block bg-black text-white px-5 py-2 text-sm">
          Voltar ao carrinho
        </Link>
      </section>
    );
  }

  if (!pix) {
    return (
      <section className="max-w-xl mx-auto px-4 py-20 text-center">
        <Loader2 size={28} className="animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Gerando seu PIX...</p>
      </section>
    );
  }

  return (
    <section className="max-w-xl mx-auto px-4 py-12">
      <div className="text-center mb-6">
        <QrCode size={36} className="mx-auto mb-3" />
        <h1 className="text-2xl font-bold">Pague com PIX</h1>
        <p className="text-sm text-gray-600 mt-2">
          Escaneie o QR Code ou use o copia e cola. O pedido será confirmado
          automaticamente.
        </p>
      </div>

      <div className="border border-gray-200 p-5 space-y-5">
        {pix.qrCode && (
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/png;base64,${pix.qrCode}`}
              alt="QR Code PIX"
              className="w-52 h-52"
            />
          </div>
        )}

        <div>
          <label className="text-xs uppercase tracking-wider text-gray-500 mb-2 block">
            PIX copia e cola
          </label>
          <div className="flex gap-2">
            <input
              readOnly
              value={pix.copiaECola}
              className="flex-1 border border-gray-200 px-3 py-2 text-xs font-mono truncate"
            />
            <button
              onClick={copy}
              className="bg-black text-white px-4 text-sm flex items-center gap-1.5 hover:bg-black/90"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
          <span>
            {pix.expiresAt
              ? `Expira em ${new Date(pix.expiresAt).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : "Aguardando pagamento"}
          </span>
          {checking && (
            <span className="flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" /> verificando...
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center leading-relaxed">
        Assim que o pagamento for confirmado, você será redirecionado
        automaticamente. Pode fechar esta página e voltar depois pelo link do
        pedido.
      </p>
    </section>
  );
}
