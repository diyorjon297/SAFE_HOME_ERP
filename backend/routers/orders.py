from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("")
def get_orders(db: Session = Depends(get_db)):
    rows = db.execute(text("""
        SELECT
            id,
            customer_id,
            customer_name,
            phone,
            object_name,
            title,
            description,
            status,
            priority,
            responsible,
            amount,
            paid,
            currency,
            due_date,
            created_at,
            updated_at
        FROM orders
        ORDER BY id DESC
    """)).mappings().all()

    return [dict(row) for row in rows]


@router.post("")
def create_order(data: dict, db: Session = Depends(get_db)):
    title = str(data.get("title", "")).strip()

    if not title:
        raise HTTPException(status_code=400, detail="Buyurtma nomi kiritilmagan")

    row = db.execute(text("""
        INSERT INTO orders (
            customer_id,
            customer_name,
            phone,
            object_name,
            title,
            description,
            status,
            priority,
            responsible,
            amount,
            paid,
            currency,
            due_date
        )
        VALUES (
            :customer_id,
            :customer_name,
            :phone,
            :object_name,
            :title,
            :description,
            :status,
            :priority,
            :responsible,
            :amount,
            :paid,
            :currency,
            :due_date
        )
        RETURNING *
    """), {
        "customer_id": data.get("customer_id"),
        "customer_name": data.get("customer_name"),
        "phone": data.get("phone"),
        "object_name": data.get("object_name"),
        "title": title,
        "description": data.get("description"),
        "status": data.get("status", "Yangi"),
        "priority": data.get("priority", "Oddiy"),
        "responsible": data.get("responsible"),
        "amount": data.get("amount", 0),
        "paid": data.get("paid", 0),
        "currency": data.get("currency", "UZS"),
        "due_date": data.get("due_date"),
    }).mappings().first()

    db.commit()

    return dict(row)


@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    result = db.execute(
        text("DELETE FROM orders WHERE id = :id"),
        {"id": order_id}
    )

    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi")

    db.commit()

    return {"message": "Buyurtma o'chirildi"}
