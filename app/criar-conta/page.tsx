"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { registerAction } from "@/app/actions/auth";

export default function CriarContaPage() {
  const [state, action] = useFormState(registerAction, null);

  return (
    <section className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-1">Criar minha conta</h1>
      <p className="text-sm text-gray-600 mb-6">
        Preencha seus dados para continuar com sua compra.
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

      <form action={action} className="space-y-3" noValidate>
        <Field label="Nome completo" name="name" errors={state?.fieldErrors?.name} />
        <Field label="CPF" name="cpf" errors={state?.fieldErrors?.cpf} placeholder="000.000.000-00" />
        <Field label="Data de nascimento" name="birthDate" type="date" errors={state?.fieldErrors?.birthDate} />
        <Field label="Telefone / WhatsApp" name="phone" errors={state?.fieldErrors?.phone} placeholder="(44) 99999-9999" />
        <Field label="E-mail" name="email" type="email" errors={state?.fieldErrors?.email} />
        <Field label="Senha" name="password" type="password" errors={state?.fieldErrors?.password} />
        <Field label="Confirmar senha" name="confirmPassword" type="password" errors={state?.fieldErrors?.confirmPassword} />

        <SubmitButton label="CRIAR CONTA" />

        <p className="text-xs text-gray-500 text-center leading-relaxed">
          Seus dados serão tratados com segurança e conforme a LGPD.
        </p>
        <p className="text-center text-sm">
          Já tem uma conta?{" "}
          <Link href="/entrar" className="underline font-medium">
            Entrar
          </Link>
        </p>
      </form>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  errors,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  errors?: string[];
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        className={`w-full border px-3 py-2 text-sm outline-none focus:border-black ${
          errors?.length ? "border-red-400" : "border-gray-200"
        }`}
      />
      {errors?.length ? (
        <p className="text-[11px] text-red-600 mt-1">{errors[0]}</p>
      ) : null}
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="w-full bg-black text-white text-sm font-medium py-3 hover:bg-black/90 disabled:bg-gray-400"
    >
      {pending ? "ENVIANDO..." : label}
    </button>
  );
}
