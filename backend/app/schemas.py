from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    id: int
    email: str
    name: str
    is_admin: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class ProductCreate(BaseModel):
    name: str
    description: str = ""
    price: float
    image_url: str = ""
    category: str = "general"
    stock: int = 0


class ProductRead(BaseModel):
    id: int
    name: str
    description: str
    price: float
    image_url: str
    category: str
    stock: int

    class Config:
        from_attributes = True


class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemRead(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductRead


class CartRead(BaseModel):
    items: List[CartItemRead]
    subtotal: float


class ShippingInfo(BaseModel):
    shipping_name: str
    shipping_address: str
    shipping_city: str
    shipping_zip: str
    shipping_country: str


class OrderItemRead(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_image: str
    quantity: int
    price: float

    class Config:
        from_attributes = True


class OrderRead(BaseModel):
    id: int
    total: float
    status: str
    created_at: datetime
    shipping_name: str
    shipping_address: str
    shipping_city: str
    shipping_zip: str
    shipping_country: str
    items: List[OrderItemRead]
