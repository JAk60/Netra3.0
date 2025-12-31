// frontend/src/app/login/page.tsx
import { checkAuth, getCurrentUser } from '@/actions/auth/auth'
import Auth3DBackground from '@/components/Drishti/auth/Auth3DBackground'
import LandingOverlay from '@/components/LandingOverlay'
import { redirect } from 'next/navigation'

interface LoginPageProps {
  searchParams: {
    reason?: string
    redirect?: string
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // ✅ Await searchParams
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