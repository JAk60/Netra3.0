import { Suspense } from 'react'
import { Users, UserCheck, UserX, Lock, UserPlus, List } from 'lucide-react'
import StatsCard from '@/components/admin/dashboard/StatsCard'
import { Button } from '@/registry/new-york-v4/ui/button'
import Link from 'next/link'
import { getUserStats, getRecentUsers } from '@/lib/actions/admin-actions'
import RoleBadge from '@/components/admin/users/RoleBadge'
import StatusBadge from '@/components/admin/users/StatusBadge'
import { formatDistanceToNow } from 'date-fns'

async function DashboardStats() {
    const response = await getUserStats()

    if (!response.success || !response.data) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <StatsCard
                        key={i}
                        title="Loading..."
                        value="--"
                        icon={Users}
                        isLoading={true}
                    />
                ))}
            </div>
        )
    }

    const stats = response.data

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
                title="Total Users"
                value={stats.totalUsers}
                icon={Users}
                description="All registered users"
                variant="default"
            />

            <StatsCard
                title="Active Users"
                value={stats.activeUsers}
                icon={UserCheck}
                description="Currently active"
                variant="success"
            />

            <StatsCard
                title="Locked Accounts"
                value={stats.lockedUsers}
                icon={Lock}
                description="Temporarily locked"
                variant={stats.lockedUsers > 0 ? "danger" : "default"}
            />

            <StatsCard
                title="Administrators"
                value={stats.superusers + stats.admins}
                icon={UserPlus}
                description={`${stats.superusers} superusers, ${stats.admins} admins`}
                variant="default"
            />
        </div>
    )
}

async function RecentUsersTable() {
    const response = await getRecentUsers(10)

    if (!response.success || !response.data) {
        return (
            <div className="text-center py-8 text-gray-400">
                Failed to load recent users
            </div>
        )
    }

    const users = response.data

    if (users.length === 0) {
        return (
            <div className="text-center py-8 text-gray-400">
                No users found
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
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Joined</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr
                            key={user.id}
                            className="border-b border-gray-800/50 hover:bg-[#0f1d31]/40 transition-colors"
                        >
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#25547e] flex items-center justify-center text-white text-sm font-semibold">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-white">
                                        {user.username}
                                    </span>
                                </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-400">
                                {user.email}
                            </td>
                            <td className="py-3 px-4">
                                <RoleBadge role={user.role} size="sm" />
                            </td>
                            <td className="py-3 px-4">
                                <StatusBadge
                                    isActive={user.is_active}
                                    lockedUntil={user.locked_until}
                                    size="sm"
                                />
                            </td>
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
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                    Admin Dashboard
                </h1>
                <p className="text-gray-400">
                    Manage users and monitor system activity
                </p>
            </div>

            {/* Stats Cards */}
            <Suspense fallback={
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <StatsCard
                            key={i}
                            title="Loading..."
                            value="--"
                            icon={Users}
                            isLoading={true}
                        />
                    ))}
                </div>
            }>
                <DashboardStats />
            </Suspense>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/admin/users/new">
                    <div className="group relative rounded-xl border border-gray-800 bg-[#0f1d31]/40 backdrop-blur-sm p-6 hover:bg-[#0f1d31]/60 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#25547e]/20 flex items-center justify-center text-[#3B82F6] group-hover:bg-[#25547e]/30 transition-colors">
                                <UserPlus className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-1">
                                    Create New User
                                </h3>
                                <p className="text-sm text-gray-400">
                                    Add a new user account to the system
                                </p>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link href="/admin/users">
                    <div className="group relative rounded-xl border border-gray-800 bg-[#0f1d31]/40 backdrop-blur-sm p-6 hover:bg-[#0f1d31]/60 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#25547e]/20 flex items-center justify-center text-[#3B82F6] group-hover:bg-[#25547e]/30 transition-colors">
                                <List className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-1">
                                    View All Users
                                </h3>
                                <p className="text-sm text-gray-400">
                                    Browse and manage all user accounts
                                </p>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Recent Users */}
            <div className="rounded-xl border border-gray-800 bg-[#0f1d31]/40 backdrop-blur-sm overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <div>
                        <h2 className="text-xl font-semibold text-white mb-1">
                            Recent Users
                        </h2>
                        <p className="text-sm text-gray-400">
                            Latest user registrations
                        </p>
                    </div>
                    <Link href="/admin/users">
                        <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-[#0f1d31] hover:text-white">
                            View All
                        </Button>
                    </Link>
                </div>

                <Suspense fallback={
                    <div className="p-6 text-center text-gray-400">
                        Loading recent users...
                    </div>
                }>
                    <RecentUsersTable />
                </Suspense>
            </div>
        </div>
    )
}