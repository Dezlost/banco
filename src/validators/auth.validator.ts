import { z } from 'zod';

export const registroSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
  apellido: z.string().trim().min(2, 'El apellido debe tener al menos 2 caracteres').max(50),
  dni: z
    .string()
    .trim()
    .regex(/^\d{7,9}$/, 'El DNI debe contener entre 7 y 9 dígitos'),
  email: z.string().trim().toLowerCase().email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña no puede superar los 72 caracteres'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export type RegistroInput = z.infer<typeof registroSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
