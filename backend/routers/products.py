from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models_product import Product


router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


# =========================================================
# BARCHA MAHSULOTLAR
# =========================================================

@router.get("/")
def get_products(db: Session = Depends(get_db)):
    return (
        db.query(Product)
        .filter(Product.is_active == True)
        .order_by(Product.id.desc())
        .all()
    )


# =========================================================
# MAHSULOT QO'SHISH
# =========================================================

@router.post("/")
def create_product(
    product: dict,
    db: Session = Depends(get_db)
):

    name = str(product.get("name", "")).strip()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Mahsulot nomini kiriting"
        )

    quantity = float(product.get("quantity", 0) or 0)
    purchase_price = float(
        product.get("purchase_price", 0) or 0
    )
    purchase_price_usd = float(
        product.get("purchase_price_usd", 0) or 0
    )
    sale_price = float(
        product.get("sale_price", 0) or 0
    )

    if quantity < 0:
        raise HTTPException(
            status_code=400,
            detail="Miqdor manfiy bo'lishi mumkin emas"
        )

    if purchase_price < 0 or sale_price < 0:
        raise HTTPException(
            status_code=400,
            detail="Narx manfiy bo'lishi mumkin emas"
        )

    warranty = int(
        product.get("warranty_month", 12) or 12
    )

    new_product = Product(
        name=name,
        brand=product.get("brand"),
        model=product.get("model"),
        category=product.get("category"),
        serial_number=product.get("serial_number"),
        purchase_price_usd=purchase_price_usd,
        purchase_price=purchase_price,
        sale_price=sale_price,
        quantity=quantity,
        unit=product.get("unit", "dona"),
        warranty_month=warranty,
        supplier=product.get("supplier"),
        note=product.get("note"),
        is_active=True,
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


# =========================================================
# MAHSULOT QIDIRISH
# =========================================================

@router.get("/search")
def search_products(
    q: str,
    db: Session = Depends(get_db)
):

    search = f"%{q}%"

    return (
        db.query(Product)
        .filter(
            Product.is_active == True,
            (
                Product.name.ilike(search)
                | Product.brand.ilike(search)
                | Product.model.ilike(search)
                | Product.category.ilike(search)
                | Product.serial_number.ilike(search)
            )
        )
        .order_by(Product.id.desc())
        .limit(50)
        .all()
    )


# =========================================================
# BITTA MAHSULOT
# =========================================================

@router.get("/{product_id}")
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):

    item = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Mahsulot topilmadi"
        )

    return item


# =========================================================
# YANGILASH
# =========================================================

@router.put("/{product_id}")
def update_product(
    product_id: int,
    product: dict,
    db: Session = Depends(get_db)
):

    item = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Mahsulot topilmadi"
        )

    numeric_fields = [
        "quantity",
        "purchase_price",
        "purchase_price_usd",
        "sale_price",
        "warranty_month",
    ]

    for field in numeric_fields:

        if field not in product:
            continue

        value = product[field]

        if field == "warranty_month":
            value = int(value or 0)
        else:
            value = float(value or 0)

        if value < 0:
            raise HTTPException(
                status_code=400,
                detail=f"{field} manfiy bo'lishi mumkin emas"
            )

        setattr(item, field, value)

    allowed_fields = {
        "name",
        "brand",
        "model",
        "category",
        "serial_number",
        "unit",
        "supplier",
        "note",
        "is_active",
    }

    for key, value in product.items():

        if key in allowed_fields:
            setattr(item, key, value)

    db.commit()
    db.refresh(item)

    return item


# =========================================================
# O'CHIRISH
# =========================================================

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):

    item = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Mahsulot topilmadi"
        )

    # Bazadan butunlay o'chirmaymiz.
    # Ombor tarixini buzmaslik uchun inactive qilamiz.
    item.is_active = False

    db.commit()

    return {
        "message": "Mahsulot o'chirildi"
    }