import axios from 'axios';

type AssetData = Record<string, unknown>;
type UpdateData = Record<string, unknown>;
type KeyData = Record<string, unknown>;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'accept': '*/*'
  },
  auth: {
    username: import.meta.env.VITE_API_USER,
    password: import.meta.env.VITE_API_PASS
  }
});

// Generic Search
export const searchAssets = async (assetType: string) => {
  const response = await api.post('/query/search', {
    query: { selector: { '@assetType': assetType } }
  });
  return response.data.result;
};

// Create (Envelope "asset")
export const createAsset = async (assetData: AssetData) => {
  const response = await api.post('/invoke/createAsset', {
    asset: [assetData]
  });
  return response.data;
};

// Update (Envelope "update")
export const updateAsset = async (updateData: UpdateData) => {
  const response = await api.post('/invoke/updateAsset', {
    update: updateData
  });
  return response.data;
};

// Delete
export const deleteAsset = async (keyData: KeyData) => {
  const response = await api.post('/invoke/deleteAsset', {
    key: keyData
  });
  return response.data;
};

// Adicione isso no seu api.ts
export const readSpecificAsset = async (keyData: Record<string, unknown>) => {
  const response = await api.post('/query/readAsset', {
    key: keyData
  });
  return response.data;
};

// Adicione no final do api.ts
export const translateError = (error: unknown): string => {
  const msg = axios.isAxiosError(error)
    ? String(error.response?.data?.error ?? error.message ?? '')
    : error instanceof Error
    ? error.message
    : '';

  if (msg.includes('asset already exists')) return 'Este registro já existe na blockchain.';
  if (msg.includes('does not exist')) return 'O registro solicitado não foi encontrado na blockchain.';
  if (msg.includes('failed to write')) return 'Falha de escrita na blockchain. Verifique os dados fornecidos.';
  if (msg.includes('Network Error')) return 'Erro de conexão. A blockchain está rodando?';
  
  return msg || 'Ocorreu um erro inesperado de comunicação.';
};

export default api;