import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Shield, ArrowLeft, Globe, HelpCircle, Mic, Volume2, VolumeX, Send, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatBot from "./ChatBot";
import ComplaintForm from "./ComplaintForm";
import SuccessModal from "./SuccessModal";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { apiRequest } from "@/lib/queryClient";

const INITIAL_COMPLAINT_DATA = {
  trackingCode: "",
  fullName: "",
  email: "",
  phone: "",
  address: "",
  incidentType: "unknown",
  incidentDate: "",
  incidentDescription: "",
  financialLoss: "",
  partiesInvolved: "",
  additionalNotes: "",
  contactConsent: false,
  language: "english"
};

interface ComplaintFilingProps {
  selectedLanguage: string;
  onChangeLanguage: () => void;
}

export default function ComplaintFiling({ selectedLanguage, onChangeLanguage }: ComplaintFilingProps) {
  const [_, navigate] = useLocation();
  const [showInputMethodSelection, setShowInputMethodSelection] = useState(true);
  const [showComplaintInterface, setShowComplaintInterface] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [inputMethod, setInputMethod] = useState<"text" | "voice">("text");
  const [complaintData, setComplaintData] = useState(INITIAL_COMPLAINT_DATA);
  const [messages, setMessages] = useState<{ content: string; sender: "user" | "bot" }[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [formComplete, setFormComplete] = useState(false);
  const [isSpeakerActive, setIsSpeakerActive] = useState(true);
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");

  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening,
    hasRecognitionSupport 
  } = useSpeechRecognition();

  const { speak, cancel, speaking, supported: hasSpeechSynthesisSupport } = useSpeechSynthesis();

  // Initialize chat with a welcome message
  useEffect(() => {
    const welcomeMessage = {
      content: "Hello! I'm your CyberShield assistant. I'll help you file a cybersecurity complaint. Can you please tell me your full name?",
      sender: "bot" as const
    };
    setMessages([welcomeMessage]);
    
    if (isSpeakerActive && hasSpeechSynthesisSupport) {
      speak(welcomeMessage.content);
    }
  }, []);

  // Listen for transcript changes when voice input is active
  useEffect(() => {
    if (transcript && isListening && inputMethod === "voice") {
      setCurrentInput(transcript);
    }
  }, [transcript, isListening]);

  // Handle voice input when the transcript is updated
  useEffect(() => {
    if (transcript && !isListening && inputMethod === "voice") {
      handleSendMessage();
    }
  }, [isListening]);

  const selectInputMethod = (method: "text" | "voice") => {
    setInputMethod(method);
    setShowInputMethodSelection(false);
    setShowComplaintInterface(true);
    
    if (method === "voice" && hasRecognitionSupport) {
      startListening();
    }
  };

  const toggleInputMethod = () => {
    const newMethod = inputMethod === "text" ? "voice" : "text";
    setInputMethod(newMethod);
    
    if (newMethod === "voice" && hasRecognitionSupport) {
      startListening();
    } else {
      stopListening();
    }
  };

  const toggleMicrophone = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerActive(!isSpeakerActive);
    if (speaking) {
      cancel();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentInput(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      content: currentInput,
      sender: "user" as const
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Process the message - extract information
    try {
      const response = await apiRequest("POST", "/api/analyze-text", { text: currentInput });
      const data = await response.json();
      
      if (data.success && data.extractedInfo) {
        // Update complaint data with extracted information
        setComplaintData(prev => ({
          ...prev,
          ...data.extractedInfo
        }));
      }
    } catch (error) {
      console.error("Error analyzing text:", error);
    }
    
    // Determine bot response based on current state
    let botResponse = "";
    let formUpdated = false;
    
    // Very simple state machine for the conversation flow
    if (!complaintData.fullName && currentInput.length > 0) {
      const newData = { ...complaintData, fullName: currentInput };
      setComplaintData(newData);
      botResponse = "Thank you. Could you please provide your email address so we can send you confirmation and updates about your complaint?";
      formUpdated = true;
    } else if (!complaintData.email && currentInput.includes("@")) {
      const newData = { ...complaintData, email: currentInput };
      setComplaintData(newData);
      botResponse = "Got your email. Now, could you please provide your phone number?";
      formUpdated = true;
    } else if (!complaintData.phone && /\d/.test(currentInput)) {
      const newData = { ...complaintData, phone: currentInput };
      setComplaintData(newData);
      botResponse = "Thank you. Could you please describe what happened in the cybersecurity incident?";
      formUpdated = true;
    } else if (!complaintData.incidentDescription && currentInput.length > 10) {
      const newData = { ...complaintData, incidentDescription: currentInput };
      setComplaintData(newData);
      botResponse = "I understand. When did this incident occur? Please provide a date if possible.";
      formUpdated = true;
    } else if (!complaintData.incidentDate) {
      // Try to parse a date or just use today's date
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const newData = { ...complaintData, incidentDate: today };
      setComplaintData(newData);
      botResponse = "Thank you for all the information. Did you experience any financial loss? If so, please indicate the amount.";
      formUpdated = true;
    } else if (!complaintData.financialLoss) {
      const newData = { ...complaintData, financialLoss: currentInput };
      setComplaintData(newData);
      
      // Enable buttons since we have the minimum required info
      setFormComplete(true);
      
      botResponse = "Thank you for all this information. I've filled out your complaint form. Would you like to review and submit it now, or would you like to edit any section?";
      formUpdated = true;
    } else if (currentInput.toLowerCase().includes("edit")) {
      if (currentInput.toLowerCase().includes("name")) {
        botResponse = "Please provide your new full name.";
      } else if (currentInput.toLowerCase().includes("email")) {
        botResponse = "Please provide your new email address.";
      } else if (currentInput.toLowerCase().includes("phone")) {
        botResponse = "Please provide your new phone number.";
      } else if (currentInput.toLowerCase().includes("description") || currentInput.toLowerCase().includes("incident")) {
        botResponse = "Please provide a new description of the incident.";
      } else {
        botResponse = "Which section would you like to edit? You can say 'personal information', 'incident details', or 'additional information'.";
      }
    } else if (currentInput.toLowerCase().includes("submit")) {
      handleSubmitForm();
      botResponse = "Submitting your complaint. Please wait...";
    } else {
      botResponse = "Thank you for that information. Is there anything specific you'd like to add or edit?";
    }
    
    // Add bot response with slight delay
    setTimeout(() => {
      const botMessage = {
        content: botResponse,
        sender: "bot" as const
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Speak the response if speaker is active
      if (isSpeakerActive && hasSpeechSynthesisSupport) {
        speak(botResponse);
      }
    }, 1000);
    
    // Clear input
    setCurrentInput("");
    
    // Start listening again if using voice input
    if (inputMethod === "voice" && hasRecognitionSupport) {
      setTimeout(() => {
        startListening();
      }, 3000); // Give time for the bot to speak before listening again
    }
  };

  const handleSubmitForm = async () => {
    setSubmitInProgress(true);
    
    try {
      const response = await apiRequest("POST", "/api/complaints", complaintData);
      const data = await response.json();
      
      if (data.success) {
        setTrackingCode(data.complaint.trackingCode);
        setShowSuccessModal(true);
      } else {
        console.error("Error submitting complaint:", data.message);
        // Add error message to chat
        setMessages(prev => [...prev, {
          content: "There was an error submitting your complaint. Please try again.",
          sender: "bot"
        }]);
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      // Add error message to chat
      setMessages(prev => [...prev, {
        content: "There was an error submitting your complaint. Please try again.",
        sender: "bot"
      }]);
    } finally {
      setSubmitInProgress(false);
    }
  };

  const fileNewComplaint = () => {
    setShowSuccessModal(false);
    setComplaintData(INITIAL_COMPLAINT_DATA);
    setMessages([{
      content: "Hello! I'm your CyberShield assistant. I'll help you file a new cybersecurity complaint. Can you please tell me your full name?",
      sender: "bot"
    }]);
    setFormComplete(false);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-3 hover:bg-primary-dark rounded-full text-white"
              onClick={() => navigate("/")}
            >
              <ArrowLeft size={20} />
            </Button>
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
              <HelpCircle className="h-4 w-4 mr-1" />
              <span>Help</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-secondary">File a Cybersecurity Complaint</h2>
          <p className="text-gray-600">Our AI assistant will guide you through the process</p>
        </div>
        
        {/* Input Method Selection */}
        {showInputMethodSelection && (
          <div className="max-w-lg mx-auto mb-8 p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-center">How would you like to provide information?</h3>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90 py-6"
                onClick={() => selectInputMethod("voice")}
              >
                <Mic className="mr-2" />
                Voice Input
              </Button>
              
              <Button 
                variant="outline"
                className="flex-1 text-primary border-primary py-6"
                onClick={() => selectInputMethod("text")}
              >
                <Keyboard className="mr-2" />
                Text Input
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 mt-4 text-center">You can switch between input methods at any time</p>
          </div>
        )}
        
        {/* Chatbot and Form Interface */}
        {showComplaintInterface && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Chatbot */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
              {/* Chat Header */}
              <div className="bg-primary text-white p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                    <Shield className="text-primary text-xl" />
                  </div>
                  <div>
                    <h3 className="font-medium">CyberShield Assistant</h3>
                    <div className="flex items-center text-xs text-primary-light">
                      <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                      <span>Online</span>
                    </div>
                  </div>
                </div>
                
                {/* Voice Controls */}
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`text-white hover:bg-primary-dark ${isListening ? 'bg-primary-dark' : ''}`}
                    onClick={toggleMicrophone}
                    disabled={!hasRecognitionSupport}
                  >
                    <Mic className={isListening ? 'text-accent animate-pulse' : ''} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-primary-dark"
                    onClick={toggleSpeaker}
                  >
                    {isSpeakerActive ? <Volume2 /> : <VolumeX />}
                  </Button>
                </div>
              </div>
              
              {/* Chat Messages Area */}
              <ChatBot
                messages={messages}
                isListening={isListening}
              />
              
              {/* Chat Input Area */}
              <div className="border-t p-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Type your message here..."
                    className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    value={currentInput}
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                    {/* Voice Status */}
                    {isListening && (
                      <div className="mr-2">
                        <div className="flex items-center space-x-1">
                          <div className="w-1 h-3 bg-accent rounded animate-pulse" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1 h-5 bg-accent rounded animate-pulse" style={{ animationDelay: '100ms' }}></div>
                          <div className="w-1 h-7 bg-accent rounded animate-pulse" style={{ animationDelay: '200ms' }}></div>
                          <div className="w-1 h-4 bg-accent rounded animate-pulse" style={{ animationDelay: '300ms' }}></div>
                          <div className="w-1 h-2 bg-accent rounded animate-pulse" style={{ animationDelay: '400ms' }}></div>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      variant="ghost"
                      size="icon"
                      className="text-primary hover:text-primary/80"
                      onClick={handleSendMessage}
                    >
                      <Send size={18} />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <div>
                    <span>
                      {inputMethod === "text" ? (
                        <>
                          <Keyboard className="inline mr-1 h-3 w-3" />
                          Text input mode
                        </>
                      ) : (
                        <>
                          <Mic className="inline mr-1 h-3 w-3" />
                          Voice input mode
                        </>
                      )}
                    </span>
                  </div>
                  
                  <Button 
                    variant="link"
                    size="sm"
                    className="text-primary hover:text-primary/80 h-5 p-0 text-xs font-medium"
                    onClick={toggleInputMethod}
                  >
                    Switch to {inputMethod === "text" ? "voice" : "text"} input
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Right Column: Form */}
            <ComplaintForm 
              complaintData={complaintData}
              setComplaintData={setComplaintData}
              isComplete={formComplete}
              onEdit={() => {
                setMessages(prev => [...prev, {
                  content: "Which section would you like to edit? You can say 'personal information', 'incident details', or 'additional information'.",
                  sender: "bot"
                }]);
                if (isSpeakerActive && hasSpeechSynthesisSupport) {
                  speak("Which section would you like to edit? You can say 'personal information', 'incident details', or 'additional information'.");
                }
              }}
              onSubmit={handleSubmitForm}
              isSubmitting={submitInProgress}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-secondary-dark text-white py-4">
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

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          trackingCode={trackingCode}
          email={complaintData.email}
          onFileNew={fileNewComplaint}
          onReturnHome={() => navigate("/")}
        />
      )}
    </div>
  );
}
