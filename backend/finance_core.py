from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import text

from database import engine


router = APIRouter(
    prefix="/finance",
    tags=["Finance Core"]
)


# =========================================================
# DATABASE
# =========================================================

def init_finance_tables():
    with engine.begin() as conn:

        # -------------------------------------------------
        # FINANCE TRANSACTIONS
        # -------------------------------------------------
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS finance_transactions (
                id SERIAL PRIMARY KEY,

                transaction_type VARCHAR(30) NOT NULL,

                title VARCHAR(255) NOT NULL,
                category VARCHAR(100),

                source_type VARCHAR(50),
                source_id INTEGER,

                destination_type VARCHAR(50),
                destination_id INTEGER,

                object_id INTEGER,
                customer_id INTEGER,
                debt_id INTEGER,

                amount NUMERIC(18,2) NOT NULL DEFAULT 0,

                currency VARCHAR(10) NOT NULL DEFAULT 'UZS',

                exchange_rate NUMERIC(18,4),

                amount_uzs NUMERIC(18,2) NOT NULL DEFAULT 0,

                payment_method VARCHAR(50),

                description TEXT,

                operation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                is_void BOOLEAN NOT NULL DEFAULT FALSE,
                void_reason TEXT,

                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """))

        # -------------------------------------------------
        # PERSONAL 20% RESERVE
        # -------------------------------------------------
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS personal_reserve (
                id SERIAL PRIMARY KEY,

                transaction_id INTEGER,

                net_profit_uzs NUMERIC(18,2) NOT NULL DEFAULT 0,

                required_uzs NUMERIC(18,2) NOT NULL DEFAULT 0,

                taken_uzs NUMERIC(18,2) NOT NULL DEFAULT 0,

                remaining_uzs NUMERIC(18,2) NOT NULL DEFAULT 0,

                operation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                note TEXT,

                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """))

        # -------------------------------------------------
        # MONEY ACCOUNTS
        # -------------------------------------------------
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS finance_accounts (
                id SERIAL PRIMARY KEY,

                name VARCHAR(150) NOT NULL,

                account_type VARCHAR(50) NOT NULL,

                currency VARCHAR(10) NOT NULL DEFAULT 'UZS',

                balance NUMERIC(18,2) NOT NULL DEFAULT 0,

                is_active BOOLEAN NOT NULL DEFAULT TRUE,

                note TEXT,

                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """))

        # -------------------------------------------------
        # POTENTIAL OBJECTS / DAGOVOR
        # -------------------------------------------------
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS potential_objects (
                id SERIAL PRIMARY KEY,

                customer_id INTEGER,

                customer_name VARCHAR(255),

                phone VARCHAR(100),

                address TEXT,

                needs TEXT,

                camera_count INTEGER DEFAULT 0,

                service VARCHAR(150),

                estimated_amount NUMERIC(18,2) DEFAULT 0,

                currency VARCHAR(10) DEFAULT 'UZS',

                status VARCHAR(50) DEFAULT 'Yangi',

                last_contact TIMESTAMP,

                next_contact TIMESTAMP,

                note TEXT,

                converted_object_id INTEGER,

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))

        # -------------------------------------------------
        # AUDIT HISTORY
        # -------------------------------------------------
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS finance_audit (
                id SERIAL PRIMARY KEY,

                entity_type VARCHAR(100) NOT NULL,

                entity_id INTEGER,

                action VARCHAR(100) NOT NULL,

                old_value TEXT,

                new_value TEXT,

                reason TEXT,

                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """))

        # -------------------------------------------------
        # DEFAULT ACCOUNTS
        # -------------------------------------------------
        count = conn.execute(
            text("SELECT COUNT(*) FROM finance_accounts")
        ).scalar()

        if count == 0:
            conn.execute(text("""
                INSERT INTO finance_accounts
                    (name, account_type, currency, balance)
                VALUES
                    ('Kassa UZS', 'cash', 'UZS', 0),
                    ('Kassa USD', 'cash', 'USD', 0),
                    ('Anorbank UZS', 'bank', 'UZS', 0),
                    ('Agrobank UZS', 'bank', 'UZS', 0),
                    ('Click/Payme UZS', 'payment', 'UZS', 0)
            """))


# =========================================================
# HELPERS
# =========================================================

