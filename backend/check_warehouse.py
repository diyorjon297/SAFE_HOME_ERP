from database import engine
from sqlalchemy import inspect

inspector = inspect(engine)

print("=== WAREHOUSE_HISTORY ===")

tables = inspector.get_table_names()

if "warehouse_history" not in tables:
    print("JADVAL MAVJUD EMAS!")
else:
    print("Jadval mavjud.")
    print()
    print("Ustunlar:")

    for col in inspector.get_columns("warehouse_history"):
        print(
            col["name"],
            "|",
            col["type"],
            "| nullable:",
            col["nullable"]
        )
