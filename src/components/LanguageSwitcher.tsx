"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1 px-2 py-1 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
      title={language === "es" ? "Switch to English" : "Cambiar a Español"}
    >
      <span className={language === "es" ? "text-primary-600 font-bold" : "text-gray-500"}>
        ES
      </span>
      <span className="text-gray-300">|</span>
      <span className={language === "en" ? "text-primary-600 font-bold" : "text-gray-500"}>
        EN
      </span>
    </button>
  );
}
