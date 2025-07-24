/**
 * Checkout component for payment processing
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

'use client';

import type { FormEvent } from 'react';
import type { PreorderData } from '../types';
import { useState } from 'react';
import { PaymentError } from '../libs/errors';

export type CheckoutFormProps = {
  locale: string;
  translations: {
    title: string;
    description: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    nameLabel: string;
    namePlaceholder: string;
    colorLabel: string;
    submitButton: string;
    processing: string;
    error: string;
  };
  colors: Array<{
    id: string;
    name: string;
    code: string;
    price: number;
  }>;
  currency: string;
  onSubmit: (data: PreorderData) => Promise<{ success: boolean; error?: string; redirectUrl?: string }>;
};

export function CheckoutForm({
  locale,
  translations,
  colors,
  currency,
  onSubmit,
}: CheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(colors[0]?.id || '');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const selectedColorData = colors.find(c => c.id === selectedColor);

      if (!selectedColorData) {
        throw new PaymentError('Selected color not found', 'INVALID_COLOR', 'checkout');
      }

      const preorderData: PreorderData = {
        email: formData.get('email') as string,
        phone: formData.get('phone') as string || undefined,
        name: formData.get('name') as string || undefined,
        color: selectedColorData.name,
        colorCode: selectedColorData.code,
        price: selectedColorData.price,
        currency,
        locale,
      };

      const result = await onSubmit(preorderData);

      if (result.success && result.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else if (!result.success) {
        setError(result.error || translations.error);
      }
    } catch (err) {
      if (err instanceof PaymentError) {
        setError(err.message);
      } else {
        setError(translations.error);
      }
      console.error('Checkout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{translations.title}</h2>
        <p className="text-muted-foreground">{translations.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            {translations.emailLabel}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            disabled={isLoading}
            placeholder={translations.emailPlaceholder}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        {/* Phone field */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            {translations.phoneLabel}
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            disabled={isLoading}
            placeholder={translations.phonePlaceholder}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        {/* Name field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            {translations.nameLabel}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            disabled={isLoading}
            placeholder={translations.namePlaceholder}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        {/* Color selection */}
        <div>
          <label htmlFor="color" className="block text-sm font-medium mb-1">
            {translations.colorLabel}
          </label>
          <select
            id="color"
            value={selectedColor}
            onChange={e => setSelectedColor(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {colors.map(color => (
              <option key={color.id} value={color.id}>
                {color.name}
                {' '}
                -
                {color.price}
                {' '}
                {currency}
              </option>
            ))}
          </select>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? translations.processing : translations.submitButton}
        </button>
      </form>
    </div>
  );
}
