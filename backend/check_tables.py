from database import engine
from sqlalchemy import inspect


try:
    inspector = inspect(engine)

    tables = inspector.get_table_names()

    print("DATABASE TABLES:")
    
    if not tables:
        print("Hech qanday jadval topilmadi.")
    else:
        for table in tables:
            print("-", table)

except Exception as e:
    print("TABLE CHECK ERROR")
    print(e)