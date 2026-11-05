import { prisma } from "@/lib/db";
import { saveCategoryAction, deleteCategoryAction } from "@/app/actions/admin";

const ICONS = [
  "Beer", "Coffee", "Candy", "ShoppingBasket", "Snowflake",
  "Package", "Pizza", "Cookie", "Wine", "Cake", "CupSoda", "Beef", "Sandwich",
];

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Categorias</h1>

      <form
        action={saveCategoryAction}
        className="bg-white border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-5 gap-3 mb-6"
      >
        <input
          name="name"
          placeholder="Nome (ex: Bebidas)"
          required
          className="border border-gray-200 px-3 py-2 text-sm md:col-span-2 outline-none focus:border-black"
        />
        <select
          name="icon"
          className="border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
        >
          {ICONS.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
        <input
          name="order"
          type="number"
          placeholder="Ordem"
          defaultValue={0}
          className="border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
        />
        <button className="bg-black text-white text-sm font-medium px-4 py-2 hover:bg-black/90">
          Adicionar
        </button>
      </form>

      <div className="bg-white border border-gray-200 divide-y divide-gray-100">
        {categories.map((c) => (
          <div key={c.id} className="grid grid-cols-5 gap-2 px-4 py-3 items-center">
            <div className="text-sm font-medium col-span-2">{c.name}</div>
            <div className="text-xs text-gray-500">Ícone: {c.icon}</div>
            <div className="text-xs text-gray-500">Ordem: {c.order}</div>
            <form
              action={async () => {
                "use server";
                await deleteCategoryAction(c.id);
              }}
              className="flex justify-end"
            >
              <button className="text-xs border border-red-200 text-red-600 px-2 py-1 hover:bg-red-50">
                Excluir
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
