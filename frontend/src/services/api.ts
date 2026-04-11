import axios, { type AxiosInstance } from 'axios';
import { apiUrl, authHeaders, getApiBase, getApiRoot } from '../config/api.js';

export { apiUrl, authHeaders, getApiRoot, getApiBase } from '../config/api.js';

function createClient(): AxiosInstance {
  const client = axios.create({
    baseURL: getApiRoot(),
  });
  client.interceptors.request.use((config) => {
    Object.assign(config.headers, authHeaders());
    return config;
  });
  return client;
}

export const http = createClient();

export const api = {
  http,
  url: apiUrl,
  authHeaders,
  getApiRoot,
  getApiBase,
};
