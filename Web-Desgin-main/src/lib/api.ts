export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

/**
 * A generic authenticated fetch wrapper that automatically attaches the
 * Authorization Bearer token from localStorage.
 */
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const tokenString = localStorage.getItem('rentbuy:v1');
  let token: string | null = null;
  
  if (tokenString) {
    try {
      const parsed = JSON.parse(tokenString);
      token = parsed.token;
    } catch {
      // ignore
    }
  }

  const headers = new Headers(options.headers || {});
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('rentbuy:v1');
  }

  return response;

}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: {
    id: number | string;
    name: string;
    email: string;
    role: string;
    dob?: string;
  };
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    const err: any = new Error(data.message || 'Failed to login');
    err.status = res.status;
    throw err;
  }

  return data;
}

// ── register now sends phone, address, dob too ──────────────────────────────
export async function registerUser(
  name: string,
  email: string,
  password: string,
  extras?: { phone?: string; address?: string; dob?: string }
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, ...extras }),
  });

  const data = await res.json();
  if (!res.ok) {
    const err: any = new Error(data.message || 'Failed to register');
    err.status = res.status;
    throw err;
  }

  if (data.token && data.user) {
    return data;
  } else if (data.user && data.user.status === 'pending') {
    return data;
  } else {
    return loginUser(email, password);
  }
}

// ── Ratings ──────────────────────────────────────────────────────────────────
export async function rateProduct(
  productId: string,
  rating: number
): Promise<{ rating: number; reviews: number; userRating: number }> {
  const res = await apiFetch(`/api/products/${productId}/rate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to submit rating');
  return data;
}

export async function getMyRating(productId: string): Promise<number | null> {
  try {
    const res = await apiFetch(`/api/products/${productId}/my-rating`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.rating;
  } catch {
    return null;
  }
}

// ── Orders & Payments ────────────────────────────────────────────────────────
export async function createOrder(orderData: {
  productId: string;
  type: 'buy' | 'rent';
  days?: number;
  total: number;
  payment: string;
  coupon?: string;
}) {

  const res = await apiFetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to place order');
  return data;
}

export async function initiatePayment(paymentData: {
  orderId: number | string;
  paymentMethod: 'visa' | 'wallet';
  walletNumber?: string;
}) {
  const res = await apiFetch('/api/payment/initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to initiate payment');
  return data;
}

export async function createProduct(productData: any) {
  const res = await apiFetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create product');
  return data;
}
export async function uploadImage(base64: string, name: string): Promise<{ url: string }> {
  const res = await apiFetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to upload image');
  return data;
}
