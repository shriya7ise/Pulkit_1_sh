from typing import Dict, Any
from .base_agent import BaseAgent

class WhatsAppAgent(BaseAgent):
    """WhatsApp Business API Agent"""
    
    def __init__(self, api_key: str):
        super().__init__(api_key, "whatsapp")
    
    def get_system_prompt(self) -> str:
        return """You are a WhatsApp Business AI assistant for a D2C company.

Key Guidelines:
- Keep responses concise (max 2-3 sentences) as WhatsApp has character limits
- Use emojis sparingly but appropriately (👍, ❤️, 📦, 🚚)
- Be friendly and conversational
- Handle order tracking, returns, product questions
- If complex, offer to transfer to human
- Use WhatsApp formatting: *bold*, _italic_, `code`

Common Scenarios:
- Order tracking: "Hi! Let me check your order #1234..."
- Returns: "I'll help you with your return. What's the issue?"
- Product questions: "Great question! Here's what you need to know..."
- Complaints: "I'm sorry to hear that. Let me help resolve this..."

Always be helpful, professional, and ready to escalate if needed."""

    async def process_message(self, message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Process WhatsApp message"""
        try:
            # Analyze intent
            intent = await self._analyze_intent(message)
            
            # Generate response
            response = await self.generate_response(message, {
                **context,
                "intent": intent,
                "channel": "whatsapp"
            })
            
            if response:
                return {
                    "status": "success",
                    "response": response,
                    "intent": intent,
                    "channel": "whatsapp"
                }
            else:
                return {
                    "status": "transferred",
                    "message": "I'm having trouble understanding. Let me connect you to a human agent.",
                    "channel": "whatsapp"
                }
                
        except Exception as e:
            print(f"Error in WhatsApp agent: {str(e)}")
            return {
                "status": "error",
                "message": "Sorry, I'm having technical issues. Please try again.",
                "channel": "whatsapp"
            }
    
    async def _analyze_intent(self, message: str) -> Dict[str, Any]:
        """Analyze WhatsApp message intent"""
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Analyze this WhatsApp message intent. Return JSON with: intent (order_tracking, return, complaint, product_question, general), confidence (0-1), urgency (low, medium, high)"},
                    {"role": "user", "content": message}
                ]
            )
            # Parse response (simplified for now)
            return {
                "intent": "general",
                "confidence": 0.8,
                "urgency": "medium"
            }
        except Exception as e:
            print(f"Error analyzing WhatsApp intent: {str(e)}")
            return {
                "intent": "general",
                "confidence": 0.5,
                "urgency": "medium"
            } 