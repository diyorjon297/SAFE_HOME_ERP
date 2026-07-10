from database import get_connection

conn = get_connection()
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS installations (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER,
    address TEXT,
    camera_type VARCHAR(100),
    camera_count INTEGER DEFAULT 0,
    nvr_model VARCHAR(100),
    installation_date DATE,
    warranty_month INTEGER DEFAULT 12,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

conn.commit()

cur.close()
conn.close()

print("✅ Installations jadvali yaratildi!")