import { 
  type Message, 
  type InsertMessage, 
  type User, 
  type UpsertUser,
  type Chat,
  type InsertChat,
  type GlobalSetting,
  type InsertGlobalSetting,
  type AdminLog,
  type InsertAdminLog,
  messages,
  users,
  chats,
  globalSettings,
  adminLogs
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sql } from "drizzle-orm";
import { encryptApiKey, decryptApiKey } from "./encryption";

export interface IStorage {
  getMessages(userId?: string, chatId?: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: string, content: string): Promise<Message>;
  deleteMessage(id: string): Promise<void>;
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserApiKey(userId: string, apiKey: string): Promise<User>;
  updateUserProfile(userId: string, updates: Partial<Pick<User, 'firstName' | 'lastName' | 'profileImageUrl' | 'themeColor'>>): Promise<User>;
  getChats(userId: string): Promise<Chat[]>;
  createChat(chat: InsertChat): Promise<Chat>;
  updateChat(id: string, title: string): Promise<Chat>;
  deleteChat(id: string): Promise<void>;
  
  // Admin methods
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getGlobalSettings(): Promise<GlobalSetting[]>;
  createGlobalSetting(setting: InsertGlobalSetting): Promise<GlobalSetting>;
  updateGlobalSetting(id: string, updates: Partial<GlobalSetting>): Promise<GlobalSetting>;
  deleteGlobalSetting(id: string): Promise<void>;
  getAdminLogs(): Promise<AdminLog[]>;
  createAdminLog(log: InsertAdminLog): Promise<AdminLog>;
  getAdminStats(): Promise<{ totalUsers: number; activeUsers: number; totalMessages: number; }>;
}

export class DatabaseStorage implements IStorage {
  async getMessages(userId?: string, chatId?: string): Promise<Message[]> {
    const query = db.select().from(messages);
    
    if (userId && chatId) {
      return await query
        .where(and(eq(messages.userId, userId), eq(messages.chatId, chatId)))
        .orderBy(messages.timestamp);
    } else if (userId) {
      return await query
        .where(eq(messages.userId, userId))
        .orderBy(messages.timestamp);
    } else {
      return await query.orderBy(messages.timestamp);
    }
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async updateMessage(id: string, content: string): Promise<Message> {
    const [message] = await db
      .update(messages)
      .set({ content })
      .where(eq(messages.id, id))
      .returning();
    return message;
  }

  async deleteMessage(id: string): Promise<void> {
    await db.delete(messages).where(eq(messages.id, id));
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) return undefined;
    
    // Decrypt API key when retrieving user
    if (user.geminiApiKey) {
      user.geminiApiKey = decryptApiKey(user.geminiApiKey);
    }
    
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserApiKey(userId: string, apiKey: string): Promise<User> {
    // Encrypt the API key before storing
    const encryptedApiKey = encryptApiKey(apiKey);
    const [user] = await db
      .update(users)
      .set({ 
        geminiApiKey: encryptedApiKey,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    
    // Return user with decrypted API key for immediate use
    return {
      ...user,
      geminiApiKey: apiKey
    };
  }

  async updateUserProfile(userId: string, updates: Partial<Pick<User, 'firstName' | 'lastName' | 'profileImageUrl' | 'themeColor'>>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    
    // Decrypt API key when returning user
    if (user.geminiApiKey) {
      user.geminiApiKey = decryptApiKey(user.geminiApiKey);
    }
    
    return user;
  }

  async getChats(userId: string): Promise<Chat[]> {
    const result = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, userId))
      .orderBy(desc(chats.updatedAt));
    return result;
  }

  async createChat(insertChat: InsertChat): Promise<Chat> {
    const [chat] = await db
      .insert(chats)
      .values(insertChat)
      .returning();
    return chat;
  }

  async updateChat(id: string, title: string): Promise<Chat> {
    const [chat] = await db
      .update(chats)
      .set({ 
        title,
        updatedAt: new Date()
      })
      .where(eq(chats.id, id))
      .returning();
    return chat;
  }

  async deleteChat(id: string): Promise<void> {
    // Delete all messages in the chat first
    await db.delete(messages).where(eq(messages.chatId, id));
    // Then delete the chat
    await db.delete(chats).where(eq(chats.id, id));
  }

  // Admin methods
  async getAllUsers(): Promise<User[]> {
    const result = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
    
    // Decrypt API keys for admin view
    return result.map(user => ({
      ...user,
      geminiApiKey: user.geminiApiKey ? decryptApiKey(user.geminiApiKey) : null
    }));
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    
    // Decrypt API key when returning user
    if (user.geminiApiKey) {
      user.geminiApiKey = decryptApiKey(user.geminiApiKey);
    }
    
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    // Delete all user's chats and messages first
    await db.delete(messages).where(eq(messages.userId, id));
    await db.delete(chats).where(eq(chats.userId, id));
    await db.delete(users).where(eq(users.id, id));
  }

  async getGlobalSettings(): Promise<GlobalSetting[]> {
    const result = await db
      .select()
      .from(globalSettings)
      .orderBy(globalSettings.key);
    return result;
  }

  async createGlobalSetting(setting: InsertGlobalSetting): Promise<GlobalSetting> {
    const [newSetting] = await db
      .insert(globalSettings)
      .values(setting)
      .returning();
    return newSetting;
  }

  async updateGlobalSetting(id: string, updates: Partial<GlobalSetting>): Promise<GlobalSetting> {
    const [setting] = await db
      .update(globalSettings)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(globalSettings.id, id))
      .returning();
    return setting;
  }

  async deleteGlobalSetting(id: string): Promise<void> {
    await db.delete(globalSettings).where(eq(globalSettings.id, id));
  }

  async getAdminLogs(): Promise<AdminLog[]> {
    const result = await db
      .select()
      .from(adminLogs)
      .orderBy(desc(adminLogs.createdAt))
      .limit(1000); // Limit to latest 1000 logs
    return result;
  }

  async createAdminLog(log: InsertAdminLog): Promise<AdminLog> {
    const [newLog] = await db
      .insert(adminLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getAdminStats(): Promise<{ totalUsers: number; activeUsers: number; totalMessages: number; }> {
    const [totalUsersResult] = await db
      .select({ count: count() })
      .from(users);

    const [activeUsersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isActive, true));

    const [totalMessagesResult] = await db
      .select({ count: count() })
      .from(messages);

    return {
      totalUsers: totalUsersResult.count,
      activeUsers: activeUsersResult.count,
      totalMessages: totalMessagesResult.count,
    };
  }
}

export const storage = new DatabaseStorage();
