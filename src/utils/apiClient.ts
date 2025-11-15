import { API_BASE_URL } from '../config/api';
import { auth } from '../config/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ApiFetchOptions = RequestInit & {
  method?: HttpMethod;
  skipAuth?: boolean;
  retryOnUnauthorized?: boolean;
};

export class ApiError<T = any> extends Error {
  status: number;
  data: T | null;

  constructor(status: number, message: string, data: T | null = null) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const resolveUrl = (path: string) => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  if (path.startsWith('/')) {
    return `${API_BASE_URL}${path}`;
  }

  return `${API_BASE_URL}/${path}`;
};

const getHeaders = (headers?: HeadersInit) => {
  return new Headers({
    'Content-Type': 'application/json',
    ...Object.fromEntries(new Headers(headers ?? {})),
  });
};

let authUserPromise: Promise<User | null> | null = null;

const waitForAuthUser = () => {
  if (!authUserPromise) {
    authUserPromise = new Promise<User | null>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        authUserPromise = null;
        resolve(null);
      }, 5000);

      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          clearTimeout(timeoutId);
          unsubscribe();
          authUserPromise = null;
          resolve(user);
        },
        (error) => {
          clearTimeout(timeoutId);
          unsubscribe();
          authUserPromise = null;
          reject(error);
        }
      );
    });
  }

  return authUserPromise;
};

const getIdToken = async (forceRefresh = false): Promise<string> => {
  let currentUser = auth.currentUser;
  if (!currentUser) {
    currentUser = await waitForAuthUser();
  }

  if (!currentUser) {
    throw new ApiError(401, 'User is not authenticated');
  }

  return currentUser.getIdToken(forceRefresh);
};

export const apiFetch = async <T = any>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> => {
  const {
    skipAuth = false,
    retryOnUnauthorized = true,
    headers,
    ...rest
  } = options;

  const requestUrl = resolveUrl(path);
  const requestHeaders = getHeaders(headers);

  if (!skipAuth) {
    const token = await getIdToken();
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(requestUrl, {
      ...rest,
      headers: requestHeaders,
    });

    const contentType = response.headers.get('content-type');
    const data = contentType?.includes('application/json')
      ? await response.json()
      : null;

    if (!response.ok) {
      if (response.status === 401 && !skipAuth && retryOnUnauthorized) {
        const token = await getIdToken(true);
        requestHeaders.set('Authorization', `Bearer ${token}`);
        const retryResponse = await fetch(requestUrl, {
          ...rest,
          headers: requestHeaders,
        });
        const retryContentType = retryResponse.headers.get('content-type');
        const retryData = retryContentType?.includes('application/json')
          ? await retryResponse.json()
          : null;

        if (!retryResponse.ok) {
          throw new ApiError(
            retryResponse.status,
            retryData?.message || retryData?.error || retryResponse.statusText,
            retryData
          );
        }

        return retryData as T;
      }

      throw new ApiError(
        response.status,
        data?.message || data?.error || response.statusText,
        data
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, (error as Error).message);
  }
};
