"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { forgotAction } from "@/app/actions/auth";

export default function RecuperarSenhaPage() {
  const [state, action] = useFormState(forgotAction, null);

  return (
    <section className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-xl font-bold mb-2">Recuperar senha</h1>
      <p className="text-sm text-gray-600 mb-6">
        Informe seu e-mail para receber o link de recuperação.
      </p>

      {state?.ok && (
        <div className="mb-4 border border-green-200 bg-green-50 text-green-800 text-sm p-3">
          {state.message}
        </div>
      )}
      {state && !state.ok && (
        <div className="mb-4 border border-red-200 bg-red-50 text-red-700 text-sm p-3">
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-3">
        <input
          name="email"
          type="email"
          placeholder="seu@email.com"
          className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
        />
        <button className="w-full bg-black text-white text-sm font-medium py-3 hover:bg-black/90">
          ENVIAR LINK
        </button>
      </form>

      <p className="text-center text-sm mt-4">
        <Link href="/entrar" className="underline">
          Voltar ao login
        </Link>
      </p>
    </section>
  );
}
