@app.post("/products")
def add_product(
    name: str,
    model: str,
    serial_number: str,
    purchase_price: float,
    sale_price: float,
    quantity: int,
    warranty_months: int
):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO products
        (name, model, serial_number, purchase_price, sale_price, quantity, warranty_months)
        VALUES (%s,%s,%s,%s,%s,%s,%s)
    """, (
        name,
        model,
        serial_number,
        purchase_price,
        sale_price,
        quantity,
        warranty_months
    ))

    conn.commit()

    cur.close()
    conn.close()

    return {
        "message": "Mahsulot qo'shildi"
    }


@app.get("/products")
def get_products():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, name, model, serial_number,
               purchase_price, sale_price,
               quantity, warranty_months
        FROM products
        ORDER BY id DESC
    """)

    rows = cur.fetchall()

    cur.close()
    conn.close()

    products = []

    for row in rows:
        products.append({
            "id": row[0],
            "name": row[1],
            "model": row[2],
            "serial_number": row[3],
            "purchase_price": float(row[4]),
            "sale_price": float(row[5]),
            "quantity": row[6],
            "warranty_months": row[7]
        })

    return products