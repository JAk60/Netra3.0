'use client'

import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/registry/new-york-v4/ui/button"
import { LogOut, ChevronRight } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"

export default function AdminHeader() {
    const { user, logout } = useAuthStore()
    const router = useRouter()
    const pathname = usePathname()

    const handleLogout = async () => {
        try {
            await logout()
            toast.success('Logged out successfully')
            router.push('/login')
        } catch (error) {
            toast.error('Failed to logout')
        }
    }

    // Generate breadcrumbs from pathname
    const generateBreadcrumbs = () => {
        const paths = pathname.split('/').filter(Boolean)
        const breadcrumbs = []

        let currentPath = ''
        for (const path of paths) {
            currentPath += `/${path}`
            const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')
            breadcrumbs.push({ label, path: currentPath })
        }

        return breadcrumbs
    }

    const breadcrumbs = generateBreadcrumbs()

    return (
        <header className="h-16 border-b border-gray-800 bg-[#0a1525]/80 backdrop-blur-lg flex items-center justify-between px-6">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                    <div key={crumb.path} className="flex items-center gap-2">
                        <button
                            onClick={() => router.push(crumb.path)}
                            className={`${index === breadcrumbs.length - 1
                                    ? 'text-white font-medium'
                                    : 'text-gray-400 hover:text-white transition-colors'
                                }`}
                        >
                            {crumb.label}
                        </button>
                        {index < breadcrumbs.length - 1 && (
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                        )}
                    </div>
                ))}
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-4">
                {user && (
                    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#0f1d31] border border-gray-800">
                        <div className="text-right">
                            <p className="text-sm font-medium text-white">
                                {user.username}
                            </p>
                            <p className="text-xs text-gray-400 capitalize">
                                {user.role}
                            </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#25547e] flex items-center justify-center text-white text-sm font-semibold">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                    </div>
                )}

                <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-700 text-gray-300 hover:bg-red-950 hover:text-red-200 hover:border-red-800"
                    onClick={handleLogout}
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </Button>
            </div>
        </header>
    )
}