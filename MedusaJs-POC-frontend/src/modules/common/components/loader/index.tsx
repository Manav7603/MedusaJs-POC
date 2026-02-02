import { clx } from "@medusajs/ui"

export const Loader = ({ className, size = 24, variant = "primary" }: { className?: string, size?: number, variant?: "primary" | "secondary" | "white" }) => {
    return (
        <div className={clx("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
            <div className={clx(
                "absolute inset-0 rounded-full border-2 border-t-transparent animate-spin",
                variant === "primary" && "border-white",
                variant === "secondary" && "border-blue-600",
                variant === "white" && "border-white",
                "border-r-transparent border-b-transparent"
            )}></div>
            <div className={clx(
                "absolute inset-0 rounded-full border-2 opacity-20",
                variant === "primary" && "border-white",
                variant === "secondary" && "border-blue-600",
                variant === "white" && "border-white"
            )}></div>
        </div>
    )
}
