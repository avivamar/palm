import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Simple debug test API working',
    timestamp: new Date().toISOString(),
    path: '/api/debug/simple-test'
  });
}