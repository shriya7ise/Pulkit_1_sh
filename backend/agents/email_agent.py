from typing import Dict, Any
from .base_agent import BaseAgent

class EmailAgent(BaseAgent):
    """Email Support & Marketing Agent"""
    
    def __init__(self, api_key: str):
        super().__init__(api_key, "email")
    
    def get_system_prompt(self) -> str:
        return """You are an Email Support & Marketing AI assistant for a D2C company.

Key Guidelines:
- Write professional, detailed responses (can be longer than chat)
- Use proper email formatting and structure
- Include relevant links and next steps
- Handle both support and marketing emails
- Be thorough but concise
- Use appropriate subject lines and signatures

Email Types:
1. Support Emails:
   - Order issues, returns, complaints
   - Technical problems, account issues
   - Product questions, sizing help
   
2. Marketing Emails:
   - Abandoned cart recovery
   - Product recommendations
   - Sale announcements
   - Newsletter content

Response Structure:
- Greeting with customer name
- Acknowledge the issue/question
- Provide detailed solution/answer
- Include relevant links or next steps
- Professional closing
- Company signature

Always maintain brand voice and be helpful."""

    async def process_message(self, message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Process email message"""
        try:
            # Determine email type
            email_type = await self._classify_email(message)
            
            # Generate appropriate response
            response = await self.generate_response(message, {
                **context,
                "email_type": email_type,
                "channel": "email"
            })
            
            if response:
                return {
                    "status": "success",
                    "response": response,
                    "email_type": email_type,
                    "subject": await self._generate_subject(email_type, message),
                    "channel": "email"
                }
            else:
                return {
                    "status": "transferred",
                    "message": "This email requires human attention. I'll forward it to our support team.",
                    "channel": "email"
                }
                
        except Exception as e:
            print(f"Error in Email agent: {str(e)}")
            return {
                "status": "error",
                "message": "Sorry, I'm having technical issues. Please try again.",
                "channel": "email"
            }
    
    async def _classify_email(self, message: str) -> str:
        """Classify email type"""
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Classify this email as: support, marketing, complaint, order_issue, return_request, general"},
                    {"role": "user", "content": message}
                ]
            )
            return "support"  # Default for now
        except Exception as e:
            print(f"Error classifying email: {str(e)}")
            return "support"
    
    async def _generate_subject(self, email_type: str, message: str) -> str:
        """Generate email subject line"""
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Generate a professional email subject line for this message. Keep it under 50 characters."},
                    {"role": "user", "content": f"Email type: {email_type}\nMessage: {message[:100]}..."}
                ]
            )
            return "Re: Your inquiry"  # Default for now
        except Exception as e:
            print(f"Error generating subject: {str(e)}")
            return "Re: Your inquiry" 