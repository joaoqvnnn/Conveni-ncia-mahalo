"use server";

import { prisma } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";
import { registerSchema, loginSchema, forgotSchema, resetSchema } from "@/lib/validators";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Resend } from "resend";
import { redirect } from "next/navigation";

const resend = new Resend(process.env.RESEND_API_KEY);
const BASE = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function registerAction(
  _prev: any,
  formData: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      error: "Verifique os campos destacados.",
      fieldErrors: parsed.error.flatten().fieldErrors as any,
    };
  }
  const data = parsed.data;

  const existing = await prisma.customer.findFirst({
    where: { OR: [{ email: data.email }, { cpf: data.cpf.replace(/\D/g, "") }] },
  });
  if (existing) {
    return { ok: false, error: "E-mail ou CPF já cadastrado." };
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const passwordHash = await bcrypt.hash(data.password, 12);

  await prisma.customer.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      cpf: data.cpf.replace(/\D/g, ""),
      phone: data.phone,
      birthDate: new Date(data.birthDate),
      passwordHash,
      verificationToken,
      verificationTokenExpiry: new Date(Date.now() + 24 * 3600 * 1000),
    },
  });

  const verifyUrl = `${BASE}/verificar-email?token=${verificationToken}`;

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: data.email,
    subject: "Confirme seu e-mail — Conveniência",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto">
        <h2 style="font-size:20px">Confirme seu e-mail</h2>
        <p>Olá, ${data.name.split(" ")[0]}.</p>
        <p>Clique no botão abaixo para ativar sua conta. O link expira em 24 horas.</p>
        <p style="margin:24px 0">
          <a href="${verifyUrl}" style="background:#000;color:#fff;padding:12px 24px;text-decoration:none">
            Confirmar e-mail
          </a>
        </p>
        <p style="font-size:12px;color:#666">Se não foi você, ignore este e-mail.</p>
      </div>
    `,
  });

  return {
    ok: true,
    message: "Conta criada. Verifique seu e-mail para ativar o acesso.",
  };
}

export async function loginAction(
  _prev: any,
  formData: FormData
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, error: "Preencha e-mail/CPF e senha." };

  const { identifier, password } = parsed.data;
  const clean = identifier.replace(/\D/g, "");

  const customer = await prisma.customer.findFirst({
    where: identifier.includes("@")
      ? { email: identifier.toLowerCase() }
      : { cpf: clean },
  });

  if (!customer) return { ok: false, error: "Credenciais inválidas." };
  if (!customer.emailVerified)
    return { ok: false, error: "Confirme seu e-mail antes de entrar." };

  const valid = await bcrypt.compare(password, customer.passwordHash);
  if (!valid) return { ok: false, error: "Credenciais inválidas." };

  await createSession({
    customerId: customer.id,
    email: customer.email,
    name: customer.name,
  });

  redirect("/conta");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function forgotAction(
  _prev: any,
  formData: FormData
): Promise<ActionResult> {
  const parsed = forgotSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, error: "E-mail inválido." };

  const customer = await prisma.customer.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  // Resposta uniforme para não revelar se o e-mail existe
  if (customer) {
    const resetToken = crypto.randomBytes(32).toString("hex");
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        resetToken,
        resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const resetUrl = `${BASE}/redefinir-senha?token=${resetToken}`;
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: customer.email,
      subject: "Redefinição de senha — Conveniência",
      html: `
        <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto">
          <h2>Redefinir senha</h2>
          <p>Clique no botão abaixo para criar uma nova senha. Expira em 1 hora.</p>
          <p style="margin:24px 0">
            <a href="${resetUrl}" style="background:#000;color:#fff;padding:12px 24px;text-decoration:none">
              Redefinir senha
            </a>
          </p>
          <p style="font-size:12px;color:#666">Se não solicitou, ignore este e-mail.</p>
        </div>
      `,
    });
  }

  return {
    ok: true,
    message: "Se o e-mail estiver cadastrado, enviaremos as instruções.",
  };
}

export async function resetAction(
  _prev: any,
  formData: FormData
): Promise<ActionResult> {
  const parsed = resetSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Verifique os campos.",
      fieldErrors: parsed.error.flatten().fieldErrors as any,
    };
  }

  const customer = await prisma.customer.findUnique({
    where: { resetToken: parsed.data.token },
  });
  if (
    !customer ||
    !customer.resetTokenExpiry ||
    customer.resetTokenExpiry < new Date()
  ) {
    return { ok: false, error: "Link inválido ou expirado." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return { ok: true, message: "Senha redefinida. Faça login." };
}
