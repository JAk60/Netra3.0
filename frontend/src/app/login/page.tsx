// app/login/page.tsx

import { checkAuth } from '@/actions/auth/auth';
import Auth3DBackground from '@/components/Drishti/auth/Auth3DBackground';
import AuthCard from '@/components/Drishti/auth/AuthCard';
import LoginForm from '@/components/Drishti/auth/LoginForm';
import LandingOverlay from '@/components/LandingOverlay';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  // Redirect if already authenticated
  const isAuthenticated = await checkAuth();
  // const isAuthenticated = true;
  if (isAuthenticated) {
    redirect('/');
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <LandingOverlay />
    <div className="relative w-full  min-h-screen flex items-center justify-center p-4">
      <Auth3DBackground />
      
      {/* <AuthCard
        title="Welcome Back"
        subtitle="Sign in to continue to your dashboard"
      >
        <LoginForm />
      </AuthCard> */}
    </div>
    </div>
  );
}