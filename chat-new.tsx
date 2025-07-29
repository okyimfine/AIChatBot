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
  Menu, X, Check, MoreVertical, Paperclip, Save 
} from "lucide-react";
import { TypingMessage } from "@/components/TypingMessage";
import { ProfileMenu } from "@/components/ProfileMenu";
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
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  // Handle authentication redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Initialize API key from user data
  useEffect(() => {
    if (user && typeof user === 'object' && 'geminiApiKey' in user && typeof user.geminiApiKey === 'string') {
      setApiKey(user.geminiApiKey);
    }
  }, [user]);

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    enabled: isAuthenticated,
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setInputValue("");
      setIsTyping(false);
      // Start typing animation for AI response
      if (data.aiMessage) {
        setTypingMessageId(data.aiMessage.id);
      }
    },
    onError: (error) => {
      setIsTyping(false);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Edit message mutation
  const editMessageMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const response = await apiRequest("PUT", `/api/messages/${id}`, { content });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setEditingMessageId(null);
      setEditingContent("");
      toast({
        title: "Success",
        description: "Message updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update message",
        variant: "destructive",
      });
    },
  });

  // Update API key mutation
  const updateApiKeyMutation = useMutation({
    mutationFn: async (newApiKey: string) => {
      const response = await apiRequest("POST", "/api/auth/api-key", { apiKey: newApiKey });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setSettingsOpen(false);
      toast({
        title: "Success",
        description: "API key updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update API key",
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

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
  };

  const handleEditMessage = (id: string, content: string) => {
    setEditingMessageId(id);
    setEditingContent(content);
  };

  const handleSaveEdit = () => {
    if (editingMessageId && editingContent.trim()) {
      editMessageMutation.mutate({ id: editingMessageId, content: editingContent.trim() });
    }
  };

  const handleUpdateApiKey = () => {
    if (apiKey.trim()) {
      updateApiKeyMutation.mutate(apiKey.trim());
    }
  };

  const formatTime = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-r border-gray-200/50 dark:border-gray-700/50 transition-transform duration-300 ease-in-out z-50 lg:relative lg:translate-x-0`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">AI Chat</h2>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </Button>
        </div>
        
        <div className="p-4 space-y-2">
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="mr-2" size={18} />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="api-key">Gemini API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Enter your Gemini API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Get your free API key from Google AI Studio
                  </p>
                </div>
                <Button 
                  onClick={handleUpdateApiKey}
                  disabled={updateApiKeyMutation.isPending}
                  className="w-full"
                >
                  {updateApiKeyMutation.isPending ? "Updating..." : "Update API Key"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={() => window.location.href = '/api/logout'}
          >
            <LogOut className="mr-2" size={18} />
            Logout
          </Button>
        </div>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-slate-600 rounded-full flex items-center justify-center">
                <User className="text-white" size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {(user && typeof user === 'object' && 'email' in user && typeof user.email === 'string' && user.email) as string || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(user && typeof user === 'object' && 'firstName' in user && 'lastName' in user && 
                    typeof user.firstName === 'string' && typeof user.lastName === 'string' && 
                    user.firstName && user.lastName)
                    ? `${user.firstName} ${user.lastName}` 
                    : "AI Chat User"}
                </p>
              </div>
            </div>
            <ProfileMenu onSettingsClick={() => setSettingsOpen(true)} />
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3 flex items-center space-x-3 shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </Button>
          
          <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center shadow-md">
            <Bot className="text-white text-lg" size={20} />
          </div>
          <div className="flex-1">
            <h1 className="font-semibold text-slate-800 dark:text-white text-lg">AI Assistant</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 bounce-gentle"></span>
              Online
            </p>
          </div>
        </header>

        {/* Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-6"
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {messages.length === 0 && (
                <div className="flex items-start space-x-4 message-in">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Bot className="text-white" size={20} />
                  </div>
                  <div className="flex-1 max-w-2xl">
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl rounded-tl-md px-6 py-4 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
                      <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                        Hello! I'm your AI assistant. How can I help you today? Feel free to ask me anything!
                      </p>
                    </div>
                    <div className="flex items-center mt-2 space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(new Date())}</span>
                    </div>
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-4 message-in ${
                    message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                    message.role === "assistant" 
                      ? "bg-gradient-to-br from-slate-600 to-slate-700" 
                      : "bg-gradient-to-br from-blue-600 to-blue-700"
                  }`}>
                    {message.role === "assistant" ? (
                      <Bot className="text-white" size={20} />
                    ) : (
                      <User className="text-white" size={20} />
                    )}
                  </div>

                  <div className="flex-1 max-w-2xl">
                    {editingMessageId === message.id ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="w-full resize-none border-gray-300 dark:border-gray-600 rounded-xl"
                          rows={3}
                        />
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={handleSaveEdit} disabled={editMessageMutation.isPending}>
                            <Check size={16} className="mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingMessageId(null)}>
                            <X size={16} className="mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          className={`group relative rounded-2xl px-6 py-4 shadow-sm border ${
                            message.role === "user"
                              ? "bg-blue-500 text-white rounded-tr-md border-blue-600"
                              : "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-800 dark:text-gray-200 rounded-tl-md border-gray-200/50 dark:border-gray-700/50"
                          }`}
                        >
                          {message.role === "assistant" && typingMessageId === message.id ? (
                            <TypingMessage 
                              content={message.content}
                              onComplete={() => setTypingMessageId(null)}
                              speed={30}
                            />
                          ) : (
                            <div className="message-content leading-relaxed text-sm">
                              {message.content}
                            </div>
                          )}
                          
                          {/* Message Actions */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-6 w-6 p-0 ${
                                    message.role === "user" 
                                      ? "text-white/70 hover:text-white hover:bg-white/20" 
                                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  }`}
                                >
                                  <MoreVertical size={14} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleCopyMessage(message.content)}>
                                  <Copy size={14} className="mr-2" />
                                  Copy
                                </DropdownMenuItem>
                                {message.role === "user" && (
                                  <DropdownMenuItem onClick={() => handleEditMessage(message.id, message.content)}>
                                    <Edit3 size={14} className="mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <div
                          className={`flex items-center mt-2 space-x-2 ${
                            message.role === "user" ? "justify-end" : ""
                          }`}
                        >
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-start space-x-4 message-in">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Bot className="text-white" size={20} />
                  </div>
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl rounded-tl-md px-6 py-4 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Message Input */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50 p-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-end space-x-3 p-4">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
                  className="w-full bg-transparent resize-none border-none outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 text-sm leading-relaxed max-h-32 min-h-0 p-0 focus-visible:ring-0"
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

          {/* Status Bar */}
          <div className="flex items-center justify-between mt-3 px-2">
            <span className="text-xs text-gray-400 flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></span>
              Connected
            </span>
            <span className="text-xs text-gray-400">
              {inputValue.length}/2000 characters
            </span>
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}