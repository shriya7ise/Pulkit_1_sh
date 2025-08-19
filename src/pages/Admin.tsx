import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Key, 
  Settings, 
  MessageSquare, 
  Database, 
  Webhook, 
  CheckCircle, 
  XCircle, 
  Eye,
  EyeOff,
  Save,
  TestTube,
  Trash2,
  Plus,
  Activity,
  Bell,
  Shield,
  Brain,
  Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface APIKey {
  name: string;
  key: string;
  status: "connected" | "disconnected" | "error";
  lastChecked: Date;
}

interface WebhookLog {
  id: string;
  timestamp: Date;
  source: string;
  method: string;
  endpoint: string;
  status: number;
  payload: string;
}

interface Template {
  id: string;
  name: string;
  category: "greeting" | "order" | "support" | "fallback";
  content: string;
  variables: string[];
  active: boolean;
}

export default function Admin() {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      name: "OpenAI API Key",
      key: "sk-*********************abc123",
      status: "connected",
      lastChecked: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      name: "Twilio Account SID", 
      key: "AC*********************def456",
      status: "connected",
      lastChecked: new Date(Date.now() - 10 * 60 * 1000)
    },
    {
      name: "Twilio Auth Token",
      key: "*********************ghi789",
      status: "error",
      lastChecked: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
      name: "Supabase URL",
      key: "https://*****.supabase.co",
      status: "connected", 
      lastChecked: new Date(Date.now() - 2 * 60 * 1000)
    }
  ]);

  const [webhookLogs] = useState<WebhookLog[]>([
    {
      id: "1",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      source: "Twilio",
      method: "POST",
      endpoint: "/api/v1/channels/whatsapp/webhook",
      status: 200,
      payload: JSON.stringify({ From: "+1234567890", Body: "Hello!", MessageSid: "SM123" })
    },
    {
      id: "2", 
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      source: "Twilio",
      method: "POST", 
      endpoint: "/api/v1/channels/whatsapp/webhook",
      status: 200,
      payload: JSON.stringify({ From: "+1234567890", Body: "Need help with order", MessageSid: "SM124" })
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      source: "Twilio",
      method: "POST",
      endpoint: "/api/v1/channels/whatsapp/webhook", 
      status: 500,
      payload: JSON.stringify({ error: "Authentication failed" })
    }
  ]);

  const [templates, setTemplates] = useState<Template[]>([
    {
      id: "1",
      name: "Welcome Greeting",
      category: "greeting",
      content: "Hi {{name}}! Welcome to our D2C platform. How can I help you today?",
      variables: ["name"],
      active: true
    },
    {
      id: "2",
      name: "Order Status Check",
      category: "order", 
      content: "I can help you check your order status. Please provide your order number (e.g., #ORD-2024-001234).",
      variables: [],
      active: true
    },
    {
      id: "3",
      name: "Human Escalation",
      category: "support",
      content: "I'm connecting you with one of our specialists who can better assist you. Please hold on for a moment.",
      variables: [],
      active: true
    },
    {
      id: "4",
      name: "Fallback Response",
      category: "fallback",
      content: "I apologize, but I didn't understand your request. Could you please rephrase or try asking something else?",
      variables: [],
      active: true
    }
  ]);

  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [keyValue, setKeyValue] = useState("");
  const [newTemplate, setNewTemplate] = useState<Partial<Template>>({});

  const toggleKeyVisibility = (keyName: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyName]: !prev[keyName]
    }));
  };

  const startEditingKey = (keyName: string, currentKey: string) => {
    setEditingKey(keyName);
    setKeyValue(currentKey);
  };

  const saveKey = (keyName: string) => {
    setApiKeys(prev => prev.map(key => 
      key.name === keyName 
        ? { ...key, key: keyValue, status: "connected", lastChecked: new Date() }
        : key
    ));
    setEditingKey(null);
    setKeyValue("");
    toast({
      title: "API Key Updated", 
      description: `${keyName} has been updated successfully.`
    });
  };

  const testConnection = async (keyName: string) => {
    toast({
      title: "Testing Connection",
      description: `Testing ${keyName}...`
    });
    
    // Simulate API test
    setTimeout(() => {
      const success = Math.random() > 0.3;
      setApiKeys(prev => prev.map(key =>
        key.name === keyName
          ? { ...key, status: success ? "connected" : "error", lastChecked: new Date() }
          : key
      ));
      
      toast({
        title: success ? "Connection Successful" : "Connection Failed",
        description: success 
          ? `${keyName} is working correctly.`
          : `Failed to connect with ${keyName}. Please check your credentials.`,
        variant: success ? "default" : "destructive"
      });
    }, 2000);
  };

  const addTemplate = () => {
    if (!newTemplate.name || !newTemplate.content || !newTemplate.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const template: Template = {
      id: Date.now().toString(),
      name: newTemplate.name,
      category: newTemplate.category as Template["category"],
      content: newTemplate.content,
      variables: newTemplate.variables || [],
      active: true
    };

    setTemplates(prev => [...prev, template]);
    setNewTemplate({});
    toast({
      title: "Template Added",
      description: `${template.name} has been created successfully.`
    });
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast({
      title: "Template Deleted",
      description: "Template has been removed successfully."
    });
  };

  const toggleTemplate = (id: string) => {
    setTemplates(prev => prev.map(t =>
      t.id === id ? { ...t, active: !t.active } : t
    ));
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Settings className="h-8 w-8" />
            <span>Admin Settings</span>
          </h1>
          <p className="text-muted-foreground">
            Manage API keys, webhooks, templates, and system configuration
          </p>
        </div>

        <Tabs defaultValue="keys" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="keys">API Keys</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* API Keys */}
          <TabsContent value="keys">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>API Configuration</span>
                </CardTitle>
                <CardDescription>
                  Manage your external service credentials and test connections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div>
                          {apiKey.name.includes("OpenAI") && <Brain className="h-5 w-5 text-primary" />}
                          {apiKey.name.includes("Twilio") && <Smartphone className="h-5 w-5 text-secondary" />}
                          {apiKey.name.includes("Supabase") && <Database className="h-5 w-5 text-analytics" />}
                        </div>
                        <div>
                          <div className="font-medium">{apiKey.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Last checked: {apiKey.lastChecked.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          apiKey.status === "connected" ? "default" :
                          apiKey.status === "error" ? "destructive" : "secondary"
                        }>
                          {apiKey.status === "connected" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {apiKey.status === "error" && <XCircle className="h-3 w-3 mr-1" />}
                          {apiKey.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testConnection(apiKey.name)}
                        >
                          <TestTube className="h-4 w-4 mr-2" />
                          Test
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`key-${apiKey.name}`}>API Key</Label>
                      <div className="flex space-x-2">
                        {editingKey === apiKey.name ? (
                          <>
                            <Input
                              id={`key-${apiKey.name}`}
                              type="text"
                              value={keyValue}
                              onChange={(e) => setKeyValue(e.target.value)}
                              className="flex-1"
                              placeholder="Enter API key..."
                            />
                            <Button onClick={() => saveKey(apiKey.name)}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" onClick={() => setEditingKey(null)}>
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Input
                              id={`key-${apiKey.name}`}
                              type={showKeys[apiKey.name] ? "text" : "password"}
                              value={apiKey.key}
                              readOnly
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              onClick={() => toggleKeyVisibility(apiKey.name)}
                            >
                              {showKeys[apiKey.name] ? 
                                <EyeOff className="h-4 w-4" /> : 
                                <Eye className="h-4 w-4" />
                              }
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => startEditingKey(apiKey.name, apiKey.key)}
                            >
                              Edit
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks */}
          <TabsContent value="webhooks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Webhook className="h-5 w-5" />
                  <span>Webhook Activity</span>
                </CardTitle>
                <CardDescription>
                  Monitor incoming webhook requests and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">WhatsApp Webhook Endpoint</div>
                      <div className="text-sm text-muted-foreground font-mono">
                        https://your-domain.com/api/v1/channels/whatsapp/webhook
                      </div>
                    </div>
                    <Badge variant="default">
                      <Activity className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-3">Recent Requests</h4>
                    <ScrollArea className="h-64 border rounded-lg">
                      <div className="p-4 space-y-3">
                        {webhookLogs.map((log) => (
                          <div key={log.id} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Badge variant={log.status === 200 ? "default" : "destructive"}>
                                  {log.method}
                                </Badge>
                                <span className="text-sm font-medium">{log.source}</span>
                                <span className="text-sm text-muted-foreground">
                                  {log.timestamp.toLocaleTimeString()}
                                </span>
                              </div>
                              <Badge variant={log.status === 200 ? "default" : "destructive"}>
                                {log.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                              {log.endpoint}
                            </div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="mt-2">
                                  View Payload
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Webhook Payload</DialogTitle>
                                  <DialogDescription>
                                    Request payload for {log.source} at {log.timestamp.toLocaleString()}
                                  </DialogDescription>
                                </DialogHeader>
                                <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                                  {JSON.stringify(JSON.parse(log.payload), null, 2)}
                                </pre>
                              </DialogContent>
                            </Dialog>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <MessageSquare className="h-5 w-5" />
                        <span>Message Templates</span>
                      </CardTitle>
                      <CardDescription>
                        Manage canned responses and WhatsApp templates
                      </CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Template
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Template</DialogTitle>
                          <DialogDescription>
                            Add a new message template for automated responses
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="template-name">Template Name</Label>
                            <Input
                              id="template-name"
                              value={newTemplate.name || ""}
                              onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Enter template name..."
                            />
                          </div>
                          <div>
                            <Label htmlFor="template-category">Category</Label>
                            <select
                              id="template-category"
                              className="w-full p-2 border rounded-md"
                              value={newTemplate.category || ""}
                              onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value as Template["category"] }))}
                            >
                              <option value="">Select category...</option>
                              <option value="greeting">Greeting</option>
                              <option value="order">Order</option>
                              <option value="support">Support</option>
                              <option value="fallback">Fallback</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="template-content">Message Content</Label>
                            <Textarea
                              id="template-content"
                              value={newTemplate.content || ""}
                              onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                              placeholder="Enter message content... Use {{variable}} for dynamic content."
                              rows={4}
                            />
                          </div>
                          <Button onClick={addTemplate} className="w-full">
                            Create Template
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {templates.map((template) => (
                      <div key={template.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Switch
                              checked={template.active}
                              onCheckedChange={() => toggleTemplate(template.id)}
                            />
                            <div>
                              <div className="font-medium">{template.name}</div>
                              <Badge variant="outline" className="text-xs">
                                {template.category}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-sm bg-muted p-3 rounded">
                          {template.content}
                        </div>
                        {template.variables.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs text-muted-foreground mb-1">Variables:</div>
                            <div className="flex flex-wrap gap-1">
                              {template.variables.map((variable) => (
                                <Badge key={variable} variant="secondary" className="text-xs">
                                  {variable}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System */}
          <TabsContent value="system">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>System Health</span>
                  </CardTitle>
                  <CardDescription>
                    Monitor system status and performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                      <div className="font-medium">OpenAI</div>
                      <div className="text-sm text-muted-foreground">Connected</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                      <div className="font-medium">Twilio</div>
                      <div className="text-sm text-muted-foreground">Error</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                      <div className="font-medium">Supabase</div>
                      <div className="text-sm text-muted-foreground">Connected</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
                      <div className="font-medium">RAG System</div>
                      <div className="text-sm text-muted-foreground">Active</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                  </CardTitle>
                  <CardDescription>
                    Configure system alerts and notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Webhook Failures</div>
                      <div className="text-sm text-muted-foreground">
                        Get notified when webhook requests fail
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">API Rate Limits</div>
                      <div className="text-sm text-muted-foreground">
                        Alert when approaching rate limits
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">High Chat Volume</div>
                      <div className="text-sm text-muted-foreground">
                        Notify when chat volume exceeds threshold
                      </div>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}