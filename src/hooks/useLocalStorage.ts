import { useEffect, useState } from 'react'

function readFromStorage<T>(key: string, fallbackValue: T): T {
  if (typeof window === 'undefined') {
    return fallbackValue
  }

  try {
    const rawValue = window.localStorage.getItem(key)
    if (rawValue === null) {
      return fallbackValue
    }

    return JSON.parse(rawValue) as T
  } catch {
    return fallbackValue
  }
}

function useLocalStorage<T>(key: string, fallbackValue: T) {
  const [value, setValue] = useState<T>(() => readFromStorage(key, fallbackValue))

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Unable to save "${key}" to localStorage.`, error)
    }
  }, [key, value])

  return [value, setValue] as const
}

export default useLocalStorage
