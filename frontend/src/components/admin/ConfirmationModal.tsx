'use client'

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/registry/new-york-v4/ui/alert-dialog'
import { Button } from '@/registry/new-york-v4/ui/button'
import { Loader2, AlertTriangle, Info, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void | Promise<void>
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'danger' | 'warning' | 'info'
    isLoading?: boolean
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
    isLoading = false,
}: ConfirmationModalProps) {
    const variantConfig = {
        default: {
            icon: Info,
            iconClass: 'text-blue-400 bg-blue-950/20 border-blue-800/50',
            buttonClass: 'bg-[#25547e] hover:bg-[#25547e]/80 text-white',
        },
        danger: {
            icon: AlertCircle,
            iconClass: 'text-red-400 bg-red-950/20 border-red-800/50',
            buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
        },
        warning: {
            icon: AlertTriangle,
            iconClass: 'text-yellow-400 bg-yellow-950/20 border-yellow-800/50',
            buttonClass: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        },
        info: {
            icon: Info,
            iconClass: 'text-cyan-400 bg-cyan-950/20 border-cyan-800/50',
            buttonClass: 'bg-cyan-600 hover:bg-cyan-700 text-white',
        },
    }

    const config = variantConfig[variant]
    const Icon = config.icon

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="bg-[#0f1d31] border-gray-800 text-white">
                <AlertDialogHeader>
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        <div
                            className={cn(
                                'w-12 h-12 rounded-full flex items-center justify-center border',
                                config.iconClass
                            )}
                        >
                            <Icon className="w-6 h-6" />
                        </div>
                    </div>

                    <AlertDialogTitle className="text-center text-xl">
                        {title}
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-center text-gray-400">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full sm:w-auto border-gray-700 text-gray-300 hover:bg-[#0a1525] hover:text-white"
                    >
                        {cancelText}
                    </Button>

                    <Button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={cn('w-full sm:w-auto', config.buttonClass)}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            confirmText
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}