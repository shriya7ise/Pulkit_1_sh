import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  MessageSquare, 
  BarChart3, 
  Zap, 
  Shield, 
  Smartphone, 
  Brain,
  TrendingUp,
  Users,
  Target
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "AI-Powered Chat",
    description: "Context-aware chatbot with RAG capabilities for both web and WhatsApp",
    badge: "Real-time"
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "RFM analysis, cohort retention, channel performance, and CLV insights",
    badge: "Interactive"
  },
  {
    icon: Smartphone,
    title: "Customer Support",
    description: "Seamless customer interactions across web and mobile",
    badge: "24/7"
  },
  {
    icon: Brain,
    title: "Smart Insights",
    description: "AI-driven customer journey optimization and campaign suggestions",
    badge: "Automated"
  }
];

const metrics = [
  { label: "Customer Engagement", value: "+156%", icon: TrendingUp },
  { label: "Response Time", value: "<2s", icon: Zap },
  { label: "Customer Satisfaction", value: "94%", icon: Users },
  { label: "Conversion Rate", value: "+45%", icon: Target }
];

export default function Index() {
  return (
    <Layout>
      <div className="relative">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-hero py-20 px-6">
          <div className="absolute inset-0 bg-background/10 backdrop-blur-sm" />
          <div className="relative z-10 max-w-6xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <Zap className="h-4 w-4 mr-2" />
              Next-Generation D2C Platform
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary-foreground to-secondary-foreground bg-clip-text text-transparent">
              Conversify
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/80 mb-8 max-w-3xl mx-auto">
              Conversify empowers businesses with AI chatbots and deep analytics to deliver personalized customer experiences that fuel growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="shadow-glow">
                <Link to="/chat">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Start Chatting
                </Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link to="/analytics">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  View Analytics
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Metrics Section */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {metrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <Card key={index} className="text-center">
                    <CardContent className="p-6">
                      <Icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                      <div className="text-3xl font-bold text-primary mb-1">
                        {metric.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {metric.label}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Platform Capabilities</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Everything you need to build meaningful customer relationships and drive business growth
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="group hover:shadow-elegant transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="h-8 w-8 text-primary group-hover:text-analytics transition-colors" />
                        <Badge variant="outline">{feature.badge}</Badge>
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-card/50">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Customer Experience?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of businesses using our platform to deliver exceptional customer experiences
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/chat">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/admin">View Documentation</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}