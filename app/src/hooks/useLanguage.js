import { useState, useCallback } from 'react';

export function useLanguage(initial = 'en') {
  const [lang, setLang] = useState(initial);
  const toggle = useCallback(() => setLang(l => (l === 'en' ? 'zh' : 'en')), []);
  const t = useCallback((obj) => (typeof obj === 'object' ? obj[lang] ?? obj.en : obj), [lang]);
  return { lang, setLang, toggle, t };
}
