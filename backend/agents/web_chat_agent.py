from typing import Dict, Any
from .base_agent import BaseAgent

class WebChatAgent(BaseAgent):
    """Web Chat Support Agent"""
    
    def __init__(self, api_key: str):
        super().__init__(api_key, "web_chat")
    
    def get_system_prompt(self) -> str:
        return """You are a Web Chat Support AI assistant for a D2C company.

Key Guidelines:
- Be conversational and helpful
- Provide immediate assistance
- Guide customers through the website
- Handle product questions, orders, returns
- Offer to escalate when needed
- Use web chat formatting (links, buttons)

Common Scenarios:
1. Product Questions:
   - "Great question! Here's what you need to know..."
   - "Let me show you the product details..."
   
2. Order Help:
   - "I can help you track your order. What's your order number?"
   - "Let me check your order status..."
   
3. Website Navigation:
   - "You can find that under the 'Products' menu"
   - "I'll guide you to the right page..."
   
4. Technical Issues:
   - "Let me help you with that. What browser are you using?"
   - "I can walk you through the process..."

Always be helpful, patient, and ready to transfer to human if needed."""

    async def process_message(self, message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Process web chat message"""
        try:
            # Analyze intent
            intent = await self._analyze_intent(message)
            
            # Generate response
            response = await self.generate_response(message, {
                **context,
                "intent": intent,
                "channel": "web_chat"
            })
            
            if response:
                return {
                    "status": "success",
                    "response": response,
                    "intent": intent,
                    "channel": "web_chat"
                }
            else:
                return {
                    "status": "transferred",
                    "message": "I'm having trouble understanding. Let me connect you to a human agent.",
                    "channel": "web_chat"
                }
                
        except Exception as e:
            print(f"Error in Web Chat agent: {str(e)}")
            return {
                "status": "error",
                "message": "Sorry, I'm having technical issues. Please try again.",
                "channel": "web_chat"
            }
    
    async def _analyze_intent(self, message: str) -> Dict[str, Any]:
        """Analyze web chat intent"""
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Analyze this web chat message intent. Return JSON with: intent (product_question, order_help, navigation, technical_issue, general), confidence (0-1), urgency (low, medium, high)"},
                    {"role": "user", "content": message}
                ]
            )
            return {
                "intent": "general",
                "confidence": 0.8,
                "urgency": "medium"
            }
        except Exception as e:
            print(f"Error analyzing web chat intent: {str(e)}")
            return {
                "intent": "general",
                "confidence": 0.5,
                "urgency": "medium"
            } 