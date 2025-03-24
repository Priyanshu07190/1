import { useState, useEffect } from "react";
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
    
    // Don't update URL here, just show the home screen
    // This prevents the "page not found" error
  };

  // Handle navigation - This is called from within component buttons
  const handleNavigate = (to: string) => {
    // First check if language is selected, if not, stay on language selection
    if (!selectedLanguage && to !== "/") {
      // Show language selection first if trying to navigate without selecting language
      setScreen("language");
      setLocation("/");
      return;
    }
    
    // Update the location which then triggers the useEffect
    setLocation(to);
    
    // Explicitly set the screen based on the route to avoid any race conditions
    switch (to) {
      case "/":
        if (selectedLanguage) {
          setScreen("home");
        } else {
          setScreen("language");
        }
        break;
      case "/filing":
        setScreen("filing");
        break;
      case "/track":
        setScreen("track");
        break;
      default:
        if (selectedLanguage) {
          setScreen("home");
        } else {
          setScreen("language");
        }
    }
  };

  // Handle change language
  const handleChangeLanguage = () => {
    // Update the screen first to avoid any race conditions
    setScreen("language");
    // Then update the location to match
    setLocation("/");
  };

  // Track URL changes using useEffect instead of in the render function
  // This prevents infinite re-renders
  useEffect(() => {
    // Only synchronize the screen state with the URL location if needed
    let newScreen = screen; // Start with current screen
    
    if (location === "/") {
      if (selectedLanguage && screen !== "language") {
        newScreen = "home";
      } else if (!selectedLanguage) {
        newScreen = "language";
      }
    } else if (location === "/filing") {
      newScreen = "filing";
    } else if (location === "/track") {
      newScreen = "track";
    }
    
    // Only update state if we need to change screens
    if (newScreen !== screen) {
      setScreen(newScreen);
    }
  }, [location, selectedLanguage, screen]);

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
