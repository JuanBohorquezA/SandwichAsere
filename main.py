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
    {"id": 1, "name": "Sándwich Cubano Clásico", "description": "Pan cubano, jamón, cerdo asado, queso suizo, pepinillos y mostaza", "price": 12.99, "category": "sandwiches", "image": "/assets/sandwich-cubano.jpg", "popular": True},
    {"id": 2, "name": "Medianoche", "description": "Pan dulce, jamón, cerdo asado, queso suizo, pepinillos y mostaza", "price": 11.99, "category": "sandwiches", "image": "/assets/medianoche.jpg", "popular": False},
    {"id": 3, "name": "Pan con Lechón", "description": "Pan cubano crujiente con lechón asado, cebolla y mojo", "price": 13.99, "category": "sandwiches", "image": "/assets/pan-lechon.jpg", "popular": True},
    
    # Platos Principales
    {"id": 4, "name": "Ropa Vieja", "description": "Carne de res deshebrada en salsa criolla con arroz y frijoles", "price": 16.99, "category": "platos", "image": "/assets/ropa-vieja.jpg", "popular": True},
    {"id": 5, "name": "Pollo a la Plancha", "description": "Pechuga de pollo marinada a la plancha con mojo y vegetales", "price": 14.99, "category": "platos", "image": "/assets/pollo-plancha.jpg", "popular": False},
    {"id": 6, "name": "Pescado a la Veracruzana", "description": "Filete de pescado fresco en salsa de tomate con aceitunas y alcaparras", "price": 18.99, "category": "platos", "image": "/assets/pescado-veracruz.jpg", "popular": False},
    {"id": 7, "name": "Arroz con Pollo", "description": "Arroz amarillo con pollo, vegetales y especias cubanas", "price": 15.99, "category": "platos", "image": "/assets/arroz-pollo.jpg", "popular": True},
    
    # Bebidas
    {"id": 8, "name": "Café Cubano", "description": "Espresso endulzado al estilo cubano tradicional", "price": 3.99, "category": "bebidas", "image": "/assets/cafe-cubano.jpg", "popular": True},
    {"id": 9, "name": "Mojito Sin Alcohol", "description": "Refrescante bebida con menta, limón y agua con gas", "price": 6.99, "category": "bebidas", "image": "/assets/mojito.jpg", "popular": False},
    {"id": 10, "name": "Guarapo de Caña", "description": "Jugo fresco de caña de azúcar natural", "price": 4.99, "category": "bebidas", "image": "/assets/guarapo.jpg", "popular": False},
    
    # Postres
    {"id": 11, "name": "Flan Cubano", "description": "Postre tradicional de leche condensada con caramelo", "price": 6.99, "category": "postres", "image": "/assets/flan.jpg", "popular": True},
    {"id": 12, "name": "Churros Cubanos", "description": "Churros crujientes con azúcar y canela, servidos calientes", "price": 5.99, "category": "postres", "image": "/assets/churros.jpg", "popular": False},
    {"id": 13, "name": "Helado de Coco", "description": "Cremoso helado artesanal de coco fresco", "price": 4.99, "category": "postres", "image": "/assets/helado-coco.jpg", "popular": False},
]

CATEGORIES_DATA = [
    {"id": "sandwiches", "name": "Sándwiches"},
    {"id": "platos", "name": "Platos Principales"},
    {"id": "bebidas", "name": "Bebidas"},
    {"id": "postres", "name": "Postres"}
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