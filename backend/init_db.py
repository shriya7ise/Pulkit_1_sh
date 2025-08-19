# init_db.py - Run this script to initialize and test your Supabase database
import os
from supabase import create_client, Client
from dotenv import load_dotenv
import asyncio

load_dotenv()

async def initialize_supabase():
    """Initialize Supabase client and verify connection"""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not supabase_key:
        raise ValueError("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in environment variables")
    
    supabase: Client = create_client(supabase_url, supabase_key)
    print("🚀 Connecting to Supabase...")
    
    try:
        # Test connection
        response = supabase.table("users").select("id", count=1).execute()
        if response.data:
            print("✅ Supabase connection successful")
        else:
            print("⚠️ No data in users table, proceeding with setup")
    except Exception as e:
        print(f"❌ Error connecting to Supabase: {e}")
        raise
    
    return supabase

async def insert_sample_data(supabase: Client):
    """Insert some sample data for testing"""
    print("\nInserting sample data...")
    try:
        # Sample users
        users = [
            {"email": "john.doe@example.com", "name": "John Doe", "phone_number": "+1234567890", "preferences": '{"theme": "dark", "notifications": true}'},
            {"email": "jane.smith@example.com", "name": "Jane Smith", "phone_number": "+0987654321", "preferences": '{"theme": "light", "notifications": false}'},
        ]
        for user in users:
            supabase.table("users").insert(user).execute()

        # Sample products
        products = [
            {"name": "Smartphone Pro", "category": "Electronics", "price": 79999, "stock": 50},
            {"name": "Wireless Headphones", "category": "Electronics", "price": 15999, "stock": 100},
            {"name": "Cotton T-Shirt", "category": "Clothing", "price": 2999, "stock": 200},
        ]
        for product in products:
            supabase.table("products").insert(product).execute()

        print("✅ Sample data inserted successfully")
    except Exception as e:
        print(f"❌ Error inserting sample data: {e}")
        raise

async def verify_tables(supabase: Client):
    """Verify that tables were created and contain data"""
    print("\nVerifying database setup...")
    try:
        # Check tables
        response = supabase.table("_supabase_migrations").select("name").execute()
        tables = [table["name"] for table in response.data]
        print(f"📊 Tables in database: {tables}")

        # Check users table
        users = supabase.table("users").select("name, email", count="exact").execute()
        print(f"👥 Users in database: {users.count}")

        # Check products table
        products = supabase.table("products").select("name, category, price", count="exact").execute()
        print(f"📦 Products in database: {products.count}")

        # Show sample data
        users_data = supabase.table("users").select("name, email").limit(3).execute()
        print(f"Sample users: {users_data.data}")
        products_data = supabase.table("products").select("name, category, price").limit(3).execute()
        print(f"Sample products: {products_data.data}")

    except Exception as e:
        print(f"❌ Error verifying database: {e}")
        raise

async def main():
    """Main function to set up the Supabase database"""
    print("🚀 Starting Supabase initialization...")
    
    try:
        supabase = await initialize_supabase()
        await insert_sample_data(supabase)
        await verify_tables(supabase)
        print("\n🎉 Supabase initialization completed successfully!")
    except Exception as e:
        print(f"\n💥 Supabase initialization failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())