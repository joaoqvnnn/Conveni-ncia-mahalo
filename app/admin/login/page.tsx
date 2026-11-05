"use client";

import { useFormState, useFormStatus } from "react-dom";
import { adminLoginAction } from "@/app/actions/admin";

export default function AdminLoginPage() {
  const [state, action] = useFormState(adminLoginAction, null);

  return (
    <section className="max-w-sm mx-auto px-4 py-24">
      <h1 className="text-xl font-bold mb-1">Painel administrativo</h1>
      <p className="text-sm text-gray-500 mb-6">Acesso restrito.</p>

      {state && !state.ok && (
        <div className="mb-4 border border-red-200 bg-red-50 text-red-700 text-sm p-3">
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-3">
        <input
          name="email"
          type="email"
          placeholder="E-mail"
          required
          className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
        />
        <input
          name="password"
          type="password"
          placeholder="Senha"
          required
          className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
        />
        <Submit />
      </form>
    </section>
  );
}

function Submit() {
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
