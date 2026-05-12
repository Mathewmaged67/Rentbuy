import { useMemo } from 'react';
import { useApp } from '@/store/app-store';
import type { Product } from '@/data/products';

export function useRecommendations(currentProductId?: string) {
  const { state } = useApp();

  return useMemo(() => {
    const { products, viewHistory } = state;
    
    // Filter out the currently viewed product from history
    const viewedProductIds = currentProductId 
      ? viewHistory.filter(id => id !== currentProductId) 
      : viewHistory;

    const viewedProducts = viewedProductIds
      .map(id => products.find(p => p.id === id))
      .filter((p): p is Product => p !== undefined);

    if (viewedProducts.length === 0) {
      // Fallback: just return trending/featured
      return products.filter(p => p.featured && p.id !== currentProductId).slice(0, 4);
    }

    // Calculate category affinity
    const categoryCounts: Record<string, number> = {};
    let totalPrices = 0;

    viewedProducts.forEach(p => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
      totalPrices += p.price;
    });

    const topCategory = Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b);
    const avgPrice = totalPrices / viewedProducts.length;

    // Price range match: ±30%
    const minPrice = avgPrice * 0.7;
    const maxPrice = avgPrice * 1.3;

    // Score and sort products
    const recommendations = products
      .filter(p => p.id !== currentProductId && !viewHistory.includes(p.id))
      .map(p => {
        let score = 0;
        
        // 1. Category match
        if (p.category === topCategory) score += 5;
        
        // 2. Price match
        if (p.price >= minPrice && p.price <= maxPrice) score += 3;
        
        // 3. Featured
        if (p.featured) score += 1;

        return { product: p, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.product);

    // If not enough recommendations, pad with other products
    if (recommendations.length < 4) {
      const padding = products
        .filter(p => p.id !== currentProductId && !viewHistory.includes(p.id) && !recommendations.find(r => r.id === p.id))
        .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        
      recommendations.push(...padding.slice(0, 4 - recommendations.length));
    }

    return recommendations.slice(0, 4);
  }, [state.products, state.viewHistory, currentProductId]);
}
