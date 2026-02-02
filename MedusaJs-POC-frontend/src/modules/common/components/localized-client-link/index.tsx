"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import React from "react"
import { useNavLoading } from "@lib/context/nav-loading-context"

/**
 * Use this component to create a Next.js `<Link />` that persists the current country code in the url,
 * without having to explicitly pass it as a prop.
 */
const LocalizedClientLink = ({
  children,
  href,
  ...props
}: {
  children?: React.ReactNode
  href: string
  className?: string
  onClick?: () => void
  passHref?: true
  [x: string]: any
}) => {
  const { countryCode } = useParams()
  const { startLoading } = useNavLoading()

  const { onClick, ...rest } = props // Extract onClick so we can wrap it

  const handleClick = () => {
    startLoading()
    onClick?.()
  }

  return (
    <Link href={`/${countryCode}${href}`} {...rest} onClick={handleClick}>
      {children}
    </Link>
  )
}

export default LocalizedClientLink
