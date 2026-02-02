import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import InteractiveLink from "@modules/common/components/interactive-link"
import ProductPreview from "@modules/products/components/product-preview"

export default async function TrendingNow({
  region,
}: {
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      limit: 8,
      offset: 0,
    },
  })

  const hasProducts = products && products.length > 0

  return (
    <div className="py-32 px-6 content-container bg-white dark:bg-black transition-colors duration-300">
      <div className="mb-20 text-center space-y-4">
        <h2 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Trending Now
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 font-light text-lg">
          Community favorites and new arrivals
        </p>
      </div>

      {hasProducts ? (
        <>
          <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((product) => (
              <li key={product.id}>
                <ProductPreview product={product} region={region} isFeatured />
              </li>
            ))}
          </ul>
          <div className="mt-12 text-center">
            <InteractiveLink href="/store">View all products</InteractiveLink>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 text-center">
          <div className="text-6xl mb-4 opacity-60">🔥</div>
          <Text className="text-xl font-medium text-neutral-700 dark:text-white mb-2">
            Trending picks coming soon
          </Text>
          <Text className="text-neutral-500 dark:text-neutral-400 max-w-md mb-6">
            We&apos;re curating the best devices and accessories. Check back soon
            or browse our store for the full selection.
          </Text>
          <InteractiveLink href="/store">Browse store</InteractiveLink>
        </div>
      )}
    </div>
  )
}
