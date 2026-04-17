from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.auth import get_current_admin
from app.database import get_session
from app.models import Product, User
from app.schemas import ProductCreate, ProductRead

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=List[ProductRead])
def list_products(
    session: Session = Depends(get_session),
    category: Optional[str] = None,
    q: Optional[str] = Query(default=None),
) -> List[ProductRead]:
    statement = select(Product)
    if category and category != "all":
        statement = statement.where(Product.category == category)
    if q:
        needle = f"%{q.lower()}%"
        statement = statement.where(Product.name.ilike(needle))
    products = session.exec(statement).all()
    return [ProductRead.model_validate(p) for p in products]


@router.get("/categories", response_model=List[str])
def list_categories(session: Session = Depends(get_session)) -> List[str]:
    rows = session.exec(select(Product.category).distinct()).all()
    return sorted({r for r in rows if r})


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int, session: Session = Depends(get_session)) -> ProductRead:
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductRead.model_validate(product)


@router.post("", response_model=ProductRead)
def create_product(
    payload: ProductCreate,
    session: Session = Depends(get_session),
    _: User = Depends(get_current_admin),
) -> ProductRead:
    product = Product(**payload.model_dump())
    session.add(product)
    session.commit()
    session.refresh(product)
    return ProductRead.model_validate(product)


@router.put("/{product_id}", response_model=ProductRead)
def update_product(
    product_id: int,
    payload: ProductCreate,
    session: Session = Depends(get_session),
    _: User = Depends(get_current_admin),
) -> ProductRead:
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for field, value in payload.model_dump().items():
        setattr(product, field, value)
    session.add(product)
    session.commit()
    session.refresh(product)
    return ProductRead.model_validate(product)


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    session: Session = Depends(get_session),
    _: User = Depends(get_current_admin),
) -> dict:
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    session.delete(product)
    session.commit()
    return {"ok": True}
