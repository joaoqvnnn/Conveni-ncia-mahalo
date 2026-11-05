"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";

export default function EntrarPage() {
  const [state, action] = useFormState(loginAction, null);

  return (
    <section className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-1">Entrar na minha conta</h1>
      <p className="text-sm text-gray-600 mb-6">Acesse para continuar.</p>

      {state && !state.ok && (
        <div className="mb-4 border border-red-200 bg-red-50 text-red-700 text-sm p-3">
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-3" noValidate>
        <div>
          <label className="block text-xs text-gray-600 mb-1">E-mail ou CPF</label>
          <input
            name="identifier"
            className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Senha</label>
          <input
            name="password"
            type="password"
            className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
          />
        </div>

        <div className="flex justify-end">
          <Link href="/recuperar-senha" className="text-xs underline text-gray-600">
            Esqueceu sua senha?
          </Link>
        </div>

        <SubmitButton />

        <p className="text-center text-sm pt-2">
          Ainda não possui conta?{" "}
          <Link href="/criar-conta" className="underline font-medium">
            Criar cadastro
          </Link>
        </p>
      </form>
    </section>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="w-full bg-black text-white text-sm font-medium py-3 hover:bg-black/90 disabled:bg-gray-400"
    >
      {pending ? "ENTRANDO..." : "ENTRAR"}
    </button>
  );
}
