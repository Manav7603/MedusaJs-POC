const TELECOM_BACKEND_URL = process.env.NEXT_PUBLIC_TELECOM_BACKEND_URL || "http://localhost:9000"

interface RequestOptions extends RequestInit {
    headers?: Record<string, string>
}

// Helper to get Medusa publishable key if needed, or other headers
const getHeaders = () => {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    }

    // If we need to pass the Medusa publishable key specifically to this backend
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    if (publishableKey) {
        headers["x-publishable-api-key"] = publishableKey
    }

    return headers
}

export const telecomClient = {
    get: async <T>(path: string, options?: RequestOptions): Promise<T> => {
        const url = `${TELECOM_BACKEND_URL}${path}`
        const headers = { ...getHeaders(), ...options?.headers }

        const response = await fetch(url, {
            ...options,
            method: "GET",
            headers,
        })

        if (!response.ok) {
            throw new Error(`Telecom API Error: ${response.statusText}`)
        }

        return response.json()
    },

    post: async <T>(path: string, body: any, options?: RequestOptions): Promise<T> => {
        const url = `${TELECOM_BACKEND_URL}${path}`
        const headers = { ...getHeaders(), ...options?.headers }

        const response = await fetch(url, {
            ...options,
            method: "POST",
            headers,
            body: JSON.stringify(body),
        })

        if (!response.ok) {
            throw new Error(`Telecom API Error: ${response.statusText}`)
        }

        return response.json()
    },
}
