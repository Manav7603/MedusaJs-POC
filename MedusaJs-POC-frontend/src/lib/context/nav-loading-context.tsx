"use client"

import { usePathname, useSearchParams } from "next/navigation"
import React, { createContext, useContext, useEffect, useState } from "react"

interface NavLoadingContextType {
    loading: boolean
    startLoading: () => void
    stopLoading: () => void
}

const NavLoadingContext = createContext<NavLoadingContextType | null>(null)

export const useNavLoading = () => {
    const context = useContext(NavLoadingContext)
    if (!context) {
        throw new Error("useNavLoading must be used within a NavLoadingProvider")
    }
    return context
}

export const NavLoadingProvider = ({ children }: { children: React.ReactNode }) => {
    const [loading, setLoading] = useState(false)
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const startLoading = () => setLoading(true)
    const stopLoading = () => setLoading(false)

    // Reset loading state on route change
    useEffect(() => {
        stopLoading()
    }, [pathname, searchParams])

    return (
        <NavLoadingContext.Provider value={{ loading, startLoading, stopLoading }}>
            {children}
        </NavLoadingContext.Provider>
    )
}
