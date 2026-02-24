// frontend/src/app/login/page.tsx

import Auth3DBackground from '@/components/Drishti/auth/Auth3DBackground'
import AuthCard from '@/components/Drishti/auth/AuthCard'
import LoginForm from '@/components/Drishti/auth/LoginForm'
import LandingOverlay from '@/components/LandingOverlay'

interface LoginPageProps {
  searchParams: Promise<{
    reason?: string
    redirect?: string
  }>
}

/**
 * Login Page - Middleware already handles logged-in redirects
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const sessionExpired = params.reason === 'session_expired'
  const redirectUrl = params.redirect

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <LandingOverlay />
      <div className="relative w-full min-h-screen flex items-center justify-center p-4">
        <Auth3DBackground
          sessionExpired={sessionExpired}
          redirectUrl={redirectUrl}
        />
      </div>
    </div>
  )
}