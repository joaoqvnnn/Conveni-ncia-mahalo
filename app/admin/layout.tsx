import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { adminLogoutAction } from "@/app/actions/admin";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Tags,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: Tags },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/config", label: "Configurações", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-56 bg-black text-white flex flex-col shrink-0">
        <div className="px-4 py-5 border-b border-white/10">
          <div className="text-xs uppercase tracking-[0.25em] text-white/50">
            ADMIN
          </div>
          <div className="text-sm font-bold mt-1">Painel da loja</div>
        </div>
        <nav className="flex-1 py-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white"
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={adminLogoutAction} className="border-t border-white/10 p-3">
          <button className="flex items-center gap-2 w-full text-left text-sm text-white/70 hover:text-white px-2 py-2">
            <LogOut size={16} /> Sair
          </button>
        </form>
      </aside>
      <main className="flex-1 overflow-x-auto">
        <div className="max-w-6xl mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
