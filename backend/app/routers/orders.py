from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.auth import get_current_user
from app.database import get_session
from app.models import CartItem, Order, OrderItem, Product, User
from app.schemas import OrderItemRead, OrderRead, ShippingInfo

router = APIRouter(prefix="/api/orders", tags=["orders"])


def _serialize_order(session: Session, order: Order) -> OrderRead:
    items = session.exec(select(OrderItem).where(OrderItem.order_id == order.id)).all()
    return OrderRead(
        id=order.id,
        total=order.total,
        status=order.status,
        created_at=order.created_at,
        shipping_name=order.shipping_name,
        shipping_address=order.shipping_address,
        shipping_city=order.shipping_city,
        shipping_zip=order.shipping_zip,
        shipping_country=order.shipping_country,
        items=[OrderItemRead.model_validate(i) for i in items],
    )


@router.post("/checkout", response_model=OrderRead)
def checkout(
    shipping: ShippingInfo,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
) -> OrderRead:
    cart_items = session.exec(select(CartItem).where(CartItem.user_id == user.id)).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total = 0.0
    order_items_data = []
    for item in cart_items:
        product = session.get(Product, item.product_id)
        if not product:
            continue
        line_total = product.price * item.quantity
        total += line_total
        order_items_data.append(
            {
                "product_id": product.id,
                "product_name": product.name,
                "product_image": product.image_url,
                "quantity": item.quantity,
                "price": product.price,
            }
        )

    if not order_items_data:
        raise HTTPException(status_code=400, detail="Cart is empty")

    order = Order(
        user_id=user.id,
        total=round(total, 2),
        status="paid",
        **shipping.model_dump(),
    )
    session.add(order)
    session.commit()
    session.refresh(order)

    for data in order_items_data:
        session.add(OrderItem(order_id=order.id, **data))

    for item in cart_items:
        session.delete(item)

    session.commit()
    return _serialize_order(session, order)


@router.get("", response_model=List[OrderRead])
def list_orders(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
) -> List[OrderRead]:
    orders = session.exec(
        select(Order).where(Order.user_id == user.id).order_by(Order.created_at.desc())
    ).all()
    return [_serialize_order(session, o) for o in orders]


@router.get("/{order_id}", response_model=OrderRead)
def get_order(
    order_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
) -> OrderRead:
    order = session.get(Order, order_id)
    if not order or order.user_id != user.id:
        raise HTTPException(status_code=404, detail="Order not found")
    return _serialize_order(session, order)