def money_uzs(amount: float, currency: str, exchange_rate: Optional[float]):
    currency = (currency or "UZS").upper()

    if currency == "UZS":
        return round(float(amount), 2)

    if currency == "USD":
        if not exchange_rate or exchange_rate <= 0:
            raise HTTPException(
                status_code=400,
                detail="USD operatsiya uchun kurs kiritilishi shart."
            )

        return round(float(amount) * float(exchange_rate), 2)

    raise HTTPException(
        status_code=400,
        detail=f"Noma'lum valyuta: {currency}"
    )


def row_dict(row):
    return dict(row._mapping)


# =========================================================
# SCHEMAS
# =========================================================

class TransactionCreate(BaseModel):
    transaction_type: str = Field(
        description="income / expense / transfer / payment / personal"
    )

    title: str

    category: Optional[str] = None

    source_type: Optional[str] = None
    source_id: Optional[int] = None

    destination_type: Optional[str] = None
    destination_id: Optional[int] = None

    object_id: Optional[int] = None
    customer_id: Optional[int] = None
    debt_id: Optional[int] = None

    amount: float

    currency: str = "UZS"

    exchange_rate: Optional[float] = None

    payment_method: Optional[str] = None

    description: Optional[str] = None

    operation_date: Optional[datetime] = None


class VoidTransaction(BaseModel):
    reason: str


class PersonalReserveCreate(BaseModel):
    net_profit_uzs: float

    taken_uzs: float = 0

    transaction_id: Optional[int] = None

    operation_date: Optional[datetime] = None

    note: Optional[str] = None


class AccountCreate(BaseModel):
    name: str

    account_type: str

    currency: str = "UZS"

    balance: float = 0

    note: Optional[str] = None


class PotentialObjectCreate(BaseModel):
    customer_id: Optional[int] = None

    customer_name: Optional[str] = None

    phone: Optional[str] = None

    address: Optional[str] = None

    needs: Optional[str] = None

    camera_count: int = 0

    service: Optional[str] = None

    estimated_amount: float = 0

    currency: str = "UZS"

    status: str = "Yangi"

    last_contact: Optional[datetime] = None

    next_contact: Optional[datetime] = None

    note: Optional[str] = None


# =========================================================
# INIT
# =========================================================

@router.on_event("startup")
def startup_finance():
    init_finance_tables()


# =========================================================
# SUMMARY
# =========================================================

@router.get("/summary")
def finance_summary():

    init_finance_tables()

    with engine.begin() as conn:

        income = conn.execute(text("""
            SELECT COALESCE(SUM(amount_uzs), 0)
            FROM finance_transactions
            WHERE transaction_type = 'income'
              AND is_void = FALSE
        """)).scalar() or 0

        expense = conn.execute(text("""
            SELECT COALESCE(SUM(amount_uzs), 0)
            FROM finance_transactions
            WHERE transaction_type = 'expense'
              AND is_void = FALSE
        """)).scalar() or 0

        personal = conn.execute(text("""
            SELECT COALESCE(SUM(taken_uzs), 0)
            FROM personal_reserve
        """)).scalar() or 0

        profit = float(income) - float(expense)

        required = max(0, profit * 0.20)

        remaining = max(
            0,
            required - float(personal)
        )

        receivables = conn.execute(text("""
            SELECT COUNT(*)
            FROM finance_transactions
            WHERE transaction_type = 'receivable'
              AND is_void = FALSE
        """)).scalar() or 0

        return {
            "total_income_uzs": round(float(income), 2),
            "total_expense_uzs": round(float(expense), 2),
            "net_profit_uzs": round(profit, 2),

            "personal_share_required_uzs": round(required, 2),
            "personal_share_taken_uzs": round(float(personal), 2),
            "personal_share_remaining_uzs": round(remaining, 2),

            "receivables_count": int(receivables),

            "warning_20_percent": remaining > 0
        }


# =========================================================
# TRANSACTIONS
# =========================================================

