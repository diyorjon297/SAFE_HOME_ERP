from database import get_connection

conn = get_connection()
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS debts (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER,
    amount NUMERIC DEFAULT 0,
    paid NUMERIC DEFAULT 0,
    status VARCHAR(50) DEFAULT 'qarzdor',
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

conn.commit()

cur.close()
conn.close()

print("✅ Debts jadvali yaratildi!")