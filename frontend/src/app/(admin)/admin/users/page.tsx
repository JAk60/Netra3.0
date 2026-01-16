
import { Suspense } from 'react'
import { UserPlus } from 'lucide-react'
import { Button } from '@/registry/new-york-v4/ui/button'
import Link from 'next/link'
import UsersTable from '@/components/admin/user/UserTables'
import Pagination from '@/components/admin/Pagination'
import UserFilters from '@/components/admin/user/UserFilters' 
import { getAllUsers } from '@/actions/auth/admin-action'
import { UserFilters as UserFiltersType } from '@/types/user'

interface UsersPageProps {
  searchParams: Promise<{
    search?: string
    role?: string
    status?: string
    page?: string
    limit?: string
  }>
}

async function UsersContent({ searchParams }: UsersPageProps) {
  // Await searchParams before accessing properties
  const params = await searchParams
  
  const filters: UserFiltersType = {
    search: params.search,
    role: params.role as any,
    status: params.status as any,
  }

  const page = parseInt(params.page || '1')
  const limit = parseInt(params.limit || '10')

  const response = await getAllUsers(filters, page, limit)

  if (!response.success || !response.data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Failed to load users: {response.error}</p>
      </div>
    )
  }

  const { data: users, total, totalPages } = response.data

  return (
    <>
      <UsersTable users={users} />

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={limit}
        />
      )}
    </>
  )
}

export default function UsersPage({ searchParams }: UsersPageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Users Management
          </h1>
          <p className="text-gray-400">
            Browse and manage all user accounts
          </p>
        </div>

        <Link href="/admin/users/new">
          <Button className="bg-[#25547e] hover:bg-[#25547e]/80 text-white">
            <UserPlus className="w-4 h-4 mr-2" />
            Create User
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <UserFilters />

      {/* Table */}
      <Suspense fallback={<UsersTable users={[]} isLoading={true} />}>
        <UsersContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}