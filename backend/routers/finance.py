from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from datetime import datetime

from database import get_db


router = APIRouter(
    prefix="/finance",
    tags=["Finance"]
)


# =========================================================
# DATABASE TABLES
# =========================================================

def create_finance_tables(db: Session):

    # -----------------------------------------------------
    # MENDAN QARZDORLAR
    # -----------------------------------------------------

    db.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS receivables (
                id SERIAL PRIMARY KEY,
                customer_name VARCHAR(255) NOT NULL,
                title VARCHAR(255),
                amount NUMERIC(15, 2) NOT NULL,
                paid NUMERIC(15, 2) NOT NULL DEFAULT 0,
                currency VARCHAR(10) NOT NULL DEFAULT 'UZS',
                due_date TIMESTAMP NULL,
                note TEXT,
                status VARCHAR(30) NOT NULL DEFAULT 'qarzdor',
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
    )

    # -----------------------------------------------------
    # RECEIVABLE PAYMENT HISTORY
    # -----------------------------------------------------

    db.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS receivable_payments (
                id SERIAL PRIMARY KEY,
                receivable_id INTEGER NOT NULL
                    REFERENCES receivables(id)
                    ON DELETE CASCADE,
                amount NUMERIC(15, 2) NOT NULL,
                currency VARCHAR(10) NOT NULL DEFAULT 'UZS',
                note TEXT,
                payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
    )

    # -----------------------------------------------------
    # KIRIM
    # -----------------------------------------------------

    db.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS finance_income (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                amount NUMERIC(15, 2) NOT NULL,
                currency VARCHAR(10) NOT NULL DEFAULT 'UZS',
                category VARCHAR(100),
                note TEXT,
                income_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
    )

    # -----------------------------------------------------
    # CHIQIM
    # -----------------------------------------------------

    db.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS finance_expenses (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                amount NUMERIC(15, 2) NOT NULL,
                currency VARCHAR(10) NOT NULL DEFAULT 'UZS',
                category VARCHAR(100),
                note TEXT,
                expense_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
    )

    db.commit()


# =========================================================
# SCHEMAS
# =========================================================

class ReceivableCreate(BaseModel):
    customer_name: str
    title: str | None = None
    amount: float
    paid: float = 0
    currency: str = "UZS"
    due_date: datetime | None = None
    note: str | None = None


class ReceivablePayment(BaseModel):
    amount: float
    note: str | None = None


class IncomeCreate(BaseModel):
    title: str
    amount: float
    currency: str = "UZS"
    category: str | None = None
    note: str | None = None
    income_date: datetime | None = None


class ExpenseCreate(BaseModel):
    title: str
    amount: float
    currency: str = "UZS"
    category: str | None = None
    note: str | None = None
    expense_date: datetime | None = None


# =========================================================
# HELPERS
# =========================================================

def validate_currency(currency: str):

    currency = currency.upper()

    if currency not in ["UZS", "USD"]:
        raise HTTPException(
            status_code=400,
            detail="Valyuta faqat UZS yoki USD bo'lishi mumkin"
        )

    return currency


def receivable_to_dict(row):

    amount = float(row["amount"] or 0)
    paid = float(row["paid"] or 0)

    remaining = max(amount - paid, 0)

    status = (
        "tugagan"
        if remaining <= 0
        else "qarzdor"
    )

    return {
        "id": row["id"],
        "customer_name": row["customer_name"],
        "title": row["title"],
        "amount": amount,
        "paid": paid,
        "remaining": remaining,
        "currency": row["currency"],
        "due_date": row["due_date"],
        "note": row["note"],
        "status": status,
        "created_at": row["created_at"],
    }


# =========================================================
# INITIALIZE TABLES
# =========================================================

@router.get("/init")
def initialize_finance(
    db: Session = Depends(get_db)
):

    create_finance_tables(db)

    return {
        "status": "OK",
        "message": "Moliya jadvallari tayyor"
    }


