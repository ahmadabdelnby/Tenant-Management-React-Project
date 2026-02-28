// ============================================
// LanguageSwitcher Component
// Toggles between English & Arabic with RTL
// ============================================

import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-bootstrap';
import { useEffect } from 'react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const currentLang = i18n.language?.startsWith('ar') ? 'ar' : 'en';

  // Sync document direction with language
  useEffect(() => {
    const dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.body.dir = dir;
    document.documentElement.dir = dir;
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  const switchLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        variant="link"
        className="text-dark text-decoration-none p-0 d-flex align-items-center"
        id="lang-dropdown"
      >
        <i className="bi bi-globe2 me-1" style={{ fontSize: '18px' }}></i>
        <span className="fw-semibold" style={{ fontSize: '14px' }}>
          {currentLang === 'ar' ? 'العربية' : 'EN'}
        </span>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item
          onClick={() => switchLanguage('en')}
          active={currentLang === 'en'}
        >
          🇺🇸 English
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => switchLanguage('ar')}
          active={currentLang === 'ar'}
        >
          🇸🇦 العربية
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageSwitcher;
