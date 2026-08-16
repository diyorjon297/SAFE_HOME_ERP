from database import SessionLocal
from models import Debt


# =========================================================
# EXCELDAN IMPORT QILINADIGAN ANIQ QARZLAR
# =========================================================

debts_to_import = [
    {
        "creditor": "Farrux yozna",
        "title": "Kredit",
        "amount": 20_000_000,
        "currency": "UZS",
        "note": "Excel ma'lumotidan import qilindi",
    },
    {
        "creditor": "Avtokredit",
        "title": "Mashina krediti",
        "amount": 130_000_000,
        "currency": "UZS",
        "note": "Excel ma'lumotidan import qilindi",
    },
    {
        "creditor": "Ishonch",
        "title": "Noutbuk",
        "amount": 8_000_000,
        "currency": "UZS",
        "note": "Excel ma'lumotidan import qilindi",
    },
    {
        "creditor": "Ishonch",
        "title": "Konditsioner",
        "amount": 6_000_000,
        "currency": "UZS",
        "note": "Excel ma'lumotidan import qilindi",
    },
    {
        "creditor": "Agrobank",
        "title": "Issiqxona krediti",
        "amount": 20_000_000,
        "currency": "UZS",
        "note": "Excel ma'lumotidan import qilindi",
    },
    {
        "creditor": "Shurik aka",
        "title": "Trade-in",
        "amount": 15_000_000,
        "currency": "UZS",
        "note": "Excel ma'lumotidan import qilindi",
    },
]


# =========================================================
# IMPORT
# =========================================================

def import_debts():
    db = SessionLocal()

    try:
        imported = 0
        skipped = 0

        for item in debts_to_import:

            # Bir xil qarzni ikki marta qo'shmaslik
            existing = (
                db.query(Debt)
                .filter(
                    Debt.creditor == item["creditor"],
                    Debt.title == item["title"],
                    Debt.amount == item["amount"],
                    Debt.currency == item["currency"],
                )
                .first()
            )

            if existing:
                print(
                    f"SKIP: {item['creditor']} - "
                    f"{item['title']} allaqachon mavjud"
                )
                skipped += 1
                continue

            debt = Debt(
                creditor=item["creditor"],
                title=item["title"],
                amount=item["amount"],
                paid=0,
                currency=item["currency"],
                status="qarzdor",
                note=item["note"],
            )

            db.add(debt)
            imported += 1

            print(
                f"IMPORT: {item['creditor']} - "
                f"{item['title']} - "
                f"{item['amount']:,} {item['currency']}"
            )

        db.commit()

        print()
        print("=" * 50)
        print("IMPORT YAKUNLANDI")
        print("=" * 50)
        print(f"Qo'shilgan: {imported}")
        print(f"O'tkazib yuborilgan: {skipped}")
        print("=" * 50)

    except Exception as e:
        db.rollback()

        print()
        print("XATOLIK:")
        print(e)

    finally:
        db.close()


if __name__ == "__main__":
    import_debts()