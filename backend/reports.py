from database import get_connection

conn = get_connection()
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    report_type VARCHAR(50),
    total_income NUMERIC DEFAULT 0,
    total_expense NUMERIC DEFAULT 0,
    total_profit NUMERIC DEFAULT 0,
    report_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

conn.commit()

cur.close()
conn.close()

print("✅ Reports jadvali yaratildi!")