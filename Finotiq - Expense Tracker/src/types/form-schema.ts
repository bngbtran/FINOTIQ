import * as z from 'zod'

export const transactionSchema = z.object({
  amount: z.number().positive({ message: 'Số tiền phải là số dương' }),
  type: z.string({
    required_error: 'Vui lòng chọn loại giao dịch',
  }),
  categoryId: z.string({
    required_error: 'Vui lòng chọn danh mục',
  }),
  description: z.string().optional(),
  date: z.date({
    required_error: 'Vui lòng chọn ngày',
  }),
})

export type TransactionFormValues = z.infer<typeof transactionSchema>

export const categorySchema = z.object({
  name: z.string().min(2, { message: 'Tên danh mục phải có ít nhất 2 ký tự' }),
  type: z.enum(['income', 'expense'], {
    required_error: 'Vui lòng chọn loại danh mục',
  }),
  color: z.string({
    required_error: 'Vui lòng chọn màu sắc',
  }),
  icon: z.string().optional(),
})

export type CategoryFormValues = z.infer<typeof categorySchema>

export const budgetSchema = z.object({
  categoryId: z.string({
    required_error: 'Vui lòng chọn danh mục',
  }),
  amount: z.number().positive({ message: 'Số tiền phải là số dương' }),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2050),
})

export type BudgetFormValues = z.infer<typeof budgetSchema>

export const loginSchema = z.object({
  email: z.string().email({ message: 'Email không hợp lệ' }),
  password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  name: z.string().min(2, { message: 'Tên phải có ít nhất 2 ký tự' }),
  email: z.string().email({ message: 'Email không hợp lệ' }),
  password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
})

export type RegisterFormValues = z.infer<typeof registerSchema>
