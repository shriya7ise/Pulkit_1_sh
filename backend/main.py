# main.py
import os
import json
from dotenv import load_dotenv
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from datetime import datetime

load_dotenv()

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
if not supabase_url or not supabase_key:
    raise ValueError("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in environment variables")

supabase: Client = create_client(supabase_url, supabase_key)

@app.on_event("startup")
async def startup_event():
    print("Starting up application...")
    print("Application startup complete!")

# Database dependency
async def get_db():
    yield supabase  # Supabase client is stateless

# Pydantic model
class MessageRequest(BaseModel):
    message: str
    context: dict = {}

# OpenAI agents
openai_key = os.getenv("OPENAI_API_KEY")
if openai_key:
    from .agents.base_agent import BaseAgent
    from .agents.email_agent import EmailAgent
    from .agents.web_chat_agent import WebChatAgent
    from .agents.whatsapp_agent import WhatsAppAgent
    from .agents.sms_agent import SMSAgent
    from .agents.recommendation_agent import RecommendationAgent

    email_agent = EmailAgent(openai_key)
    web_chat_agent = WebChatAgent(openai_key)
    whatsapp_agent = WhatsAppAgent(openai_key)
    sms_agent = SMSAgent(openai_key)
    recommendation_agent = RecommendationAgent(openai_key)
else:
    email_agent = web_chat_agent = whatsapp_agent = sms_agent = recommendation_agent = None

@app.get("/")
async def root():
    return {"message": "Welcome to the D2C Backend API"}

@app.get("/health")
async def health_check(db: Client = Depends(get_db)):
    try:
        response = db.from_("users").select("id").limit(1).execute()
        if response.data is not None:
            tables_resp = db.from_("_supabase_migrations").select("name").execute()
            tables = [table["name"] for table in tables_resp.data] if tables_resp.data else []
            return {"status": "healthy", "database": "connected", "tables": tables}
        return {"status": "unhealthy", "error": "No data retrieved"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

# Helper function
async def get_user_data(db: Client, email: str):
    try:
        response = db.from_("users").select("id, name, phone_number, preferences").eq("email", email).execute()
        if response.data:
            user = response.data[0]
            preferences = json.loads(user.get("preferences")) if user.get("preferences") else {}
            return {
                "id": user["id"],
                "name": user["name"],
                "phone_number": user.get("phone_number"),
                "preferences": preferences
            }
        return {"id": None, "name": "Customer", "phone_number": None, "preferences": {}}
    except Exception as e:
        print(f"Error fetching user data: {e}")
        return {"id": None, "name": "Customer", "phone_number": None, "preferences": {}}

# Process email
@app.post("/process-email/")
async def process_email(request: MessageRequest, db: Client = Depends(get_db)):
    if not email_agent:
        return {"error": "Email agent not initialized"}
    
    user_data = await get_user_data(db, request.context.get("email", "default@example.com"))
    result = await email_agent.process_message(request.message, {**user_data, **request.context})
    return result

# Process web chat
@app.post("/process-web-chat/")
async def process_web_chat(request: MessageRequest, db: Client = Depends(get_db)):
    if not web_chat_agent:
        return {"error": "Web chat agent not initialized"}
    
    user_email = request.context.get("email", "default@example.com")
    user_data = await get_user_data(db, user_email)
    customer_id = user_data["id"]

    try:
        # Save user message
        db.from_("conversations_recommendations").insert({
            "entity_type": "MESSAGE",
            "customer_id": customer_id,
            "channel": "web_chat",
            "content": request.message,
            "created_at": datetime.utcnow().isoformat()
        }).execute()
        
        # Process message
        result = await web_chat_agent.process_message(request.message, {**user_data, **request.context})
        
        # Save AI response
        db.from_("conversations_recommendations").insert({
            "entity_type": "RESPONSE",
            "customer_id": customer_id,
            "channel": "web_chat",
            "content": str(result),
            "created_at": datetime.utcnow().isoformat()
        }).execute()
        
        return result
    except Exception as e:
        print(f"Error saving conversation: {e}")
        return {"error": "Failed to save conversation", "details": str(e)}

# Process WhatsApp
@app.post("/process-whatsapp/")
async def process_whatsapp(request: MessageRequest, db: Client = Depends(get_db)):
    if not whatsapp_agent:
        return {"error": "WhatsApp agent not initialized"}
    
    user_data = await get_user_data(db, request.context.get("email", "default@example.com"))
    result = await whatsapp_agent.process_message(request.message, {**user_data, **request.context})
    return result

# Process SMS
@app.post("/process-sms/")
async def process_sms(request: MessageRequest, db: Client = Depends(get_db)):
    if not sms_agent:
        return {"error": "SMS agent not initialized"}
    
    user_data = await get_user_data(db, request.context.get("email", "default@example.com"))
    result = await sms_agent.process_message(request.message, {**user_data, **request.context})
    return result

# Process recommendations
@app.post("/process-recommendation/")
async def process_recommendation(request: MessageRequest, db: Client = Depends(get_db)):
    if not recommendation_agent:
        return {"error": "Recommendation agent not initialized"}
    
    email = request.context.get("email", "default@example.com")
    user_data = await get_user_data(db, email)
    customer_id = user_data["id"]

    try:
        # Fetch products
        product_response = db.from_("products").select("name, category, price").limit(3).execute()
        products = product_response.data if product_response.data else []

        # Fetch last recommendations
        rec_response = db.from_("conversations_recommendations") \
                         .select("recommended_products, keywords_extracted") \
                         .eq("customer_id", customer_id) \
                         .limit(1).execute()
        rec_data = rec_response.data[0] if rec_response.data else {}
        
        recommended_products = json.loads(rec_data.get("recommended_products", "[]")) if rec_data.get("recommended_products") else []
        keywords_extracted = json.loads(rec_data.get("keywords_extracted", "[]")) if rec_data.get("keywords_extracted") else []

        result = await recommendation_agent.process_message(request.message, {
            "user_name": user_data["name"],
            "phone_number": user_data["phone_number"],
            "preferences": user_data["preferences"],
            "products": products,
            "recommended_products": recommended_products,
            "keywords_extracted": keywords_extracted,
            **request.context
        })
        return result
    except Exception as e:
        print(f"Error in process_recommendation: {e}")
        return {"error": "Failed to process recommendation", "details": str(e)}
