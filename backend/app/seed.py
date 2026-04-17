from sqlmodel import Session, select

from app.auth import hash_password
from app.database import engine
from app.models import Product, User

SEED_PRODUCTS = [
    {
        "name": "Aurora Wireless Headphones",
        "description": "Over-ear wireless headphones with active noise cancellation and 40-hour battery life.",
        "price": 199.99,
        "category": "electronics",
        "stock": 25,
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    },
    {
        "name": "Nimbus Smartwatch",
        "description": "Track your fitness, sleep, and notifications with a crisp always-on display.",
        "price": 249.00,
        "category": "electronics",
        "stock": 18,
        "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    },
    {
        "name": "Horizon Leather Backpack",
        "description": "Handcrafted full-grain leather backpack with padded 15\" laptop sleeve.",
        "price": 159.50,
        "category": "accessories",
        "stock": 12,
        "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    },
    {
        "name": "Classic White Sneakers",
        "description": "Minimal leather sneakers that go with everything in your wardrobe.",
        "price": 89.00,
        "category": "fashion",
        "stock": 40,
        "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    },
    {
        "name": "Everyday Denim Jacket",
        "description": "Soft-washed denim jacket with a relaxed fit.",
        "price": 79.00,
        "category": "fashion",
        "stock": 22,
        "image_url": "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80",
    },
    {
        "name": "Ceramic Pour-Over Set",
        "description": "Single-cup ceramic dripper plus server for the perfect morning pour-over.",
        "price": 54.00,
        "category": "home",
        "stock": 30,
        "image_url": "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80",
    },
    {
        "name": "Linen Throw Blanket",
        "description": "Breathable stonewashed linen throw in natural oat.",
        "price": 68.00,
        "category": "home",
        "stock": 17,
        "image_url": "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
    },
    {
        "name": "Daily Brew Coffee Mug",
        "description": "12oz stoneware mug with a matte glaze. Microwave and dishwasher safe.",
        "price": 18.00,
        "category": "home",
        "stock": 60,
        "image_url": "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=80",
    },
    {
        "name": "Trailhead Water Bottle",
        "description": "Insulated stainless steel bottle, keeps drinks cold 24h / hot 12h.",
        "price": 32.00,
        "category": "accessories",
        "stock": 55,
        "image_url": "https://images.unsplash.com/photo-1523362289600-a70b4a0e09aa?auto=format&fit=crop&w=800&q=80",
    },
    {
        "name": "Meridian Sunglasses",
        "description": "Polarized acetate frames with UV400 protection.",
        "price": 129.00,
        "category": "accessories",
        "stock": 20,
        "image_url": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
    },
    {
        "name": "Mechanical Keyboard K2",
        "description": "Hot-swappable 75% mechanical keyboard with RGB backlighting.",
        "price": 149.00,
        "category": "electronics",
        "stock": 14,
        "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    },
    {
        "name": "Minimalist Desk Lamp",
        "description": "Adjustable arm desk lamp with dimmable warm LED.",
        "price": 64.00,
        "category": "home",
        "stock": 28,
        "image_url": "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80",
    },
]


def seed() -> None:
    with Session(engine) as session:
        # Seed admin user
        admin = session.exec(select(User).where(User.email == "admin@shop.dev")).first()
        if not admin:
            session.add(
                User(
                    email="admin@shop.dev",
                    name="Store Admin",
                    hashed_password=hash_password("admin123"),
                    is_admin=True,
                )
            )
            session.commit()

        # Seed products if none exist
        existing = session.exec(select(Product)).first()
        if existing:
            return
        for data in SEED_PRODUCTS:
            session.add(Product(**data))
        session.commit()
