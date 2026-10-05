from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from datetime import datetime, date
from database import get_db
from models import Debt

router = APIRouter(
    prefix="/debts",
    tags=["Debts"]
)


# =========================================================
# DATABASE TABLES
# =========================================================

def create_debt_tables(db: Session):

    # -----------------------------------------------------
    # TO'LOVLAR TARIXI
    # -----------------------------------------------------

    db.execute(
        text("""
            CREATE TABLE IF NOT EXISTS debt_payments (
                id SERIAL PRIMARY KEY,
                debt_id INTEGER NOT NULL,
                amount NUMERIC(18, 2) NOT NULL,
                currency VARCHAR(10) NOT NULL DEFAULT 'UZS',
                note TEXT,
                payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                receipt_name VARCHAR(255),
                receipt_path TEXT,
                receipt_type VARCHAR(100),
                receipt_size INTEGER
            )
        """)
    )

    # Eski debt_payments jadvali bo'lsa, yangi ustunlarni qo'shamiz
    for column_sql in [
        """
        ALTER TABLE debt_payments
        ADD COLUMN IF NOT EXISTS receipt_name VARCHAR(255)
        """,
        """
        ALTER TABLE debt_payments
        ADD COLUMN IF NOT EXISTS receipt_path TEXT
        """,
        """
        ALTER TABLE debt_payments
        ADD COLUMN IF NOT EXISTS receipt_type VARCHAR(100)
        """,
        """
        ALTER TABLE debt_payments
        ADD COLUMN IF NOT EXISTS receipt_size INTEGER
        """
    ]:
        db.execute(text(column_sql))

    # -----------------------------------------------------
    # OYLIK TO'LOV REJASI
    # -----------------------------------------------------

    db.execute(
        text("""
            CREATE TABLE IF NOT EXISTS debt_schedules (
                id SERIAL PRIMARY KEY,
                debt_id INTEGER NOT NULL,
                monthly_amount NUMERIC(18, 2) NOT NULL,
                currency VARCHAR(10) NOT NULL DEFAULT 'UZS',
                start_date DATE,
                end_date DATE,
                due_day INTEGER,
                installments INTEGER,
                interest_rate NUMERIC(8, 3) DEFAULT 0,
                variable_amount BOOLEAN NOT NULL DEFAULT FALSE,
                active BOOLEAN NOT NULL DEFAULT TRUE,
                note TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)
    )

    # -----------------------------------------------------
    # TO'LOV REJASI TARIXI / O'ZGARISHLARI
    # -----------------------------------------------------

    db.execute(
        text("""
            CREATE TABLE IF NOT EXISTS debt_schedule_changes (
                id SERIAL PRIMARY KEY,
                schedule_id INTEGER NOT NULL,
                old_amount NUMERIC(18, 2),
                new_amount NUMERIC(18, 2),
                currency VARCHAR(10),
                reason TEXT,
                changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)
    )

    db.commit()


# =========================================================
# SCHEMAS
# =========================================================

class DebtCreate(BaseModel):
    creditor: str
    title: str | None = None
    amount: float
    paid: float = 0
    currency: str = "UZS"
    due_date: datetime | None = None
    note: str | None = None
    customer_id: int | None = None


class DebtUpdate(BaseModel):
    creditor: str | None = None
    title: str | None = None
    amount: float | None = None
    paid: float | None = None
    currency: str | None = None
    due_date: datetime | None = None
    note: str | None = None
    customer_id: int | None = None


class DebtPayment(BaseModel):
    amount: float
    note: str | None = None
    payment_date: datetime | None = None


class DebtScheduleCreate(BaseModel):
    monthly_amount: float
    currency: str = "UZS"
    start_date: date | None = None
    end_date: date | None = None
    due_day: int | None = None
    installments: int | None = None
    interest_rate: float = 0
    variable_amount: bool = False
    note: str | None = None


class DebtScheduleUpdate(BaseModel):
    monthly_amount: float | None = None
    currency: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    due_day: int | None = None
    installments: int | None = None
    interest_rate: float | None = None
    variable_amount: bool | None = None
    active: bool | None = None
    note: str | None = None
    change_reason: str | None = None


# =========================================================
# HELPERS
# =========================================================

def validate_currency(currency: str):

    currency = (currency or "UZS").upper().strip()

    if currency not in ["UZS", "USD"]:
        raise HTTPException(
            status_code=400,
            detail="Valyuta faqat UZS yoki USD bo'lishi mumkin"
        )

    return currency


def debt_to_dict(debt):

    amount = float(debt.amount or 0)
    paid = float(debt.paid or 0)
    remaining = max(amount - paid, 0)

    return {
        "id": debt.id,
        "creditor": debt.creditor,
        "title": debt.title,
        "amount": amount,
        "paid": paid,
        "remaining": remaining,
        "currency": debt.currency,
        "status": (
            "tugagan"
            if remaining <= 0
            else "qarzdor"
        ),
        "due_date": debt.due_date,
        "note": debt.note,
        "customer_id": debt.customer_id,
        "created_at": debt.created_at
    }


def schedule_to_dict(row):

    if not row:
        return None

    monthly_amount = float(row["monthly_amount"] or 0)

    return {
        "id": row["id"],
        "debt_id": row["debt_id"],
        "monthly_amount": monthly_amount,
        "currency": row["currency"],
        "start_date": row["start_date"],
        "end_date": row["end_date"],
        "due_day": row["due_day"],
        "installments": row["installments"],
        "interest_rate": float(
            row["interest_rate"] or 0
        ),
        "variable_amount": bool(
            row["variable_amount"]
        ),
        "active": bool(row["active"]),
        "note": row["note"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"]
    }


# =========================================================
# GET ALL DEBTS
# =========================================================

@router.get("/")
def get_debts(
    db: Session = Depends(get_db)
):

    create_debt_tables(db)

    debts = (
        db.query(Debt)
        .order_by(Debt.id.desc())
        .all()
    )

    result = []

    for debt in debts:

        item = debt_to_dict(debt)

        schedule = db.execute(
            text("""
                SELECT *
                FROM debt_schedules
                WHERE debt_id = :debt_id
                  AND active = TRUE
                ORDER BY id DESC
                LIMIT 1
            """),
            {
                "debt_id": debt.id
            }
        ).mappings().first()

        item["schedule"] = schedule_to_dict(schedule)

        result.append(item)

    return result


# =========================================================
# GET ONE DEBT
# =========================================================

@router.get("/{debt_id}")
def get_debt(
    debt_id: int,
    db: Session = Depends(get_db)
):

    create_debt_tables(db)

    debt = (
        db.query(Debt)
        .filter(Debt.id == debt_id)
        .first()
    )

    if debt is None:
        raise HTTPException(
            status_code=404,
            detail="Qarz topilmadi"
        )

    result = debt_to_dict(debt)

    schedule = db.execute(
        text("""
            SELECT *
            FROM debt_schedules
            WHERE debt_id = :debt_id
              AND active = TRUE
            ORDER BY id DESC
            LIMIT 1
        """),
        {
            "debt_id": debt_id
        }
    ).mappings().first()

    result["schedule"] = schedule_to_dict(schedule)

    return result


# =========================================================
# CREATE DEBT
# =========================================================

@router.post("/")
def create_debt(
    data: DebtCreate,
    db: Session = Depends(get_db)
):

    create_debt_tables(db)

    if not data.creditor or not data.creditor.strip():
        raise HTTPException(
            status_code=400,
            detail="Kimga qarz ekanini kiriting"
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

    debt = Debt(
        creditor=data.creditor.strip(),
        title=data.title,
        amount=data.amount,
        paid=data.paid,
        currency=currency,
        status=(
            "tugagan"
            if data.paid >= data.amount
            else "qarzdor"
        ),
        due_date=data.due_date,
        note=data.note,
        customer_id=data.customer_id
    )

    db.add(debt)
    db.commit()
    db.refresh(debt)

    # Boshlang'ich to'lov tarixga tushadi
    if data.paid > 0:

        db.execute(
            text("""
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
            """),
            {
                "debt_id": debt.id,
                "amount": data.paid,
                "currency": currency,
                "note": "Boshlang'ich to'lov",
                "payment_date": datetime.now()
            }
        )

        db.commit()

    return debt_to_dict(debt)


# =========================================================
# UPDATE DEBT
# =========================================================

@router.put("/{debt_id}")
def update_debt(
    debt_id: int,
    data: DebtUpdate,
    db: Session = Depends(get_db)
):

    create_debt_tables(db)

    debt = (
        db.query(Debt)
        .filter(Debt.id == debt_id)
        .first()
    )

    if debt is None:
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
        debt.currency = validate_currency(data.currency)

    if data.due_date is not None:
        debt.due_date = data.due_date

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
    data: DebtPayment,
    db: Session = Depends(get_db)
):

    create_debt_tables(db)

    debt = (
        db.query(Debt)
        .filter(Debt.id == debt_id)
        .first()
    )

    if debt is None:
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
            detail="To'lov qarz qoldig'idan katta"
        )

    payment_date = (
        data.payment_date
        or datetime.now()
    )

    new_paid = paid + data.amount

    debt.paid = new_paid

    debt.status = (
        "tugagan"
        if amount - new_paid <= 0
        else "qarzdor"
    )

    result = db.execute(
        text("""
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
            RETURNING id
        """),
        {
            "debt_id": debt.id,
            "amount": data.amount,
            "currency": debt.currency,
            "note": data.note,
            "payment_date": payment_date
        }
    ).first()

    db.commit()
    db.refresh(debt)

    return {
        "message": "To'lov muvaffaqiyatli saqlandi",
        "debt": debt_to_dict(debt),
        "payment": {
            "id": result[0] if result else None,
            "amount": data.amount,
            "currency": debt.currency,
            "note": data.note,
            "payment_date": payment_date
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

    create_debt_tables(db)

    debt = (
        db.query(Debt)
        .filter(Debt.id == debt_id)
        .first()
    )

    if debt is None:
        raise HTTPException(
            status_code=404,
            detail="Qarz topilmadi"
        )

    rows = db.execute(
        text("""
            SELECT
                id,
                debt_id,
                amount,
                currency,
                note,
                payment_date,
                receipt_name,
                receipt_path,
                receipt_type,
                receipt_size
            FROM debt_payments
            WHERE debt_id = :debt_id
            ORDER BY payment_date DESC, id DESC
        """),
        {
            "debt_id": debt_id
        }
    ).mappings().all()

    return [
        {
            "id": row["id"],
            "debt_id": row["debt_id"],
            "amount": float(row["amount"]),
            "currency": row["currency"],
            "note": row["note"],
            "payment_date": row["payment_date"],
            "receipt_name": row["receipt_name"],
            "receipt_path": row["receipt_path"],
            "receipt_type": row["receipt_type"],
            "receipt_size": row["receipt_size"],
            "has_receipt": bool(row["receipt_path"])
        }
        for row in rows
    ]


# =========================================================
# EDIT PAYMENT
# =========================================================

@router.put("/{debt_id}/payments/{payment_id}")
def update_payment(
    debt_id: int,
    payment_id: int,
    data: DebtPayment,
    db: Session = Depends(get_db)
):

    create_debt_tables(db)

    debt = (
        db.query(Debt)
        .filter(Debt.id == debt_id)
        .first()
    )

    if debt is None:
        raise HTTPException(
            status_code=404,
            detail="Qarz topilmadi"
        )

    payment = db.execute(
        text("""
            SELECT *
            FROM debt_payments
            WHERE id = :payment_id
              AND debt_id = :debt_id
        """),
        {
            "payment_id": payment_id,
            "debt_id": debt_id
        }
    ).mappings().first()

    if payment is None:
        raise HTTPException(
            status_code=404,
            detail="To'lov topilmadi"
        )

    if data.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="To'lov summasi 0 dan katta bo'lishi kerak"
        )

    old_amount = float(payment["amount"] or 0)

    new_total_paid = (
        float(debt.paid or 0)
        - old_amount
        + data.amount
    )

    if new_total_paid < 0:
        raise HTTPException(
            status_code=400,
            detail="To'lovni hisoblashda xatolik"
        )

    if new_total_paid > float(debt.amount or 0):
        raise HTTPException(
            status_code=400,
            detail="Yangi to'lov jami qarzdan katta bo'lmoqda"
        )

    new_date = (
        data.payment_date
        or payment["payment_date"]
    )

    db.execute(
        text("""
            UPDATE debt_payments
            SET
                amount = :amount,
                note = :note,
                payment_date = :payment_date
            WHERE id = :payment_id
              AND debt_id = :debt_id
        """),
        {
            "amount": data.amount,
            "note": data.note,
            "payment_date": new_date,
            "payment_id": payment_id,
            "debt_id": debt_id
        }
    )

    debt.paid = new_total_paid

    debt.status = (
        "tugagan"
        if float(debt.amount or 0) - new_total_paid <= 0
        else "qarzdor"
    )

    db.commit()
    db.refresh(debt)

    return {
        "message": "To'lov tahrirlandi",
        "debt": debt_to_dict(debt)
    }


# =========================================================
# DELETE PAYMENT
# =========================================================

@router.delete("/{debt_id}/payments/{payment_id}")
def delete_payment(
    debt_id: int,
    payment_id: int,
    db: Session = Depends(get_db)
):

    create_debt_tables(db)

    debt = (
        db.query(Debt)
        .filter(Debt.id == debt_id)
        .first()
    )

    if debt is None:
        raise HTTPException(
            status_code=404,
            detail="Qarz topilmadi"
        )

    payment = db.execute(
        text("""
            SELECT amount
            FROM debt_payments
            WHERE id = :payment_id
              AND debt_id = :debt_id
        """),
        {
            "payment_id": payment_id,
            "debt_id": debt_id
        }
    ).mappings().first()

    if payment is None:
        raise HTTPException(
            status_code=404,
            detail="To'lov topilmadi"
        )

    payment_amount = float(payment["amount"] or 0)

    new_paid = (
        float(debt.paid or 0)
        - payment_amount
    )

    new_paid = max(new_paid, 0)

    db.execute(
        text("""
            DELETE FROM debt_payments
            WHERE id = :payment_id
              AND debt_id = :debt_id
        """),
        {
            "payment_id": payment_id,
            "debt_id": debt_id
        }
    )

    debt.paid = new_paid

    debt.status = (
        "tugagan"
        if float(debt.amount or 0) - new_paid <= 0
        else "qarzdor"
    )

    db.commit()
    db.refresh(debt)

    return {
        "message": "To'lov o'chirildi",
        "debt": debt_to_dict(debt)
    }


# =========================================================
# CREATE / UPDATE PAYMENT SCHEDULE
# =========================================================

@router.post("/{debt_id}/schedule")
def create_schedule(
    debt_id: int,
    data: DebtScheduleCreate,
    db: Session = Depends(get_db)
):

    create_debt_tables(db)

    debt = (
        db.query(Debt)
        .filter(Debt.id == debt_id)
        .first()
    )

    if debt is None:
        raise HTTPException(
            status_code=404,
            detail="Qarz topilmadi"
        )

    if data.monthly_amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Oylik to'lov 0 dan katta bo'lishi kerak"
        )

    currency = validate_currency(data.currency)

    if data.due_day is not None:
        if data.due_day < 1 or data.due_day > 31:
            raise HTTPException(
                status_code=400,
                detail="To'lov kuni 1 dan 31 gacha bo'lishi kerak"
            )

    # Eski aktiv rejani yopamiz
    db.execute(
        text("""
            UPDATE debt_schedules
            SET active = FALSE,
                updated_at = CURRENT_TIMESTAMP
            WHERE debt_id = :debt_id
              AND active = TRUE
        """),
        {
            "debt_id": debt_id
        }
    )

    row = db.execute(
        text("""
            INSERT INTO debt_schedules
            (
                debt_id,
                monthly_amount,
                currency,
                start_date,
                end_date,
                due_day,
                installments,
                interest_rate,
                variable_amount,
                active,
                note
            )
            VALUES
            (
                :debt_id,
                :monthly_amount,
                :currency,
                :start_date,
                :end_date,
                :due_day,
                :installments,
                :interest_rate,
                :variable_amount,
                TRUE,
                :note
            )
            RETURNING *
        """),
        {
            "debt_id": debt_id,
            "monthly_amount": data.monthly_amount,
            "currency": currency,
            "start_date": data.start_date,
            "end_date": data.end_date,
            "due_day": data.due_day,
            "installments": data.installments,
            "interest_rate": data.interest_rate,
            "variable_amount": data.variable_amount,
            "note": data.note
        }
    ).mappings().first()

    db.commit()

    return schedule_to_dict(row)


@router.put("/{debt_id}/schedule/{schedule_id}")
def update_schedule(
    debt_id: int,
    schedule_id: int,
    data: DebtScheduleUpdate,
    db: Session = Depends(get_db)
):

    create_debt_tables(db)

    schedule = db.execute(
        text("""
            SELECT *
            FROM debt_schedules
            WHERE id = :schedule_id
              AND debt_id = :debt_id
        """),
        {
            "schedule_id": schedule_id,
            "debt_id": debt_id
        }
    ).mappings().first()

    if schedule is None:
        raise HTTPException(
            status_code=404,
            detail="To'lov rejasi topilmadi"
        )

    new_amount = (
        data.monthly_amount
        if data.monthly_amount is not None
        else float(schedule["monthly_amount"])
    )

    if new_amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Oylik to'lov 0 dan katta bo'lishi kerak"
        )

    currency = (
        validate_currency(data.currency)
        if data.currency is not None
        else schedule["currency"]
    )

    # Miqdor o'zgargan bo'lsa tarixga yozamiz
    if (
        data.monthly_amount is not None
        and float(schedule["monthly_amount"]) != new_amount
    ):

        db.execute(
            text("""
                INSERT INTO debt_schedule_changes
                (
                    schedule_id,
                    old_amount,
                    new_amount,
                    currency,
                    reason
                )
                VALUES
                (
                    :schedule_id,
                    :old_amount,
                    :new_amount,
                    :currency,
                    :reason
                )
            """),
            {
                "schedule_id": schedule_id,
                "old_amount": schedule["monthly_amount"],
                "new_amount": new_amount,
                "currency": currency,
                "reason": data.change_reason
            }
        )

    db.execute(
        text("""
            UPDATE debt_schedules
            SET
                monthly_amount = :monthly_amount,
                currency = :currency,
                start_date = :start_date,
                end_date = :end_date,
                due_day = :due_day,
                installments = :installments,
                interest_rate = :interest_rate,
                variable_amount = :variable_amount,
                active = :active,
                note = :note,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = :schedule_id
              AND debt_id = :debt_id
        """),
        {
            "monthly_amount": new_amount,
            "currency": currency,
            "start_date": (
                data.start_date
                if data.start_date is not None
                else schedule["start_date"]
            ),
            "end_date": (
                data.end_date
                if data.end_date is not None
                else schedule["end_date"]
            ),
            "due_day": (
                data.due_day
                if data.due_day is not None
                else schedule["due_day"]
            ),
            "installments": (
                data.installments
                if data.installments is not None
                else schedule["installments"]
            ),
            "interest_rate": (
                data.interest_rate
                if data.interest_rate is not None
                else schedule["interest_rate"]
            ),
            "variable_amount": (
                data.variable_amount
                if data.variable_amount is not None
                else schedule["variable_amount"]
            ),
            "active": (
                data.active
                if data.active is not None
                else schedule["active"]
            ),
            "note": (
                data.note
                if data.note is not None
                else schedule["note"]
            ),
            "schedule_id": schedule_id,
            "debt_id": debt_id
        }
    )

    db.commit()

    updated = db.execute(
        text("""
            SELECT *
            FROM debt_schedules
            WHERE id = :schedule_id
        """),
        {
            "schedule_id": schedule_id
        }
    ).mappings().first()

    return schedule_to_dict(updated)


