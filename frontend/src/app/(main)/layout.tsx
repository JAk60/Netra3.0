// frontend/src/app/(main)/layout.tsx

/**
 * Main Layout - NO auth checks needed
 * Middleware already validated access
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}