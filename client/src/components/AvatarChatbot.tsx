import { useEffect, useState } from "react";
import { User, Bot } from "lucide-react";

interface AvatarChatbotProps {
  messages: { content: string; sender: "user" | "bot" }[];
  isListening: boolean;
  isSpeaking: boolean;
}

export default function AvatarChatbot({ messages, isListening, isSpeaking }: AvatarChatbotProps) {
  const [showAvatar, setShowAvatar] = useState(true);
  const [activeMessage, setActiveMessage] = useState<{ content: string; sender: "user" | "bot" } | null>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setActiveMessage(messages[messages.length - 1]);
    }
  }, [messages]);

  return (
    <div className="flex items-start justify-center p-4">
      {showAvatar && (
        <div className="relative">
          <div 
            className={`w-24 h-24 rounded-full ${
              activeMessage?.sender === "bot" ? "bg-primary" : "bg-gray-300"
            } flex items-center justify-center ${
              (isListening || isSpeaking) ? "avatar-glow" : ""
            }`}
          >
            {activeMessage?.sender === "bot" ? (
              <Bot size={48} className="text-white" />
            ) : (
              <User size={48} className="text-gray-600" />
            )}
          </div>
          
          {(isListening || isSpeaking) && (
            <div className="absolute bottom-0 right-0 bg-accent text-white rounded-full p-2">
              {isListening ? (
                <Mic className="h-4 w-4 animate-pulse" />
              ) : (
                <Volume className="h-4 w-4 animate-pulse" />
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="ml-4 flex-1">
        <div className="bg-white p-4 rounded-lg shadow-md mb-2">
          {activeMessage?.content}
        </div>
        
        <div className="text-xs text-gray-500">
          {activeMessage?.sender === "bot" ? "CyberShield Assistant" : "You"}
        </div>
      </div>
    </div>
  );
}

function Mic(props: any) {
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
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

function Volume(props: any) {
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
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}
