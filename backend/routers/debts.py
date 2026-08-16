from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from datetime import datetime

from database import get_db

try:
    from models import Debt
except ImportError:
    Debt = None


router = APIRouter(
    prefix="/debts",
    tags=["Debts"]
)


# =========================================================
# PAYMENT TABLE
# =========================================================

def create_payment_table(db: Session):
    db.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS debt_payments (
                id SERIAL PRIMARY KEY,
                debt_id INTEGER NOT NULL
                    REFERENCES debts(id)
                    ON DELETE CASCADE,
                amount NUMERIC(15, 2) NOT NULL,
                currency VARCHAR(10) NOT NULL DEFAULT 'UZS',
                note TEXT,
                payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
    )
    db.commit()


# =========================================================
# SCHEMAS
# =========================================================

class DebtCreate(BaseModel):
    creditor: str
    title: str | None = None
    amount: float = 0
    paid: float = 0
    currency: str = "UZS"
    status: str = "qarzdor"
    note: str | None = None
    customer_id: int | None = None


class DebtUpdate(BaseModel):
    creditor: str | None = None
    title: str | None = None
    amount: float | None = None
    paid: float | None = None
    currency: str | None = None
    status: str | None = None
    note: str | None = None
    customer_id: int | None = None


class DebtPayment(BaseModel):
    amount: float
    note: str | None = None


# =========================================================
# HELPER
# =========================================================

def debt_to_dict(debt):

    remaining = (
        float(debt.amount or 0)
        - float(debt.paid or 0)
    )

    status = (
        "tugagan"
        if remaining <= 0
        else "qarzdor"
    )

    return {
        "id": debt.id,
        "creditor": debt.creditor,
        "title": debt.title,
        "amount": float(debt.amount or 0),
        "paid": float(debt.paid or 0),
        "remaining": remaining,
        "currency": debt.currency,
        "status": status,
        "note": debt.note,
        "customer_id": debt.customer_id,
        "created_at": debt.created_at,
    }


# =========================================================
# GET ALL DEBTS
# =========================================================

@router.get("/")
def get_debts(
    db: Session = Depends(get_db)
):

    if Debt is None:
        raise HTTPException(
            status_code=500,
            detail="Debt modeli topilmadi"
        )

    create_payment_table(db)

    debts = (
        db.query(Debt)
        .order_by(Debt.id.desc())
        .all()
    )

    return [
        debt_to_dict(debt)
        for debt in debts
    ]


# =========================================================
# GET ONE DEBT
# =========================================================

@router.get("/{debt_id}")
def get_debt(
    debt_id: int,
    db: Session = Depends(get_db)
):

    if Debt is None:
        raise HTTPException(
            status_code=500,
            detail="Debt modeli topilmadi"
        )

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

    return debt_to_dict(debt)


# =========================================================
# CREATE DEBT
# =========================================================

@router.post("/")
def create_debt(
    debt: DebtCreate,
    db: Session = Depends(get_db)
):

    if Debt is None:
        raise HTTPException(
            status_code=500,
            detail="Debt modeli topilmadi"
        )

    create_payment_table(db)

    if not debt.creditor.strip():
        raise HTTPException(
            status_code=400,
            detail="Kimga qarz ekanini kiriting"
        )

    if debt.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Qarz summasi 0 dan katta bo'lishi kerak"
        )

    if debt.paid < 0:
        raise HTTPException(
            status_code=400,
            detail="To'langan summa manfiy bo'lishi mumkin emas"
        )

    if debt.paid > debt.amount:
        raise HTTPException(
            status_code=400,
            detail="To'langan summa qarzdan katta bo'lishi mumkin emas"
        )

    currency = debt.currency.upper()

    if currency not in ["UZS", "USD"]:
        raise HTTPException(
            status_code=400,
            detail="Valyuta faqat UZS yoki USD bo'lishi mumkin"
        )

    new_debt = Debt(
        creditor=debt.creditor.strip(),
        title=debt.title,
        amount=debt.amount,
        paid=debt.paid,
        currency=currency,
        status=(
            "tugagan"
            if debt.paid >= debt.amount
            else "qarzdor"
        ),
        note=debt.note,
        customer_id=debt.customer_id
    )

    db.add(new_debt)
    db.commit()
    db.refresh(new_debt)

    return debt_to_dict(new_debt)


# =========================================================
# UPDATE DEBT
# =========================================================

