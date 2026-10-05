from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db

router = APIRouter(prefix="/employees", tags=["Employees"])


# ============================================================
# DATABASE
# ============================================================

def init_tables(db: Session):
    """
    Xodimlar tizimi uchun jadvallarni yaratadi.
    IF NOT EXISTS sababli mavjud ma'lumotlarga tegmaydi.
    """

    # --------------------------------------------------------
    # EMPLOYEES
    # --------------------------------------------------------

    db.execute(text("""
        CREATE TABLE IF NOT EXISTS employees (
            id SERIAL PRIMARY KEY,

            full_name VARCHAR(255) NOT NULL,
            phone VARCHAR(100),
            position VARCHAR(150),

            pay_type VARCHAR(50) DEFAULT 'monthly',

            monthly_salary NUMERIC(18,2) DEFAULT 0,

            cable_rate NUMERIC(18,2) DEFAULT 1000,
            camera_rate NUMERIC(18,2) DEFAULT 30000,
            nvr_rate NUMERIC(18,2) DEFAULT 0,
            hdd_rate NUMERIC(18,2) DEFAULT 0,

            other_rate NUMERIC(18,2) DEFAULT 0,

            active BOOLEAN DEFAULT TRUE,

            note TEXT,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))

    # --------------------------------------------------------
    # EMPLOYEE PAYMENTS
    # --------------------------------------------------------

    db.execute(text("""
        CREATE TABLE IF NOT EXISTS employee_payments (
            id SERIAL PRIMARY KEY,

            employee_id INTEGER NOT NULL
                REFERENCES employees(id)
                ON DELETE CASCADE,

            object_id INTEGER NULL
                REFERENCES objects(id)
                ON DELETE SET NULL,

            payment_type VARCHAR(50) DEFAULT 'advance',

            amount NUMERIC(18,2) NOT NULL DEFAULT 0,

            currency VARCHAR(10) DEFAULT 'UZS',

            payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            note TEXT,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))

    # --------------------------------------------------------
    # EMPLOYEE WORK
    # --------------------------------------------------------

    db.execute(text("""
        CREATE TABLE IF NOT EXISTS employee_work (
            id SERIAL PRIMARY KEY,

            employee_id INTEGER NOT NULL
                REFERENCES employees(id)
                ON DELETE CASCADE,

            object_id INTEGER NULL
                REFERENCES objects(id)
                ON DELETE SET NULL,

            work_type VARCHAR(50) NOT NULL,

            quantity NUMERIC(18,2) DEFAULT 0,

            unit VARCHAR(50),

            rate NUMERIC(18,2) DEFAULT 0,

            amount NUMERIC(18,2) DEFAULT 0,

            work_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            note TEXT,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))

    db.commit()


# ============================================================
# HELPERS
# ============================================================

def employee_exists(
    db: Session,
    employee_id: int
):
    return db.execute(text("""
        SELECT *
        FROM employees
        WHERE id = :id
    """), {
        "id": employee_id
    }).mappings().first()


def calculate_work_amount(
    work_type: str,
    quantity: float,
    employee
):
    """
    Xodim ish haqi tarifini avtomatik hisoblaydi.
    """

    work_type = str(work_type or "").lower().strip()

    if work_type in ["cable", "kabel"]:
        rate = float(employee["cable_rate"] or 0)

    elif work_type in [
        "camera",
        "kamera",
        "camera_installation"
    ]:
        rate = float(employee["camera_rate"] or 0)

    elif work_type == "nvr":
        rate = float(employee["nvr_rate"] or 0)

    elif work_type == "hdd":
        rate = float(employee["hdd_rate"] or 0)

    else:
        rate = float(employee["other_rate"] or 0)

    return rate, quantity * rate


# ============================================================
# GET EMPLOYEES
# ============================================================

@router.get("")
def get_employees(
    db: Session = Depends(get_db)
):
    init_tables(db)

    employees = db.execute(text("""
        SELECT *
        FROM employees
        ORDER BY active DESC, id DESC
    """)).mappings().all()

    result = []

    for employee in employees:

        employee_id = employee["id"]

        work_total = db.execute(text("""
            SELECT COALESCE(SUM(amount), 0)
            FROM employee_work
            WHERE employee_id = :employee_id
        """), {
            "employee_id": employee_id
        }).scalar()

        paid_total = db.execute(text("""
            SELECT COALESCE(SUM(amount), 0)
            FROM employee_payments
            WHERE employee_id = :employee_id
        """), {
            "employee_id": employee_id
        }).scalar()

        item = dict(employee)

        item["work_total"] = float(work_total or 0)
        item["paid_total"] = float(paid_total or 0)
        item["remaining"] = (
            item["work_total"]
            + float(item["monthly_salary"] or 0)
            - item["paid_total"]
        )

        result.append(item)

    return result


# ============================================================
# GET SINGLE EMPLOYEE
# ============================================================

@router.get("/{employee_id}")
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db)
):
    init_tables(db)

    employee = employee_exists(
        db,
        employee_id
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Xodim topilmadi"
        )

    work = db.execute(text("""
        SELECT *
        FROM employee_work
        WHERE employee_id = :employee_id
        ORDER BY id DESC
    """), {
        "employee_id": employee_id
    }).mappings().all()

    payments = db.execute(text("""
        SELECT *
        FROM employee_payments
        WHERE employee_id = :employee_id
        ORDER BY id DESC
    """), {
        "employee_id": employee_id
    }).mappings().all()

    work_total = sum(
        float(x["amount"] or 0)
        for x in work
    )

    paid_total = sum(
        float(x["amount"] or 0)
        for x in payments
    )

    result = dict(employee)

    result["work"] = [
        dict(x)
        for x in work
    ]

    result["payments"] = [
        dict(x)
        for x in payments
    ]

    result["work_total"] = work_total
    result["paid_total"] = paid_total

    result["remaining"] = (
        work_total
        + float(employee["monthly_salary"] or 0)
        - paid_total
    )

    return result


# ============================================================
# CREATE EMPLOYEE
# ============================================================

@router.post("")
def create_employee(
    data: dict,
    db: Session = Depends(get_db)
):
    init_tables(db)

    full_name = str(
        data.get("full_name", "")
    ).strip()

    if not full_name:
        raise HTTPException(
            status_code=400,
            detail="Xodim ism-familiyasi kiritilmagan"
        )

    monthly_salary = float(
        data.get("monthly_salary", 0) or 0
    )

    cable_rate = float(
        data.get("cable_rate", 1000) or 1000
    )

    camera_rate = float(
        data.get("camera_rate", 30000) or 30000
    )

    nvr_rate = float(
        data.get("nvr_rate", 0) or 0
    )

    hdd_rate = float(
        data.get("hdd_rate", 0) or 0
    )

    other_rate = float(
        data.get("other_rate", 0) or 0
    )

    values = [
        monthly_salary,
        cable_rate,
        camera_rate,
        nvr_rate,
        hdd_rate,
        other_rate,
    ]

    if any(x < 0 for x in values):
        raise HTTPException(
            status_code=400,
            detail="Tariflar manfiy bo'lishi mumkin emas"
        )

    row = db.execute(text("""
        INSERT INTO employees (
            full_name,
            phone,
            position,

            pay_type,

            monthly_salary,

            cable_rate,
            camera_rate,
            nvr_rate,
            hdd_rate,
            other_rate,

            active,
            note,

            updated_at
        )
        VALUES (
            :full_name,
            :phone,
            :position,

            :pay_type,

            :monthly_salary,

            :cable_rate,
            :camera_rate,
            :nvr_rate,
            :hdd_rate,
            :other_rate,

            :active,
            :note,

            CURRENT_TIMESTAMP
        )
        RETURNING *
    """), {
        "full_name": full_name,

        "phone": data.get("phone"),
        "position": data.get("position"),

        "pay_type": data.get(
            "pay_type",
            "monthly"
        ),

        "monthly_salary": monthly_salary,

        "cable_rate": cable_rate,
        "camera_rate": camera_rate,
        "nvr_rate": nvr_rate,
        "hdd_rate": hdd_rate,
        "other_rate": other_rate,

        "active": bool(
            data.get("active", True)
        ),

        "note": data.get("note"),
    }).mappings().first()

    db.commit()

    return dict(row)


# ============================================================
# UPDATE EMPLOYEE
# ============================================================

@router.put("/{employee_id}")
def update_employee(
    employee_id: int,
    data: dict,
    db: Session = Depends(get_db)
):
    init_tables(db)

    employee = employee_exists(
        db,
        employee_id
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Xodim topilmadi"
        )

    full_name = str(
        data.get(
            "full_name",
            employee["full_name"]
        ) or ""
    ).strip()

    if not full_name:
        raise HTTPException(
            status_code=400,
            detail="Xodim ism-familiyasi kiritilmagan"
        )

    monthly_salary = float(
        data.get(
            "monthly_salary",
            employee["monthly_salary"] or 0
        ) or 0
    )

    cable_rate = float(
        data.get(
            "cable_rate",
            employee["cable_rate"] or 0
        ) or 0
    )

    camera_rate = float(
        data.get(
            "camera_rate",
            employee["camera_rate"] or 0
        ) or 0
    )

    nvr_rate = float(
        data.get(
            "nvr_rate",
            employee["nvr_rate"] or 0
        ) or 0
    )

    hdd_rate = float(
        data.get(
            "hdd_rate",
            employee["hdd_rate"] or 0
        ) or 0
    )

    other_rate = float(
        data.get(
            "other_rate",
            employee["other_rate"] or 0
        ) or 0
    )

    row = db.execute(text("""
        UPDATE employees
        SET
            full_name = :full_name,
            phone = :phone,
            position = :position,

            pay_type = :pay_type,

            monthly_salary = :monthly_salary,

            cable_rate = :cable_rate,
            camera_rate = :camera_rate,
            nvr_rate = :nvr_rate,
            hdd_rate = :hdd_rate,
            other_rate = :other_rate,

            active = :active,
            note = :note,

            updated_at = CURRENT_TIMESTAMP

        WHERE id = :id

        RETURNING *
    """), {
        "id": employee_id,

        "full_name": full_name,

        "phone": data.get(
            "phone",
            employee["phone"]
        ),

        "position": data.get(
            "position",
            employee["position"]
        ),

        "pay_type": data.get(
            "pay_type",
            employee["pay_type"]
        ),

        "monthly_salary": monthly_salary,

        "cable_rate": cable_rate,
        "camera_rate": camera_rate,
        "nvr_rate": nvr_rate,
        "hdd_rate": hdd_rate,
        "other_rate": other_rate,

        "active": bool(
            data.get(
                "active",
                employee["active"]
            )
        ),

        "note": data.get(
            "note",
            employee["note"]
        ),
    }).mappings().first()

    db.commit()

    return dict(row)


# ============================================================
# ADD WORK
# ============================================================

@router.post("/{employee_id}/work")
def add_employee_work(
    employee_id: int,
    data: dict,
    db: Session = Depends(get_db)
):
    init_tables(db)

    employee = employee_exists(
        db,
        employee_id
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Xodim topilmadi"
        )

    work_type = str(
        data.get("work_type", "")
    ).strip().lower()

    if not work_type:
        raise HTTPException(
            status_code=400,
            detail="Ish turi kiritilmagan"
        )

    quantity = float(
        data.get("quantity", 0) or 0
    )

    if quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Miqdor 0 dan katta bo'lishi kerak"
        )

    rate, amount = calculate_work_amount(
        work_type,
        quantity,
        employee
    )

    object_id = data.get("object_id")

    # Obyekt mavjudligini tekshirish
    if object_id:
        object_exists = db.execute(text("""
            SELECT id
            FROM objects
            WHERE id = :id
            AND COALESCE(is_deleted, FALSE) = FALSE
        """), {
            "id": object_id
        }).first()

        if not object_exists:
            raise HTTPException(
                status_code=404,
                detail="Biriktirilgan obyekt topilmadi"
            )

    row = db.execute(text("""
        INSERT INTO employee_work (
            employee_id,
            object_id,

            work_type,

            quantity,
            unit,

            rate,
            amount,

            work_date,
            note
        )
        VALUES (
            :employee_id,
            :object_id,

            :work_type,

            :quantity,
            :unit,

            :rate,
            :amount,

            COALESCE(
                :work_date,
                CURRENT_TIMESTAMP
            ),

            :note
        )
        RETURNING *
    """), {
        "employee_id": employee_id,
        "object_id": object_id,

        "work_type": work_type,

        "quantity": quantity,

        "unit": data.get(
            "unit",
            "dona"
        ),

        "rate": rate,
        "amount": amount,

        "work_date": data.get(
            "work_date"
        ) or None,

        "note": data.get("note"),
    }).mappings().first()

    db.commit()

    return {
        "success": True,
        "work": dict(row),

        "employee": {
            "id": employee["id"],
            "full_name": employee["full_name"],
        },

        "calculation": {
            "quantity": quantity,
            "rate": rate,
            "amount": amount,
        }
    }


# ============================================================
# ADD PAYMENT / ADVANCE
# ============================================================

@router.post("/{employee_id}/payments")
def add_employee_payment(
    employee_id: int,
    data: dict,
    db: Session = Depends(get_db)
):
    init_tables(db)

    employee = employee_exists(
        db,
        employee_id
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Xodim topilmadi"
        )

    amount = float(
        data.get("amount", 0) or 0
    )

    if amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="To'lov summasi 0 dan katta bo'lishi kerak"
        )

    object_id = data.get("object_id")

    if object_id:
        exists = db.execute(text("""
            SELECT id
            FROM objects
            WHERE id = :id
        """), {
            "id": object_id
        }).first()

        if not exists:
            raise HTTPException(
                status_code=404,
                detail="Obyekt topilmadi"
            )

    row = db.execute(text("""
        INSERT INTO employee_payments (
            employee_id,
            object_id,

            payment_type,

            amount,
            currency,

            payment_date,
            note
        )
        VALUES (
            :employee_id,
            :object_id,

            :payment_type,

            :amount,
            :currency,

            COALESCE(
                :payment_date,
                CURRENT_TIMESTAMP
            ),

            :note
        )
        RETURNING *
    """), {
        "employee_id": employee_id,
        "object_id": object_id,

        "payment_type": data.get(
            "payment_type",
            "advance"
        ),

        "amount": amount,

        "currency": data.get(
            "currency",
            "UZS"
        ),

        "payment_date": data.get(
            "payment_date"
        ) or None,

        "note": data.get("note"),
    }).mappings().first()

    db.commit()

    return dict(row)


# ============================================================
# EMPLOYEE OBJECT SUMMARY
# ============================================================

@router.get("/{employee_id}/objects")
def employee_objects(
    employee_id: int,
    db: Session = Depends(get_db)
):
    init_tables(db)

    employee = employee_exists(
        db,
        employee_id
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Xodim topilmadi"
        )

    rows = db.execute(text("""
        SELECT
            ew.object_id,

            o.name AS object_name,

            SUM(ew.quantity) AS quantity,
            SUM(ew.amount) AS employee_cost

        FROM employee_work ew

        LEFT JOIN objects o
            ON o.id = ew.object_id

        WHERE ew.employee_id = :employee_id

        GROUP BY
            ew.object_id,
            o.name

        ORDER BY
            ew.object_id DESC
    """), {
        "employee_id": employee_id
    }).mappings().all()

    return [
        dict(x)
        for x in rows
    ]


# ============================================================
# ARCHIVE EMPLOYEE
# ============================================================

@router.delete("/{employee_id}")
def archive_employee(
    employee_id: int,
    db: Session = Depends(get_db)
):
    init_tables(db)

    employee = employee_exists(
        db,
        employee_id
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Xodim topilmadi"
        )

    db.execute(text("""
        UPDATE employees
        SET
            active = FALSE,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = :id
    """), {
        "id": employee_id
    })

    db.commit()

    return {
        "success": True,
        "message": "Xodim arxivlandi"
    }