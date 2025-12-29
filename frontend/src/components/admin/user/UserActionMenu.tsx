'use client'

import { useState } from 'react'
import { UserListItem } from '@/types/user'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/registry/new-york-v4/ui/dropdown-menu'

import {
    MoreVertical,
    Eye,
    Edit,
    Unlock,
    UserCheck,
    UserX,
    Trash2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { unlockUserAccount, toggleUserStatus, deleteUser } from '@/actions/auth/admin-action'

import { Button } from '@/registry/new-york-v4/ui/button'
import ConfirmationModal from '../ConfirmationModal'

interface UserActionsMenuProps {
    user: UserListItem
}

export default function UserActionsMenu({ user }: UserActionsMenuProps) {
    const router = useRouter()
    const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isToggleModalOpen, setIsToggleModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const isLocked = user.locked_until && new Date(user.locked_until) > new Date()

    const handleViewDetails = () => {
        router.push(`/admin/users/${user.id}`)
    }

    const handleEdit = () => {
        router.push(`/admin/users/${user.id}`)
    }

    const handleUnlock = async () => {
        setIsLoading(true)
        try {
            const response = await unlockUserAccount(user.id)
            if (response.success) {
                toast.success('Account unlocked successfully')
                router.refresh()
            } else {
                toast.error(response.error || 'Failed to unlock account')
            }
        } catch (error) {
            toast.error('Failed to unlock account')
        } finally {
            setIsLoading(false)
            setIsUnlockModalOpen(false)
        }
    }

    const handleToggleStatus = async () => {
        setIsLoading(true)
        try {
            const newStatus = !user.is_active
            const response = await toggleUserStatus(user.id, newStatus)
            if (response.success) {
                toast.success(newStatus ? 'User activated' : 'User deactivated')
                router.refresh()
            } else {
                toast.error(response.error || 'Failed to update user status')
            }
        } catch (error) {
            toast.error('Failed to update user status')
        } finally {
            setIsLoading(false)
            setIsToggleModalOpen(false)
        }
    }

    const handleDelete = async () => {
        setIsLoading(true)
        try {
            const response = await deleteUser(user.id)
            if (response.success) {
                toast.success('User deleted successfully')
                router.refresh()
            } else {
                toast.error(response.error || 'Failed to delete user')
            }
        } catch (error) {
            toast.error('Failed to delete user')
        } finally {
            setIsLoading(false)
            setIsDeleteModalOpen(false)
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-[#0f1d31]"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#0f1d31] border-gray-800 w-48">
                    <DropdownMenuItem
                        onClick={handleViewDetails}
                        className="text-gray-300 hover:bg-[#25547e]/20 hover:text-white cursor-pointer"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={handleEdit}
                        className="text-gray-300 hover:bg-[#25547e]/20 hover:text-white cursor-pointer"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit User
                    </DropdownMenuItem>

                    {isLocked && (
                        <DropdownMenuItem
                            onClick={() => setIsUnlockModalOpen(true)}
                            className="text-yellow-400 hover:bg-yellow-950/20 hover:text-yellow-300 cursor-pointer"
                        >
                            <Unlock className="w-4 h-4 mr-2" />
                            Unlock Account
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                        onClick={() => setIsToggleModalOpen(true)}
                        className="text-gray-300 hover:bg-[#25547e]/20 hover:text-white cursor-pointer"
                    >
                        {user.is_active ? (
                            <>
                                <UserX className="w-4 h-4 mr-2" />
                                Deactivate
                            </>
                        ) : (
                            <>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Activate
                            </>
                        )}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-gray-800" />

                    <DropdownMenuItem
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="text-red-400 hover:bg-red-950/20 hover:text-red-300 cursor-pointer"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete User
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Unlock Confirmation Modal */}
            <ConfirmationModal
                isOpen={isUnlockModalOpen}
                onClose={() => setIsUnlockModalOpen(false)}
                onConfirm={handleUnlock}
                title="Unlock Account"
                description={`Are you sure you want to unlock ${user.username}'s account? This will reset their failed login attempts.`}
                confirmText="Unlock Account"
                variant="warning"
                isLoading={isLoading}
            />

            {/* Toggle Status Confirmation Modal */}
            <ConfirmationModal
                isOpen={isToggleModalOpen}
                onClose={() => setIsToggleModalOpen(false)}
                onConfirm={handleToggleStatus}
                title={user.is_active ? 'Deactivate User' : 'Activate User'}
                description={`Are you sure you want to ${user.is_active ? 'deactivate' : 'activate'} ${user.username}?`}
                confirmText={user.is_active ? 'Deactivate' : 'Activate'}
                variant={user.is_active ? 'warning' : 'default'}
                isLoading={isLoading}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete User"
                description={`Are you sure you want to delete ${user.username}? This action cannot be undone.`}
                confirmText="Delete User"
                variant="danger"
                isLoading={isLoading}
            />
        </>
    )
}