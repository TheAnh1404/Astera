import type { ApiErrorDetail, ApiSuccessResponse, TokenPair } from '@/types/api';

const DEFAULT_BASE_URL = 'http://localhost:8000/api/v1';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL;

const TOKEN_STORAGE_KEY = 'astera_access_token';
const REFRESH_TOKEN_STORAGE_KEY = 'astera_refresh_token';

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function storeTokens(tokens: TokenPair): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
}

export class ApiError extends Error implements ApiErrorDetail {
  code: string;
  details?: unknown;
  status: number;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Queue for pending requests during token refresh
let isRefreshing = false;
let refreshSubscribers: ((newToken: string | null) => void)[] = [];

function subscribeTokenRefresh(cb: (newToken: string | null) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(newToken: string | null) {
  refreshSubscribers.map((cb) => cb(newToken));
  refreshSubscribers = [];
}

async function performTokenRefresh(): Promise<string | null> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    clearTokens();
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return null;
    }

    const resJson = await response.json();
    if (resJson.success && resJson.data) {
      const tokens: TokenPair = resJson.data;
      storeTokens(tokens);
      return tokens.accessToken;
    } else {
      clearTokens();
      return null;
    }
  } catch {
    clearTokens();
    return null;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry: boolean = false
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const token = getStoredAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 && !isRetry && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await performTokenRefresh();
      isRefreshing = false;
      onRefreshed(newToken);

      if (newToken) {
        return apiRequest<T>(endpoint, options, true);
      } else {
        window.dispatchEvent(new Event('astera:unauthorized'));
        throw new ApiError(401, 'AUTH_TOKEN_EXPIRED', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
    } else {
      return new Promise<T>((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          if (newToken) {
            resolve(apiRequest<T>(endpoint, options, true));
          } else {
            reject(new ApiError(401, 'AUTH_TOKEN_EXPIRED', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'));
          }
        });
      });
    }
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(response.status, 'INVALID_RESPONSE', 'Phản hồi từ server không hợp lệ');
  }

  if (!response.ok || data.success === false) {
    const errorDetail = data.error || {};
    const code = errorDetail.code || `HTTP_${response.status}`;
    const message = errorDetail.message || getFriendlyErrorMessage(code, response.status);
    throw new ApiError(response.status, code, message, errorDetail.details);
  }

  return (data as ApiSuccessResponse<T>).data;
}

export function getFriendlyErrorMessage(code: string, status: number): string {
  switch (code) {
    case 'AI_CORE_UNAVAILABLE':
      return 'Hệ thống phân tích thị trường AI đang tạm thời không khả dụng. Vui lòng thử lại sau.';
    case 'RECOMMENDATION_EXPIRED':
      return 'Đề xuất này đã hết hạn. Vui lòng tính lại danh mục mới.';
    case 'PORTFOLIO_NOT_FOUND':
      return 'Bạn chưa có danh mục đầu tư nào.';
    case 'INVESTMENT_PROFILE_NOT_FOUND':
      return 'Chưa tìm thấy hồ sơ đầu tư. Vui lòng thiết lập hồ sơ đầu tư.';
    case 'AUTH_TOKEN_EXPIRED':
    case 'AUTHENTICATION_REQUIRED':
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    case 'INVALID_CREDENTIALS':
      return 'Email hoặc mật khẩu không chính xác.';
    case 'EMAIL_ALREADY_REGISTERED':
      return 'Địa chỉ email này đã được đăng ký tài khoản.';
    case 'VALIDATION_ERROR':
      return 'Thông tin nhập vào chưa đúng định dạng. Vui lòng kiểm tra lại.';
    default:
      if (status === 404) return 'Không tìm thấy dữ liệu yêu cầu.';
      if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
      if (status >= 500) return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.';
      return 'Đã xảy ra lỗi không xác định.';
  }
}
