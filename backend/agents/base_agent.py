from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from openai import OpenAI

class BaseAgent(ABC):
    """Base class for all AI agents"""
    
    def __init__(self, api_key: str, channel: str):
        self.client = OpenAI(api_key=api_key)
        self.channel = channel
    
    @abstractmethod
    async def process_message(self, message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Process a message and return response"""
        pass
    
    @abstractmethod
    def get_system_prompt(self) -> str:
        """Get the system prompt for this agent"""
        pass
    
    async def generate_response(self, message: str, context: Dict[str, Any]) -> Optional[str]:
        """Generate a response using OpenAI"""
        try:
            system_prompt = self.get_system_prompt()
            
            # Build conversation history
            conversation_history = ""
            if "conversation_history" in context and context["conversation_history"]:
                history = context["conversation_history"]
                conversation_history = "\n\nConversation History:\n"
                for msg in history:
                    sender = "Customer" if msg["sender_type"] == "customer" else "Assistant"
                    conversation_history += f"{sender}: {msg['content']}\n"
            
            # Create the full prompt with context
            user_prompt = f"Context: {context}\n{conversation_history}\nCurrent Message: {message}"
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error generating response for {self.channel}: {str(e)}")
            return None 