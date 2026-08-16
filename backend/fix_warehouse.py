from database import engine
from sqlalchemy import text

with engine.begin() as conn:

    print("1. unit ustuni tekshirilmoqda...")

    conn.execute(text("""
        ALTER TABLE warehouse_history
        ADD COLUMN IF NOT EXISTS unit VARCHAR DEFAULT 'dona'
    """))

    print("2. quantity FLOAT ga o'tkazilmoqda...")

    conn.execute(text("""
        ALTER TABLE warehouse_history
        ALTER COLUMN quantity TYPE DOUBLE PRECISION
        USING quantity::double precision
    """))

    print("TAYYOR!")
