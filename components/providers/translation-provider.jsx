'use client';

import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18nConfig';

export function TranslationProvider({ children, translations }) {
  i18n.init(translations); 

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
