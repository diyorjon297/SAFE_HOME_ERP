from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from datetime import datetime


router = APIRouter(
    prefix="/objects",
    tags=["Objects"]
)


# ============================================================
# CONSTANTS
# ============================================================

OBJECT_TYPES = [
    "Maktab",
    "Bog‘cha",
    "Korxona",
    "Uy",
    "Do‘kon",
    "Ombor",
    "Ofis",
    "Boshqa",
]

WORK_TYPES = [
    "Yangi ustanovka",
    "Servis",
    "Ta'mirlash",
    "Kengaytirish",
    "Almashtirish",
    "Qaytarish",
    "Montaj",
    "Sozlash",
    "Yetkazib berish",
    "Faqat tovar",
    "Boshqa",
]

FINANCING_TYPES = [
    "100% oldindan",
    "Avans + qolgan to‘lov",
    "Bosqichma-bosqich",
    "Ish tugagach",
    "Qarzga",
    "O‘z mablag‘im",
]

STATUSES = [
    "Yangi",
    "Jarayonda",
    "Kutmoqda",
    "Tugagan",
    "Qarzdor",
    "Bekor qilingan",
]

CURRENCIES = [
    "UZS",
    "USD",
]

OPERATION_TYPES = [
    "work",
    "material",
    "employee",
    "expense",
    "payment",
    "return",
    "exchange",
    "refund",
    "income",
    "other",
]

EMPLOYEE_RATE_TYPES = [
    "monthly",
    "daily",
    "per_meter",
    "per_unit",
    "percent",
    "fixed",
]

PAYMENT_METHODS = [
    "Naqd",
    "Karta",
    "Bank",
    "Click",
    "Payme",
    "Boshqa",
]

EXPENSE_TYPES = [
    "Material",
    "Ishchi",
    "Transport",
    "Benzin",
    "Ovqat",
    "Yo‘l",
    "Ijara",
    "Aloqa",
    "Boshqa",
]

RETURN_TYPES = [
    "Qaytarish",
    "Almashtirish",
]

RETURN_REASONS = [
    "Mijoz fikri o‘zgardi",
    "Noto‘g‘ri model",
    "Noto‘g‘ri miqdor",
    "Defekt",
    "Almashtirish",
    "Ortiqcha mahsulot",
    "Boshqa",
]

UNITS = [
    "dona",
    "metr",
    "buxta",
    "kun",
    "soat",
    "xizmat",
    "reys",
    "kg",
    "litr",
    "komplekt",
]


# ============================================================
# HELPERS
# ============================================================

def num(value, default=0):
    try:
        return float(value or default)
    except Exception:
        return float(default)


def safe_str(value):
    if value is None:
        return None

    value = str(value).strip()

    return value if value else None


