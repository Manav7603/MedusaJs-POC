"use client"

import { Button } from "@medusajs/ui"
import { Loader } from "@modules/common/components/loader"
import React from "react"
import { useFormStatus } from "react-dom"

export function SubmitButton({
  children,
  variant = "primary",
  className,
  "data-testid": dataTestId,
}: {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "transparent" | "danger" | null
  className?: string
  "data-testid"?: string
}) {
  const { pending } = useFormStatus()

  return (
    <Button
      size="large"
      className={className}
      type="submit"
      disabled={pending}
      variant={variant || "primary"}
      data-testid={dataTestId}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <Loader variant="white" size={20} />
        </span>
      ) : (
        children
      )}
    </Button>
  )
}
