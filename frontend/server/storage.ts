import { users, agents, messages, type User, type InsertUser, type Agent, type InsertAgent, type Message, type InsertMessage } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllAgents(): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  getAgentByName(name: string): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  
  getAllMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByAgent(agentId: number): Promise<Message[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private agents: Map<number, Agent>;
  private messages: Map<number, Message>;
  private currentUserId: number;
  private currentAgentId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.agents = new Map();
    this.messages = new Map();
    this.currentUserId = 1;
    this.currentAgentId = 1;
    this.currentMessageId = 1;
    
    // Initialize default agents
    this.initializeDefaultAgents();
  }

  private async initializeDefaultAgents() {
    const defaultAgents = [
      {
        name: "Assistant",
        displayName: "Assistant",
        description: "General purpose AI helper",
        color: "from-purple-500 to-blue-600",
        avatar: "A",
        isActive: true,
      },
      {
        name: "Coder",
        displayName: "Coder",
        description: "Programming and development",
        color: "from-green-500 to-emerald-600",
        avatar: "C",
        isActive: true,
      },
      {
        name: "Writer",
        displayName: "Writer",
        description: "Creative writing and content",
        color: "from-orange-500 to-red-600",
        avatar: "W",
        isActive: true,
      },
      {
        name: "Researcher",
        displayName: "Researcher",
        description: "Data analysis and research",
        color: "from-indigo-500 to-purple-600",
        avatar: "R",
        isActive: true,
      },
    ];

    for (const agent of defaultAgents) {
      await this.createAgent(agent);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values()).filter(agent => agent.isActive);
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    return this.agents.get(id);
  }

  async getAgentByName(name: string): Promise<Agent | undefined> {
    return Array.from(this.agents.values()).find(
      (agent) => agent.name.toLowerCase() === name.toLowerCase(),
    );
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const id = this.currentAgentId++;
    const agent: Agent = { ...insertAgent, id };
    this.agents.set(id, agent);
    return agent;
  }

  async getAllMessages(): Promise<Message[]> {
    return Array.from(this.messages.values()).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { 
      ...insertMessage, 
      id, 
      timestamp: new Date() 
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesByAgent(agentId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.agentId === agentId
    );
  }
}

export const storage = new MemStorage();