def init_tables(db: Session):

    # ========================================================
    # OBJECTS
    # ========================================================

    db.execute(text("""
        CREATE TABLE IF NOT EXISTS objects (
            id SERIAL PRIMARY KEY,

            name VARCHAR(255) NOT NULL,
            client VARCHAR(255),
            phone VARCHAR(100),

            object_type VARCHAR(100),
            work_type VARCHAR(100),
            financing_type VARCHAR(100),

            address TEXT,

            latitude NUMERIC(12,8),
            longitude NUMERIC(12,8),
            location_name VARCHAR(255),

            responsible VARCHAR(255),
            sales_person VARCHAR(255),
            project_manager VARCHAR(255),

            start_date DATE,
            end_date DATE,

            status VARCHAR(100) DEFAULT 'Yangi',

            total NUMERIC(18,2) DEFAULT 0,
            currency VARCHAR(10) DEFAULT 'UZS',
            paid NUMERIC(18,2) DEFAULT 0,

            advance NUMERIC(18,2) DEFAULT 0,

            note TEXT,

            is_deleted BOOLEAN DEFAULT FALSE,
            deleted_at TIMESTAMP NULL,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))

    # ========================================================
    # OBJECT MIGRATION
    # ========================================================

    object_columns = db.execute(text("""
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'objects'
    """)).scalars().all()

    migrations = {
        "object_type": "VARCHAR(100)",
        "work_type": "VARCHAR(100)",
        "financing_type": "VARCHAR(100)",
        "responsible": "VARCHAR(255)",
        "sales_person": "VARCHAR(255)",
        "project_manager": "VARCHAR(255)",
        "advance": "NUMERIC(18,2) DEFAULT 0",
    }

    for column, definition in migrations.items():

        if column not in object_columns:

            db.execute(
                text(
                    f"ALTER TABLE objects "
                    f"ADD COLUMN {column} {definition}"
                )
            )

    # ========================================================
    # OPERATIONS
    # ========================================================

    db.execute(text("""
        CREATE TABLE IF NOT EXISTS object_operations (
            id SERIAL PRIMARY KEY,

            object_id INTEGER NOT NULL
                REFERENCES objects(id)
                ON DELETE CASCADE,

            operation_type VARCHAR(50) NOT NULL,

            name VARCHAR(255),

            quantity NUMERIC(18,2) DEFAULT 0,
            unit VARCHAR(50),

            price NUMERIC(18,2) DEFAULT 0,
            amount NUMERIC(18,2) DEFAULT 0,

            employee VARCHAR(255),

            days NUMERIC(18,2) DEFAULT 0,
            daily NUMERIC(18,2) DEFAULT 0,

            expense_type VARCHAR(100),

            currency VARCHAR(10) DEFAULT 'UZS',
            payment_method VARCHAR(50),

            employee_rate_type VARCHAR(50),
            employee_rate NUMERIC(18,2) DEFAULT 0,

            transport_type VARCHAR(100),

            operation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            note TEXT,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))

    operation_columns = db.execute(text("""
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'object_operations'
    """)).scalars().all()

    operation_migrations = {
        "currency": "VARCHAR(10) DEFAULT 'UZS'",
        "payment_method": "VARCHAR(50)",
        "employee_rate_type": "VARCHAR(50)",
        "employee_rate": "NUMERIC(18,2) DEFAULT 0",
        "transport_type": "VARCHAR(100)",
    }

    for column, definition in operation_migrations.items():

        if column not in operation_columns:

            db.execute(
                text(
                    f"ALTER TABLE object_operations "
                    f"ADD COLUMN {column} {definition}"
                )
            )

    # ========================================================
    # ESTIMATES
    # ========================================================

    db.execute(text("""
        CREATE TABLE IF NOT EXISTS object_estimates (
            id SERIAL PRIMARY KEY,

            object_id INTEGER NOT NULL
                REFERENCES objects(id)
                ON DELETE CASCADE,

            name VARCHAR(255),

            quantity NUMERIC(18,2) DEFAULT 0,
            unit VARCHAR(50),

            sale_price NUMERIC(18,2) DEFAULT 0,
            cost_price NUMERIC(18,2) DEFAULT 0,

            sale_total NUMERIC(18,2) DEFAULT 0,
            cost_total NUMERIC(18,2) DEFAULT 0,
            profit NUMERIC(18,2) DEFAULT 0,

            category VARCHAR(100) DEFAULT 'Boshqa',

            note TEXT,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))

    # ========================================================
    # DEBTS
    # ========================================================

    db.execute(text("""
        CREATE TABLE IF NOT EXISTS object_debts (
            id SERIAL PRIMARY KEY,

            object_id INTEGER NOT NULL
                REFERENCES objects(id)
                ON DELETE CASCADE,

            debt_type VARCHAR(50) NOT NULL,

            name VARCHAR(255),

            amount NUMERIC(18,2) DEFAULT 0,
            paid NUMERIC(18,2) DEFAULT 0,

            currency VARCHAR(10) DEFAULT 'UZS',

            due_date DATE,

            note TEXT,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))

    # ========================================================
    # FILES
    # ========================================================

    db.execute(text("""
        CREATE TABLE IF NOT EXISTS object_files (
            id SERIAL PRIMARY KEY,

            object_id INTEGER NOT NULL
                REFERENCES objects(id)
                ON DELETE CASCADE,

            file_name VARCHAR(255),
            file_url TEXT,

            file_type VARCHAR(50) DEFAULT 'image',

            note TEXT,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))

    # ========================================================
    # RETURNS / EXCHANGES
    # ========================================================

    db.execute(text("""
        CREATE TABLE IF NOT EXISTS object_returns (
            id SERIAL PRIMARY KEY,

            object_id INTEGER NOT NULL
                REFERENCES objects(id)
                ON DELETE CASCADE,

            return_type VARCHAR(50) NOT NULL,

            reason VARCHAR(255),

            old_product VARCHAR(255),
            old_quantity NUMERIC(18,2) DEFAULT 0,
            old_unit VARCHAR(50),
            old_price NUMERIC(18,2) DEFAULT 0,
            old_cost NUMERIC(18,2) DEFAULT 0,

            new_product VARCHAR(255),
            new_quantity NUMERIC(18,2) DEFAULT 0,
            new_unit VARCHAR(50),
            new_price NUMERIC(18,2) DEFAULT 0,
            new_cost NUMERIC(18,2) DEFAULT 0,

            difference NUMERIC(18,2) DEFAULT 0,

            currency VARCHAR(10) DEFAULT 'UZS',

            note TEXT,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))

    # ========================================================
    # CHECKLIST
    # ========================================================

    db.execute(text("""
        CREATE TABLE IF NOT EXISTS object_checklist (
            id SERIAL PRIMARY KEY,

            object_id INTEGER NOT NULL
                REFERENCES objects(id)
                ON DELETE CASCADE,

            title VARCHAR(255) NOT NULL,

            is_done BOOLEAN DEFAULT FALSE,

            assigned_to VARCHAR(255),

            due_date DATE,

            note TEXT,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            completed_at TIMESTAMP NULL
        )
    """))

    # ========================================================
    # SERVICES
    # ========================================================

    db.execute(text("""
        CREATE TABLE IF NOT EXISTS object_services (
            id SERIAL PRIMARY KEY,

            object_id INTEGER NOT NULL
                REFERENCES objects(id)
                ON DELETE CASCADE,

            service_type VARCHAR(255) NOT NULL,

            quantity NUMERIC(18,2) DEFAULT 1,

            unit VARCHAR(50) DEFAULT 'xizmat',

            price NUMERIC(18,2) DEFAULT 0,

            employee VARCHAR(255),

            status VARCHAR(100) DEFAULT 'Yangi',

            service_date DATE,

            note TEXT,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))

    # ========================================================
    # REFERRALS
    # ========================================================

    db.execute(text("""
        CREATE TABLE IF NOT EXISTS object_referrals (
            id SERIAL PRIMARY KEY,

            object_id INTEGER NOT NULL
                REFERENCES objects(id)
                ON DELETE CASCADE,

            referrer_name VARCHAR(255),

            referrer_code VARCHAR(100),

            reward_type VARCHAR(50) DEFAULT 'percent',

            reward_rate NUMERIC(18,2) DEFAULT 0,

            reward_amount NUMERIC(18,2) DEFAULT 0,

            max_reward NUMERIC(18,2),

            status VARCHAR(50) DEFAULT 'pending',

            note TEXT,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))

    # ========================================================
    # HISTORY
    # ========================================================

    db.execute(text("""
        CREATE TABLE IF NOT EXISTS object_history (
            id SERIAL PRIMARY KEY,

            object_id INTEGER NOT NULL
                REFERENCES objects(id)
                ON DELETE CASCADE,

            action VARCHAR(100) NOT NULL,

            title VARCHAR(255),

            description TEXT,

            amount NUMERIC(18,2) DEFAULT 0,

            currency VARCHAR(10) DEFAULT 'UZS',

            created_by VARCHAR(255),

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))

    db.commit()


def add_history(
    db,
    object_id,
    action,
    title,
    description=None,
    amount=0,
    currency="UZS",
    created_by=None,
):

    db.execute(text("""
        INSERT INTO object_history (
            object_id,
            action,
            title,
            description,
            amount,
            currency,
            created_by
        )
        VALUES (
            :object_id,
            :action,
            :title,
            :description,
            :amount,
            :currency,
            :created_by
        )
    """), {
        "object_id": object_id,
        "action": action,
        "title": title,
        "description": description,
        "amount": amount,
        "currency": currency,
        "created_by": created_by,
    })


# ============================================================
# GET OBJECTS
# ============================================================

@router.get("")
def get_objects(
    db: Session = Depends(get_db)
):

    init_tables(db)

    rows = db.execute(text("""
        SELECT *
        FROM objects
        WHERE COALESCE(is_deleted, FALSE) = FALSE
        ORDER BY id DESC
    """)).mappings().all()

    return [dict(row) for row in rows]


# ============================================================
# CREATE OBJECT
# ============================================================

@router.post("")
def create_object(
    data: dict,
    db: Session = Depends(get_db)
):

    init_tables(db)

    name = safe_str(data.get("name"))

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Obyekt nomi kiritilmagan"
        )

    total = num(data.get("total"))
    paid = num(data.get("paid"))
    advance = num(data.get("advance"))

    if total < 0:
        raise HTTPException(
            status_code=400,
            detail="Jami summa manfiy bo‘lishi mumkin emas"
        )

    if paid < 0 or advance < 0:
        raise HTTPException(
            status_code=400,
            detail="To‘lov manfiy bo‘lishi mumkin emas"
        )

    if paid > total and total > 0:
        raise HTTPException(
            status_code=400,
            detail="To‘langan summa jami summadan katta"
        )

    currency = data.get("currency", "UZS")

    if currency not in CURRENCIES:
        currency = "UZS"

    row = db.execute(text("""
        INSERT INTO objects (
            name,
            client,
            phone,

            object_type,
            work_type,
            financing_type,

            address,

            latitude,
            longitude,
            location_name,

            responsible,
            sales_person,
            project_manager,

            start_date,
            end_date,

            status,

            total,
            currency,
            paid,
            advance,

            note
        )
        VALUES (
            :name,
            :client,
            :phone,

            :object_type,
            :work_type,
            :financing_type,

            :address,

            :latitude,
            :longitude,
            :location_name,

            :responsible,
            :sales_person,
            :project_manager,

            :start_date,
            :end_date,

            :status,

            :total,
            :currency,
            :paid,
            :advance,

            :note
        )
        RETURNING *
    """), {

        "name": name,

        "client": safe_str(data.get("client")),
        "phone": safe_str(data.get("phone")),

        "object_type": data.get(
            "object_type",
            "Boshqa"
        ),

        "work_type": data.get(
            "work_type",
            "Yangi ustanovka"
        ),

        "financing_type": data.get(
            "financing_type",
            "Avans + qolgan to‘lov"
        ),

        "address": safe_str(
            data.get("address")
        ),

        "latitude": data.get("latitude"),
        "longitude": data.get("longitude"),

        "location_name": safe_str(
            data.get("location_name")
        ),

        "responsible": safe_str(
            data.get("responsible")
        ),

        "sales_person": safe_str(
            data.get("sales_person")
        ),

        "project_manager": safe_str(
            data.get("project_manager")
        ),

        "start_date": data.get("startDate") or None,
        "end_date": data.get("endDate") or None,

        "status": data.get(
            "status",
            "Yangi"
        ),

        "total": total,
        "currency": currency,

        "paid": paid,
        "advance": advance,

        "note": safe_str(
            data.get("note")
        ),
    }).mappings().first()

    object_id = row["id"]

    add_history(
        db,
        object_id,
        "create",
        "Obyekt yaratildi",
        f"{name} obyekti yaratildi"
    )

    if paid > 0:

        add_history(
            db,
            object_id,
            "payment",
            "Boshlang‘ich to‘lov",
            "Obyekt yaratilishida to‘lov kiritildi",
            paid,
            currency
        )

    db.commit()

    return dict(row)


# ============================================================
# UPDATE OBJECT
# ============================================================

@router.put("/{object_id}")
def update_object(
    object_id: int,
    data: dict,
    db: Session = Depends(get_db)
):

    init_tables(db)

    existing = db.execute(text("""
        SELECT *
        FROM objects
        WHERE id = :id
        AND COALESCE(is_deleted, FALSE) = FALSE
    """), {
        "id": object_id
    }).mappings().first()

    if not existing:

        raise HTTPException(
            status_code=404,
            detail="Obyekt topilmadi"
        )

    total = num(
        data.get(
            "total",
            existing["total"]
        )
    )

    paid = num(
        data.get(
            "paid",
            existing["paid"]
        )
    )

    advance = num(
        data.get(
            "advance",
            existing["advance"]
        )
    )

    if total < 0:
        raise HTTPException(
            status_code=400,
            detail="Jami summa manfiy bo‘lishi mumkin emas"
        )

    if paid < 0 or paid > total:
        raise HTTPException(
            status_code=400,
            detail="To‘lov summasi noto‘g‘ri"
        )

    currency = data.get(
        "currency",
        existing["currency"]
    )

    row = db.execute(text("""
        UPDATE objects
        SET
            name = :name,
            client = :client,
            phone = :phone,

            object_type = :object_type,
            work_type = :work_type,
            financing_type = :financing_type,

            address = :address,

            latitude = :latitude,
            longitude = :longitude,
            location_name = :location_name,

            responsible = :responsible,
            sales_person = :sales_person,
            project_manager = :project_manager,

            start_date = :start_date,
            end_date = :end_date,

            status = :status,

            total = :total,
            currency = :currency,
            paid = :paid,
            advance = :advance,

            note = :note,

            updated_at = CURRENT_TIMESTAMP

        WHERE id = :id

        RETURNING *
    """), {

        "id": object_id,

        "name": safe_str(
            data.get(
                "name",
                existing["name"]
            )
        ),

        "client": data.get(
            "client",
            existing["client"]
        ),

        "phone": data.get(
            "phone",
            existing["phone"]
        ),

        "object_type": data.get(
            "object_type",
            existing["object_type"]
        ),

        "work_type": data.get(
            "work_type",
            existing["work_type"]
        ),

        "financing_type": data.get(
            "financing_type",
            existing["financing_type"]
        ),

        "address": data.get(
            "address",
            existing["address"]
        ),

        "latitude": data.get(
            "latitude",
            existing["latitude"]
        ),

        "longitude": data.get(
            "longitude",
            existing["longitude"]
        ),

        "location_name": data.get(
            "location_name",
            existing["location_name"]
        ),

        "responsible": data.get(
            "responsible",
            existing["responsible"]
        ),

        "sales_person": data.get(
            "sales_person",
            existing["sales_person"]
        ),

        "project_manager": data.get(
            "project_manager",
            existing["project_manager"]
        ),

        "start_date": data.get(
            "startDate",
            existing["start_date"]
        ) or None,

        "end_date": data.get(
            "endDate",
            existing["end_date"]
        ) or None,

        "status": data.get(
            "status",
            existing["status"]
        ),

        "total": total,
        "currency": currency,

        "paid": paid,
        "advance": advance,

        "note": data.get(
            "note",
            existing["note"]
        ),
    }).mappings().first()

    add_history(
        db,
        object_id,
        "update",
        "Obyekt ma'lumotlari yangilandi"
    )

    db.commit()

    return dict(row)


# ============================================================
# GET SINGLE OBJECT
# ============================================================

@router.get("/{object_id}")
def get_object(
    object_id: int,
    db: Session = Depends(get_db)
):

    init_tables(db)

    obj = db.execute(text("""
        SELECT *
        FROM objects
        WHERE id = :id
        AND COALESCE(is_deleted, FALSE) = FALSE
    """), {
        "id": object_id
    }).mappings().first()

    if not obj:

        raise HTTPException(
            status_code=404,
            detail="Obyekt topilmadi"
        )

    operations = db.execute(text("""
        SELECT *
        FROM object_operations
        WHERE object_id = :object_id
        ORDER BY id DESC
    """), {
        "object_id": object_id
    }).mappings().all()

    estimates = db.execute(text("""
        SELECT *
        FROM object_estimates
        WHERE object_id = :object_id
        ORDER BY id DESC
    """), {
        "object_id": object_id
    }).mappings().all()

    debts = db.execute(text("""
        SELECT *
        FROM object_debts
        WHERE object_id = :object_id
        ORDER BY id DESC
    """), {
        "object_id": object_id
    }).mappings().all()

    files = db.execute(text("""
        SELECT *
        FROM object_files
        WHERE object_id = :object_id
        ORDER BY id DESC
    """), {
        "object_id": object_id
    }).mappings().all()

    returns = db.execute(text("""
        SELECT *
        FROM object_returns
        WHERE object_id = :object_id
        ORDER BY id DESC
    """), {
        "object_id": object_id
    }).mappings().all()

    checklist = db.execute(text("""
        SELECT *
        FROM object_checklist
        WHERE object_id = :object_id
        ORDER BY id DESC
    """), {
        "object_id": object_id
    }).mappings().all()

    services = db.execute(text("""
        SELECT *
        FROM object_services
        WHERE object_id = :object_id
        ORDER BY id DESC
    """), {
        "object_id": object_id
    }).mappings().all()

    referrals = db.execute(text("""
        SELECT *
        FROM object_referrals
        WHERE object_id = :object_id
        ORDER BY id DESC
    """), {
        "object_id": object_id
    }).mappings().all()

    history = db.execute(text("""
        SELECT *
        FROM object_history
        WHERE object_id = :object_id
        ORDER BY id DESC
    """), {
        "object_id": object_id
    }).mappings().all()

    # ========================================================
    # FINANCIAL CALCULATIONS
    # ========================================================

    revenue = 0
    material_cost = 0
    employee_cost = 0
    other_expense = 0

    for op in operations:

        amount = num(op["amount"])

        operation_type = op["operation_type"]

        if operation_type in (
            "material",
        ):
            material_cost += amount

        elif operation_type in (
            "employee",
            "work",
        ):
            employee_cost += amount

        elif operation_type in (
            "expense",
            "other",
        ):
            other_expense += amount

    for estimate in estimates:

        # Estimate cost is also useful for project analysis.
        pass

    revenue = num(obj["total"])

    total_cost = (
        material_cost
        + employee_cost
        + other_expense
    )

    net_profit = revenue - total_cost

    customer_debt = 0
    supplier_debt = 0

    for debt in debts:

        remaining = (
            num(debt["amount"])
            - num(debt["paid"])
        )

        if debt["debt_type"] == "customer":
            customer_debt += remaining

        elif debt["debt_type"] == "supplier":
            supplier_debt += remaining

    result = dict(obj)

    result["operations"] = [
        dict(x) for x in operations
    ]

    result["estimates"] = [
        dict(x) for x in estimates
    ]

    result["debts"] = [
        dict(x) for x in debts
    ]

    result["files"] = [
        dict(x) for x in files
    ]

    result["returns"] = [
        dict(x) for x in returns
    ]

    result["checklist"] = [
        dict(x) for x in checklist
    ]

    result["services"] = [
        dict(x) for x in services
    ]

    result["referrals"] = [
        dict(x) for x in referrals
    ]

    result["history"] = [
        dict(x) for x in history
    ]

    result["customer_debt"] = customer_debt
    result["supplier_debt"] = supplier_debt

    result["material_cost"] = material_cost
    result["employee_cost"] = employee_cost
    result["other_expense"] = other_expense

    result["total_cost"] = total_cost
    result["net_profit"] = net_profit

    result["estimate_sale_total"] = sum(
        num(x["sale_total"])
        for x in estimates
    )

    result["estimate_cost_total"] = sum(
        num(x["cost_total"])
        for x in estimates
    )

    result["estimate_profit"] = sum(
        num(x["profit"])
        for x in estimates
    )

    result["debt_total"] = sum(
        num(x["amount"])
        for x in debts
    )

    result["debt_paid"] = sum(
        num(x["paid"])
        for x in debts
    )

    result["debt_remaining"] = (
        result["debt_total"]
        - result["debt_paid"]
    )

    return result


# ============================================================
# CREATE OPERATION
# ============================================================

@router.post("/{object_id}/operations")
def create_operation(
    object_id: int,
    data: dict,
    db: Session = Depends(get_db)
):

    init_tables(db)

    exists = db.execute(text("""
        SELECT *
        FROM objects
        WHERE id = :id
        AND COALESCE(is_deleted, FALSE) = FALSE
    """), {
        "id": object_id
    }).mappings().first()

    if not exists:

        raise HTTPException(
            status_code=404,
            detail="Obyekt topilmadi"
        )

    operation_type = safe_str(
        data.get("operation_type")
    )

    if not operation_type:

        raise HTTPException(
            status_code=400,
            detail="Operatsiya turi tanlanmagan"
        )

    amount = num(
        data.get("amount")
    )

    if amount < 0:

        raise HTTPException(
            status_code=400,
            detail="Summa manfiy bo‘lishi mumkin emas"
        )

    quantity = num(
        data.get("quantity")
    )

    price = num(
        data.get("price")
    )

    days = num(
        data.get("days")
    )

    daily = num(
        data.get("daily")
    )

    employee_rate = num(
        data.get("employee_rate")
    )

    rate_type = data.get(
        "employee_rate_type"
    )

    # ========================================================
    # AUTOMATIC EMPLOYEE CALCULATION
    # ========================================================

    if operation_type == "employee":

        if rate_type == "daily":

            amount = days * employee_rate

        elif rate_type == "per_meter":

            amount = quantity * employee_rate

        elif rate_type == "per_unit":

            amount = quantity * employee_rate

        elif rate_type == "percent":

            base = num(
                data.get("rate_base")
            )

            amount = (
                base
                * employee_rate
                / 100
            )

        elif rate_type == "fixed":

            amount = employee_rate

        elif rate_type == "monthly":

            amount = employee_rate

    # ========================================================
    # AUTOMATIC MATERIAL CALCULATION
    # ========================================================

    if operation_type == "material":

        if quantity > 0 and price > 0:

            amount = quantity * price

    # ========================================================
    # INSERT
    # ========================================================

    row = db.execute(text("""
        INSERT INTO object_operations (
            object_id,
            operation_type,

            name,

            quantity,
            unit,

            price,
            amount,

            employee,

            days,
            daily,

            expense_type,

            currency,
            payment_method,

            employee_rate_type,
            employee_rate,

            transport_type,

            operation_date,

            note
        )
        VALUES (
            :object_id,
            :operation_type,

            :name,

            :quantity,
            :unit,

            :price,
            :amount,

            :employee,

            :days,
            :daily,

            :expense_type,

            :currency,
            :payment_method,

            :employee_rate_type,
            :employee_rate,

            :transport_type,

            COALESCE(
                :operation_date,
                CURRENT_TIMESTAMP
            ),

            :note
        )
        RETURNING *
    """), {

        "object_id": object_id,

        "operation_type": operation_type,

        "name": safe_str(
            data.get("name")
        ),

        "quantity": quantity,
        "unit": data.get("unit"),

        "price": price,
        "amount": amount,

        "employee": safe_str(
            data.get("employee")
        ),

        "days": days,
        "daily": daily,

        "expense_type": data.get(
            "expense_type"
        ),

        "currency": data.get(
            "currency",
            exists["currency"]
        ),

        "payment_method": data.get(
            "payment_method"
        ),

        "employee_rate_type": rate_type,

        "employee_rate": employee_rate,

        "transport_type": data.get(
            "transport_type"
        ),

        "operation_date": data.get(
            "operation_date"
        ) or None,

        "note": safe_str(
            data.get("note")
        ),
    }).mappings().first()

    # ========================================================
    # PAYMENT
    # ========================================================

    if operation_type == "payment":

        old_paid = num(
            exists["paid"]
        )

        new_paid = old_paid + amount

        total = num(
            exists["total"]
        )

        if total > 0 and new_paid > total:

            raise HTTPException(
                status_code=400,
                detail="To‘lov jami shartnoma summasidan oshib ketmoqda"
            )

        db.execute(text("""
            UPDATE objects
            SET
                paid = :paid,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = :object_id
        """), {
            "paid": new_paid,
            "object_id": object_id,
        })

        add_history(
            db,
            object_id,
            "payment",
            "To‘lov qabul qilindi",
            data.get("note"),
            amount,
            data.get(
                "currency",
                exists["currency"]
            )
        )

    else:

        add_history(
            db,
            object_id,
            operation_type,
            safe_str(
                data.get("name")
            ) or operation_type,
            data.get("note"),
            amount,
            data.get(
                "currency",
                exists["currency"]
            ),
            data.get("employee")
        )

    db.commit()

    return dict(row)


# ============================================================
# CREATE ESTIMATE
# ============================================================

@router.post("/{object_id}/estimates")
def create_estimate(
    object_id: int,
    data: dict,
    db: Session = Depends(get_db)
):

    init_tables(db)

    exists = db.execute(text("""
        SELECT id
        FROM objects
        WHERE id = :id
        AND COALESCE(is_deleted, FALSE) = FALSE
    """), {
        "id": object_id
    }).first()

    if not exists:

        raise HTTPException(
            status_code=404,
            detail="Obyekt topilmadi"
        )

    name = safe_str(
        data.get("name")
    )

    if not name:

        raise HTTPException(
            status_code=400,
            detail="Smeta nomi kiritilmagan"
        )

    quantity = num(
        data.get("quantity")
    )

    sale_price = num(
        data.get("sale_price")
    )

    cost_price = num(
        data.get("cost_price")
    )

    if quantity < 0:

        raise HTTPException(
            status_code=400,
            detail="Miqdor manfiy bo‘lishi mumkin emas"
        )

    sale_total = quantity * sale_price
    cost_total = quantity * cost_price

    profit = (
        sale_total
        - cost_total
    )

    row = db.execute(text("""
        INSERT INTO object_estimates (
            object_id,

            name,
            quantity,
            unit,

            sale_price,
            cost_price,

            sale_total,
            cost_total,
            profit,

            category,
            note
        )
        VALUES (
            :object_id,

            :name,
            :quantity,
            :unit,

            :sale_price,
            :cost_price,

            :sale_total,
            :cost_total,
            :profit,

            :category,
            :note
        )
        RETURNING *
    """), {

        "object_id": object_id,

        "name": name,
        "quantity": quantity,
        "unit": data.get("unit"),

        "sale_price": sale_price,
        "cost_price": cost_price,

        "sale_total": sale_total,
        "cost_total": cost_total,
        "profit": profit,

        "category": data.get(
            "category",
            "Boshqa"
        ),

        "note": safe_str(
            data.get("note")
        ),
    }).mappings().first()

    add_history(
        db,
        object_id,
        "estimate",
        "Smetaga qo‘shildi",
        name,
        sale_total
    )

    db.commit()

    return dict(row)


# ============================================================
# DELETE ESTIMATE
# ============================================================

@router.delete(
    "/{object_id}/estimates/{estimate_id}"
)
def delete_estimate(
    object_id: int,
    estimate_id: int,
    db: Session = Depends(get_db)
):

    init_tables(db)

    row = db.execute(text("""
        SELECT *
        FROM object_estimates
        WHERE id = :id
        AND object_id = :object_id
    """), {
        "id": estimate_id,
        "object_id": object_id
    }).mappings().first()

    if not row:

        raise HTTPException(
            status_code=404,
            detail="Smeta qatori topilmadi"
        )

    db.execute(text("""
        DELETE FROM object_estimates
        WHERE id = :id
        AND object_id = :object_id
    """), {
        "id": estimate_id,
        "object_id": object_id
    })

    add_history(
        db,
        object_id,
        "estimate_delete",
        "Smeta o‘chirildi",
        row["name"]
    )

    db.commit()

    return {
        "success": True
    }


# ============================================================
# CREATE DEBT
# ============================================================

@router.post("/{object_id}/debts")
def create_debt(
    object_id: int,
    data: dict,
    db: Session = Depends(get_db)
):

    init_tables(db)

    debt_type = data.get(
        "debt_type"
    )

    if debt_type not in (
        "customer",
        "supplier"
    ):

        raise HTTPException(
            status_code=400,
            detail="Qarz turi customer yoki supplier bo‘lishi kerak"
        )

    amount = num(
        data.get("amount")
    )

    paid = num(
        data.get("paid")
    )

    if amount <= 0:

        raise HTTPException(
            status_code=400,
            detail="Qarz summasi 0 dan katta bo‘lishi kerak"
        )

    if paid < 0 or paid > amount:

        raise HTTPException(
            status_code=400,
            detail="Qarz to‘lovi noto‘g‘ri"
        )

    row = db.execute(text("""
        INSERT INTO object_debts (
            object_id,
            debt_type,
            name,
            amount,
            paid,
            currency,
            due_date,
            note
        )
        VALUES (
            :object_id,
            :debt_type,
            :name,
            :amount,
            :paid,
            :currency,
            :due_date,
            :note
        )
        RETURNING *
    """), {

        "object_id": object_id,

        "debt_type": debt_type,

        "name": safe_str(
            data.get("name")
        ),

        "amount": amount,
        "paid": paid,

        "currency": data.get(
            "currency",
            "UZS"
        ),

        "due_date": data.get(
            "due_date"
        ) or None,

        "note": safe_str(
            data.get("note")
        ),
    }).mappings().first()

    add_history(
        db,
        object_id,
        "debt",
        "Qarz qo‘shildi",
        data.get("name"),
        amount,
        data.get("currency", "UZS")
    )

    db.commit()

    return dict(row)


# ============================================================
# DEBT PAYMENT
# ============================================================

@router.post(
    "/{object_id}/debts/{debt_id}/payment"
)
def pay_debt(
    object_id: int,
    debt_id: int,
    data: dict,
    db: Session = Depends(get_db)
):

    init_tables(db)

    debt = db.execute(text("""
        SELECT *
        FROM object_debts
        WHERE id = :id
        AND object_id = :object_id
    """), {
        "id": debt_id,
        "object_id": object_id
    }).mappings().first()

    if not debt:

        raise HTTPException(
            status_code=404,
            detail="Qarz topilmadi"
        )

    payment = num(
        data.get("amount")
    )

    remaining = (
        num(debt["amount"])
        - num(debt["paid"])
    )

    if payment <= 0:

        raise HTTPException(
            status_code=400,
            detail="To‘lov summasi noto‘g‘ri"
        )

    if payment > remaining:

        raise HTTPException(
            status_code=400,
            detail="To‘lov qolgan qarzdan katta"
        )

    new_paid = (
        num(debt["paid"])
        + payment
    )

    db.execute(text("""
        UPDATE object_debts
        SET paid = :paid
        WHERE id = :id
    """), {
        "paid": new_paid,
        "id": debt_id
    })

    add_history(
        db,
        object_id,
        "debt_payment",
        "Qarz to‘lovi",
        debt["name"],
        payment,
        debt["currency"]
    )

    db.commit()

    return {
        "success": True,
        "paid": new_paid,
        "remaining": (
            num(debt["amount"])
            - new_paid
        )
    }


# ============================================================
# RETURN / EXCHANGE
# ============================================================

@router.post("/{object_id}/returns")
def create_return(
    object_id: int,
    data: dict,
    db: Session = Depends(get_db)
):

    init_tables(db)

    return_type = data.get(
        "return_type",
        "Qaytarish"
    )

    if return_type not in RETURN_TYPES:

        raise HTTPException(
            status_code=400,
            detail="Qaytarish turi noto‘g‘ri"
        )

    old_quantity = num(
        data.get("old_quantity")
    )

    old_price = num(
        data.get("old_price")
    )

    old_cost = num(
        data.get("old_cost")
    )

    new_quantity = num(
        data.get("new_quantity")
    )

    new_price = num(
        data.get("new_price")
    )

    new_cost = num(
        data.get("new_cost")
    )

    old_total = (
        old_quantity
        * old_price
    )

    new_total = (
        new_quantity
        * new_price
    )

    difference = (
        new_total
        - old_total
    )

    row = db.execute(text("""
        INSERT INTO object_returns (
            object_id,

            return_type,
            reason,

            old_product,
            old_quantity,
            old_unit,
            old_price,
            old_cost,

            new_product,
            new_quantity,
            new_unit,
            new_price,
            new_cost,

            difference,

            currency,
            note
        )
        VALUES (
            :object_id,

            :return_type,
            :reason,

            :old_product,
            :old_quantity,
            :old_unit,
            :old_price,
            :old_cost,

            :new_product,
            :new_quantity,
            :new_unit,
            :new_price,
            :new_cost,

            :difference,

            :currency,
            :note
        )
        RETURNING *
    """), {

        "object_id": object_id,

        "return_type": return_type,

        "reason": safe_str(
            data.get("reason")
        ),

        "old_product": safe_str(
            data.get("old_product")
        ),

        "old_quantity": old_quantity,
        "old_unit": data.get("old_unit"),
        "old_price": old_price,
        "old_cost": old_cost,

        "new_product": safe_str(
            data.get("new_product")
        ),

        "new_quantity": new_quantity,
        "new_unit": data.get("new_unit"),
        "new_price": new_price,
        "new_cost": new_cost,

        "difference": difference,

        "currency": data.get(
            "currency",
            "UZS"
        ),

        "note": safe_str(
            data.get("note")
        ),
    }).mappings().first()

    # ========================================================
    # IMPORTANT:
    # Ombor integratsiyasi keyingi bosqichda qilinadi.
    # Hozir qaytarish/almashtirish tarixi va moliyaviy farqi
    # saqlanadi.
    # ========================================================

    add_history(
        db,
        object_id,
        "return",
        return_type,
        (
            f"{data.get('old_product')} -> "
            f"{data.get('new_product')}"
        ),
        difference,
        data.get("currency", "UZS")
    )

    db.commit()

    return dict(row)


# ============================================================
# CHECKLIST
# ============================================================

@router.post("/{object_id}/checklist")
def create_checklist(
    object_id: int,
    data: dict,
    db: Session = Depends(get_db)
):

    init_tables(db)

    title = safe_str(
        data.get("title")
    )

    if not title:

        raise HTTPException(
            status_code=400,
            detail="Checklist nomi kiritilmagan"
        )

    row = db.execute(text("""
        INSERT INTO object_checklist (
            object_id,
            title,
            assigned_to,
            due_date,
            note
        )
        VALUES (
            :object_id,
            :title,
            :assigned_to,
            :due_date,
            :note
        )
        RETURNING *
    """), {

        "object_id": object_id,
        "title": title,

        "assigned_to": safe_str(
            data.get("assigned_to")
        ),

        "due_date": data.get(
            "due_date"
        ) or None,

        "note": safe_str(
            data.get("note")
        ),
    }).mappings().first()

    add_history(
        db,
        object_id,
        "checklist",
        "Checklist qo‘shildi",
        title
    )

    db.commit()

    return dict(row)


@router.post(
    "/{object_id}/checklist/{checklist_id}/complete"
)
def complete_checklist(
    object_id: int,
    checklist_id: int,
    db: Session = Depends(get_db)
):

    init_tables(db)

    row = db.execute(text("""
        UPDATE object_checklist
        SET
            is_done = TRUE,
            completed_at = CURRENT_TIMESTAMP
        WHERE id = :id
        AND object_id = :object_id
        RETURNING *
    """), {
        "id": checklist_id,
        "object_id": object_id
    }).mappings().first()

    if not row:

        raise HTTPException(
            status_code=404,
            detail="Checklist topilmadi"
        )

    add_history(
        db,
        object_id,
        "checklist_complete",
        "Checklist bajarildi",
        row["title"]
    )

    db.commit()

    return dict(row)


# ============================================================
# SERVICE
# ============================================================

@router.post("/{object_id}/services")
def create_service(
    object_id: int,
    data: dict,
    db: Session = Depends(get_db)
):

    init_tables(db)

    service_type = safe_str(
        data.get("service_type")
    )

    if not service_type:

        raise HTTPException(
            status_code=400,
            detail="Xizmat turi kiritilmagan"
        )

    quantity = num(
        data.get("quantity"),
        1
    )

    price = num(
        data.get("price")
    )

    row = db.execute(text("""
        INSERT INTO object_services (
            object_id,
            service_type,
            quantity,
            unit,
            price,
            employee,
            status,
            service_date,
            note
        )
        VALUES (
            :object_id,
            :service_type,
            :quantity,
            :unit,
            :price,
            :employee,
            :status,
            :service_date,
            :note
        )
        RETURNING *
    """), {

        "object_id": object_id,

        "service_type": service_type,

        "quantity": quantity,

        "unit": data.get(
            "unit",
            "xizmat"
        ),

        "price": price,

        "employee": safe_str(
            data.get("employee")
        ),

        "status": data.get(
            "status",
            "Yangi"
        ),

        "service_date": data.get(
            "service_date"
        ) or None,

        "note": safe_str(
            data.get("note")
        ),
    }).mappings().first()

    amount = (
        quantity
        * price
    )

    add_history(
        db,
        object_id,
        "service",
        service_type,
        data.get("note"),
        amount
    )

    db.commit()

    return dict(row)


# ============================================================
# REFERRAL
# ============================================================

@router.post("/{object_id}/referral")
def create_referral(
    object_id: int,
    data: dict,
    db: Session = Depends(get_db)
):

    init_tables(db)

    reward_type = data.get(
        "reward_type",
        "percent"
    )

    reward_rate = num(
        data.get("reward_rate")
    )

    reward_amount = num(
        data.get("reward_amount")
    )

    max_reward = data.get(
        "max_reward"
    )

    if max_reward is not None:

        max_reward = num(
            max_reward
        )

    row = db.execute(text("""
        INSERT INTO object_referrals (
            object_id,
            referrer_name,
            referrer_code,
            reward_type,
            reward_rate,
            reward_amount,
            max_reward,
            status,
            note
        )
        VALUES (
            :object_id,
            :referrer_name,
            :referrer_code,
            :reward_type,
            :reward_rate,
            :reward_amount,
            :max_reward,
            :status,
            :note
        )
        RETURNING *
    """), {

        "object_id": object_id,

        "referrer_name": safe_str(
            data.get("referrer_name")
        ),

        "referrer_code": safe_str(
            data.get("referrer_code")
        ),

        "reward_type": reward_type,

        "reward_rate": reward_rate,

        "reward_amount": reward_amount,

        "max_reward": max_reward,

        "status": data.get(
            "status",
            "pending"
        ),

        "note": safe_str(
            data.get("note")
        ),
    }).mappings().first()

    add_history(
        db,
        object_id,
        "referral",
        "Referral qo‘shildi",
        data.get("referrer_name")
    )

    db.commit()

    return dict(row)


# ============================================================
# FILE
# ============================================================

@router.post("/{object_id}/files")
def create_file(
    object_id: int,
    data: dict,
    db: Session = Depends(get_db)
):

    init_tables(db)

    file_url = safe_str(
        data.get("file_url")
    )

    if not file_url:

        raise HTTPException(
            status_code=400,
            detail="Fayl URL kiritilmagan"
        )

    row = db.execute(text("""
        INSERT INTO object_files (
            object_id,
            file_name,
            file_url,
            file_type,
            note
        )
        VALUES (
            :object_id,
            :file_name,
            :file_url,
            :file_type,
            :note
        )
        RETURNING *
    """), {

        "object_id": object_id,

        "file_name": safe_str(
            data.get("file_name")
        ),

        "file_url": file_url,

        "file_type": data.get(
            "file_type",
            "image"
        ),

        "note": safe_str(
            data.get("note")
        ),
    }).mappings().first()

    add_history(
        db,
        object_id,
        "file",
        "Fayl qo‘shildi",
        data.get("file_name")
    )

    db.commit()

    return dict(row)


# ============================================================
# DELETE OBJECT
# ============================================================

@router.delete("/{object_id}")
def delete_object(
    object_id: int,
    db: Session = Depends(get_db)
):

    init_tables(db)

    exists = db.execute(text("""
        SELECT id
        FROM objects
        WHERE id = :id
        AND COALESCE(is_deleted, FALSE) = FALSE
    """), {
        "id": object_id
    }).first()

    if not exists:

        raise HTTPException(
            status_code=404,
            detail="Obyekt topilmadi"
        )

    db.execute(text("""
        UPDATE objects
        SET
            is_deleted = TRUE,
            deleted_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = :id
    """), {
        "id": object_id
    })

    add_history(
        db,
        object_id,
        "delete",
        "Obyekt arxivlandi"
    )

    db.commit()

    return {
        "success": True,
        "message": "Obyekt arxivlandi"
    }


# ============================================================
# RESTORE OBJECT
# ============================================================

@router.post("/{object_id}/restore")
def restore_object(
    object_id: int,
    db: Session = Depends(get_db)
):

    init_tables(db)

    row = db.execute(text("""
        UPDATE objects
        SET
            is_deleted = FALSE,
            deleted_at = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = :id
        RETURNING *
    """), {
        "id": object_id
    }).mappings().first()

    if not row:

        raise HTTPException(
            status_code=404,
            detail="Obyekt topilmadi"
        )

    add_history(
        db,
        object_id,
        "restore",
        "Obyekt tiklandi"
    )

    db.commit()

    return dict(row)


# ============================================================
# OPTIONS / DICTIONARIES
# ============================================================

@router.get("/meta/options")
def get_object_options():

    return {
        "object_types": OBJECT_TYPES,
        "work_types": WORK_TYPES,
        "financing_types": FINANCING_TYPES,
        "statuses": STATUSES,
        "currencies": CURRENCIES,
        "operation_types": OPERATION_TYPES,
        "employee_rate_types": EMPLOYEE_RATE_TYPES,
        "payment_methods": PAYMENT_METHODS,
        "expense_types": EXPENSE_TYPES,
        "return_types": RETURN_TYPES,
        "return_reasons": RETURN_REASONS,
        "units": UNITS,
    }