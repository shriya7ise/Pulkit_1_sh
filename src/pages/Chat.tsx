import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Bot, 
  User, 
  MessageSquare, 
  Search,
  Sparkles,
  Clock,
  Tag,
  Phone,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    quick_replies?: string[];
    source?: string;
  };
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: "online" | "away" | "offline";
  lastMessage: string;
  unreadCount: number;
  tags: string[];
}

// Mock data
const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+1 (555) 123-4567",
    status: "online",
    lastMessage: "Thanks for the help with my order!",
    unreadCount: 0,
    tags: ["VIP", "Repeat Customer"]
  },
  {
    id: "2", 
    name: "Mike Chen",
    email: "mike@example.com",
    status: "away",
    lastMessage: "When will my package arrive?",
    unreadCount: 2,
    tags: ["First Time"]
  },
  {
    id: "3",
    name: "Alex Rivera", 
    phone: "+1 (555) 987-6543",
    status: "offline",
    lastMessage: "I'd like to return this item",
    unreadCount: 1,
    tags: ["Return Request"]
  }
];

const mockMessages: Message[] = [
  {
    id: "1",
    role: "user",
    content: "Hi, I'm having trouble with my recent order. Can you help?",
    timestamp: new Date(Date.now() - 10 * 60 * 1000)
  },
  {
    id: "2", 
    role: "assistant",
    content: "I'd be happy to help you with your order! Let me look that up for you. Can you please provide your order number?",
    timestamp: new Date(Date.now() - 9 * 60 * 1000),
    metadata: {
      quick_replies: ["Check Order Status", "Contact Support", "Return Item"],
      source: "RAG: Order Management KB"
    }
  },
  {
    id: "3",
    role: "user", 
    content: "My order number is #ORD-2024-001234",
    timestamp: new Date(Date.now() - 8 * 60 * 1000)
  },
  {
    id: "4",
    role: "assistant",
    content: "Perfect! I found your order #ORD-2024-001234. It was shipped yesterday and should arrive by tomorrow. You can track it using tracking number TRK789456123. Is there anything specific about the order you need help with?",
    timestamp: new Date(Date.now() - 7 * 60 * 1000),
    metadata: {
      quick_replies: ["Track Package", "Change Address", "Cancel Order"]
    }
  }
];

const quickReplies = [
  "How can I help you today?",
  "Let me check your order status",
  "I'll connect you with a specialist",
  "Would you like to track your package?",
  "Is there anything else I can help with?"
];

export default function Chat() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(mockCustomers[0]);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: newMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant", 
        content: "I understand your question. Let me help you with that. Based on our knowledge base, here's what I can tell you...",
        timestamp: new Date(),
        metadata: {
          quick_replies: ["Tell me more", "That's helpful", "I need different help"],
          source: "RAG: Customer Support KB"
        }
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleQuickReply = (reply: string) => {
    setNewMessage(reply);
  };

  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="h-[calc(100vh-80px)] flex">
        {/* Customer List Sidebar */}
        <div className="w-80 border-r border-border bg-card/30">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
                    selectedCustomer.id === customer.id && "bg-primary/10 border border-primary/20"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background",
                          customer.status === "online" && "bg-success",
                          customer.status === "away" && "bg-warning", 
                          customer.status === "offline" && "bg-muted-foreground"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{customer.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          {customer.email && <Mail className="h-3 w-3 mr-1" />}
                          {customer.phone && <Phone className="h-3 w-3 mr-1" />}
                          {customer.email || customer.phone || "No contact info"}
                        </div>
                      </div>
                    </div>
                    {customer.unreadCount > 0 && (
                      <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {customer.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground truncate mb-2">
                    {customer.lastMessage}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {customer.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-border bg-card/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                    {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedCustomer.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <div className={cn(
                      "h-2 w-2 rounded-full mr-2",
                      selectedCustomer.status === "online" && "bg-success",
                      selectedCustomer.status === "away" && "bg-warning",
                      selectedCustomer.status === "offline" && "bg-muted-foreground"
                    )} />
                    {selectedCustomer.status}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Web Chat
                </Badge>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 chat-scrollbar">
            <div className="p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}>
                  <div className={cn(
                    "max-w-[70%] space-y-2",
                    message.role === "user" ? "items-end" : "items-start"
                  )}>
                    <div className="flex items-end space-x-2">
                      {message.role === "assistant" && (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-chat-assistant text-xs">
                            <Bot className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn(
                        "rounded-lg px-4 py-2 max-w-full",
                        message.role === "user" 
                          ? "bg-chat-user text-primary-foreground" 
                          : "bg-card border border-border"
                      )}>
                        <div className="text-sm">{message.content}</div>
                        {message.metadata?.source && (
                          <div className="text-xs text-muted-foreground mt-1 flex items-center">
                            <Sparkles className="h-3 w-3 mr-1" />
                            {message.metadata.source}
                          </div>
                        )}
                      </div>
                      {message.role === "user" && (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-primary text-xs">
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    <div className={cn(
                      "text-xs text-muted-foreground flex items-center",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}>
                      <Clock className="h-3 w-3 mr-1" />
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                    {message.metadata?.quick_replies && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.metadata.quick_replies.map((reply, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickReply(reply)}
                            className="text-xs"
                          >
                            {reply}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-end space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-chat-assistant text-xs">
                        <Bot className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-card border border-border rounded-lg px-4 py-2">
                      <div className="typing-dots flex space-x-1">
                        <span className="h-2 w-2 bg-muted-foreground rounded-full"></span>
                        <span className="h-2 w-2 bg-muted-foreground rounded-full"></span>
                        <span className="h-2 w-2 bg-muted-foreground rounded-full"></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Replies */}
          <div className="p-4 border-t border-border bg-card/30">
            <div className="flex flex-wrap gap-2 mb-3">
              {quickReplies.map((reply, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickReply(reply)}
                  className="text-xs"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {reply}
                </Button>
              ))}
            </div>

            {/* Message Input */}
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Customer Profile Sidebar */}
        <div className="w-80 border-l border-border bg-card/30">
          <div className="p-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Customer Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Avatar className="h-16 w-16 mx-auto mb-3">
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-lg">
                      {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-medium">{selectedCustomer.name}</h3>
                  <div className="text-sm text-muted-foreground">
                    {selectedCustomer.email || selectedCustomer.phone}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium mb-2">Tags</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedCustomer.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-2">Quick Actions</div>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Send Coupon
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <User className="h-4 w-4 mr-2" />
                        Escalate to Human
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Tag className="h-4 w-4 mr-2" />
                        Start Campaign
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}