from database import get_connection

conn = get_connection()
cur = conn.cursor()

cur.execute("""
SELECT column_name
FROM information_schema.columns
WHERE table_name='customers';
""")

rows = cur.fetchall()

for row in rows:
    print(row[0])

cur.close()
conn.close()