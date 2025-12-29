'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Input } from '@/registry/new-york-v4/ui/input'
import { Button } from '@/registry/new-york-v4/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/registry/new-york-v4/ui/select'
import { useDebounce } from '@/hooks/use-debounce'

export default function UserFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Initialize from URL params
    const [search, setSearch] = useState(searchParams.get('search') || '')
    const [role, setRole] = useState(searchParams.get('role') || 'all')
    const [status, setStatus] = useState(searchParams.get('status') || 'all')

    // Debounce search input
    const debouncedSearch = useDebounce(search, 500)

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())

        if (debouncedSearch) {
            params.set('search', debouncedSearch)
        } else {
            params.delete('search')
        }

        if (role && role !== 'all') {
            params.set('role', role)
        } else {
            params.delete('role')
        }

        if (status && status !== 'all') {
            params.set('status', status)
        } else {
            params.delete('status')
        }

        // Reset to page 1 when filters change
        params.set('page', '1')

        router.push(`/admin/users?${params.toString()}`)
    }, [debouncedSearch, role, status, router, searchParams])

    const handleClearFilters = () => {
        setSearch('')
        setRole('all')
        setStatus('all')
        router.push('/admin/users')
    }

    const hasActiveFilters = search || role !== 'all' || status !== 'all'

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1 w-full sm:w-auto sm:min-w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                    type="text"
                    placeholder="Search by username or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-[#0f1d31] border-gray-800 text-white placeholder:text-gray-500 focus:border-[#3B82F6]"
                />
            </div>

            {/* Role Filter */}
            <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-full sm:w-[150px] bg-[#0f1d31] border-gray-800 text-white">
                    <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f1d31] border-gray-800">
                    <SelectItem value="all" className="text-white">All Roles</SelectItem>
                    <SelectItem value="superuser" className="text-white">Superuser</SelectItem>
                    <SelectItem value="admin" className="text-white">Admin</SelectItem>
                    <SelectItem value="user" className="text-white">User</SelectItem>
                </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full sm:w-[150px] bg-[#0f1d31] border-gray-800 text-white">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f1d31] border-gray-800">
                    <SelectItem value="all" className="text-white">All Status</SelectItem>
                    <SelectItem value="active" className="text-white">Active</SelectItem>
                    <SelectItem value="inactive" className="text-white">Inactive</SelectItem>
                    <SelectItem value="locked" className="text-white">Locked</SelectItem>
                </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasActiveFilters && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="border-gray-700 text-gray-300 hover:bg-[#0f1d31] hover:text-white w-full sm:w-auto"
                >
                    <X className="w-4 h-4 mr-2" />
                    Clear
                </Button>
            )}
        </div>
    )
}