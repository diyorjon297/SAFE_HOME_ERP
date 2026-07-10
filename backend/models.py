@app.get("/customers")
def get_customers():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, fullname, phone, address, service, debt
        FROM customers
        ORDER BY id DESC
    """)

    data = cur.fetchall()

    cur.close()
    conn.close()

    return data