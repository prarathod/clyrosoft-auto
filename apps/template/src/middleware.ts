import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') ?? ''
  const rootDomain = process.env.ROOT_DOMAIN ?? 'yourdomain.com'

  // Extract subdomain: sharmadental.yourdomain.com → sharmadental
  const subdomain = hostname.replace(`.${rootDomain}`, '').replace(`:${req.nextUrl.port}`, '')

  // Skip root domain, www, and Next.js internals
  if (
    subdomain === rootDomain ||
    subdomain === 'www' ||
    subdomain === '' ||
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }

  // Rewrite to /[subdomain]/... while keeping the URL clean for the user
  const url = req.nextUrl.clone()
  url.pathname = `/${subdomain}${req.nextUrl.pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
