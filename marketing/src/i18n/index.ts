import en from './locales/en';
import de from './locales/de';

export const LOCALES = ['en', 'de'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

const translations = { en, de } as const;

export type Translations = typeof en;

export function getTranslations(lang: Locale): Translations {
  return translations[lang] ?? translations[DEFAULT_LOCALE];
}

export function getLocales(): readonly Locale[] {
  return LOCALES;
}

export function getNonDefaultLocales(): Locale[] {
  return LOCALES.filter(l => l !== DEFAULT_LOCALE) as Locale[];
}

export function getLocalizedPath(path: string, lang: Locale): string {
  if (lang === DEFAULT_LOCALE) return path;
  return `/${lang}${path}`;
}

export function isValidLocale(lang: string): lang is Locale {
  return LOCALES.includes(lang as Locale);
}
