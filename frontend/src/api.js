// API Client for Estoque Culinária backend (.NET API)

const API_BASE = '/api/inventory';

async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const errorMsg = data?.message || data?.title || `Erro HTTP ${response.status}`;
      throw new Error(errorMsg);
    }
    return data;
  } catch (err) {
    console.error(`API Error [${url}]:`, err);
    throw err;
  }
}

export const api = {
  // Dashboard
  getDashboard: () => request(`${API_BASE}/dashboard`),

  // Food Items
  getItems: (category = '', search = '', course = '') => {
    const params = new URLSearchParams();
    if (category && category !== 'Todos') params.append('category', category);
    if (search) params.append('search', search);
    if (course && course !== 'Todos') params.append('course', course);
    return request(`${API_BASE}/items?${params.toString()}`);
  },
  getItemById: (id) => request(`${API_BASE}/items/${id}`),
  createItem: (data) => request(`${API_BASE}/items`, { method: 'POST', body: JSON.stringify(data) }),
  updateItem: (id, data) => request(`${API_BASE}/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteItem: (id) => request(`${API_BASE}/items/${id}`, { method: 'DELETE' }),

  // Batches
  getBatches: (activeOnly = true, status = '') => {
    const params = new URLSearchParams({ activeOnly: activeOnly.toString() });
    if (status && status !== 'Todos') params.append('status', status);
    return request(`${API_BASE}/batches?${params.toString()}`);
  },
  getBatchesByItem: (foodItemId, activeOnly = true) => 
    request(`${API_BASE}/batches/item/${foodItemId}?activeOnly=${activeOnly}`),
  getPVPSBatch: (foodItemId) => request(`${API_BASE}/batches/pvps/${foodItemId}`),
  freezeBatch: (data) => request(`${API_BASE}/batches/freeze`, { method: 'POST', body: JSON.stringify(data) }),
  thawBatch: (data) => request(`${API_BASE}/batches/thaw`, { method: 'POST', body: JSON.stringify(data) }),

  // Transactions
  registerPurchase: (data) => request(`${API_BASE}/purchases`, { method: 'POST', body: JSON.stringify(data) }),
  registerConsumption: (data) => request(`${API_BASE}/consumption`, { method: 'POST', body: JSON.stringify(data) }),
  adjustStock: (data) => request(`${API_BASE}/adjustment`, { method: 'POST', body: JSON.stringify(data) }),
  getTransactions: (foodItemId = null, type = '', month = null, year = null) => {
    const params = new URLSearchParams();
    if (foodItemId) params.append('foodItemId', foodItemId);
    if (type && type !== 'Todos') params.append('type', type);
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    return request(`${API_BASE}/transactions?${params.toString()}`);
  },

  // Reports
  getMonthlyReport: (month, year) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    return request(`${API_BASE}/reports/monthly?${params.toString()}`);
  },

  // Configuration
  getConfig: () => request(`${API_BASE}/config`),
  updateConfig: (data) => request(`${API_BASE}/config`, { method: 'PUT', body: JSON.stringify(data) }),

  // Backup
  exportBackup: () => request(`${API_BASE}/export`)
};

// Utilities for formatting
export const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(val)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('pt-BR');
};

export const formatNumber = (num, unit = '') => {
  if (num === null || num === undefined) return '0';
  const formatted = Number(num).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  return unit ? `${formatted} ${unit}` : formatted;
};
