import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: "en", name: "English", flag: "https://cdn.countryflags.com/thumbs/united-states-of-america/flag-400.png" },
  { code: "es", name: "Español", flag: "https://cdn.countryflags.com/thumbs/spain/flag-400.png" },
  { code: "fr", name: "Français", flag: "https://cdn.countryflags.com/thumbs/france/flag-400.png" },
  { code: "de", name: "Deutsch", flag: "https://cdn.countryflags.com/thumbs/germany/flag-400.png" },
  { code: "hi", name: "हिन्दी", flag: "https://cdn.countryflags.com/thumbs/india/flag-400.png" },
  { code: "zh", name: "中文", flag: "https://cdn.countryflags.com/thumbs/china/flag-400.png" }
];

interface LanguageSelectorProps {
  onSelectLanguage: (language: Language) => void;
}

export default function LanguageSelector({ onSelectLanguage }: LanguageSelectorProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-background">
      <div className="mb-8">
        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto animate-pulse shadow-lg shadow-primary/30">
          <Shield className="text-white h-12 w-12" />
        </div>
        <h1 className="text-3xl font-bold text-center mt-6 text-secondary">CyberShield</h1>
        <p className="text-lg text-center text-secondary/70 mt-2">
          Cybersecurity Complaint Management System
        </p>
      </div>
      
      <h2 className="text-xl font-semibold mb-6 text-center">Select your preferred language</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl w-full">
        {languages.map((language) => (
          <Button
            key={language.code}
            variant="outline"
            className="flex items-center justify-start p-4 hover:border-primary hover:bg-blue-50 transition-colors h-auto"
            onClick={() => onSelectLanguage(language)}
          >
            <img 
              src={language.flag} 
              alt={language.name} 
              className="w-8 h-auto mr-3 rounded"
            />
            <span className="font-medium">{language.name}</span>
          </Button>
        ))}
      </div>
      
      <p className="mt-8 text-sm text-gray-500">Powered by Google Cloud Translation API</p>
    </div>
  );
}
