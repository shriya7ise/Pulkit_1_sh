from typing import Dict, Any
import csv
import os
from .base_agent import BaseAgent

class RecommendationAgent(BaseAgent):
    """Recommendation Agent for personalized fashion suggestions"""
    
    def __init__(self, api_key: str, csv_path: str = None):
        super().__init__(api_key, "recommendation")
        self.csv_path = csv_path
    
    def get_system_prompt(self) -> str:
        return """You are a Fashion Recommendation AI for a D2C company.

Key Guidelines:
- Suggest personalized fashion items based on user preferences
- Use CSV data if available, otherwise provide general recommendations
- Keep responses concise, professional, and engaging
- Include product links or call-to-action (e.g., 'Shop now')
- Handle queries about styles, trends, or specific items
- Escalate complex queries to human agents

Response Structure:
- Acknowledge user request
- Suggest 2-3 specific items or styles
- Include next steps (e.g., link to shop or contact support)

Always be helpful, trendy, and align with brand voice."""

    async def process_message(self, message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        try:
            # Analyze intent
            intent = await self._analyze_intent(message)
            
            # Load CSV data if available
            recommendations = await self._load_recommendations(message, context)
            
            # Generate response
            response = await self.generate_response(message, {
                **context,
                "intent": intent,
                "channel": "recommendation",
                "recommendations": recommendations
            })
            
            if response:
                return {
                    "status": "success",
                    "response": response,
                    "intent": intent,
                    "channel": "recommendation"
                }
            return {
                "status": "transferred",
                "message": "For personalized help, contact our support team.",
                "channel": "recommendation"
            }
                
        except Exception as e:
            print(f"Error in Recommendation Agent: {str(e)}")
            return {
                "status": "error",
                "message": "Sorry, something went wrong. Try again or contact support.",
                "channel": "recommendation"
            }
    
    async def _analyze_intent(self, message: str) -> Dict[str, Any]:
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Analyze this message for fashion recommendation intent. Return JSON with: intent (style, product, trend, general), confidence (0-1), urgency (low, medium, high)"},
                    {"role": "user", "content": message}
                ]
            )
            return {
                "intent": "general",
                "confidence": 0.8,
                "urgency": "low"
            }
        except Exception as e:
            print(f"Error analyzing recommendation intent: {str(e)}")
            return {
                "intent": "general",
                "confidence": 0.5,
                "urgency": "low"
            }
    
    async def _load_recommendations(self, message: str, context: Dict[str, Any]) -> list:
        if not self.csv_path or not os.path.exists(self.csv_path):
            return ["Casual Shirt", "Slim Fit Jeans", "Sneakers"]
        
        try:
            recommendations = []
            with open(self.csv_path, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    if any(keyword.lower() in message.lower() for keyword in row.get('keywords', '').split(',')):
                        recommendations.append(row['product'])
                    if len(recommendations) >= 3:
                        break
            return recommendations if recommendations else ["Casual Shirt", "Slim Fit Jeans", "Sneakers"]
        except Exception as e:
            print(f"Error loading CSV recommendations: {str(e)}")
            return ["Casual Shirt", "Slim Fit Jeans", "Sneakers"]