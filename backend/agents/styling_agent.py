from typing import Dict, Any
import csv
import os
from .base_agent import BaseAgent

class StylingAgent(BaseAgent):
    """Styling Agent for fashion outfit combinations"""
    
    def __init__(self, api_key: str, csv_path: str = None):
        super().__init__(api_key, "styling")
        self.csv_path = csv_path
    
    def get_system_prompt(self) -> str:
        return """You are a Fashion Styling AI for a D2C company.

Key Guidelines:
- Suggest complete outfit combinations (e.g., shirt + pants + accessories)
- Use CSV data if available, otherwise provide general styling tips
- Keep responses concise, trendy, and engaging
- Include actionable advice (e.g., 'Pair with...', 'Shop now')
- Handle queries about occasion-based styling or trends
- Escalate complex queries to human agents

Response Structure:
- Acknowledge user request
- Suggest 1-2 outfit combinations
- Include next steps (e.g., link to shop or contact support)

Always be helpful, stylish, and align with brand voice."""

    async def process_message(self, message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        try:
            # Analyze intent
            intent = await self._analyze_intent(message)
            
            # Load CSV data if available
            outfits = await self._load_outfits(message, context)
            
            # Generate response
            response = await self.generate_response(message, {
                **context,
                "intent": intent,
                "channel": "styling",
                "outfits": outfits
            })
            
            if response:
                return {
                    "status": "success",
                    "response": response,
                    "intent": intent,
                    "channel": "styling"
                }
            return {
                "status": "transferred",
                "message": "For personalized styling, contact our support team.",
                "channel": "styling"
            }
                
        except Exception as e:
            print(f"Error in Styling Agent: {str(e)}")
            return {
                "status": "error",
                "message": "Sorry, something went wrong. Try again or contact support.",
                "channel": "styling"
            }
    
    async def _analyze_intent(self, message: str) -> Dict[str, Any]:
        try:
            response = self.client.chat.completions.create(
                model="gpt-4.0-mini",
                messages=[
                    {"role": "system", "content": "Analyze this message for styling intent. Return JSON with: intent (occasion, trend, outfit, general), confidence (0-1), urgency (low, medium, high)"},
                    {"role": "user", "content": message}
                ]
            )
            return {
                "intent": "general",
                "confidence": 0.8,
                "urgency": "low"
            }
        except Exception as e:
            print(f"Error analyzing styling intent: {str(e)}")
            return {
                "intent": "general",
                "confidence": 0.5,
                "urgency": "low"
            }
    
    async def _load_outfits(self, message: str, context: Dict[str, Any]) -> list:
        if not self.csv_path or not os.path.exists(self.csv_path):
            return ["Casual Shirt + Jeans + Sneakers", "Blazer + Chinos + Loafers"]
        
        try:
            outfits = []
            with open(self.csv_path, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    if any(keyword.lower() in message.lower() for keyword in row.get('keywords', '').split(',')):
                        outfits.append(row['outfit'])
                    if len(outfits) >= 2:
                        break
            return outfits if outfits else ["Casual Shirt + Jeans + Sneakers", "Blazer + Chinos + Loafers"]
        except Exception as e:
            print(f"Error loading CSV outfits: {str(e)}")
            return ["Casual Shirt + Jeans + Sneakers", "Blazer + Chinos + Loafers"]