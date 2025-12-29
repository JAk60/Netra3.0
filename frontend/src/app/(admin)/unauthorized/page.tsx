'use client'

import { Button } from "@/registry/new-york-v4/ui/button"
import { ShieldAlert, Home, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function UnauthorizedPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a1525] p-4">
            <div className="max-w-md w-full">
                {/* Glassmorphism Card */}
                <div className="relative bg-[#0f1d31]/60 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
                    {/* Decorative Glow */}
                    <div className="absolute -inset-1 bg-linear-to-r from-red-600 to-orange-600 rounded-2xl blur opacity-20"></div>

                    {/* Content */}
                    <div className="relative">
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-red-950/50 border border-red-800 flex items-center justify-center">
                                <ShieldAlert className="w-10 h-10 text-red-400" />
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl font-bold text-center mb-3 text-white">
                            Access Denied
                        </h1>

                        {/* Error Code */}
                        <p className="text-center text-gray-500 font-mono mb-6">
                            Error 403
                        </p>

                        {/* Description */}
                        <p className="text-center text-gray-400 mb-8">
                            You don't have permission to access this area.
                            This section is restricted to administrators and superusers only.
                        </p>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <Button
                                className="w-full bg-[#25547e] hover:bg-[#25547e]/80 text-white"
                                onClick={() => router.push('/')}
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Go to Home
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full border-gray-700 text-gray-300 hover:bg-[#0f1d31] hover:text-white"
                                onClick={() => router.back()}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Go Back
                            </Button>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-6 pt-6 border-t border-gray-800">
                            <p className="text-xs text-center text-gray-500">
                                If you believe this is an error, please contact your system administrator.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}