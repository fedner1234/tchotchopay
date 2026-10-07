import axios from 'axios';
import { getToken } from './storage';

const API_BASE_URL = 'https://tchotchopay.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token to every request
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- AUTH ---
export const registerUser = (data) =>
  api.post('/.netlify/functions/register', data);

export const loginUser = (data) =>
  api.post('/.netlify/functions/login', data);

// --- WALLET ---
// Fetch USDC balance from Circle (POST with action: getBalance)
export const getWalletBalance = (walletId) =>
  api.post('/.netlify/functions/circle-wallet', { action: 'getBalance', walletId });

// Legacy alias used by some screens — maps to balance fetch
export const getWallet = (walletId) =>
  api.post('/.netlify/functions/circle-wallet', { action: 'getBalance', walletId });

export const getTransactions = (walletId) =>
  api.post('/.netlify/functions/circle-wallet', { action: 'listTransactions', walletId });

// --- SEND MONEY ---
export const sendMoney = (data) =>
  api.post('/.netlify/functions/moncash-transfer', data);

// --- PAYMENT (load funds into user's wallet) ---
export const addFundsToWallet = (data) =>
  api.post('/.netlify/functions/add-funds', data);

// --- PAYMENT (send money to MonCash/NatCash — requires wallet + phoneNumber) ---
export const createPaymentIntent = (data) =>
  api.post('/.netlify/functions/send-payment', data);

// --- TOP-UP ---
export const getTopUpOperators = (countryCode) =>
  api.get(`/.netlify/functions/reloadly-proxy?action=operators&country=${countryCode}`);

export const sendTopUp = (data) =>
  api.post('/.netlify/functions/reloadly-proxy', data);

// --- PROFILE ---
export const updateProfile = (data) =>
  api.post('/.netlify/functions/update-profile', data);

// --- EXCHANGE RATES ---
export const getExchangeRates = () =>
  api.get('/.netlify/functions/exchange-rates');

export default api;
