import { useState } from "react";
import { useLocation } from "wouter";
import LanguageSelector from "@/components/LanguageSelector";
import HomePage from "@/components/HomePage";
import ComplaintFiling from "@/components/ComplaintFiling";
import TrackComplaint from "@/components/TrackComplaint";

interface Language {
  code: string;
  name: string;
  flag: string;
}

export default function LandingPage() {
  const [location, setLocation] = useLocation();
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [screen, setScreen] = useState<"language" | "home" | "filing" | "track">("language");

  // Handle language selection
  const handleSelectLanguage = (language: Language) => {
    setSelectedLanguage(language);
    setScreen("home");
    
    // Update URL to reflect the change
    setLocation("/home");
  };

  // Handle navigation
  const handleNavigate = (to: string) => {
    switch (to) {
      case "/":
        setScreen("home");
        break;
      case "/filing":
        setScreen("filing");
        break;
      case "/track":
        setScreen("track");
        break;
      default:
        setScreen("home");
    }
    
    // Update URL to reflect the change
    setLocation(to);
  };

  // Handle change language
  const handleChangeLanguage = () => {
    setScreen("language");
    setLocation("/");
  };

  // Track URL changes
  if (location === "/" && screen !== "language" && selectedLanguage) {
    setScreen("home");
  } else if (location === "/filing" && screen !== "filing") {
    setScreen("filing");
  } else if (location === "/track" && screen !== "track") {
    setScreen("track");
  }

  // Choose which screen to render
  const renderScreen = () => {
    if (screen === "language" || !selectedLanguage) {
      return <LanguageSelector onSelectLanguage={handleSelectLanguage} />;
    }
    
    if (screen === "filing") {
      return <ComplaintFiling selectedLanguage={selectedLanguage.name} onChangeLanguage={handleChangeLanguage} />;
    }
    
    if (screen === "track") {
      return <TrackComplaint selectedLanguage={selectedLanguage.name} onChangeLanguage={handleChangeLanguage} />;
    }
    
    return <HomePage selectedLanguage={selectedLanguage.name} onChangeLanguage={handleChangeLanguage} />;
  };

  return <div className="min-h-screen flex flex-col">{renderScreen()}</div>;
}
