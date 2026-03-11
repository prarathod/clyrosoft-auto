import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') ?? ''
  const rootDomain = process.env.ROOT_DOMAIN ?? ''

  // Subdomain routing: only active when a custom domain is configured
  // Without a custom domain, use path-based routing: /[subdomain]
  if (
    !rootDomain ||
    rootDomain.includes('vercel.app') ||
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }

  const subdomain = hostname
    .replace(`.${rootDomain}`, '')
    .replace(`:${req.nextUrl.port}`, '')

  if (subdomain === rootDomain || subdomain === 'www' || subdomain === '') {
    return NextResponse.next()
  }

  const url = req.nextUrl.clone()
  url.pathname = `/${subdomain}${req.nextUrl.pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
