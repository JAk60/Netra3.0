'use client'

import { Button } from "@/registry/new-york-v4/ui/button"
import {
    LayoutDashboard,
    Users,
    UserPlus,
    Settings,
    ArrowLeft,
    Shield,
    Telescope
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"

export default function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const { user } = useAuthStore()

    const isActive = (path: string) => pathname === path

    const navigationItems = [
        {
            label: 'Dashboard',
            href: '/admin',
            icon: LayoutDashboard,
        },
        {
            label: 'All Users',
            href: '/admin/users',
            icon: Users,
        },
        {
            label: 'Create User',
            href: '/admin/users/new',
            icon: UserPlus,
        },
        {
            label: 'Settings',
            href: '/admin/settings',
            icon: Settings,
        },
    ]

    return (
        <div className="w-64 border-r border-gray-800 flex flex-col bg-[#0a1525]">
            {/* Logo and Header */}
            <div className="ml-4 p-4 border-b border-gray-800">
                <div className="flex justify-start items-center">
                    <Telescope className="w-12 h-12 animate-[jumpThenMirror_20s_ease-in-out_infinite] text-[#3B82F6]" />
                    <div className="flex flex-col ml-3">
                        <span className="font-[amita] text-3xl text-white">
                            {/* दृष्टि */}नेत्रा
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Admin Panel
                        </span>
                    </div>
                </div>
            </div>

            {/* User Info */}
            {user && (
                <div className="px-4 py-3 border-b border-gray-800 bg-[#0f1d31]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#25547e] flex items-center justify-center text-white font-semibold">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {user.username}
                            </p>
                            <p className="text-xs text-gray-400 capitalize">
                                {user.role}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1">
                {navigationItems.map((item) => {
                    const Icon = item.icon

                    return (
                        <Button
                            key={item.href}
                            variant={isActive(item.href) ? "default" : "ghost"}
                            className={`w-full justify-start gap-3 ${isActive(item.href)
                                    ? "bg-[#25547e] hover:bg-[#25547e]/80 text-white"
                                    : "text-gray-300 hover:bg-[#0f1d31] hover:text-white"
                                }`}
                            onClick={() => router.push(item.href)}
                        >
                            <Icon className="w-4 h-4" />
                            {item.label}
                        </Button>
                    )
                })}
            </nav>

            {/* Back to Main App */}
            <div className="p-4 border-t border-gray-800">
                <Button
                    variant="outline"
                    className="w-full justify-start gap-3 border-gray-700 text-gray-300 hover:bg-[#0f1d31] hover:text-white hover:border-gray-600"
                    onClick={() => router.push('/')}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to App
                </Button>
            </div>
        </div>
    )
}