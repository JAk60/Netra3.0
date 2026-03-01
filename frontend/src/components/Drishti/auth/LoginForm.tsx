'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

import { LoginFormData, loginSchema } from '@/types/Schema/auth'
import { loginAction } from '@/actions/auth/auth'

interface LoginFormProps {
  redirectUrl?: string
}

export default function LoginForm({ redirectUrl }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    startTransition(async () => {
      try {
        const result = await loginAction(
          data.username,
          data.password,
          redirectUrl
        )

        if (!result.success) {
          if (result.error?.includes('Invalid credentials')) {
            setError('password', {
              message: 'Invalid username or password',
            })
          } else if (result.error?.includes('locked')) {
            toast.error('Account is locked. Please try again later.')
          } else if (result.error?.includes('inactive')) {
            toast.error('Account is inactive. Contact administrator.')
          } else {
            toast.error(result.error || 'Login failed')
          }
        }
      } catch (error: any) {
        if (error?.message?.includes('NEXT_REDIRECT')) {
          return
        }

        console.error('Login error:', error)
        toast.error('An unexpected error occurred')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 h-screen">
      {/* Username */}
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-slate-300 mb-2"
        >
          Username
        </label>
        <input
          {...register('username')}
          id="username"
          type="text"
          autoComplete="username"
          disabled={isPending}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Enter your username"
        />
        {errors.username && (
          <p className="mt-1 text-sm text-red-400">
            {errors.username.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-300 mb-2"
        >
          Password
        </label>
        <div className="relative">
          <input
            {...register('password')}
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            disabled={isPending}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isPending}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition disabled:opacity-50"
          >
            {showPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-400">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
      >
        {isPending ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </button>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-sm text-slate-400">
          Don't have an account?{' '}
          <a
            href={`mailto:admin@yourcompany.com?subject=Forgot%20Password%20Request&body=Dear%20Administrator%2C%0A%0AI%20am%20writing%20to%20request%20a%20password%20reset%20for%20my%20account.%0A%0AAccount%20Details%3A%0A-%20Name%3A%20%5BYour%20Full%20Name%5D%0A-%20Username%3A%20%5BYour%20Username%5D%0A-%20Department%3A%20%5BYour%20Department%5D%0A%0APlease%20assist%20me%20in%20regaining%20access%20to%20my%20account%20at%20your%20earliest%20convenience.%0A%0AThank%20you%2C%0A%5BYour%20Name%5D`}
            className="hover:text-blue-300 font-medium transition-colors duration-200"
          >
            Contact your administrator
          </a>
        </p>
      </div>
    </form>
  )
}