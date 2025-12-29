export type UserRole = 'superuser' | 'admin' | 'user'

/**
 * User list item for table display
 */
export interface UserListItem {
  id: number
  username: string
  email: string
  full_name?: string
  role: UserRole
  is_active: boolean
  created_at: string
  last_login?: string
  failed_login_attempts: number
  locked_until?: string
}

/**
 * Full user details
 */
export interface UserDetails extends UserListItem {
  updated_at?: string
}

/**
 * User filters for search and filtering
 */
export interface UserFilters {
  search?: string
  role?: UserRole | 'all'
  status?: 'all' | 'active' | 'inactive' | 'locked'
  sortBy?: 'username' | 'created_at' | 'last_login'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number
  limit: number
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Dashboard statistics
 */
export interface UserStats {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  lockedUsers: number
  superusers: number
  admins: number
  regularUsers: number
}

/**
 * Create user form data
 */
export interface CreateUserData {
  username: string
  email: string
  password: string
  confirmPassword: string
  full_name?: string
  role: UserRole
  is_active: boolean
}

/**
 * Update user form data
 */
export interface UpdateUserData {
  username?: string
  email?: string
  full_name?: string
  role?: UserRole
  is_active?: boolean
  password?: string
}

/**
 * Server action response
 */
export interface ActionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Recent activity item
 */
export interface RecentActivity {
  id: number
  username: string
  email: string
  role: UserRole
  created_at: string
}