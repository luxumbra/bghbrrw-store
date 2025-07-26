import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { getCompanyInfo } from "@lib/data/company"
import { Text, clx } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MedusaCTA from "@modules/layout/components/medusa-cta"

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  })
  const productCategories = await listCategories()
  const companyInfo = await getCompanyInfo()

  return (
    <footer className="w-full border-t border-ui-border-base">
      <div className="flex flex-col w-full content-container">
        <div className="flex flex-col items-start justify-between py-40 gap-y-6 xsmall:flex-row">
          <div>
            <LocalizedClientLink
              href="/"
              className="uppercase txt-compact-xlarge-plus text-ui-fg-subtle hover:text-ui-fg-base"
            >
              {companyInfo.name}
            </LocalizedClientLink>
            {companyInfo.location && (
              <div className="mt-2 text-ui-fg-subtle txt-small">
                <div className="font-medium">{companyInfo.location.name}</div>
                {companyInfo.location.address.address_1 && (
                  <div>{companyInfo.location.address.address_1}</div>
                )}
                {companyInfo.location.address.city && (
                  <div>{companyInfo.location.address.city}</div>
                )}
                {companyInfo.location.address.country_code && (
                  <div>
                    {companyInfo.location.address.country_code.toUpperCase()}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-10 text-small-regular md:gap-x-16 sm:grid-cols-3">
            {productCategories && productCategories?.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus txt-ui-fg-base">
                  Categories
                </span>
                <ul
                  className="grid grid-cols-1 gap-2"
                  data-testid="footer-categories"
                >
                  {productCategories?.slice(0, 6).map((c) => {
                    if (c.parent_category) {
                      return
                    }

                    const children =
                      c.category_children?.map((child) => ({
                        name: child.name,
                        handle: child.handle,
                        id: child.id,
                      })) || null

                    return (
                      <li
                        className="flex flex-col gap-2 text-ui-fg-subtle txt-small"
                        key={c.id}
                      >
                        <LocalizedClientLink
                          className={clx(
                            "hover:text-ui-fg-base",
                            children && "txt-small-plus"
                          )}
                          href={`/categories/${c.handle}`}
                          data-testid="category-link"
                        >
                          {c.name}
                        </LocalizedClientLink>
                        {children && (
                          <ul className="grid grid-cols-1 gap-2 ml-3">
                            {children &&
                              children.map((child) => (
                                <li key={child.id}>
                                  <LocalizedClientLink
                                    className="hover:text-ui-fg-base"
                                    href={`/categories/${child.handle}`}
                                    data-testid="category-link"
                                  >
                                    {child.name}
                                  </LocalizedClientLink>
                                </li>
                              ))}
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus txt-ui-fg-base">
                  Collections
                </span>
                <ul
                  className={clx(
                    "grid grid-cols-1 gap-2 text-ui-fg-subtle txt-small",
                    {
                      "grid-cols-2": (collections?.length || 0) > 3,
                    }
                  )}
                >
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-ui-fg-base"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base">
                Bough & Burrow
              </span>
              <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                <li>
                  <a
                    href="https://github.com/medusajs"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ui-fg-base"
                  >
                    Facebook
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs.medusajs.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ui-fg-base"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${companyInfo.email}`}
                    className="hover:text-ui-fg-base"
                  >
                    {companyInfo.email}
                  </a>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-ui-fg-base"
                    href={`/privacy`}
                  >
                    Privacy Policy
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-ui-fg-base"
                    href={`/terms`}
                  >
                    Terms &amp; Conditions
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex justify-between w-full mb-16 text-ui-fg-muted">
          <Text className="txt-compact-small">
            © {new Date().getFullYear()} {companyInfo.name}. All rights
            reserved.
          </Text>
          <MedusaCTA />
        </div>
      </div>
    </footer>
  )
}
