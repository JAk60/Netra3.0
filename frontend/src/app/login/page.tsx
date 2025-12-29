// app/login/page.tsx

import { checkAuth, getCurrentUser } from '@/actions/auth/auth';
import Auth3DBackground from '@/components/Drishti/auth/Auth3DBackground';
import AuthCard from '@/components/Drishti/auth/AuthCard';
import LoginForm from '@/components/Drishti/auth/LoginForm';
import LandingOverlay from '@/components/LandingOverlay';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  // Check if already authenticated
  const isAuthenticated = await checkAuth();
  
  if (isAuthenticated) {
    // Get user data to determine redirect
    const userResult = await getCurrentUser();
    
    if (userResult.success && userResult.user) {
      // ✅ Redirect based on role
      if (userResult.user.role === 'superuser' || userResult.user.role === 'admin') {
        redirect('/admin');
      } else {
        redirect('/');
      }
    } else {
      // If we can't get user data but are authenticated, go to home
      redirect('/');
    }
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <LandingOverlay />
      <div className="relative w-full min-h-screen flex items-center justify-center p-4">
        <Auth3DBackground />
      </div>
    </div>
  );
}