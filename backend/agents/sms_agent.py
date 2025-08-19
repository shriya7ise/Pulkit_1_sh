from typing import Dict, Any
from .base_agent import BaseAgent

class SMSAgent(BaseAgent):
    """SMS Notification & Support Agent"""
    
    def __init__(self, api_key: str):
        super().__init__(api_key, "sms")
    
    def get_system_prompt(self) -> str:
        return """You are an SMS Support & Notification AI assistant for a D2C company.

Key Guidelines:
- Keep responses extremely short (max 160 characters)
- Use abbreviations when necessary (u=you, 2=to, etc.)
- Be direct and actionable
- Handle order updates, delivery notifications
- Provide quick support responses
- Use SMS-friendly language

Common SMS Types:
1. Order Updates:
   - "Order #1234 shipped! Track: [link]"
   - "Your order is out for delivery today"
   
2. Support Responses:
   - "Hi! For order help, call 1-800-XXX-XXXX"
   - "Track order: [link] | Need help? Reply HELP"
   
3. Marketing:
   - "Flash sale! 50% off ends today. Shop now: [link]"
   - "New arrivals! Check out: [link]"

Always be concise, helpful, and include clear next steps."""

    async def process_message(self, message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Process SMS message"""
        try:
            # Analyze SMS type
            sms_type = await self._classify_sms(message)
            
            # Generate short response
            response = await self.generate_response(message, {
                **context,
                "sms_type": sms_type,
                "channel": "sms",
                "max_length": 160
            })
            
            if response and len(response) <= 160:
                return {
                    "status": "success",
                    "response": response,
                    "sms_type": sms_type,
                    "channel": "sms"
                }
            else:
                return {
                    "status": "transferred",
                    "message": "For detailed help, call 1-800-XXX-XXXX",
                    "channel": "sms"
                }
                
        except Exception as e:
            print(f"Error in SMS agent: {str(e)}")
            return {
                "status": "error",
                "message": "Call 1-800-XXX-XXXX for help",
                "channel": "sms"
            }
    
    async def _classify_sms(self, message: str) -> str:
        """Classify SMS type"""
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Classify this SMS as: order_update, support, marketing, delivery, complaint"},
                    {"role": "user", "content": message}
                ]
            )
            return "support"  # Default for now
        except Exception as e:
            print(f"Error classifying SMS: {str(e)}")
            return "support" 