# =========================================================
# MENDAN QARZDORLAR
# =========================================================

@router.get("/receivables")
def get_receivables(
    db: Session = Depends(get_db)
):

    create_finance_tables(db)

    rows = db.execute(
        text(
            """
            SELECT
                id,
                customer_name,
                title,
                amount,
                paid,
                currency,
                due_date,
                note,
                status,
                created_at
            FROM receivables
            ORDER BY id DESC
            """
        )
    ).mappings().all()

    return [
        receivable_to_dict(row)
        for row in rows
    ]


# =========================================================
# ADD MENDAN QARZDOR
# =========================================================

@router.post("/receivables")
def create_receivable(
    data: ReceivableCreate,
    db: Session = Depends(get_db)
):

    create_finance_tables(db)

    if not data.customer_name.strip():
        raise HTTPException(
            status_code=400,
            detail="Mijoz nomini kiriting"
        )

    if data.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Qarz summasi 0 dan katta bo'lishi kerak"
        )

    if data.paid < 0:
        raise HTTPException(
            status_code=400,
            detail="To'langan summa manfiy bo'lishi mumkin emas"
        )

    if data.paid > data.amount:
        raise HTTPException(
            status_code=400,
            detail="To'langan summa qarzdan katta bo'lishi mumkin emas"
        )

    currency = validate_currency(data.currency)

    remaining = data.amount - data.paid

    status = (
        "tugagan"
        if remaining <= 0
        else "qarzdor"
    )

    row = db.execute(
        text(
            """
            INSERT INTO receivables
            (
                customer_name,
                title,
                amount,
                paid,
                currency,
                due_date,
                note,
                status
            )
            VALUES
            (
                :customer_name,
                :title,
                :amount,
                :paid,
                :currency,
                :due_date,
                :note,
                :status
            )
            RETURNING
                id,
                customer_name,
                title,
                amount,
                paid,
                currency,
                due_date,
                note,
                status,
                created_at
            """
        ),
        {
            "customer_name": data.customer_name.strip(),
            "title": data.title,
            "amount": data.amount,
            "paid": data.paid,
            "currency": currency,
            "due_date": data.due_date,
            "note": data.note,
            "status": status,
        }
    ).mappings().first()

    db.commit()

    return receivable_to_dict(row)


# =========================================================
# ADD PAYMENT TO MENDAN QARZDOR
# =========================================================

@router.post("/receivables/{receivable_id}/payment")
def add_receivable_payment(
    receivable_id: int,
    data: ReceivablePayment,
    db: Session = Depends(get_db)
):

    create_finance_tables(db)

    row = db.execute(
        text(
            """
            SELECT *
            FROM receivables
            WHERE id = :id
            """
        ),
        {
            "id": receivable_id
        }
    ).mappings().first()

    if not row:
        raise HTTPException(
            status_code=404,
            detail="Qarzdor topilmadi"
        )

    if data.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="To'lov summasi 0 dan katta bo'lishi kerak"
        )

    amount = float(row["amount"] or 0)
    paid = float(row["paid"] or 0)

    remaining = amount - paid

    if data.amount > remaining:
        raise HTTPException(
            status_code=400,
            detail="To'lov qoldiq qarzdan katta"
        )

    payment_date = datetime.now()

    db.execute(
        text(
            """
            INSERT INTO receivable_payments
            (
                receivable_id,
                amount,
                currency,
                note,
                payment_date
            )
            VALUES
            (
                :receivable_id,
                :amount,
                :currency,
                :note,
                :payment_date
            )
            """
        ),
        {
            "receivable_id": receivable_id,
            "amount": data.amount,
            "currency": row["currency"],
            "note": data.note,
            "payment_date": payment_date,
        }
    )

    new_paid = paid + data.amount
    new_remaining = amount - new_paid

    new_status = (
        "tugagan"
        if new_remaining <= 0
        else "qarzdor"
    )

    db.execute(
        text(
            """
            UPDATE receivables
            SET
                paid = :paid,
                status = :status
            WHERE id = :id
            """
        ),
        {
            "paid": new_paid,
            "status": new_status,
            "id": receivable_id,
        }
    )

    db.commit()

    updated = db.execute(
        text(
            """
            SELECT *
            FROM receivables
            WHERE id = :id
            """
        ),
        {
            "id": receivable_id
        }
    ).mappings().first()

    return {
        "message": "To'lov qabul qilindi",
        "debt": receivable_to_dict(updated),
        "payment": {
            "amount": data.amount,
            "currency": row["currency"],
            "note": data.note,
            "payment_date": payment_date,
        }
    }


