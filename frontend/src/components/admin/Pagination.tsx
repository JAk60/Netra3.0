'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/registry/new-york-v4/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
}

export default function Pagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
}: PaginationProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const goToPage = (page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', page.toString())
        router.push(`?${params.toString()}`)
    }

    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages: (number | string)[] = []
        const maxPages = 7 // Max number of page buttons to show

        if (totalPages <= maxPages) {
            // Show all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Show first, last, and current with ellipsis
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i)
                pages.push('...')
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1)
                pages.push('...')
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
            } else {
                pages.push(1)
                pages.push('...')
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
                pages.push('...')
                pages.push(totalPages)
            }
        }

        return pages
    }

    const pageNumbers = getPageNumbers()

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-gray-800 bg-[#0f1d31]/40 backdrop-blur-sm p-4">
            {/* Info */}
            <div className="text-sm text-gray-400">
                Showing <span className="font-medium text-white">{startItem}</span> to{' '}
                <span className="font-medium text-white">{endItem}</span> of{' '}
                <span className="font-medium text-white">{totalItems}</span> results
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
                {/* First Page */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="border-gray-700 text-gray-300 hover:bg-[#0f1d31] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronsLeft className="w-4 h-4" />
                </Button>

                {/* Previous Page */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-gray-700 text-gray-300 hover:bg-[#0f1d31] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>

                {/* Page Numbers */}
                <div className="hidden sm:flex items-center gap-1">
                    {pageNumbers.map((page, index) => {
                        if (page === '...') {
                            return (
                                <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                                    ...
                                </span>
                            )
                        }

                        const pageNumber = page as number
                        const isActive = pageNumber === currentPage

                        return (
                            <Button
                                key={pageNumber}
                                variant={isActive ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => goToPage(pageNumber)}
                                className={
                                    isActive
                                        ? 'bg-[#25547e] hover:bg-[#25547e]/80 text-white'
                                        : 'border-gray-700 text-gray-300 hover:bg-[#0f1d31] hover:text-white'
                                }
                            >
                                {pageNumber}
                            </Button>
                        )
                    })}
                </div>

                {/* Mobile: Current Page */}
                <div className="sm:hidden px-3 py-1 rounded bg-[#25547e]/20 text-sm font-medium text-white">
                    {currentPage} / {totalPages}
                </div>

                {/* Next Page */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="border-gray-700 text-gray-300 hover:bg-[#0f1d31] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>

                {/* Last Page */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="border-gray-700 text-gray-300 hover:bg-[#0f1d31] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronsRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}