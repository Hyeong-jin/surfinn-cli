import i18n from 'i18n-js';
import en from './en.json';
import ko from './ko.json';

i18n.fallbacks = true;
i18n.translations = { en, ko };

i18n.locale = window.navigator.language || 'en';

/**
 * Builds up valid keypaths for translations.
 * Update to your default locale of choice if not English.
 */
type DefaultLocale = typeof en;
export type TxKeyPath = RecursiveKeyOf<DefaultLocale>;
type RecursiveKeyOf<TObj extends Record<string, any>> = {
  [TKey in keyof TObj & string]: TObj[TKey] extends Record<string, any> ? `${TKey}` | `${TKey}.${RecursiveKeyOf<TObj[TKey]>}` : `${TKey}`;
}[keyof TObj & string];