# =========================================================
# PAYMENT HISTORY
# =========================================================

@router.get("/receivables/{receivable_id}/payments")
def get_receivable_payments(
    receivable_id: int,
    db: Session = Depends(get_db)
):

    create_finance_tables(db)

    exists = db.execute(
        text(
            """
            SELECT id
            FROM receivables
            WHERE id = :id
            """
        ),
        {
            "id": receivable_id
        }
    ).first()

    if not exists:
        raise HTTPException(
            status_code=404,
            detail="Qarzdor topilmadi"
        )

    rows = db.execute(
        text(
            """
            SELECT
                id,
                receivable_id,
                amount,
                currency,
                note,
                payment_date
            FROM receivable_payments
            WHERE receivable_id = :id
            ORDER BY payment_date DESC, id DESC
            """
        ),
        {
            "id": receivable_id
        }
    ).mappings().all()

    return [
        {
            "id": row["id"],
            "receivable_id": row["receivable_id"],
            "amount": float(row["amount"]),
            "currency": row["currency"],
            "note": row["note"],
            "payment_date": row["payment_date"],
        }
        for row in rows
    ]


# =========================================================
# DELETE RECEIVABLE
# =========================================================

@router.delete("/receivables/{receivable_id}")
def delete_receivable(
    receivable_id: int,
    db: Session = Depends(get_db)
):

    create_finance_tables(db)

    result = db.execute(
        text(
            """
            DELETE FROM receivables
            WHERE id = :id
            """
        ),
        {
            "id": receivable_id
        }
    )

    if result.rowcount == 0:
        raise HTTPException(
            status_code=404,
            detail="Qarzdor topilmadi"
        )

    db.commit()

    return {
        "message": "Qarzdor o'chirildi",
        "id": receivable_id
    }


# =========================================================
# KIRIM
# =========================================================

@router.get("/income")
def get_income(
    db: Session = Depends(get_db)
):

    create_finance_tables(db)

    rows = db.execute(
        text(
            """
            SELECT
                id,
                title,
                amount,
                currency,
                category,
                note,
                income_date
            FROM finance_income
            ORDER BY income_date DESC, id DESC
            """
        )
    ).mappings().all()

    return [
        {
            "id": row["id"],
            "title": row["title"],
            "amount": float(row["amount"]),
            "currency": row["currency"],
            "category": row["category"],
            "note": row["note"],
            "income_date": row["income_date"],
        }
        for row in rows
    ]


@router.post("/income")
def create_income(
    data: IncomeCreate,
    db: Session = Depends(get_db)
):

    create_finance_tables(db)

    if not data.title.strip():
        raise HTTPException(
            status_code=400,
            detail="Kirim nomini kiriting"
        )

    if data.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Kirim summasi 0 dan katta bo'lishi kerak"
        )

    currency = validate_currency(data.currency)

    income_date = (
        data.income_date
        or datetime.now()
    )

    row = db.execute(
        text(
            """
            INSERT INTO finance_income
            (
                title,
                amount,
                currency,
                category,
                note,
                income_date
            )
            VALUES
            (
                :title,
                :amount,
                :currency,
                :category,
                :note,
                :income_date
            )
            RETURNING
                id,
                title,
                amount,
                currency,
                category,
                note,
                income_date
            """
        ),
        {
            "title": data.title.strip(),
            "amount": data.amount,
            "currency": currency,
            "category": data.category,
            "note": data.note,
            "income_date": income_date,
        }
    ).mappings().first()

    db.commit()

    return {
        "id": row["id"],
        "title": row["title"],
        "amount": float(row["amount"]),
        "currency": row["currency"],
        "category": row["category"],
        "note": row["note"],
        "income_date": row["income_date"],
    }


