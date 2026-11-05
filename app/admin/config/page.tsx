import { getSettings } from "@/lib/settings";
import {
  saveSettingsAction,
  registerTelegramWebhookAction,
  testTelegramAction,
} from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function ConfigPage() {
  const s = await getSettings();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>

      <form
        action={saveSettingsAction}
        className="bg-white border border-gray-200 p-5 space-y-3 max-w-2xl mb-6"
      >
        <h2 className="text-sm font-bold">Loja</h2>
        <Field label="Nome da loja" name="storeName" defaultValue={s.storeName} />
        <Field label="WhatsApp (só dígitos, ex: 5544999999999)" name="whatsapp" defaultValue={s.whatsapp} />
        <Field label="Horário" name="hours" defaultValue={s.hours} />
        <Field label="Região" name="region" defaultValue={s.region} />

        <h2 className="text-sm font-bold pt-3 border-t border-gray-100">Entrega</h2>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Taxa (R$)" name="deliveryFee" defaultValue={s.deliveryFee} />
          <Field label="Frete grátis acima de (R$)" name="freeDeliveryAbove" defaultValue={s.freeDeliveryAbove} />
          <Field label="Pedido mínimo (R$)" name="minOrder" defaultValue={s.minOrder} />
        </div>

        <h2 className="text-sm font-bold pt-3 border-t border-gray-100">Telegram</h2>
        <Field
          label="Chat ID (opcional — usa ENV se vazio)"
          name="telegramChatId"
          defaultValue={s.telegramChatId}
        />
        <label className="flex items-center gap-2 text-sm pt-2">
          <input
            type="checkbox"
            name="autoConfirmOrders"
            defaultChecked={s.autoConfirmOrders === "true"}
            className="accent-black"
          />
          <span>
            <b>Modo automático</b> — pedidos pagos por PIX são confirmados sozinhos
          </span>
        </label>

        <button className="bg-black text-white text-sm font-medium px-6 py-3 hover:bg-black/90 mt-3">
          SALVAR
        </button>
      </form>

      <div className="bg-white border border-gray-200 p-5 max-w-2xl space-y-3">
        <h2 className="text-sm font-bold">Integração com o bot</h2>
        <p className="text-xs text-gray-600">
          Registre o webhook para que os botões (Confirmar / Recusar / Auto) funcionem.
        </p>
        <div className="flex flex-wrap gap-2">
          <form action={registerTelegramWebhookAction}>
            <button className="text-sm border border-gray-300 px-4 py-2 hover:border-black">
              Registrar webhook
            </button>
          </form>
          <form action={testTelegramAction}>
            <button className="text-sm border border-gray-300 px-4 py-2 hover:border-black">
              Enviar mensagem de teste
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
      />
    </div>
  );
}
