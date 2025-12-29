'use client'
import { UserListItem } from '@/types/user'
import RoleBadge from './RoleBadge'
import StatusBadge from './StatusBadge'

import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'
import UserActionsMenu from './UserActionMenu'

interface UsersTableProps {
  users: UserListItem[]
  isLoading?: boolean
}

export default function UsersTable({ users, isLoading }: UsersTableProps) {
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-800 bg-[#0f1d31]/40 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 bg-[#0a1525]">
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">User</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Email</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Role</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Last Login</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Failed</th>
                <th className="text-right py-4 px-4 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b border-gray-800/50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-800 animate-pulse"></div>
                      <div className="h-4 w-24 bg-gray-800 rounded animate-pulse"></div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-32 bg-gray-800 rounded animate-pulse"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-6 w-16 bg-gray-800 rounded-full animate-pulse"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-6 w-16 bg-gray-800 rounded-full animate-pulse"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-20 bg-gray-800 rounded animate-pulse"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-8 bg-gray-800 rounded animate-pulse"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-8 w-8 bg-gray-800 rounded animate-pulse ml-auto"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-gray-800 bg-[#0f1d31]/40 backdrop-blur-sm p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-gray-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              No Users Found
            </h3>
            <p className="text-sm text-gray-400">
              Try adjusting your filters or create a new user
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-[#0f1d31]/40 backdrop-blur-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 bg-[#0a1525]">
              <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">User</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Email</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Role</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Status</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Last Login</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Failed</th>
              <th className="text-right py-4 px-4 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-800/50 hover:bg-[#0f1d31]/60 transition-colors cursor-pointer"
                onClick={() => router.push(`/admin/users/${user.id}`)}
              >
                {/* User */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#25547e] flex items-center justify-center text-white text-sm font-semibold shrink-0">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {user.username}
                      </p>
                      {user.full_name && (
                        <p className="text-xs text-gray-500 truncate">
                          {user.full_name}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td className="py-4 px-4 text-sm text-gray-400">
                  <span className="truncate max-w-[200px] inline-block">
                    {user.email}
                  </span>
                </td>

                {/* Role */}
                <td className="py-4 px-4">
                  <RoleBadge role={user.role} size="sm" />
                </td>

                {/* Status */}
                <td className="py-4 px-4">
                  <StatusBadge
                    isActive={user.is_active}
                    lockedUntil={user.locked_until}
                    size="sm"
                  />
                </td>

                {/* Last Login */}
                <td className="py-4 px-4 text-sm text-gray-400">
                  {user.last_login
                    ? formatDistanceToNow(new Date(user.last_login), { addSuffix: true })
                    : 'Never'}
                </td>

                {/* Failed Attempts */}
                <td className="py-4 px-4">
                  {user.failed_login_attempts > 0 ? (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full bg-red-950/40 text-red-300 border border-red-800/50">
                      {user.failed_login_attempts}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">0</span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <UserActionsMenu user={user} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}