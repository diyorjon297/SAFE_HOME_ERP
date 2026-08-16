from database import engine
from sqlalchemy import text


with engine.connect() as conn:

    conn.execute(text("""
        ALTER TABLE debts
        ADD COLUMN IF NOT EXISTS amount FLOAT DEFAULT 0;
    """))

    conn.execute(text("""
        ALTER TABLE debts
        ADD COLUMN IF NOT EXISTS paid FLOAT DEFAULT 0;
    """))

    conn.execute(text("""
        ALTER TABLE debts
        ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'qarzdor';
    """))

    conn.execute(text("""
        ALTER TABLE debts
        ADD COLUMN IF NOT EXISTS note TEXT;
    """))

    conn.execute(text("""
        ALTER TABLE debts
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    """))

    conn.commit()


print("✅ debts jadvali to'liq tuzatildi")