@router.put("/{debt_id}")
def update_debt(
    debt_id: int,
    data: DebtUpdate,
    db: Session = Depends(get_db)
):

    if Debt is None:
        raise HTTPException(
            status_code=500,
            detail="Debt modeli topilmadi"
        )

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

    if data.creditor is not None:

        if not data.creditor.strip():
            raise HTTPException(
                status_code=400,
                detail="Kimga qarz ekanini kiriting"
            )

        debt.creditor = data.creditor.strip()

    if data.title is not None:
        debt.title = data.title

    if data.amount is not None:

        if data.amount <= 0:
            raise HTTPException(
                status_code=400,
                detail="Qarz summasi 0 dan katta bo'lishi kerak"
            )

        if data.amount < float(debt.paid or 0):
            raise HTTPException(
                status_code=400,
                detail="Qarz summasi to'langan summadan kichik bo'lishi mumkin emas"
            )

        debt.amount = data.amount

    if data.paid is not None:

        if data.paid < 0:
            raise HTTPException(
                status_code=400,
                detail="To'langan summa manfiy bo'lishi mumkin emas"
            )

        if data.paid > float(debt.amount or 0):
            raise HTTPException(
                status_code=400,
                detail="To'langan summa qarzdan katta bo'lishi mumkin emas"
            )

        debt.paid = data.paid

    if data.currency is not None:

        currency = data.currency.upper()

        if currency not in ["UZS", "USD"]:
            raise HTTPException(
                status_code=400,
                detail="Valyuta faqat UZS yoki USD bo'lishi mumkin"
            )

        debt.currency = currency

    if data.note is not None:
        debt.note = data.note

    if data.customer_id is not None:
        debt.customer_id = data.customer_id

    remaining = (
        float(debt.amount or 0)
        - float(debt.paid or 0)
    )

    debt.status = (
        "tugagan"
        if remaining <= 0
        else "qarzdor"
    )

    db.commit()
    db.refresh(debt)

    return debt_to_dict(debt)


# =========================================================
# ADD PAYMENT
# =========================================================

@router.post("/{debt_id}/payment")
def add_payment(
    debt_id: int,
    payment: DebtPayment,
    db: Session = Depends(get_db)
):

    if Debt is None:
        raise HTTPException(
            status_code=500,
            detail="Debt modeli topilmadi"
        )

    create_payment_table(db)

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

    if payment.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="To'lov summasi 0 dan katta bo'lishi kerak"
        )

    remaining = (
        float(debt.amount or 0)
        - float(debt.paid or 0)
    )

    if payment.amount > remaining:
        raise HTTPException(
            status_code=400,
            detail="To'lov qarz qoldig'idan katta"
        )

    # =====================================================
    # PAYMENT HISTORY
    # =====================================================

    payment_date = datetime.now()

    db.execute(
        text(
            """
            INSERT INTO debt_payments
            (
                debt_id,
                amount,
                currency,
                note,
                payment_date
            )
            VALUES
            (
                :debt_id,
                :amount,
                :currency,
                :note,
                :payment_date
            )
            """
        ),
        {
            "debt_id": debt.id,
            "amount": payment.amount,
            "currency": debt.currency,
            "note": payment.note,
            "payment_date": payment_date,
        }
    )

    # =====================================================
    # UPDATE PAID
    # =====================================================

    debt.paid = (
        float(debt.paid or 0)
        + payment.amount
    )

    new_remaining = (
        float(debt.amount or 0)
        - float(debt.paid or 0)
    )

    debt.status = (
        "tugagan"
        if new_remaining <= 0
        else "qarzdor"
    )

    db.commit()
    db.refresh(debt)

    return {
        "message": "To'lov qabul qilindi",
        "debt": debt_to_dict(debt),
        "payment": {
            "amount": payment.amount,
            "currency": debt.currency,
            "note": payment.note,
            "payment_date": payment_date,
        }
    }


# =========================================================
# PAYMENT HISTORY
# =========================================================

@router.get("/{debt_id}/payments")
def get_payment_history(
    debt_id: int,
    db: Session = Depends(get_db)
):

    if Debt is None:
        raise HTTPException(
            status_code=500,
            detail="Debt modeli topilmadi"
        )

    create_payment_table(db)

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

    rows = db.execute(
        text(
            """
            SELECT
                id,
                debt_id,
                amount,
                currency,
                note,
                payment_date
            FROM debt_payments
            WHERE debt_id = :debt_id
            ORDER BY payment_date DESC, id DESC
            """
        ),
        {
            "debt_id": debt_id
        }
    ).mappings().all()

    result = []

    for row in rows:

        result.append(
            {
                "id": row["id"],
                "debt_id": row["debt_id"],
                "amount": float(row["amount"]),
                "currency": row["currency"],
                "note": row["note"],
                "payment_date": row["payment_date"],
            }
        )

    return result


# =========================================================
# DELETE DEBT
# =========================================================

@router.delete("/{debt_id}")
def delete_debt(
    debt_id: int,
    db: Session = Depends(get_db)
):

    if Debt is None:
        raise HTTPException(
            status_code=500,
            detail="Debt modeli topilmadi"
        )

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