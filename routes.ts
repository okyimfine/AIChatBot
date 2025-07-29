import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema, insertChatSchema } from "@shared/schema";
import { setupGoogleAuth, isAuthenticated, isAdmin } from "./googleAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupGoogleAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user API key - with encryption
  app.post('/api/auth/api-key', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { apiKey } = req.body;
      const user = await storage.updateUserApiKey(userId, apiKey);
      res.json(user);
    } catch (error) {
      console.error("Error updating API key:", error);
      res.status(500).json({ message: "Failed to update API key" });
    }
  });

  // Update user profile
  app.put('/api/auth/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName, profileImageUrl, themeColor } = req.body;
      const updates: any = {};
      
      if (firstName !== undefined) updates.firstName = firstName;
      if (lastName !== undefined) updates.lastName = lastName;
      if (profileImageUrl !== undefined) updates.profileImageUrl = profileImageUrl;
      if (themeColor !== undefined) updates.themeColor = themeColor;
      
      const user = await storage.updateUserProfile(userId, updates);
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Get chats for user
  app.get("/api/chats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const chats = await storage.getChats(userId);
      res.json(chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      res.status(500).json({ message: "Failed to fetch chats" });
    }
  });

  // Create new chat
  app.post("/api/chats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { title } = req.body;
      const chat = await storage.createChat({
        title,
        userId
      });
      res.json(chat);
    } catch (error) {
      console.error("Error creating chat:", error);
      res.status(500).json({ message: "Failed to create chat" });
    }
  });

  // Update chat title
  app.put("/api/chats/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { title } = req.body;
      const chat = await storage.updateChat(id, title);
      res.json(chat);
    } catch (error) {
      console.error("Error updating chat:", error);
      res.status(500).json({ message: "Failed to update chat" });
    }
  });

  // Delete chat
  app.delete("/api/chats/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteChat(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting chat:", error);
      res.status(500).json({ message: "Failed to delete chat" });
    }
  });

  // Get messages for a specific chat
  app.get("/api/chats/:chatId/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { chatId } = req.params;
      const messages = await storage.getMessages(userId, chatId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Get all messages (backwards compatibility)
  app.get("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const messages = await storage.getMessages(userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send a message and get AI response
  app.post("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertMessageSchema.parse(req.body);
      
      // Store user message
      const userMessage = await storage.createMessage({
        ...validatedData,
        userId
      });
      
      // Get user's API key or fall back to system key
      const user = await storage.getUser(userId);
      const apiKey = user?.geminiApiKey || process.env.GEMINI_API_KEY || "";
      
      if (!apiKey) {
        return res.status(400).json({ 
          message: "No API key available. Please add your Gemini API key in settings." 
        });
      }

      // Get AI response using Gemini REST API
      const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a helpful AI assistant. Provide concise, helpful responses to user questions.

User: ${validatedData.content}`
                }
              ]
            }
          ]
        })
      });

      if (!apiResponse.ok) {
        throw new Error(`Gemini API error: ${apiResponse.status} ${apiResponse.statusText}`);
      }

      const responseData = await apiResponse.json();
      const aiResponse = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!aiResponse) {
        throw new Error("No response from AI");
      }

      // Store AI response
      const aiMessage = await storage.createMessage({
        content: aiResponse,
        role: "assistant",
        userId,
        chatId: validatedData.chatId
      });

      res.json({ userMessage, aiMessage });
    } catch (error) {
      console.error("Error processing message:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to process message" 
      });
    }
  });

  // Edit message
  app.put("/api/messages/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const message = await storage.updateMessage(id, content);
      res.json(message);
    } catch (error) {
      console.error("Error updating message:", error);
      res.status(500).json({ message: "Failed to update message" });
    }
  });

  // Delete message
  app.delete("/api/messages/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMessage(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ message: "Failed to delete message" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", isAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put("/api/admin/users/:id", isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const user = await storage.updateUser(id, updates);
      
      // Log admin action
      await storage.createAdminLog({
        adminId: req.user.id,
        action: "UPDATE_USER",
        target: id,
        details: JSON.stringify(updates),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id);
      
      // Log admin action
      await storage.createAdminLog({
        adminId: req.user.id,
        action: "DELETE_USER",
        target: id,
        details: "User account deleted",
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.get("/api/admin/settings", isAdmin, async (req: any, res) => {
    try {
      const settings = await storage.getGlobalSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post("/api/admin/settings", isAdmin, async (req: any, res) => {
    try {
      const setting = await storage.createGlobalSetting(req.body);
      
      // Log admin action
      await storage.createAdminLog({
        adminId: req.user.id,
        action: "CREATE_SETTING",
        target: setting.key,
        details: JSON.stringify(req.body),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.json(setting);
    } catch (error) {
      console.error("Error creating setting:", error);
      res.status(500).json({ message: "Failed to create setting" });
    }
  });

  app.put("/api/admin/settings/:id", isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const setting = await storage.updateGlobalSetting(id, updates);
      
      // Log admin action
      await storage.createAdminLog({
        adminId: req.user.id,
        action: "UPDATE_SETTING",
        target: setting.key,
        details: JSON.stringify(updates),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.json(setting);
    } catch (error) {
      console.error("Error updating setting:", error);
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  app.delete("/api/admin/settings/:id", isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteGlobalSetting(id);
      
      // Log admin action
      await storage.createAdminLog({
        adminId: req.user.id,
        action: "DELETE_SETTING",
        target: id,
        details: "Global setting deleted",
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting setting:", error);
      res.status(500).json({ message: "Failed to delete setting" });
    }
  });

  app.get("/api/admin/logs", isAdmin, async (req: any, res) => {
    try {
      const logs = await storage.getAdminLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching logs:", error);
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  app.get("/api/admin/stats", isAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
