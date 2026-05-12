import { useEffect, useCallback } from 'react';
import { useApp } from '@/store/app-store';

export function useCurrency() {
  const { state, dispatch } = useApp();

  const convertPrice = useCallback((priceInUsd: number) => {
    if (state.currency === 'USD' || !state.exchangeRates || !state.exchangeRates[state.currency]) {
      return { price: priceInUsd, symbol: '$' };
    }
    
    const rate = state.exchangeRates[state.currency];
    const convertedPrice = priceInUsd * rate;
    
    let symbol = '$';
    switch (state.currency) {
      case 'EUR': symbol = '€'; break;
      case 'GBP': symbol = '£'; break;
      case 'EGP': symbol = 'E£'; break;
      case 'SAR': symbol = 'ر.س'; break;
      default: symbol = state.currency;
    }
    
    return { price: convertedPrice, symbol };
  }, [state.currency, state.exchangeRates]);

  const formatPrice = useCallback((priceInUsd: number) => {
    if (priceInUsd === undefined || priceInUsd === null) return '';
    const { price, symbol } = convertPrice(priceInUsd);
    
    const formatted = price.toFixed(2).replace(/\.00$/, '');
    return `${symbol}${formatted}`;
  }, [convertPrice]);

  return {
    currency: state.currency,
    setCurrency: (currency: string) => dispatch({ type: 'SET_CURRENCY', currency }),
    convertPrice,
    formatPrice,
    availableCurrencies: ['USD', 'EUR', 'GBP', 'EGP', 'SAR']
  };
}
