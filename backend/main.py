from fastapi import FastAPI
from database import get_connection

app = FastAPI(
    title="SAFE HOME SERVICES ERP",
    description="SAFE HOME SERVICES uchun ERP boshqaruv tizimi",
    version="1.0"
)


@app.get("/", summary="🏠 Bosh sahifa")
def home():
    return {
        "message": "SAFE HOME SERVICES ERP ishlayapti"
    }


@app.get("/db-test", summary="🗄️ Ma'lumotlar bazasini tekshirish")
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

@app.post("/customers", summary="👤 Mijoz qo'shish")
def add_customer(
    name: str,
    phone: str,
    address: str
):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO customers (name, phone, address)
        VALUES (%s, %s, %s)
    """, (name, phone, address))

    conn.commit()

    cur.close()
    conn.close()

    return {"message": "Mijoz qo'shildi"}


@app.get("/customers", summary="📋 Mijozlar ro'yxati")
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

    return customers


# =========================
# MAHSULOTLAR
# =========================

@app.post("/products", summary="📦 Mahsulot qo'shish")
def add_product(
    name: str,
    model: str,
    serial_number: str,
    purchase_price: float,
    sale_price: float,
    quantity: int,
    warranty_months: int
):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO products
        (name, model, serial_number, purchase_price, sale_price, quantity, warranty_months)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (
        name,
        model,
        serial_number,
        purchase_price,
        sale_price,
        quantity,
        warranty_months
    ))

    conn.commit()

    cur.close()
    conn.close()

    return {"message": "Mahsulot qo'shildi"}


@app.get("/products", summary="📦 Mahsulotlar ro'yxati")
def get_products():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            id,
            name,
            model,
            serial_number,
            purchase_price,
            sale_price,
            quantity,
            warranty_months,
            created_at
        FROM products
        ORDER BY id DESC
    """)

    rows = cur.fetchall()

    cur.close()
    conn.close()

    products = []

    for row in rows:
        products.append({
            "id": row[0],
            "name": row[1],
            "model": row[2],
            "serial_number": row[3],
            "purchase_price": float(row[4]),
            "sale_price": float(row[5]),
            "quantity": row[6],
            "warranty_months": row[7],
            "created_at": str(row[8])
        })

    return products