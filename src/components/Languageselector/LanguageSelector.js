import React, { useState, useEffect } from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { useTranslation } from "react-i18next";
import "../../components/Languageselector/Languageselector.css";

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const languages = [
    { code: "en", name: "ENGLISH", flag: "🇺🇸" },
    { code: "am", name: "አማርኛ", flag: "🇪🇹" },
    { code: "ti", name: "ትግርኛ", flag: "🇪🇷" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "es", name: "ESPAÑOL", flag: "🇪🇸" },
    { code: "fr", name: "FRANÇAIS", flag: "🇫🇷" },
    { code: "so", name: "SOOMAALI", flag: "🇸🇴" },
  ];

  useEffect(() => {
    const savedLanguage = localStorage.getItem("selectedLanguage") || "en";
    setSelectedLanguage(savedLanguage);
    i18n.changeLanguage(savedLanguage);
  }, [i18n]);

  const toggle = () => setDropdownOpen(prev => !prev);

  const handleLanguageChange = (langCode, e) => {
    // Stop event propagation to prevent toggle from firing
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    setSelectedLanguage(langCode);
    i18n.changeLanguage(langCode);
    localStorage.setItem("selectedLanguage", langCode);
    
    // Force close the dropdown
    setDropdownOpen(false);
  };

  const currentLanguage =
    languages.find((lang) => lang.code === selectedLanguage) || languages[0];

  return (
    <div className="language-selector-wrapper">
      <Dropdown isOpen={dropdownOpen} toggle={toggle}>
        <DropdownToggle
          caret
          className="language-toggle"
          style={{
            backgroundColor: "#5e72e4",
            borderColor: "#5e72e4",
            color: "#ffffff",
            padding: "8px 16px",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>{currentLanguage.flag}</span>
          <span>{currentLanguage.name}</span>
        </DropdownToggle>

        <DropdownMenu
          container="body"
          strategy="fixed"
          style={{
            backgroundColor: "#1a273a",
            border: "1px solid #3a4555",
            borderRadius: "6px",
            marginTop: "6px",
            minWidth: "220px",
            maxHeight: "320px",
            overflowY: "auto",
            zIndex: 9999,
          }}
        >
          {languages.map((lang) => (
            <DropdownItem
              key={lang.code}
              onClick={(e) => handleLanguageChange(lang.code, e)}
              active={selectedLanguage === lang.code}
              style={{
                backgroundColor:
                  selectedLanguage === lang.code ? "#2b427d" : "transparent",
                color: "#ffffff",
                padding: "10px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "14px",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (selectedLanguage !== lang.code) {
                  e.currentTarget.style.backgroundColor = "#2d3e50";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedLanguage !== lang.code) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <span style={{ fontSize: "18px" }}>{lang.flag}</span>
              <span>{lang.name}</span>
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default LanguageSelector;