import { prisma } from "@/lib/db";
import Link from "next/link";
import { Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim();
  const customers = await prisma.customer.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
            { cpf: { contains: q.replace(/\D/g, "") } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Clientes</h1>

      <form className="mb-4 flex gap-2 max-w-md">
        <div className="flex-1 flex items-center border border-gray-300 bg-white px-3">
          <Search size={16} className="text-gray-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por nome, e-mail, CPF ou telefone"
            className="flex-1 px-2 py-2 text-sm outline-none"
          />
        </div>
        <button className="bg-black text-white text-sm px-4 py-2 hover:bg-black/90">
          Buscar
        </button>
      </form>

      <div className="bg-white border border-gray-200 divide-y divide-gray-100">
        {customers.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-500">
            Nenhum cliente encontrado.
          </div>
        ) : (
          customers.map((c) => (
            <Link
              key={c.id}
              href={`/admin/clientes/${c.id}`}
              className="grid grid-cols-5 gap-2 px-4 py-3 hover:bg-gray-50 items-center"
            >
              <div className="col-span-2">
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-gray-500">{c.email}</p>
              </div>
              <div className="text-xs text-gray-500">{c.phone}</div>
              <div className="text-xs text-gray-500">
                {c.banned ? (
                  <span className="text-red-600 font-medium">BANIDO</span>
                ) : (
                  "Ativo"
                )}
              </div>
              <div className="text-xs text-gray-400 text-right">
                {c.createdAt.toLocaleDateString("pt-BR")}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
