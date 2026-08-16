from sqlalchemy import text
from database import engine


print("========================================")
print("SALES JADVALI TEKSHIRILMOQDA...")
print("========================================")

try:
    with engine.begin() as conn:

        # =====================================
        # SALES JADVALI
        # =====================================

        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS sales (
                id SERIAL PRIMARY KEY,
                customer_id INTEGER,
                customer_name VARCHAR(255),
                product_id INTEGER NOT NULL,
                product_name VARCHAR(255),
                unit VARCHAR(50) DEFAULT 'dona',
                quantity DOUBLE PRECISION NOT NULL DEFAULT 1,
                price DOUBLE PRECISION NOT NULL DEFAULT 0,
                total DOUBLE PRECISION NOT NULL DEFAULT 0,
                payment_status VARCHAR(50) DEFAULT 'Naqd',
                profit DOUBLE PRECISION DEFAULT 0,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))

        # =====================================
        # ESKI SALES JADVALIGA YANGI USTUNLAR
        # =====================================

        conn.execute(text("""
            ALTER TABLE sales
            ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255)
        """))

        conn.execute(text("""
            ALTER TABLE sales
            ADD COLUMN IF NOT EXISTS product_name VARCHAR(255)
        """))

        conn.execute(text("""
            ALTER TABLE sales
            ADD COLUMN IF NOT EXISTS unit VARCHAR(50) DEFAULT 'dona'
        """))

        conn.execute(text("""
            ALTER TABLE sales
            ADD COLUMN IF NOT EXISTS price DOUBLE PRECISION DEFAULT 0
        """))

        conn.execute(text("""
            ALTER TABLE sales
            ADD COLUMN IF NOT EXISTS total DOUBLE PRECISION DEFAULT 0
        """))

        conn.execute(text("""
            ALTER TABLE sales
            ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'Naqd'
        """))

        conn.execute(text("""
            ALTER TABLE sales
            ADD COLUMN IF NOT EXISTS profit DOUBLE PRECISION DEFAULT 0
        """))

        conn.execute(text("""
            ALTER TABLE sales
            ADD COLUMN IF NOT EXISTS date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        """))

        # =====================================
        # ESKI SALE_PRICE BO'LSA PRICE GA
        # =====================================

        conn.execute(text("""
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_name = 'sales'
                    AND column_name = 'sale_price'
                ) THEN

                    UPDATE sales
                    SET price = sale_price
                    WHERE (price IS NULL OR price = 0)
                    AND sale_price IS NOT NULL;

                END IF;
            END
            $$;
        """))

        # =====================================
        # ESKI CREATED_AT BO'LSA DATE GA
        # =====================================

        conn.execute(text("""
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_name = 'sales'
                    AND column_name = 'created_at'
                ) THEN

                    UPDATE sales
                    SET date = created_at
                    WHERE date IS NULL
                    AND created_at IS NOT NULL;

                END IF;
            END
            $$;
        """))

        # =====================================
        # NULL QIYMATLARNI TOZALASH
        # =====================================

        conn.execute(text("""
            UPDATE sales
            SET quantity = 1
            WHERE quantity IS NULL
        """))

        conn.execute(text("""
            UPDATE sales
            SET price = 0
            WHERE price IS NULL
        """))

        conn.execute(text("""
            UPDATE sales
            SET total = quantity * price
            WHERE total IS NULL
        """))

        conn.execute(text("""
            UPDATE sales
            SET profit = 0
            WHERE profit IS NULL
        """))

        conn.execute(text("""
            UPDATE sales
            SET payment_status = 'Naqd'
            WHERE payment_status IS NULL
        """))

        conn.execute(text("""
            UPDATE sales
            SET unit = 'dona'
            WHERE unit IS NULL
        """))

    print("")
    print("========================================")
    print("✅ 3-QADAM MUVAFFAQIYATLI BAJARILDI")
    print("========================================")
    print("✅ sales jadvali tekshirildi")
    print("✅ customer_name qo'shildi")
    print("✅ product_name qo'shildi")
    print("✅ unit qo'shildi")
    print("✅ price qo'shildi")
    print("✅ total qo'shildi")
    print("✅ payment_status qo'shildi")
    print("✅ profit qo'shildi")
    print("✅ date qo'shildi")
    print("========================================")

except Exception as e:

    print("")
    print("========================================")
    print("❌ XATOLIK")
    print("========================================")
    print(e)
    print("========================================")