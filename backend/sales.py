from database import get_connection

conn = get_connection()
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER,
    product_id INTEGER,
    quantity INTEGER DEFAULT 1,
    sale_price NUMERIC DEFAULT 0,
    purchase_price NUMERIC DEFAULT 0,
    profit NUMERIC DEFAULT 0,
    payment_status VARCHAR(50) DEFAULT 'kutilmoqda',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

conn.commit()

cur.close()
conn.close()

print("✅ Sales jadvali yaratildi!")