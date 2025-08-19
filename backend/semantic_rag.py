import os
import logging
import asyncio
import json
import re
import csv
from typing import List, Dict, Optional
from dotenv import load_dotenv
from sentence_transformers import CrossEncoder
from fuzzywuzzy import process, fuzz
import google.generativeai as genai

# ==== Logging Setup ====
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("SemanticRAG")

# ==== Environment Variables ====
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not set")

genai.configure(api_key=GOOGLE_API_KEY)

# ==== Clients ====
cross_encoder = CrossEncoder(os.getenv("RERANKER_MODEL", "BAAI/bge-reranker-base"))

# ==== Load Catalog from CSV or Default ====
def load_catalog(csv_path: Optional[str] = None) -> List[Dict]:
    if csv_path and os.path.exists(csv_path):
        try:
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                catalog = [
                    {
                        "name": row.get("name", "").strip(),
                        "category": row.get("category", "").strip(),
                        "price": float(row.get("price", 0.0)),
                        "fabric": row.get("fabric", "").strip(),
                        "description": row.get("description", "").strip(),
                        "link": row.get("link", "").strip()
                    } for row in reader if row.get("name")
                ]
                logger.info(f"Loaded {len(catalog)} items from CSV: {csv_path}")
                return catalog
        except Exception as e:
            logger.error(f"Failed to load CSV: {e}")
            return []
    
    return json.loads(os.getenv("CATALOG", """[
        {"name": "CLASSIC JACKET", "category": "Jacket", "price": 2999, "fabric": "wool blend", "description": "Versatile jacket for trendy looks.", "link": "https://example.com/products/classic-jacket"},
        {"name": "SLIM FIT PANTS", "category": "Bottoms", "price": 2499, "fabric": "cotton", "description": "Modern slim-fit pants.", "link": "https://example.com/products/slim-pants"},
        {"name": "CASUAL SHIRT", "category": "Shirt", "price": 1999, "fabric": "cotton", "description": "Relaxed unisex shirt.", "link": "https://example.com/products/casual-shirt"},
        {"name": "GRAPHIC TEE", "category": "T-Shirt", "price": 1499, "fabric": "jersey", "description": "Bold graphic t-shirt.", "link": "https://example.com/products/graphic-tee"},
        {"name": "COZY HOODIE", "category": "Hoodie", "price": 3499, "fabric": "fleece", "description": "Comfortable oversized hoodie.", "link": "https://example.com/products/cozy-hoodie"}
    ]"""))

# ==== Category and Material Configuration ====
CATEGORY_MAPPING = json.loads(os.getenv("CATEGORY_MAPPING", """{
    "tshirt": "T-Shirt", "t-shirt": "T-Shirt", "tee": "T-Shirt", "tees": "T-Shirt",
    "shirt": "Shirt", "shirts": "Shirt", "button-up": "Shirt", "button-down": "Shirt",
    "hoodie": "Hoodie", "hoodies": "Hoodie", "sweatshirt": "Hoodie",
    "jacket": "Jacket", "jackets": "Jacket", "coat": "Jacket", "blazer": "Jacket",
    "bottoms": "Bottoms", "jeans": "Bottoms", "pants": "Bottoms", "trousers": "Bottoms",
    "corset": "Corset", "corsets": "Corset", "bustier": "Corset",
    "bodysuit": "Bodysuit", "bodysuits": "Bodysuit",
    "clothes": "clothing", "clothing": "clothing", "outfit": "clothing"
}"""))

KNOWN_MATERIALS = json.loads(os.getenv("KNOWN_MATERIALS", """[
    "denim", "cotton", "leather", "wool", "suede", "fleece", "spandex", "mesh",
    "polyester", "jersey", "flannel", "linen", "satin", "lycra", "modal", "terry"
]"""))

CLOTHING_KEYWORDS = list(CATEGORY_MAPPING.keys()) + KNOWN_MATERIALS + ['clothing', 'wear', 'outfit', 'style', 'fashion', 'garment', 'apparel']

# ==== Fuzzy Matcher ====
def fuzzy_match(term: str, choices: List[str], threshold: int = 80) -> Optional[str]:
    if not choices:
        return None
    result, score = process.extractOne(term, choices, scorer=fuzz.token_sort_ratio)
    return result if score >= threshold else None

# ==== Extract Filters ====
async def extract_filters(query: str) -> Dict:
    query_lower = query.lower()
    filters = {}

    # Price extraction
    price_patterns = [
        r'budget\s*(?:is|:)?\s*₹?(\d+)', r'price\s*(?:is|:)?\s*₹?(\d+)', 
        r'under\s*₹?(\d+)', r'below\s*₹?(\d+)', r'less than\s*₹?(\d+)', 
        r'max(?:imum)?\s*₹?(\d+)', r'₹(\d+)', r'rs\.?\s*(\d+)'
    ]
    for pattern in price_patterns:
        if match := re.search(pattern, query_lower):
            filters['max_price'] = float(match.group(1))
            break

    # Category extraction
    for word in query_lower.split():
        if word in CATEGORY_MAPPING:
            filters['category'] = CATEGORY_MAPPING[word]
            break
        if match := fuzzy_match(word.strip('s'), list(CATEGORY_MAPPING.keys()), threshold=80):
            filters['category'] = CATEGORY_MAPPING[match]
            break

    # Material extraction
    if "jeans" in query_lower or "denim" in query_lower:
        filters['material'] = "denim"
    else:
        for word in query_lower.split():
            if match := fuzzy_match(word, KNOWN_MATERIALS, threshold=80):
                filters['material'] = match
                break

    # Contextual fixes
    if 'denim' in filters.get('material', '') and ('jacket' in query_lower or 'coat' in query_lower) and not filters.get('category'):
        filters['category'] = 'Jacket'
    if 'leather' in filters.get('material', '') and ('jacket' in query_lower or 'coat' in query_lower) and not filters.get('category'):
        filters['category'] = 'Jacket'

    logger.info(f"Extracted filters: {filters}")
    return filters

