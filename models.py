from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import List, Optional

class Product(BaseModel):
    id: int
    name: str
    description: str
    price: float = Field(..., gt=0)
    category: str
    image: str
    popular: bool = False

class Category(BaseModel):
    id: str
    name: str

class ContactMessage(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    message: str = Field(..., min_length=10, max_length=1000)
    created_at: Optional[datetime] = None

class CartItem(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)
    price: float

class PurchaseRequest(BaseModel):
    items: List[CartItem]
    total: float = Field(..., gt=0)
    customer_name: str = Field(..., min_length=2, max_length=100)
    customer_email: EmailStr
    customer_phone: Optional[str] = None