from database import get_connection

try:
    conn = get_connection()
    print("✅ PostgreSQL ulanish muvaffaqiyatli!")
    conn.close()
except Exception as e:
    print("❌ Xato:", e)