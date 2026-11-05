import { prisma } from "@/lib/db";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VerificarEmailPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;
  if (!token) {
    return <Result ok={false} message="Token ausente." />;
  }

  const customer = await prisma.customer.findUnique({
    where: { verificationToken: token },
  });

  if (
    !customer ||
    !customer.verificationTokenExpiry ||
    customer.verificationTokenExpiry < new Date()
  ) {
    return <Result ok={false} message="Link inválido ou expirado." />;
  }

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    },
  });

  return <Result ok message="E-mail confirmado. Você já pode fazer login." />;
}

function Result({ ok, message }: { ok: boolean; message: string }) {
  return (
    <section className="max-w-md mx-auto px-4 py-20 text-center">
      {ok ? (
        <CheckCircle2 size={48} strokeWidth={1.2} className="mx-auto mb-4" />
      ) : (
        <XCircle size={48} strokeWidth={1.2} className="mx-auto mb-4 text-red-500" />
      )}
      <h1 className="text-xl font-bold">{ok ? "Conta ativada" : "Falha na ativação"}</h1>
      <p className="text-sm text-gray-600 mt-2">{message}</p>
      <Link
        href="/entrar"
        className="mt-6 inline-block bg-black text-white px-5 py-2 text-sm hover:bg-black/90"
      >
        Ir para o login
      </Link>
    </section>
  );
}
