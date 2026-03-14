import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') ?? ''
  const rootDomain = process.env.ROOT_DOMAIN ?? 'localhost:3000'

  // Always pass through static assets and API routes
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }

  // Pass through when:
  // - no custom domain configured
  // - using vercel.app (no wildcard subdomain support)
  // - request IS the root domain (not a subdomain) → use path-based routing
  if (!rootDomain || rootDomain.includes('vercel.app') || hostname === rootDomain) {
    return NextResponse.next()
  }

  // Extract subdomain from hostname (e.g. sharma.myclinic.com → sharma)
  const subdomain = hostname.replace(`.${rootDomain}`, '')

  // If no subdomain extracted (replacement failed), www, or demo → pass through to path-based routing
  if (!subdomain || subdomain === 'www' || subdomain === 'demo' || subdomain === hostname) {
    return NextResponse.next()
  }

  // Rewrite subdomain.domain.com/path → /subdomain/path
  const url = req.nextUrl.clone()
  url.pathname = `/${subdomain}${req.nextUrl.pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
