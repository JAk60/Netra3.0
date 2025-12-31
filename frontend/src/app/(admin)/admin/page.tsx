
// frontend/src/app/(admin)/admin/page.tsx
import { Suspense } from 'react'
import { Users, UserCheck, UserX, Lock, Crown, Shield, User, Activity } from 'lucide-react'
import StatsCard from '@/components/admin/dashboard/StatsCard'
import { getUserStats, getRecentUsers } from '@/actions/auth/admin-action'
import { formatDistanceToNow } from 'date-fns'
import RoleBadge from '@/components/admin/user/RoleBadge'
import StatusBadge from '@/components/admin/user/StatusBadge'
import Link from 'next/link'
import { Button } from '@/registry/new-york-v4/ui/button'

// Loading skeleton component
function StatsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="relative rounded-xl border border-gray-800 bg-[#0f1d31]/40 backdrop-blur-sm p-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 bg-gray-800 rounded"></div>
              <div className="w-12 h-12 bg-gray-800 rounded-full"></div>
            </div>
            <div className="h-8 w-16 bg-gray-800 rounded mb-2"></div>
            <div className="h-3 w-32 bg-gray-800 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

function RoleLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="relative rounded-xl border border-gray-800 bg-[#0f1d31]/40 backdrop-blur-sm p-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 bg-gray-800 rounded"></div>
              <div className="w-12 h-12 bg-gray-800 rounded-full"></div>
            </div>
            <div className="h-8 w-16 bg-gray-800 rounded mb-2"></div>
            <div className="h-3 w-32 bg-gray-800 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

async function DashboardStats() {
  const statsResponse = await getUserStats()

  if (!statsResponse.success || !statsResponse.data) {
    return (
      <div className="text-center py-12 text-red-400">
        Failed to load statistics
      </div>
    )
  }

  const stats = statsResponse.data

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Users */}
      <StatsCard
        title="Total Users"
        value={stats.totalUsers}
        icon={Users}
        description="All registered users"
        variant="default"
      />

      {/* Active Users */}
      <StatsCard
        title="Active Users"
        value={stats.activeUsers}
        icon={UserCheck}
        description="Currently active"
        variant="success"
      />

      {/* Inactive Users */}
      <StatsCard
        title="Inactive Users"
        value={stats.inactiveUsers}
        icon={UserX}
        description="Deactivated accounts"
        variant="warning"
      />

      {/* Locked Users */}
      <StatsCard
        title="Locked Accounts"
        value={stats.lockedUsers}
        icon={Lock}
        description="Temporarily locked"
        variant="danger"
      />
    </div>
  )
}

async function RoleDistribution() {
  const statsResponse = await getUserStats()

  if (!statsResponse.success || !statsResponse.data) {
    return (
      <div className="text-center py-12 text-red-400">
        Failed to load role distribution
      </div>
    )
  }

  const stats = statsResponse.data

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Superusers */}
      <div className="relative rounded-xl border border-purple-800/50 bg-purple-950/20 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-400">Superusers</h3>
          <div className="w-12 h-12 rounded-full bg-purple-900/20 flex items-center justify-center">
            <Crown className="w-6 h-6 text-purple-400" />
          </div>
        </div>
        <p className="text-3xl font-bold text-white mb-2">{stats.superusers}</p>
        <p className="text-xs text-gray-500">Full system access</p>
      </div>

      {/* Admins */}
      <div className="relative rounded-xl border border-blue-800/50 bg-blue-950/20 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-400">Administrators</h3>
          <div className="w-12 h-12 rounded-full bg-blue-900/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        <p className="text-3xl font-bold text-white mb-2">{stats.admins}</p>
        <p className="text-xs text-gray-500">User management</p>
      </div>

      {/* Regular Users */}
      <div className="relative rounded-xl border border-gray-800 bg-[#0f1d31]/40 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-400">Regular Users</h3>
          <div className="w-12 h-12 rounded-full bg-gray-900/20 flex items-center justify-center">
            <User className="w-6 h-6 text-gray-400" />
          </div>
        </div>
        <p className="text-3xl font-bold text-white mb-2">{stats.regularUsers}</p>
        <p className="text-xs text-gray-500">Standard access</p>
      </div>
    </div>
  )
}

async function RecentUsersTable() {
  const recentResponse = await getRecentUsers(5)

  if (!recentResponse.success || !recentResponse.data) {
    return (
      <div className="text-center py-8 text-red-400">
        Failed to load recent users
      </div>
    )
  }

  const users = recentResponse.data

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No users yet
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">User</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Email</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Role</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Created</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-gray-800/50 hover:bg-[#0f1d31]/60 transition-colors"
            >
              {/* User */}
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#25547e] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user.username}
                    </p>
                  </div>
                </div>
              </td>

              {/* Email */}
              <td className="py-3 px-4 text-sm text-gray-400">
                <span className="truncate max-w-[200px] inline-block">
                  {user.email}
                </span>
              </td>

              {/* Role */}
              <td className="py-3 px-4">
                <RoleBadge role={user.role} size="sm" />
              </td>

              {/* Status */}
              <td className="py-3 px-4">
                <StatusBadge
                  isActive={user.is_active}
                  lockedUntil={user.locked_until}
                  size="sm"
                />
              </td>

              {/* Created */}
              <td className="py-3 px-4 text-sm text-gray-400">
                {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-400">
          Welcome to the admin panel. Here's an overview of your system.
        </p>
      </div>

      {/* Main Stats */}
      <Suspense fallback={<StatsLoadingSkeleton />}>
        <DashboardStats />
      </Suspense>

      {/* Role Distribution */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#3B82F6]" />
          Role Distribution
        </h2>
        <Suspense fallback={<RoleLoadingSkeleton />}>
          <RoleDistribution />
        </Suspense>
      </div>

      {/* Recent Users */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#3B82F6]" />
            Recent Users
          </h2>
          <Link href="/admin/users">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-300 hover:bg-[#0f1d31] hover:text-white"
            >
              View All
            </Button>
          </Link>
        </div>

        <div className="rounded-xl border border-gray-800 bg-[#0f1d31]/40 backdrop-blur-sm overflow-hidden">
          <Suspense
            fallback={
              <div className="text-center py-8 text-gray-400">
                Loading recent users...
              </div>
            }
          >
            <RecentUsersTable />
          </Suspense>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/users/new">
            <div className="rounded-xl border border-gray-800 bg-[#0f1d31]/40 backdrop-blur-sm p-6 hover:bg-[#0f1d31]/60 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#25547e]/20 flex items-center justify-center group-hover:bg-[#25547e]/30 transition-colors">
                  <Users className="w-6 h-6 text-[#3B82F6]" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Create User</h3>
                  <p className="text-sm text-gray-400">Add a new user account</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/users">
            <div className="rounded-xl border border-gray-800 bg-[#0f1d31]/40 backdrop-blur-sm p-6 hover:bg-[#0f1d31]/60 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#25547e]/20 flex items-center justify-center group-hover:bg-[#25547e]/30 transition-colors">
                  <UserCheck className="w-6 h-6 text-[#3B82F6]" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Manage Users</h3>
                  <p className="text-sm text-gray-400">View and edit user accounts</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/settings">
            <div className="rounded-xl border border-gray-800 bg-[#0f1d31]/40 backdrop-blur-sm p-6 hover:bg-[#0f1d31]/60 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#25547e]/20 flex items-center justify-center group-hover:bg-[#25547e]/30 transition-colors">
                  <Shield className="w-6 h-6 text-[#3B82F6]" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Settings</h3>
                  <p className="text-sm text-gray-400">Configure system settings</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}