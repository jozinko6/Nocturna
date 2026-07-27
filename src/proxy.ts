import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self), autoplay=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-DNS-Prefetch-Control': 'on',
}

const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password', '/reset-password']
const HEALTH_PATHS = ['/api/health/liveness', '/api/health/readiness', '/api/health/admin']

function applySecurityHeaders(response: NextResponse): void {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://eu.posthog.com https://browser.sentry-cdn.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://*.supabase.co",
    "connect-src 'self' https://*.supabase.co https://eu.posthog.com https://sentry.io wss://*.supabase.co",
    'frame-src https://js.stripe.com',
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('x-request-id', generateRequestId())
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseKey) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value)
          )
        },
      },
    })

    await supabase.auth.getClaims()
  }

  applySecurityHeaders(response)

  const userAgent = request.headers.get('user-agent') || ''
  const isBot = /bot|crawler|spider|scraper|curl|wget|python|gohttp/i.test(userAgent)
  if (isBot && !PUBLIC_PATHS.includes(pathname) && !pathname.startsWith('/api/')) {
    return new NextResponse(null, { status: 403, headers: response.headers })
  }

  const maintenanceMode = process.env.MAINTENANCE_MODE || 'off'
  const isHealthPath = HEALTH_PATHS.some((path) => pathname.startsWith(path))
  const isStaticAsset =
    pathname.includes('/_next/') ||
    pathname.includes('/favicon') ||
    pathname.includes('/manifest') ||
    pathname.includes('/icons/') ||
    pathname.includes('/images/')

  if (maintenanceMode === 'full' && !isHealthPath && !isStaticAsset) {
    if (request.method !== 'GET') {
      return NextResponse.json(
        { error: { code: 'MAINTENANCE_MODE', message: 'Prebieha údržba. Skús to neskôr.' } },
        { status: 503, headers: response.headers }
      )
    }
    if (PUBLIC_PATHS.includes(pathname) || isStaticAsset) {
      return response
    }
    const maintenanceUrl = request.nextUrl.clone()
    maintenanceUrl.pathname = '/maintenance'
    return NextResponse.rewrite(maintenanceUrl, { headers: response.headers })
  }

  if (
    maintenanceMode === 'read-only' &&
    !isHealthPath &&
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)
  ) {
    return NextResponse.json(
      { error: { code: 'MAINTENANCE_MODE', message: 'Prebieha údržba. Zmeny nie sú povolené.' } },
      { status: 503, headers: response.headers }
    )
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/).*)',
  ],
}
