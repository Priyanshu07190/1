import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Shield, FileText, Search, Bot, Mic, ShieldCheck } from "lucide-react";

interface HomePageProps {
  selectedLanguage: string;
  onChangeLanguage: () => void;
}

export default function HomePage({ selectedLanguage, onChangeLanguage }: HomePageProps) {
  const [_, navigate] = useLocation();

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
              <Shield className="text-primary text-xl" />
            </div>
            <h1 className="text-2xl font-bold">CyberShield</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:text-white hover:bg-primary-dark"
              onClick={onChangeLanguage}
            >
              <Globe className="h-4 w-4 mr-1" />
              <span>{selectedLanguage}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:text-white hover:bg-primary-dark"
            >
              <QuestionMark className="h-4 w-4 mr-1" />
              <span>Help</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-secondary">
              Report & Track Cybersecurity Incidents
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Our AI-powered platform helps you file complaints about cybersecurity incidents and track their resolution.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white py-6 rounded-lg font-medium flex items-center justify-center transition-colors shadow-lg"
                onClick={() => navigate("/filing")}
              >
                <FileText className="mr-2 h-5 w-5" />
                File a Complaint
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="bg-white hover:bg-gray-100 text-primary py-6 rounded-lg font-medium flex items-center justify-center transition-colors border border-primary shadow-lg"
                onClick={() => navigate("/track")}
              >
                <Search className="mr-2 h-5 w-5" />
                Track My Complaint
              </Button>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Bot className="text-primary text-xl" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI-Powered Assistant</h3>
              <p className="text-gray-600">Our intelligent chatbot guides you through the process of filing a cybersecurity complaint.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Mic className="text-primary text-xl" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Voice Interaction</h3>
              <p className="text-gray-600">Speak directly to our system and have your information automatically recorded.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="text-primary text-xl" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Processing</h3>
              <p className="text-gray-600">Your complaint is securely processed, categorized, and stored with state-of-the-art encryption.</p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-semibold mb-3">Need Immediate Assistance?</h3>
            <p className="text-gray-600 mb-4">For urgent cybersecurity threats, contact our 24/7 helpline</p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <a href="tel:+18001234567" className="flex items-center text-primary hover:text-primary/80 font-medium">
                <Phone className="mr-2 h-4 w-4" />
                +1 (800) 123-4567
              </a>
              
              <span className="hidden sm:block text-gray-300">|</span>
              
              <a href="mailto:help@cybershield.com" className="flex items-center text-primary hover:text-primary/80 font-medium">
                <Mail className="mr-2 h-4 w-4" />
                help@cybershield.com
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-secondary-dark text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">&copy; 2023 CyberShield. All rights reserved.</p>
            </div>
            
            <div className="flex space-x-4">
              <a href="#" className="text-sm text-gray-300 hover:text-white">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-300 hover:text-white">Terms of Service</a>
              <a href="#" className="text-sm text-gray-300 hover:text-white">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Lucide icons that were missing
function Globe(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function QuestionMark(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function Phone(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function Mail(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}
