// frontend/src/app/login/page.tsx
import Auth3DBackground from '@/components/Drishti/auth/Auth3DBackground'
import LandingOverlay from '@/components/LandingOverlay'
import LoginRedirectHandler from '@/components/Drishti/auth/LoginRedirectHandler'

interface LoginPageProps {
  searchParams: {
    reason?: string
    redirect?: string
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const sessionExpired = searchParams.reason === 'session_expired'
  const redirectUrl = searchParams.redirect

  return (
    <>
      {/* Client-side redirect handler */}
      <LoginRedirectHandler />
      
      <div className="relative min-h-screen bg-black overflow-hidden">
        <LandingOverlay />
        <div className="relative w-full min-h-screen flex items-center justify-center p-4">
          <Auth3DBackground 
            sessionExpired={sessionExpired}
            redirectUrl={redirectUrl}
          />
        </div>
      </div>
    </>
  )
}