@router.post("/transactions")
def create_transaction(data: TransactionCreate):

    init_finance_tables()

    currency = data.currency.upper()

    amount_uzs = money_uzs(
        data.amount,
        currency,
        data.exchange_rate
    )

    operation_date = data.operation_date or datetime.now()

    with engine.begin() as conn:

        result = conn.execute(text("""
            INSERT INTO finance_transactions (
                transaction_type,
                title,
                category,

                source_type,
                source_id,

                destination_type,
                destination_id,

                object_id,
                customer_id,
                debt_id,

                amount,
                currency,
                exchange_rate,
                amount_uzs,

                payment_method,
                description,
                operation_date
            )
            VALUES (
                :transaction_type,
                :title,
                :category,

                :source_type,
                :source_id,

                :destination_type,
                :destination_id,

                :object_id,
                :customer_id,
                :debt_id,

                :amount,
                :currency,
                :exchange_rate,
                :amount_uzs,

                :payment_method,
                :description,
                :operation_date
            )
            RETURNING id
        """), {
            "transaction_type": data.transaction_type,
            "title": data.title,
            "category": data.category,

            "source_type": data.source_type,
            "source_id": data.source_id,

            "destination_type": data.destination_type,
            "destination_id": data.destination_id,

            "object_id": data.object_id,
            "customer_id": data.customer_id,
            "debt_id": data.debt_id,

            "amount": data.amount,
            "currency": currency,
            "exchange_rate": data.exchange_rate,
            "amount_uzs": amount_uzs,

            "payment_method": data.payment_method,
            "description": data.description,
            "operation_date": operation_date
        })

        transaction_id = result.scalar()

        conn.execute(text("""
            INSERT INTO finance_audit (
                entity_type,
                entity_id,
                action,
                new_value
            )
            VALUES (
                'finance_transaction',
                :id,
                'created',
                :value
            )
        """), {
            "id": transaction_id,
            "value": (
                f"{data.title}; "
                f"{data.amount} {currency}; "
                f"{amount_uzs} UZS"
            )
        })

    return {
        "success": True,
        "id": transaction_id,
        "amount": data.amount,
        "currency": currency,
        "exchange_rate": data.exchange_rate,
        "amount_uzs": amount_uzs,
        "operation_date": operation_date
    }


@router.get("/transactions")
def list_transactions(
    limit: int = 500,
    object_id: Optional[int] = None
):

    init_finance_tables()

    with engine.begin() as conn:

        if object_id is not None:

            rows = conn.execute(text("""
                SELECT *
                FROM finance_transactions
                WHERE object_id = :object_id
                ORDER BY operation_date DESC, id DESC
                LIMIT :limit
            """), {
                "object_id": object_id,
                "limit": limit
            }).fetchall()

        else:

            rows = conn.execute(text("""
                SELECT *
                FROM finance_transactions
                ORDER BY operation_date DESC, id DESC
                LIMIT :limit
            """), {
                "limit": limit
            }).fetchall()

        return [row_dict(row) for row in rows]


@router.get("/transactions/{transaction_id}")
def get_transaction(transaction_id: int):

    init_finance_tables()

    with engine.begin() as conn:

        row = conn.execute(text("""
            SELECT *
            FROM finance_transactions
            WHERE id = :id
        """), {
            "id": transaction_id
        }).fetchone()

        if not row:
            raise HTTPException(
                status_code=404,
                detail="Operatsiya topilmadi."
            )

        return row_dict(row)


# =========================================================
# VOID — DELETE EMAS
# =========================================================

@router.post("/transactions/{transaction_id}/void")
def void_transaction(
    transaction_id: int,
    data: VoidTransaction
):

    init_finance_tables()

    with engine.begin() as conn:

        row = conn.execute(text("""
            SELECT *
            FROM finance_transactions
            WHERE id = :id
        """), {
            "id": transaction_id
        }).fetchone()

        if not row:
            raise HTTPException(
                status_code=404,
                detail="Operatsiya topilmadi."
            )

        if row._mapping["is_void"]:
            raise HTTPException(
                status_code=400,
                detail="Bu operatsiya allaqachon bekor qilingan."
            )

        conn.execute(text("""
            UPDATE finance_transactions
            SET
                is_void = TRUE,
                void_reason = :reason
            WHERE id = :id
        """), {
            "id": transaction_id,
            "reason": data.reason
        })

        conn.execute(text("""
            INSERT INTO finance_audit (
                entity_type,
                entity_id,
                action,
                old_value,
                new_value,
                reason
            )
            VALUES (
                'finance_transaction',
                :id,
                'void',
                'active',
                'void',
                :reason
            )
        """), {
            "id": transaction_id,
            "reason": data.reason
        })

    return {
        "success": True,
        "message": "Operatsiya bekor qilindi. Tarix saqlandi."
    }


# =========================================================
# PERSONAL 20%
# =========================================================

