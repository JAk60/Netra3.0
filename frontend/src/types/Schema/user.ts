import { z } from "zod"

/**
 * Schema for creating a new user (admin panel)
 */
export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  
  email: z
    .string()
    .email("Invalid email address")
    .min(1, "Email is required"),
  
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(255, "Password is too long"),
  
  confirmPassword: z
    .string()
    .min(1, "Please confirm your password"),
  
  full_name: z
    .string()
    .max(255, "Full name is too long")
    .optional()
    .or(z.literal('')),
  
  role: z.enum(['superuser', 'admin', 'user'], {
    required_error: "Please select a role",
  }),
  
  is_active: z.boolean().default(true),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

/**
 * Schema for updating user (admin panel)
 */
export const updateUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .optional(),
  
  email: z
    .string()
    .email("Invalid email address")
    .optional(),
  
  full_name: z
    .string()
    .max(255, "Full name is too long")
    .optional()
    .or(z.literal('')),
  
  role: z.enum(['superuser', 'admin', 'user']).optional(),
  
  is_active: z.boolean().optional(),
  
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(255, "Password is too long")
    .optional()
    .or(z.literal('')),
})

/**
 * Schema for user filters
 */
export const userFiltersSchema = z.object({
  search: z.string().optional(),
  role: z.enum(['all', 'superuser', 'admin', 'user']).optional(),
  status: z.enum(['all', 'active', 'inactive', 'locked']).optional(),
  sortBy: z.enum(['username', 'created_at', 'last_login']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

/**
 * Schema for pagination
 */
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
})

/**
 * Type inference helpers
 */
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type UserFiltersInput = z.infer<typeof userFiltersSchema>
export type PaginationInput = z.infer<typeof paginationSchema>