# =========================================================
# GET SCHEDULE
# =========================================================

@router.get("/{debt_id}/schedule")
def get_schedule(
    debt_id: int,
    db: Session = Depends(get_db)
):

    create_debt_tables(db)

    exists = (
        db.query(Debt)
        .filter(Debt.id == debt_id)
        .first()
    )

    if exists is None:
        raise HTTPException(
            status_code=404,
            detail="Qarz topilmadi"
        )

    row = db.execute(
        text("""
            SELECT *
            FROM debt_schedules
            WHERE debt_id = :debt_id
            ORDER BY active DESC, id DESC
            LIMIT 1
        """),
        {
            "debt_id": debt_id
        }
    ).mappings().first()

    return schedule_to_dict(row)


# =========================================================
# SCHEDULE CHANGE HISTORY
# =========================================================

@router.get("/{debt_id}/schedule/history")
def get_schedule_history(
    debt_id: int,
    db: Session = Depends(get_db)
):

    create_debt_tables(db)

    rows = db.execute(
        text("""
            SELECT
                c.id,
                c.schedule_id,
                c.old_amount,
                c.new_amount,
                c.currency,
                c.reason,
                c.changed_at
            FROM debt_schedule_changes c
            JOIN debt_schedules s
              ON s.id = c.schedule_id
            WHERE s.debt_id = :debt_id
            ORDER BY c.changed_at DESC, c.id DESC
        """),
        {
            "debt_id": debt_id
        }
    ).mappings().all()

    return [
        {
            "id": row["id"],
            "schedule_id": row["schedule_id"],
            "old_amount": float(row["old_amount"] or 0),
            "new_amount": float(row["new_amount"] or 0),
            "currency": row["currency"],
            "reason": row["reason"],
            "changed_at": row["changed_at"]
        }
        for row in rows
    ]


