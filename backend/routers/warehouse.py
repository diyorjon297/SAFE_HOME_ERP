from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models_product import Product, WarehouseHistory

router = APIRouter(
    prefix="/warehouse",
    tags=["Warehouse"]
)

@router.get("/")
def get_warehouse(db: Session = Depends(get_db)):
    return db.query(Product).order_by(Product.id.desc()).all()

@router.get("/history")
def get_warehouse_history(db: Session = Depends(get_db)):
    return db.query(WarehouseHistory).order_by(
        WarehouseHistory.id.desc()
    ).all()

@router.post("/{product_id}/in")
def warehouse_in(
    product_id: int,
    quantity: float,
    db: Session = Depends(get_db)
):
    if quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Miqdor 0 dan katta bo'lishi kerak"
        )

    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Mahsulot topilmadi"
        )

    product.quantity = float(product.quantity or 0) + quantity

    history = WarehouseHistory(
        product_id=product.id,
        product_name=product.name,
        action="KIRIM",
        quantity=quantity,
        unit=product.unit or "dona"
    )

    db.add(history)
    db.commit()
    db.refresh(product)

    return product

@router.post("/{product_id}/out")
def warehouse_out(
    product_id: int,
    quantity: float,
    db: Session = Depends(get_db)
):
    if quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Miqdor 0 dan katta bo'lishi kerak"
        )

    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Mahsulot topilmadi"
        )

    current_quantity = float(product.quantity or 0)

    if quantity > current_quantity:
        raise HTTPException(
            status_code=400,
            detail="Omborda yetarli mahsulot mavjud emas"
        )

    product.quantity = current_quantity - quantity

    history = WarehouseHistory(
        product_id=product.id,
        product_name=product.name,
        action="CHIQIM",
        quantity=quantity,
        unit=product.unit or "dona"
    )

    db.add(history)
    db.commit()
    db.refresh(product)

    return product
