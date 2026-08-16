from sqlalchemy import text
from database import engine, SessionLocal
from models import Debt


def prepare_debts_table():
    with engine.begin() as conn:
        columns = conn.execute(text("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'debts'
        """)).fetchall()

        existing = {row[0] for row in columns}

        new_columns = {
            "creditor": "VARCHAR",
            "title": "VARCHAR",
            "currency": "VARCHAR DEFAULT 'UZS'",
        }

        for column, definition in new_columns.items():
            if column not in existing:
                conn.execute(
                    text(
                        f"ALTER TABLE debts ADD COLUMN {column} {definition}"
                    )
                )

        print("Debts jadvali tayyor.")


def import_debts():
    db = SessionLocal()

    debts = [
        {
            "creditor": "Farrux yozna",
            "title": "Kredit",
            "amount": 20000000,
            "paid": 0,
            "currency": "UZS",
            "note": "2025 kredit",
        },
        {
            "creditor": "Farrux yozna",
            "title": "Ish haqi",
            "amount": 11800000,
            "paid": 0,
            "currency": "UZS",
            "note": "Aniqlanishi kerak",
        },
        {
            "creditor": "Zarnigor Beshimova",
            "title": "Foizli qarz",
            "amount": 900,
            "paid": 0,
            "currency": "USD",
            "note": "10% foiz",
        },
        {
            "creditor": "Avtokredit",
            "title": "Mashina",
            "amount": 130000000,
            "paid": 0,
            "currency": "UZS",
            "note": "Oylik taxminan 3 000 000",
        },
        {
            "creditor": "Ishonch",
            "title": "Noutbuk",
            "amount": 8000000,
            "paid": 0,
            "currency": "UZS",
            "note": "",
        },
        {
            "creditor": "Ishonch",
            "title": "Konditsioner",
            "amount": 6000000,
            "paid": 0,
            "currency": "UZS",
            "note": "",
        },
        {
            "creditor": "Agrobank",
            "title": "Issiqxona",
            "amount": 20000000,
            "paid": 0,
            "currency": "UZS",
            "note": "",
        },
        {
            "creditor": "Shurik aka",
            "title": "Trade-in",
            "amount": 15000000,
            "paid": 0,
            "currency": "UZS",
            "note": "Oylik 260 000",
        },
        {
            "creditor": "iPhone 16 Pro Max",
            "title": "Bolib tolash",
            "amount": 885,
            "paid": 200,
            "currency": "USD",
            "note": "3 x 295 USD",
        },
    ]

    try:
        for item in debts:
            existing = db.query(Debt).filter(
                Debt.creditor == item["creditor"],
                Debt.title == item["title"],
            ).first()

            if existing:
                print(
                    f"BOR: {item['creditor']} - {item['title']} "
                    f"(qayta kiritilmadi)"
                )
                continue

            debt = Debt(
                creditor=item["creditor"],
                title=item["title"],
                amount=item["amount"],
                paid=item["paid"],
                currency=item["currency"],
                status="qarzdor",
                note=item["note"],
            )

            db.add(debt)

        db.commit()
        print("Qarzlar bazaga kiritildi.")

    except Exception as e:
        db.rollback()
        print("XATO:", e)

    finally:
        db.close()


if __name__ == "__main__":
    prepare_debts_table()
    import_debts()
    print("TAYYOR.")