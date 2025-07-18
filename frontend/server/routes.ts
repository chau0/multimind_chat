import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema } from "@shared/schema";
import { z } from "zod";
import axios from "axios";
import { createProxyMiddleware } from "http-proxy-middleware";

export async function registerRoutes(app: Express): Promise<Server> {
  // Backend API URL
  const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';
  
  // API Proxy for backend
  app.use('/api/v1', createProxyMiddleware({
    target: BACKEND_API_URL,
    changeOrigin: true,
    timeout: 30000, // 30 second timeout
    proxyTimeout: 30000,
    selfHandleResponse: false, // Let the proxy handle the response
    // Preserve the original headers and body
    preserveHeaderKeyCase: true,
    followRedirects: false,
    // Remove the redundant pathRewrite since we want to keep /api/v1
    onProxyReq: (proxyReq, req, res) => {
      // Log the request
      console.log(`Proxying ${req.method} request to: ${BACKEND_API_URL}${proxyReq.path}`);
      console.log(`Request headers:`, req.headers);

      // Ensure content-type is preserved for POST requests
      if (req.method === 'POST' && req.headers['content-type']) {
        proxyReq.setHeader('content-type', req.headers['content-type']);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      // Log the response
      console.log(`Received response with status: ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Backend service unavailable', error: err.message });
      }
    }
  }));
  
  // Fallback routes for local development/testing
  
  // Get all agents (fallback)
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await storage.getAllAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });

  // Get all messages (fallback)
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getAllMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send a message and get AI response (fallback)
  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      
      // Save user message
      const userMessage = await storage.createMessage(messageData);
      
      // Parse mentions from the message
      const mentions = extractMentions(messageData.content);
      
      // Generate AI responses for each mentioned agent
      const responses = [];
      
      if (mentions.length > 0) {
        for (const mentionedAgent of mentions) {
          const agent = await storage.getAgentByName(mentionedAgent);
          if (agent) {
            // Simulate AI response delay
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
            
            const aiResponse = await generateAIResponse(messageData.content, agent, userMessage);
            const aiMessage = await storage.createMessage({
              content: aiResponse,
              isUser: false,
              agentId: agent.id,
              mentions: [],
            });
            responses.push(aiMessage);
          }
        }
      } else {
        // Default to Assistant if no mentions
        const defaultAgent = await storage.getAgentByName("Assistant");
        if (defaultAgent) {
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
          
          const aiResponse = await generateAIResponse(messageData.content, defaultAgent, userMessage);
          const aiMessage = await storage.createMessage({
            content: aiResponse,
            isUser: false,
            agentId: defaultAgent.id,
            mentions: [],
          });
          responses.push(aiMessage);
        }
      }
      
      res.json({
        userMessage,
        responses,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to send message" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  
  return Array.from(new Set(mentions)); // Remove duplicates
}

async function generateAIResponse(userMessage: string, agent: any, originalMessage: any): Promise<string> {
  // Simulate different agent personalities and responses
  const responses = {
    Assistant: [
      "I'd be happy to help you with that! Let me provide you with a comprehensive response.",
      "That's an interesting question. Here's what I think about it...",
      "I can definitely assist you with this. Let me break it down for you.",
    ],
    Coder: [
      "Here's a technical solution for your problem:\n\n```javascript\n// Sample code implementation\nfunction solution() {\n  return 'This would be actual code';\n}\n```\n\nWould you like me to explain any part of this implementation?",
      "I can help you with that programming challenge. Let me write some code for you.",
      "That's a great coding question! Here's how I would approach it with clean, efficient code.",
    ],
    Writer: [
      "I'll craft some compelling content for you. Here's a well-structured response that addresses your needs.",
      "Let me help you with that writing task. I'll focus on clarity, engagement, and proper structure.",
      "That's a great topic for creative writing! Let me develop that idea for you.",
    ],
    Researcher: [
      "I've analyzed this topic thoroughly. Here are the key findings and insights based on current data.",
      "Let me provide you with comprehensive research on this subject, including relevant statistics and sources.",
      "Based on my analysis, here are the most important points you should consider.",
    ],
  };

  const agentResponses = responses[agent.name as keyof typeof responses] || responses.Assistant;
  const randomResponse = agentResponses[Math.floor(Math.random() * agentResponses.length)];
  
  return randomResponse;
}
