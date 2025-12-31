// frontend/src/config/auth.config.ts

export type UserRole = 'superuser' | 'admin' | 'user'

export interface RouteConfig {
  // Routes that don't require authentication
  publicRoutes: string[]
  
  // Routes that require authentication but any role can access
  protectedRoutes: string[]
  
  // Role-based route access
  roleRoutes: {
    pattern: string | RegExp
    allowedRoles: UserRole[]
    redirectTo?: string // Where to redirect if unauthorized
  }[]
  
  // Default redirects after login based on role
  defaultRedirects: {
    [key in UserRole]: string
  }
  
  // Where to redirect if not authenticated
  loginRoute: string
  
  // Where to redirect if authenticated but unauthorized for a route
  unauthorizedRoute: string
}

export const authConfig: RouteConfig = {
  // No authentication needed
  publicRoutes: [
    '/login',
    '/unauthorized',
    // Add more public routes here as needed
    // '/signup',
    // '/forgot-password',
  ],
  
  // Requires authentication, any role can access
  protectedRoutes: [
    // Add routes that any authenticated user can access
  ],
  
  // Role-based access control
  roleRoutes: [
    {
      pattern: /^\/admin/,  // Matches /admin, /admin/users, etc.
      allowedRoles: ['admin', 'superuser'],
      redirectTo: '/unauthorized'
    },
    {
      pattern: '/',  // Root route
      allowedRoles: ['user'],  // Only regular users
      redirectTo: '/admin'  // Admins go to admin panel
    },
    // Add more role-based routes here
    // {
    //   pattern: /^\/reports/,
    //   allowedRoles: ['admin', 'superuser'],
    //   redirectTo: '/unauthorized'
    // },
  ],
  
  // Where to redirect after successful login
  defaultRedirects: {
    superuser: '/admin',
    admin: '/admin',
    user: '/',
  },
  
  loginRoute: '/login',
  unauthorizedRoute: '/unauthorized',
}

// Helper function to check if a path matches a pattern
export function matchesPattern(path: string, pattern: string | RegExp): boolean {
  if (typeof pattern === 'string') {
    return path === pattern || path.startsWith(pattern + '/')
  }
  return pattern.test(path)
}

// Helper function to check if route is public
export function isPublicRoute(path: string): boolean {
  return authConfig.publicRoutes.some(route => 
    path === route || path.startsWith(route + '/')
  )
}

// Helper function to get allowed roles for a path
export function getAllowedRoles(path: string): UserRole[] | null {
  for (const rule of authConfig.roleRoutes) {
    if (matchesPattern(path, rule.pattern)) {
      return rule.allowedRoles
    }
  }
  return null // No specific role requirement
}

// Helper function to get redirect destination for unauthorized access
export function getUnauthorizedRedirect(path: string): string {
  for (const rule of authConfig.roleRoutes) {
    if (matchesPattern(path, rule.pattern)) {
      return rule.redirectTo || authConfig.unauthorizedRoute
    }
  }
  return authConfig.unauthorizedRoute
}