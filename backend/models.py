# models.py
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    phone_number = Column(String(20), nullable=True)
    preferences = Column(Text, nullable=True)  # JSONB in PostgreSQL
    created_at = Column(DateTime, nullable=False)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False)
    price = Column(Integer, nullable=False)  # Store price in cents/paise
    stock = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, nullable=False)

class ConversationsRecommendations(Base):
    __tablename__ = "conversations_recommendations"
    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(50), nullable=False)  # e.g., 'CONVERSATION', 'MESSAGE', 'RECOMMENDATION'
    conversation_id = Column(Integer, nullable=True)  # Links to conversations
    customer_id = Column(Integer, nullable=True)      # Links to users
    agent_id = Column(Integer, nullable=True)         # Links to agents
    channel = Column(String(50), nullable=True)      # e.g., web, whatsapp
    content = Column(Text, nullable=True)             # Message content
    recommended_products = Column(Text, nullable=True)  # JSONB in PostgreSQL
    keywords_extracted = Column(Text, nullable=True)  # Text array or JSONB in PostgreSQL
    created_at = Column(DateTime, nullable=False)

class RemainingEntities(Base):
    __tablename__ = "remaining_entities"
    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(50), nullable=False)  # e.g., 'CUSTOMER', 'CUSTOMER_TAG', etc.
    customer_id = Column(Integer, nullable=True)      # FK to users
    agent_id = Column(Integer, nullable=True)         # FK to agents
    message_id = Column(Integer, nullable=True)       # FK to messages
    name = Column(String(100), nullable=True)         # Name for CUSTOMERS, AGENTS, INTENTS
    email = Column(String(255), nullable=True)        # Email for CUSTOMERS, EMAIL_DATA
    phone = Column(String(50), nullable=True)         # Phone for CUSTOMERS, SMS_DATA
    tag = Column(String(50), nullable=True)           # Tag for CUSTOMER_TAGS
    intent = Column(String(100), nullable=True)       # Intent for MESSAGE_INTENTS, INTENTS
    template_text = Column(Text, nullable=True)       # Template text for RESPONSE_TEMPLATES
    text = Column(Text, nullable=True)                # Text for QUICK_REPLIES
    created_at = Column(DateTime, nullable=False)