# =========================================================
# CHIQIM
# =========================================================

@router.get("/expense")
def get_finance_expenses(
    db: Session = Depends(get_db)
):

    create_finance_tables(db)

    rows = db.execute(
        text(
            """
            SELECT
                id,
                title,
                amount,
                currency,
                category,
                note,
                expense_date
            FROM finance_expenses
            ORDER BY expense_date DESC, id DESC
            """
        )
    ).mappings().all()

    return [
        {
            "id": row["id"],
            "title": row["title"],
            "amount": float(row["amount"]),
            "currency": row["currency"],
            "category": row["category"],
            "note": row["note"],
            "expense_date": row["expense_date"],
        }
        for row in rows
    ]


@router.post("/expense")
def create_finance_expense(
    data: ExpenseCreate,
    db: Session = Depends(get_db)
):

    create_finance_tables(db)

    if not data.title.strip():
        raise HTTPException(
            status_code=400,
            detail="Chiqim nomini kiriting"
        )

    if data.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Chiqim summasi 0 dan katta bo'lishi kerak"
        )

    currency = validate_currency(data.currency)

    expense_date = (
        data.expense_date
        or datetime.now()
    )

    row = db.execute(
        text(
            """
            INSERT INTO finance_expenses
            (
                title,
                amount,
                currency,
                category,
                note,
                expense_date
            )
            VALUES
            (
                :title,
                :amount,
                :currency,
                :category,
                :note,
                :expense_date
            )
            RETURNING
                id,
                title,
                amount,
                currency,
                category,
                note,
                expense_date
            """
        ),
        {
            "title": data.title.strip(),
            "amount": data.amount,
            "currency": currency,
            "category": data.category,
            "note": data.note,
            "expense_date": expense_date,
        }
    ).mappings().first()

    db.commit()

    return {
        "id": row["id"],
        "title": row["title"],
        "amount": float(row["amount"]),
        "currency": row["currency"],
        "category": row["category"],
        "note": row["note"],
        "expense_date": row["expense_date"],
    }


# =========================================================
# FINANCE SUMMARY
# =========================================================

@router.get("/summary")
def get_finance_summary(
    db: Session = Depends(get_db)
):

    create_finance_tables(db)

    receivable = db.execute(
        text(
            """
            SELECT
                COUNT(*) AS count,
                COALESCE(
                    SUM(amount - paid),
                    0
                ) AS remaining
            FROM receivables
            WHERE amount > paid
            """
        )
    ).mappings().first()

    income = db.execute(
        text(
            """
            SELECT
                COALESCE(
                    SUM(amount),
                    0
                ) AS total
            FROM finance_income
            WHERE currency = 'UZS'
            """
        )
    ).mappings().first()

    expense = db.execute(
        text(
            """
            SELECT
                COALESCE(
                    SUM(amount),
                    0
                ) AS total
            FROM finance_expenses
            WHERE currency = 'UZS'
            """
        )
    ).mappings().first()

    return {
        "receivables_count": int(
            receivable["count"] or 0
        ),
        "receivables_remaining": float(
            receivable["remaining"] or 0
        ),
        "total_income_uzs": float(
            income["total"] or 0
        ),
        "total_expense_uzs": float(
            expense["total"] or 0
        ),
        "net_balance_uzs": (
            float(income["total"] or 0)
            - float(expense["total"] or 0)
        ),
    }