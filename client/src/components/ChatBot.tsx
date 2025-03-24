import { useRef, useEffect } from "react";
import { Bot, User } from "lucide-react";

interface ChatBotProps {
  messages: { content: string; sender: "user" | "bot" }[];
  isListening: boolean;
}

export default function ChatBot({ messages, isListening }: ChatBotProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto" style={{ height: "400px" }}>
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex items-start ${
            message.sender === "bot" ? "" : "justify-end"
          }`}
        >
          {message.sender === "bot" && (
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white mr-3">
              <Bot size={20} />
            </div>
          )}
          
          <div
            className={`max-w-[80%] ${
              message.sender === "bot"
                ? "bg-primary text-white chat-bubble relative"
                : "bg-gray-200 chat-bubble user-bubble relative"
            } p-3 rounded-lg`}
          >
            <p>{message.content}</p>
          </div>
          
          {message.sender === "user" && (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center ml-3">
              <User size={18} className="text-gray-600" />
            </div>
          )}
        </div>
      ))}
      
      {isListening && (
        <div className="flex items-center justify-center py-2">
          <div className="px-4 py-2 bg-accent/20 text-accent rounded-full text-sm flex items-center">
            <div className="mr-2 flex items-center space-x-1">
              <div className="w-1 h-3 bg-accent rounded animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-4 bg-accent rounded animate-pulse" style={{ animationDelay: '100ms' }}></div>
              <div className="w-1 h-5 bg-accent rounded animate-pulse" style={{ animationDelay: '200ms' }}></div>
            </div>
            Listening...
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}
