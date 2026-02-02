import { Button, Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

const Hero = () => {
  return (
    <div className="relative w-full h-[85vh] md:h-[90vh] bg-white dark:bg-black transition-colors duration-300 overflow-hidden flex items-center">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-900/10 dark:via-black dark:to-purple-900/10 opacity-60 z-0"></div>

      <div className="content-container relative z-10 w-full h-full flex flex-col sm:flex-row items-center gap-12 sm:gap-16 md:gap-20 pt-20 sm:pt-0">

        {/* Left: Text */}
        <div className="flex-1 flex flex-col justify-center items-start gap-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 fill-mode-forwards">
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-semibold tracking-wide uppercase mb-2 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/30">
            The Next Gen Network
          </div>

          <Heading
            level="h1"
            className="text-5xl md:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.1]"
          >
            Future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              Connectivity
            </span>
          </Heading>

          <p className="text-xl text-neutral-500 dark:text-neutral-400 max-w-lg font-light leading-relaxed">
            Experience ultra-fast 5G, seamless roaming, and premium devices.
            Join the network designed for your digital lifestyle.
          </p>

          <div className="flex items-center gap-4 pt-4">
            <LocalizedClientLink href="/buy-sim">
              <Button
                className="
                      px-8 py-4 rounded-full text-base bg-neutral-900 text-white dark:bg-white dark:text-neutral-900
                      hover:bg-neutral-800 dark:hover:bg-neutral-200 hover:shadow-lg transition-all duration-300
                   "
              >
                Get Connected
              </Button>
            </LocalizedClientLink>
            <LocalizedClientLink href="/store">
              <Button
                variant="secondary"
                className="
                      px-8 py-4 rounded-full text-base bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800
                      text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all duration-300
                   "
              >
                View Devices
              </Button>
            </LocalizedClientLink>
          </div>
        </div>

        {/* Right: Modern Image Composition */}
        <div className="flex-1 h-full w-full relative flex items-center justify-center md:justify-end animate-in fade-in zoom-in-95 duration-1000 delay-200 fill-mode-forwards opacity-0">
          <div className="relative w-[90%] md:w-[100%] aspect-[3/4] md:aspect-[4/5] max-h-[80vh]">
            <div className="absolute inset-0 rounded-[2rem] overflow-hidden shadow-2xl border-[8px] border-white dark:border-neutral-900 z-10 transition-colors duration-300">
              <Image
                src="/hero-lifestyle.png"
                alt="Future Connectivity"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            {/* Decorative backdrop blobs */}
            <div className="absolute top-10 -right-10 w-full h-full bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl -z-0"></div>
            <div className="absolute bottom-10 -left-10 w-2/3 h-2/3 bg-purple-200/30 dark:bg-purple-500/10 rounded-full blur-3xl -z-0"></div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Hero
