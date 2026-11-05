import { z } from "zod";
import { cpf } from "cpf-cnpj-validator";

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, "Informe nome e sobrenome")
      .refine((v) => v.trim().split(/\s+/).length >= 2, "Informe nome e sobrenome"),
    cpf: z.string().refine((v) => cpf.isValid(v), "CPF inválido"),
    birthDate: z
      .string()
      .refine((v) => {
        const d = new Date(v);
        if (isNaN(d.getTime())) return false;
        const age = (Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000);
        return age >= 18 && age < 120;
      }, "É necessário ter 18 anos ou mais"),
    phone: z
      .string()
      .transform((v) => v.replace(/\D/g, ""))
      .refine((v) => /^\d{10,11}$/.test(v), "Telefone inválido (DDD + número)"),
    email: z.string().email("E-mail inválido"),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Deve conter letra maiúscula")
      .regex(/[a-z]/, "Deve conter letra minúscula")
      .regex(/\d/, "Deve conter número"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  identifier: z.string().min(1, "Informe e-mail ou CPF"),
  password: z.string().min(1, "Informe a senha"),
});

export const forgotSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export const resetSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Deve conter letra maiúscula")
      .regex(/[a-z]/, "Deve conter letra minúscula")
      .regex(/\d/, "Deve conter número"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });
