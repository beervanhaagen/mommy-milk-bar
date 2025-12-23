import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

// Disable middleware completely for now
export const config = {
  matcher: [],
};
