from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime
import json

from models import Product, Category, ContactMessage, CartItem, PurchaseRequest

app = FastAPI(
    title="Sandwich Asere API",
    description="API para el restaurante Sandwich Asere",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sample data for products
PRODUCTS_DATA = [
    # Sándwiches
    {"id": 1, "name": "Sándwich Cubano Clásico", "description": "Pan cubano, jamón, cerdo asado, queso suizo, pepinillos y mostaza", "price": 12000, "category": "sandwiches", "image": "/assets/sandwiches/sandwich.jpg", "popular": True},
    # Combos
    {"id": 2, "name": "Sándwich Cubano Clásico + papas + gaseaas 300ml", "description": "Disfruta de nuestro Sándwich Cubano Clásico preparado con pan cubano fresco, jamón, cerdo asado jugoso, queso suizo derretido, pepinillos crujientes y mostaza. Acompañado de papas fritas doradas y una refrescante gaseosa de 300ml. ¡Un combo completo y lleno de sabor, ideal para calmar el hambre con el auténtico toque cubano!", "price": 15000, "category": "combos", "image": "/assets/combos/combo.jpg", "popular": True},
]

CATEGORIES_DATA = [
    {"id": "sandwiches", "name": "Sándwiches"},
    {"id": "combos", "name": "Combos"}
]

# Serve static files
app.mount("/js", StaticFiles(directory="js"), name="js")
app.mount("/assets", StaticFiles(directory="assets"), name="assets")

# Serve CSS file directly
from fastapi.responses import FileResponse

@app.get("/styles.css")
async def get_styles():
    """Serve the main CSS file"""
    return FileResponse("styles.css", media_type="text/css")

@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Serve the main HTML page"""
    with open("index.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now()}

@app.get("/api/products", response_model=List[Product])
async def get_products(category: Optional[str] = None):
    """Get all products or filter by category"""
    products = [Product(**product) for product in PRODUCTS_DATA]
    
    if category:
        products = [p for p in products if p.category == category]
    
    return products

@app.get("/api/products/{product_id}", response_model=Product)
async def get_product(product_id: int):
    """Get a specific product by ID"""
    product_data = next((p for p in PRODUCTS_DATA if p["id"] == product_id), None)
    
    if not product_data:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return Product(**product_data)

@app.get("/api/categories", response_model=List[Category])
async def get_categories():
    """Get all available categories"""
    return [Category(**category) for category in CATEGORIES_DATA]

@app.post("/api/contact")
async def submit_contact(contact: ContactMessage):
    """Submit a contact message"""
    contact.created_at = datetime.now()
    
    # In a real app, you would save to database or send email
    print(f"New contact message from {contact.name} ({contact.email}): {contact.message}")
    
    return {"status": "success", "message": "Mensaje enviado correctamente"}

@app.post("/api/purchase")
async def process_purchase(purchase: PurchaseRequest):
    """Process a purchase request"""
    # Validate products exist and recalculate total server-side
    server_total = 0.0
    validated_items = []
    
    for item in purchase.items:
        # Find product in server data
        product_data = next((p for p in PRODUCTS_DATA if p["id"] == item.product_id), None)
        if not product_data:
            raise HTTPException(status_code=400, detail=f"Product {item.product_id} not found")
        
        # Validate quantity
        if item.quantity <= 0:
            raise HTTPException(status_code=400, detail=f"Invalid quantity for product {item.product_id}")
        
        # Use server-side price (ignore client price for security)
        server_price = product_data["price"]
        item_total = server_price * item.quantity
        server_total += item_total
        
        validated_items.append({
            "product_id": item.product_id,
            "product_name": product_data["name"],
            "quantity": item.quantity,
            "unit_price": server_price,
            "total_price": item_total
        })
    
    # Validate client total against server-calculated total (allow small floating point differences)
    if abs(server_total - purchase.total) > 0.01:
        raise HTTPException(
            status_code=400, 
            detail=f"Total mismatch. Expected: ${server_total:.2f}, Received: ${purchase.total:.2f}"
        )
    
    # In a real app, you would process payment and save to database
    print(f"New purchase from {purchase.customer_name}: ${server_total:.2f}")
    print(f"Items: {validated_items}")
    
    return {
        "status": "success", 
        "message": "Pedido procesado correctamente", 
        "order_id": f"ASR{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "total": server_total,
        "items": validated_items
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)