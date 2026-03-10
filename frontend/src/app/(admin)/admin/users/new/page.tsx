'use client'
// frontend/src/app/(admin)/admin/users/new/page.tsx

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, UserPlus } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/registry/new-york-v4/ui/button'
import { Input } from '@/registry/new-york-v4/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/registry/new-york-v4/ui/select'
import { createUserSchema, CreateUserInput } from '@/types/Schema/user'
import { createUser } from '@/actions/auth/admin-action'

export default function CreateUserPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: 'user',
      is_active: true,
      full_name: '',
    },
  })

  const selectedRole = watch('role')
  const isActive = watch('is_active')

  const onSubmit = async (data: CreateUserInput) => {
    setIsSubmitting(true)
    try {
      const response = await createUser(data)

      if (response.success) {
        toast.success('User created successfully')
        router.push('/admin/users')
      } else {
        toast.error(response.error || 'Failed to create user')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
    <div className="flex flex-col bg-muted/50 space-y-6 max-w-2xl">
      {/* Header */}
      <div className="p-6 flex items-center gap-4">
        <Link href="/admin/users">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-700 text-gray-300 hover:bg-[#0f1d31] hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Create New User</h1>
          <p className="text-gray-400">Add a new user account to the system</p>
        </div>
      </div>
</div>
      {/* Form Container - Using div with onSubmit handler */}
      <div className="rounded-xl border border-gray-800 bg-black/40 backdrop-blur-sm p-6 space-y-6 w-full">
        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
            Username <span className="text-red-400">*</span>
          </label>
          <Input
            id="username"
            {...register('username')}
            disabled={isSubmitting}
            className="bg-[#0a1525] border-gray-800 text-white"
            placeholder="Enter username"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-400">{errors.username.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email <span className="text-red-400">*</span>
          </label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            disabled={isSubmitting}
            className="bg-[#0a1525] border-gray-800 text-white"
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-300 mb-2">
            Full Name <span className="text-gray-500">(Optional)</span>
          </label>
          <Input
            id="full_name"
            {...register('full_name')}
            disabled={isSubmitting}
            className="bg-[#0a1525] border-gray-800 text-white"
            placeholder="Enter full name"
          />
          {errors.full_name && (
            <p className="mt-1 text-sm text-red-400">{errors.full_name.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Password <span className="text-red-400">*</span>
          </label>
          <Input
            id="password"
            type="password"
            {...register('password')}
            disabled={isSubmitting}
            className="bg-[#0a1525] border-gray-800 text-white"
            placeholder="Enter password (min. 8 characters)"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
            Confirm Password <span className="text-red-400">*</span>
          </label>
          <Input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            disabled={isSubmitting}
            className="bg-[#0a1525] border-gray-800 text-white"
            placeholder="Confirm password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Role <span className="text-red-400">*</span>
          </label>
          <Select
            value={selectedRole}
            onValueChange={(value) => setValue('role', value as any)}
            disabled={isSubmitting}
          >
            <SelectTrigger className="bg-[#0a1525] border-gray-800 text-white">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent className="bg-[#0f1d31] border-gray-800">
              <SelectItem value="user" className="text-white">User</SelectItem>
              <SelectItem value="admin" className="text-white">Admin</SelectItem>
              <SelectItem value="superuser" className="text-white">Superuser</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-400">{errors.role.message}</p>
          )}
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_active"
            checked={isActive}
            onChange={(e) => setValue('is_active', e.target.checked)}
            disabled={isSubmitting}
            className="w-4 h-4 rounded border-gray-800 bg-[#0a1525] text-[#25547e] focus:ring-[#25547e]"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-300">
            Active Account
          </label>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-800">
          <Button
            onClick={() => handleSubmit(onSubmit)()}
            disabled={isSubmitting}
            className="bg-[#25547e] hover:bg-[#25547e]/80 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Create User
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push('/admin/users')}
            disabled={isSubmitting}
            className="border-gray-700 text-gray-300 hover:bg-[#0f1d31] hover:text-white"
          >
            Cancel
          </Button>
        </div>
      </div>
  </>
  )
}