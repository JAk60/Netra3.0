// frontend/src/app/(main)/layout.tsx
// Create this file to wrap all non-admin routes with ProtectedRoute

import ProtectedRoute from '@/components/ProtectedRoute'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  )
}