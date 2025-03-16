import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Redirect to the fallback icon
    return NextResponse.redirect(new URL('/fallback-icon.svg', 'http://localhost:3000'));
  } catch (error) {
    console.error('Error generating icon:', error);
    return new NextResponse('Error generating icon', { status: 500 });
  }
}

export const dynamic = 'force-dynamic'; 