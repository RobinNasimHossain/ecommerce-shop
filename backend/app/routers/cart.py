from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.auth import get_current_user
from app.database import get_session
from app.models import CartItem, Product, User
from app.schemas import (
    CartItemAdd,
    CartItemRead,
    CartItemUpdate,
    CartRead,
    ProductRead,
)

router = APIRouter(prefix="/api/cart", tags=["cart"])


def _build_cart(session: Session, user_id: int) -> CartRead:
    items = session.exec(select(CartItem).where(CartItem.user_id == user_id)).all()
    result = []
    subtotal = 0.0
    for item in items:
        product = session.get(Product, item.product_id)
        if not product:
            continue
        subtotal += product.price * item.quantity
        result.append(
            CartItemRead(
                id=item.id,
                product_id=item.product_id,
                quantity=item.quantity,
                product=ProductRead.model_validate(product),
            )
        )
    return CartRead(items=result, subtotal=round(subtotal, 2))


@router.get("", response_model=CartRead)
def get_cart(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
) -> CartRead:
    return _build_cart(session, user.id)


@router.post("/items", response_model=CartRead)
def add_to_cart(
    payload: CartItemAdd,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
) -> CartRead:
    product = session.get(Product, payload.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if payload.quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be >= 1")

    existing = session.exec(
        select(CartItem).where(
            CartItem.user_id == user.id,
            CartItem.product_id == payload.product_id,
        )
    ).first()

    if existing:
        existing.quantity += payload.quantity
        session.add(existing)
    else:
        session.add(
            CartItem(
                user_id=user.id,
                product_id=payload.product_id,
                quantity=payload.quantity,
            )
        )
    session.commit()
    return _build_cart(session, user.id)


@router.put("/items/{item_id}", response_model=CartRead)
def update_cart_item(
    item_id: int,
    payload: CartItemUpdate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
) -> CartRead:
    item = session.get(CartItem, item_id)
    if not item or item.user_id != user.id:
        raise HTTPException(status_code=404, detail="Cart item not found")
    if payload.quantity < 1:
        session.delete(item)
    else:
        item.quantity = payload.quantity
        session.add(item)
    session.commit()
    return _build_cart(session, user.id)


@router.delete("/items/{item_id}", response_model=CartRead)
def remove_cart_item(
    item_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
) -> CartRead:
    item = session.get(CartItem, item_id)
    if not item or item.user_id != user.id:
        raise HTTPException(status_code=404, detail="Cart item not found")
    session.delete(item)
    session.commit()
    return _build_cart(session, user.id)


@router.delete("", response_model=CartRead)
def clear_cart(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
) -> CartRead:
    items = session.exec(select(CartItem).where(CartItem.user_id == user.id)).all()
    for item in items:
        session.delete(item)
    session.commit()
    return _build_cart(session, user.id)
