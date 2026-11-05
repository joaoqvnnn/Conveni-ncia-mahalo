"use client";

import { useFormState } from "react-dom";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetAction } from "@/app/actions/auth";

export default function RedefinirSenhaPage() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [state, action] = useFormState(resetAction, null);

  if (!token) {
    return (
      <section className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-sm text-red-600">Link inválido.</p>
        <Link href="/recuperar-senha" className="mt-4 inline-block underline text-sm">
          Solicitar novo link
        </Link>
      </section>
    );
  }

  return (
    <section className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-xl font-bold mb-4">Criar nova senha</h1>

      {state?.ok ? (
        <div className="border border-green-200 bg-green-50 text-green-800 text-sm p-3">
          {state.message}{" "}
          <Link href="/entrar" className="underline font-medium">
            Entrar agora
          </Link>
        </div>
      ) : (
        <form action={action} className="space-y-3">
          <input type="hidden" name="token" value={token} />
          <input
            name="password"
            type="password"
            placeholder="Nova senha"
            className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
          />
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirmar nova senha"
            className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
          />
          {state && !state.ok && (
            <p className="text-xs text-red-600">{state.error}</p>
          )}
          <button className="w-full bg-black text-white text-sm font-medium py-3 hover:bg-black/90">
            REDEFINIR SENHA
          </button>
        </form>
      )}
    </section>
  );
}
