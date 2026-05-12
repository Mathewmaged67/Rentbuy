import * as React from 'react';
import { useRecommendations } from '@/hooks/useRecommendations';
import { ProductCard } from '@/components/product-card';
import { useApp } from '@/store/app-store';

export function RecommendedProducts({ currentProductId }: { currentProductId?: string }) {
  const recommendations = useRecommendations(currentProductId);
  const { state } = useApp();

  if (recommendations.length === 0) return null;

  // Don't show on homepage if user hasn't viewed at least 2 products yet
  if (!currentProductId && state.viewHistory.length < 2) return null;

  return (
    <section className="w-full">
      {!currentProductId ? (
        <div className="mb-6">
          <p className="text-sm font-medium text-rent mb-1">Based on your recent views</p>
          <h2 className="text-2xl font-display font-semibold tracking-tight">
            Recommended for You
          </h2>
        </div>
      ) : (
        <div className="mb-6">
          <h2 className="text-2xl font-display font-semibold tracking-tight">
            You may also like
          </h2>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {recommendations.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
