import axios, { type AxiosRequestConfig } from 'axios'

const baseURL = (
  (import.meta.env.VITE_API_URL as string | undefined) || 'https://dummyjson.com'
).replace(/\/+$/, '')

export const apiClient = axios.create({ baseURL })

export class ApiError extends Error {
  readonly status?: number
  readonly code?: string
  readonly canceled: boolean

  constructor(
    message: string,
    options: { status?: number; code?: string; canceled?: boolean } = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status
    this.code = options.code
    this.canceled = options.canceled ?? false
  }
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (axios.isCancel(error)) {
    return new ApiError('Запит скасовано.', { code: 'ERR_CANCELED', canceled: true })
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const responseMessage =
      typeof error.response?.data === 'object' &&
      error.response.data !== null &&
      'message' in error.response.data &&
      typeof error.response.data.message === 'string'
        ? error.response.data.message
        : undefined

    return new ApiError(
      responseMessage ??
        (status ? `Помилка HTTP: ${status}` : 'Не вдалося з’єднатися з сервером.'),
      { status, code: error.code },
    )
  }

  return new ApiError(
    error instanceof Error ? error.message : 'Сталася невідома помилка.',
  )
}

export async function httpClient<T>(
  path: string,
  options: AxiosRequestConfig = {},
): Promise<T> {
  try {
    const response = await apiClient.request<T>({ ...options, url: path })
    return response.data
  } catch (error) {
    throw normalizeApiError(error)
  }
}
