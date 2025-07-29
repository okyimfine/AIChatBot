import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, User, Send, Copy, Edit3, Settings, LogOut, 
  Menu, X, Check, MoreVertical, Paperclip, Save, Plus,
  MessageSquare, Trash2, Camera, Palette
} from "lucide-react";
import { TypingMessage } from "@/components/TypingMessage";
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
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Message, Chat, User as UserType } from "@shared/schema";

interface ThemeButtonProps {
  color: "blue" | "green" | "red";
  isActive: boolean;
  onClick: () => void;
}

function ThemeButton({ color, isActive, onClick }: ThemeButtonProps) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600", 
    red: "from-red-500 to-red-600"
  };

  return (
    <button
      onClick={onClick}
      className={`theme-button w-12 h-12 rounded-full bg-gradient-to-br ${colorClasses[color]} ${
        isActive ? "ring-4 ring-offset-2 ring-gray-400" : ""
      }`}
    />
  );
}

export default function ChatApp() {
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [newChatTitle, setNewChatTitle] = useState("");
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  
  // Profile form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [themeColor, setThemeColor] = useState<"blue" | "green" | "red">("blue");
  const [uploadingFile, setUploadingFile] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  // Apply theme to document
  useEffect(() => {
    if (user && typeof user === 'object' && 'themeColor' in user) {
      const userTheme = user.themeColor as "blue" | "green" | "red";
      setThemeColor(userTheme);
      document.documentElement.setAttribute('data-theme', userTheme);
    }
  }, [user]);

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

  // Initialize form data from user
  useEffect(() => {
    if (user && typeof user === 'object') {
      if ('firstName' in user && typeof user.firstName === 'string') {
        setFirstName(user.firstName);
      }
      if ('lastName' in user && typeof user.lastName === 'string') {
        setLastName(user.lastName);
      }
      if ('profileImageUrl' in user && typeof user.profileImageUrl === 'string') {
        setProfileImageUrl(user.profileImageUrl);
      }
      if ('geminiApiKey' in user && typeof user.geminiApiKey === 'string') {
        setApiKey(user.geminiApiKey);
      }
    }
  }, [user]);

  // Fetch chats
  const { data: chats = [], isLoading: chatsLoading } = useQuery<Chat[]>({
    queryKey: ["/api/chats"],
    enabled: isAuthenticated,
  });

  // Fetch messages for current chat
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/chats", currentChatId, "messages"],
    queryFn: () => {
      if (!currentChatId) return [];
      return fetch(`/api/chats/${currentChatId}/messages`).then(res => res.json());
    },
    enabled: isAuthenticated && !!currentChatId,
  });

  // Auto-select first chat
  useEffect(() => {
    if (chats.length > 0 && !currentChatId) {
      setCurrentChatId(chats[0].id);
    }
  }, [chats, currentChatId]);

  // Create new chat mutation
  const createChatMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiRequest("POST", "/api/chats", { title });
      return response.json();
    },
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
      setCurrentChatId(newChat.id);
      setNewChatOpen(false);
      setNewChatTitle("");
      // If we have input waiting, send it immediately
      if (inputValue.trim()) {
        setTimeout(() => {
          sendMessageMutation.mutate(inputValue.trim());
        }, 100);
      }
      toast({
        title: "Success",
        description: "New chat created!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create chat",
        variant: "destructive",
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/messages", {
        content,
        role: "user",
        chatId: currentChatId,
      });
      return response.json();
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats", currentChatId, "messages"] });
      setInputValue("");
      setIsTyping(false);
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

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await apiRequest("PUT", "/api/auth/profile", updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setProfileOpen(false);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Update API key mutation
  const updateApiKeyMutation = useMutation({
    mutationFn: async (apiKey: string) => {
      const response = await apiRequest("POST", "/api/auth/api-key", { apiKey });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setSettingsOpen(false);
      toast({
        title: "Success",
        description: "API key updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update API key",
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
    if (inputValue.trim() && !sendMessageMutation.isPending && currentChatId) {
      sendMessageMutation.mutate(inputValue.trim());
    } else if (inputValue.trim() && !currentChatId) {
      // Auto-create a chat if none exists
      const title = inputValue.trim().slice(0, 50) + (inputValue.length > 50 ? "..." : "");
      createChatMutation.mutate(title);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateChat = () => {
    if (newChatTitle.trim()) {
      createChatMutation.mutate(newChatTitle.trim());
    }
  };

  const handleUpdateProfile = () => {
    updateProfileMutation.mutate({
      firstName,
      lastName,
      profileImageUrl,
      themeColor,
    });
  };

  const handleThemeChange = (color: "blue" | "green" | "red") => {
    setThemeColor(color);
    document.documentElement.setAttribute('data-theme', color);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    setUploadingFile(true);
    try {
      // For demo purposes, we'll use a file URL or convert to base64
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          if (file.type.startsWith('image/') && currentChatId) {
            setInputValue(prev => prev + `\n[Image uploaded: ${file.name}]`);
          } else {
            setInputValue(prev => prev + `\n[File uploaded: ${file.name}]`);
          }
        };
        reader.readAsDataURL(file);
      } else {
        setInputValue(prev => prev + `\n[File uploaded: ${file.name}]`);
      }
      
      toast({
        title: "File uploaded",
        description: `${file.name} has been attached to your message`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleProfileImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfileImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatTime = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
  };

  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (user && typeof user === 'object' && 'email' in user && user.email) {
      return (user.email as string).charAt(0).toUpperCase();
    }
    return 'U';
  };

  if (!isAuthenticated || authLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-80 lg:w-80" : "w-0"} transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col ${sidebarOpen ? "fixed lg:relative z-50 h-full lg:z-auto" : ""}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold gradient-bg bg-clip-text text-transparent">AI Chat</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNewChatOpen(true)}
              className="scale-in"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {/* User Profile */}
          <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
            <Avatar className="h-8 w-8 profile-avatar">
              <AvatarImage src={profileImageUrl} />
              <AvatarFallback className="gradient-bg text-white text-sm">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{firstName || "User"}</p>
              <p className="text-xs text-gray-500 truncate">
                {user && typeof user === 'object' && 'email' in user ? user.email as string : ''}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => window.location.href = '/api/logout'}
                  className="text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setCurrentChatId(chat.id)}
                className={`chat-item cursor-pointer p-3 rounded-lg border transition-all ${
                  currentChatId === chat.id
                    ? "gradient-bg text-white"
                    : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{chat.title}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {chat.updatedAt ? new Date(chat.updatedAt).toLocaleDateString() : ''}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
          
          <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center">
            <Bot className="text-white text-lg" size={20} />
          </div>
          
          <div className="flex-1">
            <h1 className="font-semibold text-lg">
              {chats.find(c => c.id === currentChatId)?.title || "AI Assistant"}
            </h1>
            <p className="text-sm text-gray-500 flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 bounce-gentle"></span>
              Online
            </p>
          </div>
        </header>

        {/* Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messagesLoading ? (
            <div className="text-center text-gray-500">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Start a conversation with your AI assistant!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`message-in flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === "user"
                      ? "gradient-bg text-white slide-in-right"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 slide-in-left"
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <div className="flex-1">
                      {typingMessageId === message.id ? (
                        <TypingMessage content={message.content} />
                      ) : (
                        <div className="message-content">{message.content}</div>
                      )}
                      <div className="text-xs opacity-70 mt-1">
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="opacity-50 hover:opacity-100">
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => copyToClipboard(message.content)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </DropdownMenuItem>
                        {message.role === "user" && (
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingMessageId(message.id);
                              setEditingContent(message.content);
                            }}
                          >
                            <Edit3 className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2 slide-in-left">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="resize-none min-h-[44px] max-h-32 pr-12"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 bottom-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile}
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,application/pdf,.doc,.docx,.txt,.md"
                onChange={handleImageSelect}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || sendMessageMutation.isPending}
              className="gradient-bg text-white theme-button"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* New Chat Dialog */}
      <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
        <DialogContent className="scale-in">
          <DialogHeader>
            <DialogTitle>Create New Chat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="chatTitle">Chat Title</Label>
              <Input
                id="chatTitle"
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
                placeholder="Enter chat title..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewChatOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateChat}
              disabled={!newChatTitle.trim() || createChatMutation.isPending}
              className="gradient-bg text-white"
            >
              Create Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="scale-in max-w-md">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-20 w-20 profile-avatar">
                <AvatarImage src={profileImageUrl} />
                <AvatarFallback className="gradient-bg text-white text-xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const event = e as any;
                    handleProfileImageSelect(event);
                  };
                  input.click();
                }}
                className="theme-button"
              >
                <Camera className="w-4 h-4 mr-2" />
                Change Photo
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="profileImage">Profile Image URL</Label>
              <Input
                id="profileImage"
                value={profileImageUrl}
                onChange={(e) => setProfileImageUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
              />
            </div>
            
            <div>
              <Label className="flex items-center space-x-2">
                <Palette className="w-4 h-4" />
                <span>Theme Color</span>
              </Label>
              <div className="flex space-x-3 mt-2">
                <ThemeButton
                  color="blue"
                  isActive={themeColor === "blue"}
                  onClick={() => handleThemeChange("blue")}
                />
                <ThemeButton
                  color="green"
                  isActive={themeColor === "green"}
                  onClick={() => handleThemeChange("green")}
                />
                <ThemeButton
                  color="red"
                  isActive={themeColor === "red"}
                  onClick={() => handleThemeChange("red")}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProfile}
              disabled={updateProfileMutation.isPending}
              className="gradient-bg text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="scale-in">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey">Gemini API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your API key is encrypted and stored securely.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => updateApiKeyMutation.mutate(apiKey)}
              disabled={updateApiKeyMutation.isPending}
              className="gradient-bg text-white"
            >
              Save API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}