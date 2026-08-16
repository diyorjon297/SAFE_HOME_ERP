from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models_product import Product


router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


# =========================
# BARCHA MAHSULOTLAR
# =========================

@router.get("/")
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).order_by(Product.id.desc()).all()


# =========================
# MAHSULOT QO'SHISH
# =========================

@router.post("/")
def create_product(
    product: dict,
    db: Session = Depends(get_db)
):

    quantity = float(product.get("quantity", 0) or 0)

    if quantity < 0:
        raise HTTPException(
            status_code=400,
            detail="Miqdor manfiy bo'lishi mumkin emas"
        )

    purchase_price = float(
        product.get("purchase_price", 0) or 0
    )

    sale_price = float(
        product.get("sale_price", 0) or 0
    )

    if purchase_price < 0 or sale_price < 0:
        raise HTTPException(
            status_code=400,
            detail="Narx manfiy bo'lishi mumkin emas"
        )

    new_product = Product(
        name=product.get("name"),
        brand=product.get("brand"),
        model=product.get("model"),
        category=product.get("category"),
        resolution=product.get("resolution"),
        connection=product.get("connection"),
        serial_number=product.get("serial_number"),
        purchase_price=purchase_price,
        sale_price=sale_price,
        quantity=quantity,
        unit=product.get("unit", "dona"),
        warranty_month=int(
            product.get("warranty_month", 12) or 12
        )
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


# =========================
# MAHSULOT QIDIRISH
# =========================

@router.get("/search")
def search_products(
    q: str,
    db: Session = Depends(get_db)
):

    return db.query(Product).filter(
        (Product.name.ilike(f"%{q}%")) |
        (Product.brand.ilike(f"%{q}%")) |
        (Product.model.ilike(f"%{q}%")) |
        (Product.category.ilike(f"%{q}%"))
    ).limit(20).all()


# =========================
# YANGILASH
# =========================

@router.put("/{product_id}")
def update_product(
    product_id: int,
    product: dict,
    db: Session = Depends(get_db)
):

    item = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Product topilmadi"
        )

    if "quantity" in product:
        quantity = float(product["quantity"] or 0)

        if quantity < 0:
            raise HTTPException(
                status_code=400,
                detail="Miqdor manfiy bo'lishi mumkin emas"
            )

        item.quantity = quantity

    if "purchase_price" in product:
        purchase_price = float(
            product["purchase_price"] or 0
        )

        if purchase_price < 0:
            raise HTTPException(
                status_code=400,
                detail="Kirim narxi manfiy bo'lishi mumkin emas"
            )

        item.purchase_price = purchase_price

    if "sale_price" in product:
        sale_price = float(
            product["sale_price"] or 0
        )

        if sale_price < 0:
            raise HTTPException(
                status_code=400,
                detail="Sotuv narxi manfiy bo'lishi mumkin emas"
            )

        item.sale_price = sale_price

    allowed_fields = {
        "name",
        "brand",
        "model",
        "category",
        "resolution",
        "connection",
        "serial_number",
        "unit",
        "warranty_month",
    }

    for key, value in product.items():
        if key in allowed_fields:
            setattr(item, key, value)

    db.commit()
    db.refresh(item)

    return item


# =========================
# O'CHIRISH
# =========================

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):

    item = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Product topilmadi"
        )

    db.delete(item)
    db.commit()

    return {
        "message": "Mahsulot o'chirildi"
    }