# =========================================================
# UPCOMING PAYMENTS
# =========================================================

@router.get("/schedule/upcoming")
def get_upcoming_payments(
    db: Session = Depends(get_db)
):

    create_debt_tables(db)

    rows = db.execute(
        text("""
            SELECT
                s.*,
                d.creditor,
                d.title,
                d.amount AS debt_amount,
                d.paid AS debt_paid
            FROM debt_schedules s
            JOIN debts d
              ON d.id = s.debt_id
            WHERE s.active = TRUE
              AND d.amount > d.paid
            ORDER BY
                s.due_day NULLS LAST,
                s.id DESC
        """)
    ).mappings().all()

    today = date.today()

    result = []

    for row in rows:

        due_day = row["due_day"]

        result.append({
            "schedule_id": row["id"],
            "debt_id": row["debt_id"],
            "creditor": row["creditor"],
            "title": row["title"],
            "monthly_amount": float(
                row["monthly_amount"] or 0
            ),
            "currency": row["currency"],
            "due_day": due_day,
            "start_date": row["start_date"],
            "end_date": row["end_date"],
            "debt_amount": float(
                row["debt_amount"] or 0
            ),
            "debt_paid": float(
                row["debt_paid"] or 0
            ),
            "remaining": max(
                float(row["debt_amount"] or 0)
                - float(row["debt_paid"] or 0),
                0
            ),
            "today": today
        })

    return result


