import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, User, Send, Copy, Edit3, Settings, LogOut, 
  Menu, X, Check, MoreVertical, Paperclip 
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Message } from "@shared/schema";

export default function Chat() {
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/messages", {
        content,
        role: "user",
      });
      return response.json();
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setInputValue("");
      setIsTyping(false);
    },
    onError: (error) => {
      setIsTyping(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSendMessage = () => {
    if (inputValue.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(inputValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-2xl">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center space-x-3 shadow-sm">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
          <Bot className="text-white text-lg" size={20} />
        </div>
        <div className="flex-1">
          <h1 className="font-semibold text-slate-800 text-lg">AI Assistant</h1>
          <p className="text-sm text-slate-500 flex items-center">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 bounce-gentle"></span>
            Online
          </p>
        </div>
        <Button variant="ghost" size="sm" className="p-2 text-slate-400 hover:text-slate-600">
          <MoreVertical size={16} />
        </Button>
      </header>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50/50 to-white"
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {messages.length === 0 && (
              <div className="flex items-start space-x-3 message-in">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot className="text-white text-sm" size={16} />
                </div>
                <div className="flex-1 max-w-xs lg:max-w-md">
                  <div className="bg-slate-100 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                    <p className="text-slate-800">
                      Hello! I'm your AI assistant. How can I help you today? Feel free to ask me anything!
                    </p>
                  </div>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-xs text-slate-500">{formatTime(new Date())}</span>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 message-in ${
                  message.role === "user" ? "justify-end" : ""
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Bot className="text-white text-sm" size={16} />
                  </div>
                )}

                <div className="flex-1 max-w-xs lg:max-w-md">
                  <div
                    className={`rounded-2xl px-4 py-3 shadow-sm ${
                      message.role === "user"
                        ? "bg-blue-500 text-white rounded-tr-md ml-auto"
                        : "bg-slate-100 text-slate-800 rounded-tl-md"
                    }`}
                  >
                    <p>{message.content}</p>
                  </div>
                  <div
                    className={`flex items-center mt-1 space-x-2 ${
                      message.role === "user" ? "justify-end" : ""
                    }`}
                  >
                    <span className="text-xs text-slate-500">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>

                {message.role === "user" && (
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <User className="text-white text-sm" size={16} />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start space-x-3 message-in">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot className="text-white text-sm" size={16} />
                </div>
                <div className="bg-slate-100 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full typing-dot"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full typing-dot"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full typing-dot"></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-slate-200 p-4">
        <div className="bg-slate-50 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-end space-x-3 p-3">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 text-slate-400 hover:text-slate-600"
            >
              <Paperclip size={18} />
            </Button>
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent resize-none border-none outline-none text-slate-800 placeholder-slate-400 text-sm leading-relaxed max-h-32 min-h-0 p-0 focus-visible:ring-0"
                rows={1}
                disabled={sendMessageMutation.isPending}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || sendMessageMutation.isPending}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-xl shadow-sm hover:shadow-md transition-all transform hover:scale-105 active:scale-95"
              size="sm"
            >
              <Send size={18} />
            </Button>
          </div>
        </div>

        {/* Message Status Bar */}
        <div className="flex items-center justify-between mt-2 px-2">
          <span className="text-xs text-slate-400 flex items-center">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></span>
            Connected
          </span>
          <span className="text-xs text-slate-400">
            {inputValue.length}/2000 characters
          </span>
        </div>
      </div>
    </div>
  );
}
