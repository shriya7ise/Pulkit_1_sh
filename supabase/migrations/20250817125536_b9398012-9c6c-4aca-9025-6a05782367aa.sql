-- Create messages table for chat functionality
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room TEXT NOT NULL DEFAULT 'general',
  customer_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  quick_replies JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table for analytics
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL,
  order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  channel TEXT NOT NULL DEFAULT 'web',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  ts TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rfm_cache table for analytics
CREATE TABLE IF NOT EXISTS public.rfm_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id TEXT NOT NULL UNIQUE,
  r_score INTEGER NOT NULL DEFAULT 1,
  f_score INTEGER NOT NULL DEFAULT 1,
  m_score INTEGER NOT NULL DEFAULT 1,
  recency_days INTEGER NOT NULL DEFAULT 0,
  frequency_count INTEGER NOT NULL DEFAULT 0,
  monetary_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create message_templates table for admin
CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  template TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfm_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your auth requirements)
CREATE POLICY "Allow all operations on messages" ON public.messages FOR ALL USING (true);
CREATE POLICY "Allow all operations on orders" ON public.orders FOR ALL USING (true);
CREATE POLICY "Allow all operations on analytics_events" ON public.analytics_events FOR ALL USING (true);
CREATE POLICY "Allow all operations on rfm_cache" ON public.rfm_cache FOR ALL USING (true);
CREATE POLICY "Allow all operations on message_templates" ON public.message_templates FOR ALL USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rfm_cache_updated_at
  BEFORE UPDATE ON public.rfm_cache
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for testing
INSERT INTO public.customers (customer_id, name, email, phone, segment, tier, total_orders, total_spent, first_order_date, last_order_date) VALUES
('cust_001', 'Sarah Johnson', 'sarah@example.com', '+1-555-123-4567', 'vip', 'gold', 5, 1250.00, now() - interval '6 months', now() - interval '2 days'),
('cust_002', 'Mike Chen', 'mike@example.com', '+1-555-234-5678', 'regular', 'silver', 3, 450.00, now() - interval '3 months', now() - interval '1 week'),
('cust_003', 'Alex Rivera', 'alex@example.com', '+1-555-345-6789', 'new', 'bronze', 1, 89.99, now() - interval '1 month', now() - interval '1 month')
ON CONFLICT (customer_id) DO NOTHING;

INSERT INTO public.orders (order_id, customer_id, order_date, amount, channel, status) VALUES
('ORD-001', 'cust_001', now() - interval '2 days', 299.99, 'web', 'completed'),
('ORD-002', 'cust_001', now() - interval '1 month', 450.00, 'whatsapp', 'completed'),
('ORD-003', 'cust_002', now() - interval '1 week', 150.00, 'email', 'completed'),
('ORD-004', 'cust_003', now() - interval '1 month', 89.99, 'web', 'completed')
ON CONFLICT (order_id) DO NOTHING;

INSERT INTO public.message_templates (name, category, template, variables) VALUES
('greeting', 'general', 'Hello! How can I help you today?', '[]'),
('order_status', 'orders', 'Let me check your order status for you. Could you please provide your order number?', '[]'),
('escalate', 'support', 'I''ll connect you with a human agent who can better assist you.', '[]'),
('fallback', 'general', 'I''m not sure I understand. Could you please rephrase your question?', '[]')
ON CONFLICT (name) DO NOTHING;