@router.post("/personal-reserve")
def create_personal_reserve(data: PersonalReserveCreate):

    init_finance_tables()

    required = max(
        0,
        float(data.net_profit_uzs) * 0.20
    )

    taken = max(
        0,
        float(data.taken_uzs)
    )

    remaining = max(
        0,
        required - taken
    )

    operation_date = data.operation_date or datetime.now()

    with engine.begin() as conn:

        result = conn.execute(text("""
            INSERT INTO personal_reserve (
                transaction_id,
                net_profit_uzs,
                required_uzs,
                taken_uzs,
                remaining_uzs,
                operation_date,
                note
            )
            VALUES (
                :transaction_id,
                :net_profit_uzs,
                :required_uzs,
                :taken_uzs,
                :remaining_uzs,
                :operation_date,
                :note
            )
            RETURNING id
        """), {
            "transaction_id": data.transaction_id,
            "net_profit_uzs": data.net_profit_uzs,
            "required_uzs": required,
            "taken_uzs": taken,
            "remaining_uzs": remaining,
            "operation_date": operation_date,
            "note": data.note
        })

        reserve_id = result.scalar()

    return {
        "success": True,
        "id": reserve_id,
        "net_profit_uzs": data.net_profit_uzs,
        "required_uzs": required,
        "taken_uzs": taken,
        "remaining_uzs": remaining
    }


@router.get("/personal-reserve")
def personal_reserve():

    init_finance_tables()

    with engine.begin() as conn:

        row = conn.execute(text("""
            SELECT
                COALESCE(SUM(net_profit_uzs), 0) AS net_profit,
                COALESCE(SUM(required_uzs), 0) AS required,
                COALESCE(SUM(taken_uzs), 0) AS taken,
                COALESCE(SUM(remaining_uzs), 0) AS remaining
            FROM personal_reserve
        """)).fetchone()

        return row_dict(row)


# =========================================================
# ACCOUNTS
# =========================================================

@router.get("/accounts")
def list_accounts():

    init_finance_tables()

    with engine.begin() as conn:

        rows = conn.execute(text("""
            SELECT *
            FROM finance_accounts
            WHERE is_active = TRUE
            ORDER BY id
        """)).fetchall()

        return [row_dict(row) for row in rows]


@router.post("/accounts")
def create_account(data: AccountCreate):

    init_finance_tables()

    currency = data.currency.upper()

    if currency not in ("UZS", "USD"):
        raise HTTPException(
            status_code=400,
            detail="Valyuta faqat UZS yoki USD bo‘lishi mumkin."
        )

    with engine.begin() as conn:

        result = conn.execute(text("""
            INSERT INTO finance_accounts (
                name,
                account_type,
                currency,
                balance,
                note
            )
            VALUES (
                :name,
                :account_type,
                :currency,
                :balance,
                :note
            )
            RETURNING id
        """), {
            "name": data.name,
            "account_type": data.account_type,
            "currency": currency,
            "balance": data.balance,
            "note": data.note
        })

        return {
            "success": True,
            "id": result.scalar()
        }


# =========================================================
# POTENTIAL OBJECTS / DAGOVOR
# =========================================================

@router.post("/potential-objects")
def create_potential_object(data: PotentialObjectCreate):

    init_finance_tables()

    with engine.begin() as conn:

        result = conn.execute(text("""
            INSERT INTO potential_objects (
                customer_id,
                customer_name,
                phone,
                address,
                needs,
                camera_count,
                service,
                estimated_amount,
                currency,
                status,
                last_contact,
                next_contact,
                note
            )
            VALUES (
                :customer_id,
                :customer_name,
                :phone,
                :address,
                :needs,
                :camera_count,
                :service,
                :estimated_amount,
                :currency,
                :status,
                :last_contact,
                :next_contact,
                :note
            )
            RETURNING id
        """), data.model_dump())

        return {
            "success": True,
            "id": result.scalar()
        }


@router.get("/potential-objects")
def list_potential_objects():

    init_finance_tables()

    with engine.begin() as conn:

        rows = conn.execute(text("""
            SELECT *
            FROM potential_objects
            ORDER BY updated_at DESC, id DESC
        """)).fetchall()

        return [row_dict(row) for row in rows]


# =========================================================
# AUDIT
# =========================================================

@router.get("/audit")
def finance_audit(limit: int = 500):

    init_finance_tables()

    with engine.begin() as conn:

        rows = conn.execute(text("""
            SELECT *
            FROM finance_audit
            ORDER BY created_at DESC, id DESC
            LIMIT :limit
        """), {
            "limit": limit
        }).fetchall()

        return [row_dict(row) for row in rows]
