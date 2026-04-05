import { createContext, useContext } from 'react'

export const ThemeContext = createContext<{ dark: boolean }>({ dark: true })

export function useTheme() {
  return useContext(ThemeContext)
}
