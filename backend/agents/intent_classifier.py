#!/usr/bin/env python3
"""
Intent Classifier for D2C Platform
Classifies customer messages into different intents for proper routing
"""

import os
from typing import Dict, List, Any
from openai import OpenAI

class IntentClassifier:
    def __init__(self, openai_api_key: str):
        """Initialize intent classifier with OpenAI API key"""
        self.client = OpenAI(api_key=openai_api_key)
        
        # Define common intents for D2C businesses
        self.intents = {
            "order_tracking": "Customer wants to track their order status",
            "product_inquiry": "Customer asking about products, features, or pricing",
            "support_request": "Customer needs technical support or help",
            "complaint": "Customer has a complaint or issue",
            "return_refund": "Customer wants to return or get refund",
            "general_inquiry": "General questions about the company or service",
            "spam": "Spam or irrelevant messages",
            "greeting": "Simple greetings or hello messages"
        }
    
    async def classify_intent(self, message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Classify the intent of a customer message"""
        try:
            # Create prompt for intent classification
            prompt = f"""
            Classify the following customer message into one of these intents:
            
            {chr(10).join([f"- {intent}: {description}" for intent, description in self.intents.items()])}
            
            Customer message: "{message}"
            
            Context: {context or 'No additional context'}
            
            Respond with only the intent name (e.g., "order_tracking", "product_inquiry", etc.)
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an intent classification system for a D2C business. Classify customer messages accurately."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=50,
                temperature=0.1
            )
            
            intent = response.choices[0].message.content.strip().lower()
            
            # Validate intent
            if intent not in self.intents:
                intent = "general_inquiry"  # Default fallback
            
            return {
                "intent": intent,
                "confidence": 0.9,  # Placeholder confidence score
                "message": message,
                "context": context
            }
            
        except Exception as e:
            print(f"Error classifying intent: {e}")
            return {
                "intent": "general_inquiry",
                "confidence": 0.0,
                "message": message,
                "context": context,
                "error": str(e)
            }
    
    def get_intent_description(self, intent: str) -> str:
        """Get description for a specific intent"""
        return self.intents.get(intent, "Unknown intent")
    
    def get_all_intents(self) -> Dict[str, str]:
        """Get all available intents"""
        return self.intents.copy()
    
    async def batch_classify(self, messages: List[str]) -> List[Dict[str, Any]]:
        """Classify multiple messages at once"""
        results = []
        for message in messages:
            result = await self.classify_intent(message)
            results.append(result)
        return results 