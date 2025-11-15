import { Platform } from 'react-native';
import Constants from 'expo-constants';

const FALLBACK_PORT = '3000';
const DEFAULT_FALLBACK = Platform.select({
  android: `http://10.0.2.2:${FALLBACK_PORT}/api`,
  ios: `http://localhost:${FALLBACK_PORT}/api`,
  default: `http://localhost:${FALLBACK_PORT}/api`,
});

const extractHost = (value?: string | null) => {
  if (!value) return null;
  const host = value.split(':')[0]?.split('://').pop();
  return host ?? null;
};

const resolveDevHost = () => {
  const debuggerHost = (Constants as any)?.debuggerHost;
  const expoHost = Constants.expoConfig?.hostUri;
  const manifestHost = (Constants.manifest as any)?.debuggerHost;
  return extractHost(debuggerHost || expoHost || manifestHost);
};

const buildBaseUrl = () => {
  const envValue = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envValue && envValue.length > 0) {
    return envValue.trim().replace(/\/$/, '');
  }

  const host = resolveDevHost();
  if (!host) {
    return DEFAULT_FALLBACK ?? `http://localhost:${FALLBACK_PORT}/api`;
  }

  if (host === 'localhost' || host === '127.0.0.1') {
    const localhost = Platform.OS === 'android' ? '10.0.2.2' : host;
    return `http://${localhost}:${FALLBACK_PORT}/api`;
  }

  return `http://${host}:${FALLBACK_PORT}/api`;
};

export const API_BASE_URL = buildBaseUrl();
