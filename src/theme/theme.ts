import { createContext, createElement, ReactNode, useContext } from 'react';
import { PremiumColorTokens, premiumDarkColors, premiumLightColors } from './colors';

export type ThemeMode = 'light' | 'dark';

export type AppTheme = {
  mode: ThemeMode;
  isDark: boolean;
  colors: PremiumColorTokens;
};

export const premiumLightTheme: AppTheme = {
  mode: 'light',
  isDark: false,
  colors: premiumLightColors,
};

export const premiumDarkTheme: AppTheme = {
  mode: 'dark',
  isDark: true,
  colors: premiumDarkColors,
};

const AppThemeContext = createContext<AppTheme>(premiumLightTheme);

type AppThemeProviderProps = {
  mode: ThemeMode;
  children: ReactNode;
};

export function AppThemeProvider({ mode, children }: AppThemeProviderProps) {
  return createElement(
    AppThemeContext.Provider,
    { value: mode === 'dark' ? premiumDarkTheme : premiumLightTheme },
    children,
  );
}

export function useAppTheme(): AppTheme {
  return useContext(AppThemeContext);
}
