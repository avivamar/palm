import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { locationSearchService } from '@/libs/location/service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limitParam = searchParams.get('limit');

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 },
      );
    }

    const limit = limitParam ? Number.parseInt(limitParam, 10) : 5;
    if (Number.isNaN(limit) || limit < 1 || limit > 20) {
      return NextResponse.json(
        { error: 'Limit must be a number between 1 and 20' },
        { status: 400 },
      );
    }

    console.log(`[Location API] Searching for: "${query}" with limit: ${limit}`);

    const results = await locationSearchService.searchLocations(query, { limit });

    console.log(`[Location API] Found ${results.length} results`);

    return NextResponse.json({
      success: true,
      query,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('[Location API] Search error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// 支持 CORS 预检请求
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}