import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"

// Use the internal Docker URL for middleware (server-side requests)
const BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  process.env.MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "gb"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache
  logger.debug("Initializing middleware with BACKEND_URL", {
    hasBackendUrl: !!BACKEND_URL,
  })
  if (!BACKEND_URL) {
    throw new Error(
      "Middleware.ts: Error fetching regions. Did you set up regions in your Medusa Admin and define NEXT_PUBLIC_MEDUSA_BACKEND_URL or MEDUSA_BACKEND_URL environment variable?"
    )
  }

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    // Fetch regions from Medusa with timeout and error handling
    logger.debug("Fetching regions from Medusa API")

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const { regions } = await fetch(`${BACKEND_URL}/store/regions`, {
        headers: {
          "x-publishable-api-key": PUBLISHABLE_API_KEY!,
        },
        signal: controller.signal,
      }).then(async (response) => {
        clearTimeout(timeoutId)
        const json = await response.json()

        if (!response.ok) {
          throw new Error(
            `Region fetch failed: ${response.status} ${
              json.message || "Unknown error"
            }`
          )
        }

        return json
      })

      if (!regions?.length) {
        logger.warn("No regions found. Using default region")
        // Set a minimal default region to prevent repeated API calls
        regionMapCache.regionMap.set(DEFAULT_REGION, {
          iso_2: DEFAULT_REGION,
        } as any)
        regionMapCache.regionMapUpdated = Date.now()
        return regionMapCache.regionMap
      }

      // Create a map of country codes to regions.
      regions.forEach((region: HttpTypes.StoreRegion) => {
        region.countries?.forEach((c) => {
          regionMapCache.regionMap.set(c.iso_2 ?? "", region)
        })
      })

      regionMapCache.regionMapUpdated = Date.now()
      logger.info(`Successfully fetched and cached ${regions.length} regions`)
    } catch (error) {
      logger.error("Failed to fetch regions", error)
      // Use cached data if available, or set default to prevent infinite failures
      if (!regionMap.keys().next().value) {
        logger.debug("Setting fallback default region", {
          defaultRegion: DEFAULT_REGION,
        })
        regionMapCache.regionMap.set(DEFAULT_REGION, {
          iso_2: DEFAULT_REGION,
        } as any)
      }
      // Update timestamp to prevent immediate retry (wait 10 minutes on failure)
      regionMapCache.regionMapUpdated = Date.now() - 2400 * 1000 // This gives 40 minutes before retry
    }
  }

  return regionMapCache.regionMap
}

/**
 * Fetches regions from Medusa and sets the region cookie.
 * @param request
 * @param response
 */
async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  try {
    let countryCode

    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase()

    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else if (regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value
    }

    return countryCode
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Middleware.ts: Error getting the country code. Did you set up regions in your Medusa Admin and define NEXT_PUBLIC_MEDUSA_BACKEND_URL or MEDUSA_BACKEND_URL environment variable?"
      )
    }
  }
}

/**
 * Middleware to handle maintenance mode, region selection and onboarding status.
 */
export async function middleware(request: NextRequest) {
  // Check maintenance mode first
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true'
  const bypassKey = process.env.MAINTENANCE_BYPASS_KEY
  const requestBypass = request.nextUrl.searchParams.get('bypass')
  
  // Allow bypass if correct key is provided
  const canBypass = bypassKey && requestBypass === bypassKey
  
  if (isMaintenanceMode && !canBypass) {
    // Don't redirect if already on maintenance page
    if (request.nextUrl.pathname === '/maintenance') {
      return NextResponse.next()
    }
    
    // Allow static assets, API routes, and Next.js internals
    if (
      request.nextUrl.pathname.startsWith('/api/') ||
      request.nextUrl.pathname.startsWith('/_next/') ||
      request.nextUrl.pathname.includes('.') ||
      request.nextUrl.pathname === '/favicon.ico' ||
      request.nextUrl.pathname === '/robots.txt' ||
      request.nextUrl.pathname === '/sitemap.xml'
    ) {
      return NextResponse.next()
    }
    
    // Redirect to maintenance page
    const maintenanceUrl = new URL('/maintenance', request.url)
    return NextResponse.redirect(maintenanceUrl)
  }
  let redirectUrl = request.nextUrl.href

  let response = NextResponse.redirect(redirectUrl, 307)

  let cacheIdCookie = request.cookies.get("_medusa_cache_id")

  let cacheId = cacheIdCookie?.value || crypto.randomUUID()

  const regionMap = await getRegionMap(cacheId)

  const countryCode = regionMap && (await getCountryCode(request, regionMap))

  const pathSegments = request.nextUrl.pathname.split("/")
  const urlCountryCode = pathSegments[1]?.toLowerCase()
  const urlHasCountryCode = countryCode && urlCountryCode === countryCode

  // if one of the country codes is in the url and the cache id is set, return next
  if (urlHasCountryCode && cacheIdCookie) {
    return NextResponse.next()
  }

  // if one of the country codes is in the url and the cache id is not set, set the cache id and redirect
  if (urlHasCountryCode && !cacheIdCookie) {
    const nextResponse = NextResponse.next()
    nextResponse.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
    })
    return nextResponse
  }

  // check if the url is a static asset
  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
  }

  const redirectPath =
    request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname

  const queryString = request.nextUrl.search ? request.nextUrl.search : ""

  // If no country code is set, we redirect to the relevant region.
  if (!urlHasCountryCode && countryCode) {
    logger.debug("Redirecting to country code", { countryCode })

    redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
    response = NextResponse.redirect(`${redirectUrl}`, 307)
    response.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
    })
    return response
  }

  // Only redirect to default if we don't have any country code and haven't already processed
  if (!urlHasCountryCode && !countryCode && DEFAULT_REGION) {
    logger.debug("No country code found, redirecting to default region", {
      defaultRegion: DEFAULT_REGION,
    })
    redirectUrl = `${request.nextUrl.origin}/${DEFAULT_REGION}${redirectPath}${queryString}`
    response = NextResponse.redirect(`${redirectUrl}`, 307)
    response.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
    })
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Only run middleware on actual pages, exclude:
    // - API routes (/api/*)
    // - Next.js internals (_next/*)
    // - Static assets (images, fonts, etc.)
    // - Common files (robots.txt, sitemap.xml, etc.)
    // - Web app manifest images
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|web-app-manifest-.*\\.png).*)",
  ],
}
