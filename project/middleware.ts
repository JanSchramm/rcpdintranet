import { type NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Remove the problematic 'browsing-topics' from Permissions-Policy header
    const permissionsPolicy = response.headers.get('Permissions-Policy');
    if (permissionsPolicy?.includes('browsing-topics')) {
        const cleaned = permissionsPolicy
            .split(',')
            .map(p => p.trim())
            .filter(p => !p.startsWith('browsing-topics'))
            .join(', ');
        response.headers.set('Permissions-Policy', cleaned);
    }

    return response;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