# ==== Rewrite Query ====
async def rewrite_query(query: str) -> str:
    prompt = f"""
    Rewrite the fashion query to be short and semantically rich, including category, material, and price if mentioned.
    Emphasize 'denim' for 'jeans'. For general queries (e.g., 'clothes'), use 'clothing, new arrivals, fashion items'.
    Examples:
    - 'jeans under 3000' -> 'denim jeans, blue pants, under 3000'
    - 'jackets' -> 'jacket, outerwear, fashion jackets'
    - 'clothes' -> 'clothing, new arrivals, fashion items'
    Query: "{query}"
    """
    for attempt in range(3):
        try:
            model = genai.GenerativeModel(os.getenv("MODEL", "gemini-1.5-pro"))
            response = await asyncio.to_thread(model.generate_content, prompt)
            return response.text.strip()
        except Exception as e:
            logger.warning(f"Query rewrite failed on attempt {attempt + 1}: {e}")
            if attempt == 2:
                return query

# ==== Catalog Search ====
def search_catalog(query: str, catalog: List[Dict], filters: Dict) -> List[Dict]:
    results = []
    query_lower = query.lower()
    
    for item in catalog:
        score = 0.0
        if fuzzy_match(query_lower, [item['name'].lower(), item['category'].lower(), item['description'].lower()], threshold=85):
            score += 0.5
        if filters.get('category') and item['category'].lower() == filters['category'].lower():
            score += 0.3
        if filters.get('material') and fuzzy_match(filters['material'].lower(), [item['fabric'].lower()], threshold=80):
            score += 0.2
        if filters.get('max_price'):
            try:
                if float(item['price']) <= filters['max_price']:
                    score += 0.1
                else:
                    score *= 0.5
            except ValueError:
                score *= 0.8
        
        if score > 0:
            item_copy = item.copy()
            item_copy['score'] = score
            results.append(item_copy)
    
    return sorted(results, key=lambda x: x['score'], reverse=True)[:10]

# ==== Fallback LLM Recommendations ====
async def generate_fallback_recommendations(query: str, catalog: List[Dict]) -> List[Dict]:
    prompt = f"""
    Fashion expert with trendy tone. For query "{query}", suggest 3 clothing items for a cohesive outfit.
    Catalog: {json.dumps(catalog, indent=2)}
    Return JSON: [{{"name": str, "category": str, "description": str, "price": float, "fabric": str, "link": str}}]
    """
    for attempt in range(3):
        try:
            model = genai.GenerativeModel(os.getenv("MODEL", "gemini-1.5-pro"))
            response = await asyncio.to_thread(model.generate_content, prompt)
            return json.loads(response.text.strip().replace("```json", "").replace("```", ""))
        except Exception as e:
            logger.warning(f"Fallback recommendation failed on attempt {attempt + 1}: {e}")
            if attempt == 2:
                return catalog[:3] if catalog else []

# ==== Main Semantic RAG ====
async def semantic_rag(query: str, category: Optional[str] = None, csv_path: Optional[str] = None) -> List[Dict]:
    logger.info(f"Starting RAG for query: '{query}', Category: {category}, CSV: {csv_path}")
    catalog = load_catalog(csv_path)
    filters = await extract_filters(query)
    if category:
        filters['category'] = category

    # Check if fashion query
    is_fashion_query = bool(filters.get('category') or filters.get('material') or filters.get('max_price')) or \
                       any(fuzzy_match(word, CLOTHING_KEYWORDS, 75) for word in query.lower().split())
    
    if not is_fashion_query:
        logger.info("Non-fashion query detected, using LLM fallback.")
        return [{"response": "This query doesn't seem fashion-related. Try asking about clothing, like 'denim jeans' or 'casual shirts'.", "intent": "general"}]

    if catalog:
        # Use catalog search if available
        results = search_catalog(query, catalog, filters)
        if results:
            logger.info(f"Found {len(results)} catalog matches")
            return [{
                "style_name": item["name"],
                "category": item["category"],
                "price": item["price"],
                "fabric": item["fabric"],
                "description": item["description"],
                "product_link": item["link"],
                "cross_encoder_score": item["score"]
            } for item in results]
    
    # Fallback to LLM if no catalog or no matches
    logger.info("No catalog or matches, using LLM fallback")
    results = await generate_fallback_recommendations(query, catalog)
    return [{
        "style_name": item["name"],
        "category": item["category"],
        "price": item["price"],
        "fabric": item["fabric"],
        "description": item["description"],
        "product_link": item["link"],
        "cross_encoder_score": 1.0
    } for item in results]

# ==== CLI Test ====
async def main():
    import argparse
    parser = argparse.ArgumentParser(description="Run Semantic RAG")
    parser.add_argument("query", type=str, nargs='+', help="Fashion query")
    parser.add_argument("--csv", type=str, help="Path to CSV catalog")
    args = parser.parse_args()
    query = " ".join(args.query)
    
    print(f"\n--- RAG Query: '{query}' ---\n")
    results = await semantic_rag(query, csv_path=args.csv)
    print("\n--- Results ---")
    print(json.dumps(results, indent=2))
    print("\n--------------------------\n")

if __name__ == "__main__":
    asyncio.run(main())