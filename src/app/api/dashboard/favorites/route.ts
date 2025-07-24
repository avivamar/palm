/**
 * Dashboard Favorites API Route
 * Following CLAUDE.md: 商业价值优先，TypeScript严格模式
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createServerClient, isSupabaseConfigured } from '@/libs/supabase/config';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Authentication service not available' }, { status: 503 });
    }

    const supabase = await createServerClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: 当连接到真实数据库时，使用 session.user.id 进行用户特定查询
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');

    // TODO: 替换为真实的收藏夹数据库查询
    // 现在返回模拟数据结构，之后需要连接到真实的收藏表
    const mockFavorites = [
      {
        id: 'fav_1',
        productId: 'prod_1',
        product: {
          id: 'prod_1',
          name: 'Rolitt AI Companion - Cherry Blossom',
          slug: 'rolitt-ai-companion-cherry-blossom',
          price: 299.99,
          originalPrice: 399.99,
          currency: 'USD',
          images: ['/images/products/rolitt-cherry.jpg'],
          category: 'AI Companions',
          inStock: true,
          rating: 4.8,
          reviewCount: 127,
        },
        addedAt: '2024-01-10T14:30:00Z',
      },
      {
        id: 'fav_2',
        productId: 'prod_2',
        product: {
          id: 'prod_2',
          name: 'Rolitt AI Companion - Ocean Blue',
          slug: 'rolitt-ai-companion-ocean-blue',
          price: 299.99,
          originalPrice: 399.99,
          currency: 'USD',
          images: ['/images/products/rolitt-blue.jpg'],
          category: 'AI Companions',
          inStock: false,
          rating: 4.9,
          reviewCount: 93,
        },
        addedAt: '2024-01-08T09:15:00Z',
      },
      {
        id: 'fav_3',
        productId: 'prod_3',
        product: {
          id: 'prod_3',
          name: 'Rolitt AI Companion - Sunset Orange',
          slug: 'rolitt-ai-companion-sunset-orange',
          price: 299.99,
          originalPrice: 399.99,
          currency: 'USD',
          images: ['/images/products/rolitt-orange.jpg'],
          category: 'AI Companions',
          inStock: true,
          rating: 4.7,
          reviewCount: 156,
        },
        addedAt: '2024-01-05T16:45:00Z',
      },
    ];

    // Filter favorites based on category
    let filteredFavorites = mockFavorites;

    if (category && category !== 'all') {
      filteredFavorites = filteredFavorites.filter(fav =>
        fav.product.category.toLowerCase() === category.toLowerCase(),
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFavorites = filteredFavorites.slice(startIndex, endIndex);

    const response = {
      favorites: paginatedFavorites,
      pagination: {
        page,
        limit,
        total: filteredFavorites.length,
        totalPages: Math.ceil(filteredFavorites.length / limit),
      },
      stats: {
        total: mockFavorites.length,
        categories: Array.from(new Set(mockFavorites.map(f => f.product.category))),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Favorites API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch favorites',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Authentication service not available' }, { status: 503 });
    }

    const supabase = await createServerClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: 当连接到真实数据库时，使用 session.user.id 进行用户特定查询
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // TODO: 实现添加到收藏夹的数据库操作
    // 现在返回成功响应，之后需要实际插入到数据库

    const response = {
      success: true,
      message: 'Product added to favorites',
      favoriteId: `fav_${Date.now()}`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Add favorite error:', error);
    return NextResponse.json(
      {
        error: 'Failed to add favorite',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify user authentication
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Authentication service not available' }, { status: 503 });
    }

    const supabase = await createServerClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: 当连接到真实数据库时，使用 session.user.id 进行用户特定查询
    const { searchParams } = new URL(request.url);
    const favoriteId = searchParams.get('id');

    if (!favoriteId) {
      return NextResponse.json({ error: 'Favorite ID is required' }, { status: 400 });
    }

    // TODO: 实现从收藏夹删除的数据库操作
    // 现在返回成功响应，之后需要实际从数据库删除

    const response = {
      success: true,
      message: 'Product removed from favorites',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Remove favorite error:', error);
    return NextResponse.json(
      {
        error: 'Failed to remove favorite',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
