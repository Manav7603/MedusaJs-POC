"use client"

import { Popover, Transition } from "@headlessui/react"
import { Fragment } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@medusajs/ui"

const NavMenu = () => {
    return (
        <Popover className="relative">
            {({ open }) => (
                <>
                    <Popover.Button
                        className={clx(
                            "relative w-10 h-10 flex flex-col justify-center items-center gap-1.5 focus:outline-none group z-50",
                            "transition-all duration-300"
                        )}
                        aria-label="Menu"
                    >
                        {/* Top Line */}
                        <span
                            className={clx(
                                "block w-6 h-0.5 bg-neutral-900 dark:bg-white rounded-full transition-all duration-300 ease-out fill-mode-forwards",
                                open ? "rotate-45 translate-y-2" : "group-hover:-translate-y-0.5"
                            )}
                        />
                        {/* Middle Line */}
                        <span
                            className={clx(
                                "block w-6 h-0.5 bg-neutral-900 dark:bg-white rounded-full transition-all duration-300 ease-out",
                                open ? "opacity-0" : "opacity-100"
                            )}
                        />
                        {/* Bottom Line */}
                        <span
                            className={clx(
                                "block w-6 h-0.5 bg-neutral-900 dark:bg-white rounded-full transition-all duration-300 ease-out fill-mode-forwards",
                                open ? "-rotate-45 -translate-y-2" : "group-hover:translate-y-0.5"
                            )}
                        />
                    </Popover.Button>

                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-4 scale-95"
                        enterTo="opacity-100 translate-y-0 scale-100"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0 scale-100"
                        leaveTo="opacity-0 translate-y-4 scale-95"
                    >
                        <Popover.Panel className="absolute top-[calc(100%_+_10px)] right-0 w-64 z-40">
                            <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] p-2">
                                <div className="flex flex-col gap-1">

                                    {/* Account Header */}
                                    {/* <div className="px-4 py-3 border-b border-neutral-200/50 dark:border-neutral-800/50 mb-1">
                                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                            Menu
                                        </span>
                                    </div> */}

                                    {/* My Hub */}
                                    <LocalizedClientLink
                                        href="/account"
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                            {/* User Icon SVG */}
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium text-neutral-900 dark:text-white">My Hub</span>
                                    </LocalizedClientLink>

                                    {/* My Numbers */}
                                    <LocalizedClientLink
                                        href="/my-numbers"
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                                            {/* Sim/Phone Icon SVG */}
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                                                <line x1="12" y1="18" x2="12.01" y2="18" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium text-neutral-900 dark:text-white">My Numbers</span>
                                    </LocalizedClientLink>

                                    {/* Support */}
                                    <LocalizedClientLink
                                        href="/customer-service"
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                                            {/* Support/Lifebuoy Icon SVG */}
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" />
                                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                                <line x1="12" y1="17" x2="12.01" y2="17" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium text-neutral-900 dark:text-white">Support</span>
                                    </LocalizedClientLink>

                                </div>
                            </div>
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    )
}

export default NavMenu
