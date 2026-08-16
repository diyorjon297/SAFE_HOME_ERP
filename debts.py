from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from models import Debt


router = APIRouter(
    prefix="/debts",
    tags=["Debts"]
)


# =========================================================
# SCHEMAS
# =========================================================

class DebtCreate(BaseModel):
    creditor: str | None = None
    title: str | None = None
    amount: float
    paid: float = 0
    currency: str = "UZS"
    note: str | None = None
    customer_id: int | None = None


class PaymentCreate(BaseModel):
    amount: float
    note: str | None = None


# =========================================================
# QARZLAR RO'YXATI
# =========================================================

@router.get("/")
def get_debts(db: Session = Depends(get_db)):

    debts = (
        db.query(Debt)
        .order_by(Debt.id.desc())
        .all()
    )

    result = []

    for debt in debts:

        amount = float(debt.amount or 0)
        paid = float(debt.paid or 0)

        remaining = max(amount - paid, 0)

        result.append({
            "id": debt.id,
            "customer_id": debt.customer_id,
            "creditor": debt.creditor,
            "title": debt.title,
            "amount": amount,
            "paid": paid,
            "remaining": remaining,
            "currency": debt.currency or "UZS",
            "status": (
                "tugagan"
                if remaining <= 0
                else "qarzdor"
            ),
            "note": debt.note,
            "created_at": debt.created_at,
        })

    return result


# =========================================================
# YANGI QARZ QO'SHISH
# =========================================================

@router.post("/")
def create_debt(
    data: DebtCreate,
    db: Session = Depends(get_db)
):

    if data.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Qarz summasi 0 dan katta bo'lishi kerak"
        )

    if data.paid < 0:
        raise HTTPException(
            status_code=400,
            detail="To'lov manfiy bo'lishi mumkin emas"
        )

    if data.paid > data.amount:
        raise HTTPException(
            status_code=400,
            detail="To'langan summa qarzdan katta bo'lishi mumkin emas"
        )

    debt = Debt(
        customer_id=data.customer_id,
        creditor=data.creditor,
        title=data.title,
        amount=data.amount,
        paid=data.paid,
        currency=data.currency,
        status=(
            "tugagan"
            if data.paid >= data.amount
            else "qarzdor"
        ),
        note=data.note,
        created_at=datetime.utcnow(),
    )

    db.add(debt)
    db.commit()
    db.refresh(debt)

    return {
        "message": "Qarz muvaffaqiyatli qo'shildi",
        "id": debt.id,
        "creditor": debt.creditor,
        "amount": debt.amount,
        "paid": debt.paid,
        "remaining": max(
            float(debt.amount or 0)
            - float(debt.paid or 0),
            0
        ),
        "currency": debt.currency,
        "status": debt.status,
    }


# =========================================================
# TO'LOV QILISH
# =========================================================

@router.post("/{debt_id}/payment")
def add_payment(
    debt_id: int,
    data: PaymentCreate,
    db: Session = Depends(get_db)
):

    debt = (
        db.query(Debt)
        .filter(Debt.id == debt_id)
        .first()
    )

    if not debt:
        raise HTTPException(
            status_code=404,
            detail="Qarz topilmadi"
        )

    if data.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="To'lov summasi 0 dan katta bo'lishi kerak"
        )

    amount = float(debt.amount or 0)
    paid = float(debt.paid or 0)

    remaining = amount - paid

    if data.amount > remaining:
        raise HTTPException(
            status_code=400,
            detail=f"Qoldiq: {remaining}"
        )

    debt.paid = paid + data.amount

    if debt.paid >= amount:
        debt.status = "tugagan"
    else:
        debt.status = "qarzdor"

    db.commit()
    db.refresh(debt)

    return {
        "message": "To'lov muvaffaqiyatli qabul qilindi",
        "id": debt.id,
        "amount": amount,
        "paid": debt.paid,
        "remaining": max(
            amount - debt.paid,
            0
        ),
        "currency": debt.currency,
        "status": debt.status,
    }


# =========================================================
# TO'LOVLAR TARIXI
# =========================================================

@router.get("/{debt_id}/payments")
def get_payment_history(
    debt_id: int,
    db: Session = Depends(get_db)
):

    debt = (
        db.query(Debt)
        .filter(Debt.id == debt_id)
        .first()
    )

    if not debt:
        raise HTTPException(
            status_code=404,
            detail="Qarz topilmadi"
        )

    # Hozirgi Debt modelida alohida
    # DebtPayment jadvali mavjud emas.
    #
    # Shuning uchun hozircha boshlang'ich
    # to'lovni tarix sifatida qaytaramiz.

    if float(debt.paid or 0) <= 0:
        return []

    return [{
        "id": debt.id,
        "amount": float(debt.paid),
        "currency": debt.currency or "UZS",
        "note": debt.note,
        "payment_date": debt.created_at,
    }]


# =========================================================
# QARZNI O'CHIRISH
# =========================================================

@router.delete("/{debt_id}")
def delete_debt(
    debt_id: int,
    db: Session = Depends(get_db)
):

    debt = (
        db.query(Debt)
        .filter(Debt.id == debt_id)
        .first()
    )

    if not debt:
        raise HTTPException(
            status_code=404,
            detail="Qarz topilmadi"
        )

    db.delete(debt)
    db.commit()

    return {
        "message": "Qarz o'chirildi",
        "id": debt_id
    }