# =========================================================
# FINANCE DEBT SUMMARY
# =========================================================

@router.get("/summary/overview")
def get_debt_summary(
    db: Session = Depends(get_db)
):

    create_debt_tables(db)

    rows = db.execute(
        text("""
            SELECT
                currency,
                COUNT(*) AS count,
                COALESCE(SUM(amount), 0) AS total,
                COALESCE(SUM(paid), 0) AS paid,
                COALESCE(
                    SUM(
                        CASE
                            WHEN amount > paid
                            THEN amount - paid
                            ELSE 0
                        END
                    ),
                    0
                ) AS remaining
            FROM debts
            GROUP BY currency
            ORDER BY currency
        """)
    ).mappings().all()

    result = {
        "UZS": {
            "count": 0,
            "total": 0,
            "paid": 0,
            "remaining": 0
        },
        "USD": {
            "count": 0,
            "total": 0,
            "paid": 0,
            "remaining": 0
        }
    }

    for row in rows:

        currency = row["currency"]

        if currency not in result:
            continue

        result[currency] = {
            "count": int(row["count"] or 0),
            "total": float(row["total"] or 0),
            "paid": float(row["paid"] or 0),
            "remaining": float(row["remaining"] or 0)
        }

    return result


# =========================================================
# DELETE DEBT
# =========================================================

@router.delete("/{debt_id}")
def delete_debt(
    debt_id: int,
    db: Session = Depends(get_db)
):

    create_debt_tables(db)

    debt = (
        db.query(Debt)
        .filter(Debt.id == debt_id)
        .first()
    )

    if debt is None:
        raise HTTPException(
            status_code=404,
            detail="Qarz topilmadi"
        )

    # To'lovlar
    db.execute(
        text("""
            DELETE FROM debt_payments
            WHERE debt_id = :debt_id
        """),
        {
            "debt_id": debt_id
        }
    )

    # Rejalar
    db.execute(
        text("""
            DELETE FROM debt_schedule_changes
            WHERE schedule_id IN (
                SELECT id
                FROM debt_schedules
                WHERE debt_id = :debt_id
            )
        """),
        {
            "debt_id": debt_id
        }
    )

    db.execute(
        text("""
            DELETE FROM debt_schedules
            WHERE debt_id = :debt_id
        """),
        {
            "debt_id": debt_id
        }
    )

    db.delete(debt)

    db.commit()

    return {
        "message": "Qarz o'chirildi",
        "id": debt_id
    }
