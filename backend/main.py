from fastapi import FastAPI
from pydantic import BaseModel
from database import get_connection

app = FastAPI(
    title="SAFE HOME SERVICES ERP",
    description="SAFE HOME SERVICES uchun ERP boshqaruv tizimi",
    version="1.0"
)


class Customer(BaseModel):
    name: str
    phone: str
    address: str


@app.get("/")
def home():
    return {
        "message": "SAFE HOME SERVICES ERP ishlayapti"
    }


@app.get("/db-test")
def db_test():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT current_database();")
    result = cur.fetchone()

    cur.close()
    conn.close()

    return {
        "database": result[0]
    }


# =========================
# MIJOZLAR
# =========================

@app.post("/customers")
def add_customer(customer: Customer):

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO customers (name, phone, address)
        VALUES (%s, %s, %s)
    """, (
        customer.name,
        customer.phone,
        customer.address
    ))

    conn.commit()

    cur.close()
    conn.close()

    return {
        "message": "Mijoz qo'shildi"
    }


@app.get("/customers")
def get_customers():

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, name, phone, address, debt, created_at
        FROM customers
        ORDER BY id DESC
    """)

    rows = cur.fetchall()

    cur.close()
    conn.close()

    customers = []

    for row in rows:
        customers.append({
            "id": row[0],
            "name": row[1],
            "phone": row[2],
            "address": row[3],
            "debt": float(row[4]),
            "created_at": str(row[5])
        })

    return customers# =========================
# MIJOZ O'ZGARTIRISH
# =========================

@app.put("/customers/{customer_id}")
def update_customer(customer_id: int, customer: Customer):

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE customers
        SET name=%s, phone=%s, address=%s
        WHERE id=%s
    """, (
        customer.name,
        customer.phone,
        customer.address,
        customer_id
    ))

    conn.commit()

    cur.close()
    conn.close()

    return {
        "message": "Mijoz yangilandi"
    }


# =========================
# MIJOZ O'CHIRISH
# =========================

@app.delete("/customers/{customer_id}")
def delete_customer(customer_id: int):

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        DELETE FROM customers
        WHERE id=%s
    """, (customer_id,))

    conn.commit()

    cur.close()
    conn.close()

    return {
        "message": "Mijoz o'chirildi"
    }