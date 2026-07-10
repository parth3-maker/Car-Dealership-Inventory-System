const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

// Token Helpers
export const getToken = (): string | null => localStorage.getItem('token');
export const setToken = (token: string) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');

export const getUser = (): User | null => {
  const userJson = localStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
};
export const setUser = (user: User) => localStorage.setItem('user', JSON.stringify(user));
export const removeUser = () => localStorage.removeItem('user');

// Fetch wrapper with auth header
async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Something went wrong');
  }

  // Handle delete endpoint returning message
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  // Auth API
  async register(email: string, password: string, role?: string): Promise<User> {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(res.token);
    setUser(res.user);
    return res;
  },

  logout() {
    removeToken();
    removeUser();
  },

  // Vehicles API
  async getVehicles(): Promise<Vehicle[]> {
    return request('/vehicles');
  },

  async searchVehicles(params: {
    make?: string;
    model?: string;
    category?: string;
    priceMin?: number;
    priceMax?: number;
  }): Promise<Vehicle[]> {
    const query = new URLSearchParams();
    if (params.make) query.append('make', params.make);
    if (params.model) query.append('model', params.model);
    if (params.category) query.append('category', params.category);
    if (params.priceMin !== undefined && !isNaN(params.priceMin)) {
      query.append('priceMin', params.priceMin.toString());
    }
    if (params.priceMax !== undefined && !isNaN(params.priceMax)) {
      query.append('priceMax', params.priceMax.toString());
    }
    return request(`/vehicles/search?${query.toString()}`);
  },

  async createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
    return request('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicle),
    });
  },

  async updateVehicle(
    id: string,
    vehicle: Partial<Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Vehicle> {
    return request(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicle),
    });
  },

  async deleteVehicle(id: string): Promise<{ message: string }> {
    return request(`/vehicles/${id}`, {
      method: 'DELETE',
    });
  },

  // Inventory API
  async purchaseVehicle(id: string): Promise<Vehicle> {
    return request(`/vehicles/${id}/purchase`, {
      method: 'POST',
    });
  },

  async restockVehicle(id: string, quantity: number): Promise<Vehicle> {
    return request(`/vehicles/${id}/restock`, {
      method: 'POST',
      body: JSON.stringify({ quantity }),
    });
  },
};
