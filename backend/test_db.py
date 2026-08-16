from database import engine
from sqlalchemy import text


try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("DATABASE OK")
        print("PostgreSQL bilan ulanish muvaffaqiyatli.")
        print("Natija:", result.scalar())

except Exception as e:
    print("DATABASE ERROR")
    print(e)