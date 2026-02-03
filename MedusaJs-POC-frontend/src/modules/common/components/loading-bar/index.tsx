"use client"

import { useNavLoading } from "@lib/context/nav-loading-context"
import { clx } from "@medusajs/ui"

export const LoadingBar = () => {
    const { loading } = useNavLoading()

    if (!loading) return null

    return (
        <div className="fixed top-0 left-0 w-full h-1 z-[9999] pointer-events-none">
            <div className="relative w-full h-full bg-neutral-900/10 dark:bg-white/10 overflow-hidden">
                {/* Animated Gradient Bar */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-loading-bar origin-left w-full h-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            </div>
        </div>
    )
}
