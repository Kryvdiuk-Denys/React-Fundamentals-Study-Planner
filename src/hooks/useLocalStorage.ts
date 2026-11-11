import { useEffect, useState } from 'react'

function readFromStorage<T>(key: string, fallbackValue: T): T {
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
    window.localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}

export default useLocalStorage
