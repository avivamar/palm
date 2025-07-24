'use client';

import { Eye, Filter, Heart, Search, ShoppingCart, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type FavoriteItem = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  inStock: boolean;
  rating: number;
  addedDate: string;
};

// Mock data hidden for production - replace with real API data
const mockFavorites: FavoriteItem[] = [];

export function FavoritesContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const t = useTranslations('dashboard');

  // TODO: Replace with real API call to fetch user favorites
  const filteredFavorites: FavoriteItem[] = [];
  const categories: string[] = [];

  const handleRemoveFromFavorites = (_itemId: string) => {
    // TODO: Implement remove from favorites functionality
    // Remove item from favorites list
  };

  const handleAddToCart = (_itemId: string) => {
    // TODO: Implement add to cart functionality
    // Add item to shopping cart
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500" />
            {t('favorites.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('favorites.description')}
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {t('favorites.items_count', { count: filteredFavorites.length, total: mockFavorites.length })}
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('favorites.search_placeholder')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder={t('favorites.category')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('favorites.all_categories')}</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder={t('favorites.sort_by')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t('favorites.sort_options.newest')}</SelectItem>
                <SelectItem value="oldest">{t('favorites.sort_options.oldest')}</SelectItem>
                <SelectItem value="price-low">{t('favorites.sort_options.price_low')}</SelectItem>
                <SelectItem value="price-high">{t('favorites.sort_options.price_high')}</SelectItem>
                <SelectItem value="name">{t('favorites.sort_options.name')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Favorites Grid */}
      {filteredFavorites.length === 0
        ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('favorites.no_favorites')}</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || categoryFilter !== 'all'
                      ? t('favorites.no_favorites_search')
                      : t('favorites.no_favorites_empty')}
                  </p>
                  <Button variant="outline">
                    {t('favorites.browse_products')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFavorites.map(item => (
                <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="relative mb-4">
                      <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                        {!item.inStock && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Badge variant="destructive">{t('favorites.out_of_stock')}</Badge>
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleRemoveFromFavorites(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm line-clamp-2">{item.name}</h3>
                        <div className="flex items-center gap-1 text-yellow-500 text-xs">
                          ⭐
                          {' '}
                          {item.rating}
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {item.category}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">
                          $
                          {item.price}
                        </span>
                        {item.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            $
                            {item.originalPrice}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className={item.inStock ? 'text-green-600' : 'text-red-600'}>
                          {item.inStock ? t('favorites.in_stock') : t('favorites.out_of_stock')}
                        </span>
                        •
                        <span>
                          {t('favorites.added_date', { date: new Date(item.addedDate).toLocaleDateString() })}
                        </span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          disabled={!item.inStock}
                          onClick={() => handleAddToCart(item.id)}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {t('favorites.add_to_cart')}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

      {/* Favorites Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{t('summary.title')}</CardTitle>
          <CardDescription>
            {t('summary.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{mockFavorites.length}</p>
              <p className="text-sm text-muted-foreground">{t('summary.total_items')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {mockFavorites.filter(item => item.inStock).length}
              </p>
              <p className="text-sm text-muted-foreground">{t('summary.in_stock')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                $
                {mockFavorites.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">{t('summary.total_value')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {mockFavorites.filter(item => item.originalPrice).length}
              </p>
              <p className="text-sm text-muted-foreground">{t('summary.on_sale')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
