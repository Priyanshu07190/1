import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: "en", name: "English", flag: "https://cdn.countryflags.com/thumbs/india/flag-400.png" },
  { code: "hi", name: "हिन्दी (Hindi)", flag: "https://cdn.countryflags.com/thumbs/india/flag-400.png" },
  { code: "bn", name: "বাংলা (Bengali)", flag: "https://cdn.countryflags.com/thumbs/india/flag-400.png" },
  { code: "mr", name: "मराठी (Marathi)", flag: "https://cdn.countryflags.com/thumbs/india/flag-400.png" },
  { code: "te", name: "తెలుగు (Telugu)", flag: "https://cdn.countryflags.com/thumbs/india/flag-400.png" },
  { code: "ta", name: "தமிழ் (Tamil)", flag: "https://cdn.countryflags.com/thumbs/india/flag-400.png" },
  { code: "gu", name: "ગુજરાતી (Gujarati)", flag: "https://cdn.countryflags.com/thumbs/india/flag-400.png" },
  { code: "ur", name: "اردو (Urdu)", flag: "https://cdn.countryflags.com/thumbs/india/flag-400.png" },
  { code: "kn", name: "ಕನ್ನಡ (Kannada)", flag: "https://cdn.countryflags.com/thumbs/india/flag-400.png" },
  { code: "or", name: "ଓଡ଼ିଆ (Odia)", flag: "https://cdn.countryflags.com/thumbs/india/flag-400.png" },
  { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)", flag: "https://cdn.countryflags.com/thumbs/india/flag-400.png" },
  { code: "ml", name: "മലയാളം (Malayalam)", flag: "https://cdn.countryflags.com/thumbs/india/flag-400.png" },
  { code: "as", name: "অসমীয়া (Assamese)", flag: "https://cdn.countryflags.com/thumbs/india/flag-400.png" },
  { code: "mai", name: "मैथिली (Maithili)", flag: "https://cdn.countryflags.com/thumbs/india/flag-400.png" },
  { code: "sa", name: "संस्कृतम् (Sanskrit)", flag: "https://cdn.countryflags.com/thumbs/india/flag-400.png" },
  { code: "ks", name: "कॉशुर (Kashmiri)", flag: "https://cdn.countryflags.com/thumbs/india/flag-400.png" },
  { code: "ne", name: "नेपाली (Nepali)", flag: "https://cdn.countryflags.com/thumbs/india/flag-400.png" },
  { code: "kok", name: "कोंकणी (Konkani)", flag: "https://cdn.countryflags.com/thumbs/india/flag-400.png" },
  { code: "sd", name: "سنڌي (Sindhi)", flag: "https://cdn.countryflags.com/thumbs/india/flag-400.png" },
  { code: "brx", name: "बड़ो (Bodo)", flag: "https://cdn.countryflags.com/thumbs/india/flag-400.png" },
  { code: "doi", name: "डोगरी (Dogri)", flag: "https://cdn.countryflags.com/thumbs/india/flag-400.png" },
  { code: "mni", name: "মৈতৈলোন্ (Manipuri)", flag: "https://cdn.countryflags.com/thumbs/india/flag-400.png" },
  { code: "sat", name: "ᱥᱟᱱᱛᱟᱲᱤ (Santhali)", flag: "https://cdn.countryflags.com/thumbs/india/flag-400.png" }
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
      
      <div className="max-h-[60vh] overflow-y-auto px-2 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-4xl w-full">
          {languages.map((language) => (
            <Button
              key={language.code}
              variant="outline"
              className="flex items-center justify-start p-3 hover:border-primary hover:bg-blue-50 transition-colors h-auto"
              onClick={() => onSelectLanguage(language)}
            >
              <img 
                src={language.flag} 
                alt={language.name} 
                className="w-6 h-auto mr-2 rounded"
              />
              <span className="font-medium text-sm">{language.name}</span>
            </Button>
          ))}
        </div>
      </div>
      
      <p className="mt-8 text-sm text-gray-500">Powered by Google Cloud Translation API</p>
    </div>
  );
}
