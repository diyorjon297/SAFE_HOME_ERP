from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import Sale, Customer
from models_product import Product, WarehouseHistory


router = APIRouter(
    prefix="/sales",
    tags=["Sales"]
)


# =====================================================
# SCHEMAS
# =====================================================

class SaleItem(BaseModel):
    product_id: int
    quantity: float
    price: float | None = None


class BatchSaleRequest(BaseModel):
    customer_id: int
    payment_status: str = "Naqd"
    items: list[SaleItem]


# =====================================================
# BARCHA SOTUVLAR
# =====================================================

@router.get("/")
def get_sales(db: Session = Depends(get_db)):
    return db.query(Sale).order_by(
        Sale.id.desc()
    ).all()


# =====================================================
# ESKI BIR DONALIK SOTUV
# =====================================================

@router.post("/")
def create_sale(
    customer_id: int,
    customer_name: str,
    product_id: int,
    quantity: float,
    payment_status: str = "Naqd",
    db: Session = Depends(get_db),
):
    if quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Miqdor 0 dan katta bo'lishi kerak",
        )

    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Mahsulot topilmadi",
        )

    current_quantity = float(
        product.quantity or 0
    )

    if current_quantity < quantity:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Omborda yetarli mahsulot yo'q. "
                f"Qoldiq: {current_quantity}"
            ),
        )

    customer = db.query(Customer).filter(
        Customer.id == customer_id
    ).first()

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Mijoz topilmadi",
        )

    sale_price = float(
        product.sale_price or 0
    )

    purchase_price = float(
        product.purchase_price or 0
    )

    total = sale_price * quantity

    profit = (
        sale_price - purchase_price
    ) * quantity

    try:

        # ---------------------------------------------
        # OMBORDAN CHIQARISH
        # ---------------------------------------------

        product.quantity = (
            current_quantity - quantity
        )

        # ---------------------------------------------
        # SOTUV
        # ---------------------------------------------

        sale = Sale(
            customer_id=customer.id,
            customer_name=customer.name,
            product_id=product.id,
            product_name=product.name,
            quantity=quantity,
            price=sale_price,
            total=total,
            payment_status=payment_status,
            profit=profit,
        )

        db.add(sale)

        # ---------------------------------------------
        # OMBOR TARIXI
        # ---------------------------------------------

        history = WarehouseHistory(
            product_id=product.id,
            product_name=product.name,
            action="CHIQIM",
            quantity=quantity,
            unit=product.unit or "dona",
        )

        db.add(history)

        # ---------------------------------------------
        # QARZ
        # ---------------------------------------------

        if payment_status == "Qarz":
            customer.debt = (
                float(customer.debt or 0)
                + total
            )

        db.commit()

        db.refresh(sale)
        db.refresh(product)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Sotuvni saqlashda xatolik",
        )

    return {
        "message": "Sotuv muvaffaqiyatli saqlandi",
        "sale": sale,
        "warehouse_remaining": product.quantity,
        "total": total,
        "profit": profit,
    }


# =====================================================
# KOMPLEKT SOTUV
# =====================================================

@router.post("/batch")
def create_batch_sale(
    data: BatchSaleRequest,
    db: Session = Depends(get_db),
):

    if not data.items:
        raise HTTPException(
            status_code=400,
            detail="Kamida bitta mahsulot qo'shing",
        )

    if data.payment_status not in {
        "Naqd",
        "Karta",
        "Qarz",
    }:
        raise HTTPException(
            status_code=400,
            detail="To'lov turi noto'g'ri",
        )

    customer = db.query(Customer).filter(
        Customer.id == data.customer_id
    ).first()

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Mijoz topilmadi",
        )

    # =================================================
    # MAHSULOTLARNI BIRLASHTIRISH
    # =================================================

    merged = {}

    for item in data.items:

        if item.quantity <= 0:
            raise HTTPException(
                status_code=400,
                detail="Miqdor 0 dan katta bo'lishi kerak",
            )

        if item.product_id in merged:

            merged[item.product_id]["quantity"] += (
                float(item.quantity)
            )

            if item.price is not None:
                merged[item.product_id]["price"] = (
                    float(item.price)
                )

        else:

            merged[item.product_id] = {
                "quantity": float(item.quantity),
                "price": (
                    float(item.price)
                    if item.price is not None
                    else None
                ),
            }

    # =================================================
    # OLDINDAN TEKSHIRISH
    # =================================================

    prepared_items = []

    total_amount = 0.0
    total_profit = 0.0

    for product_id, item_data in merged.items():

        product = db.query(Product).filter(
            Product.id == product_id
        ).first()

        if not product:
            raise HTTPException(
                status_code=404,
                detail=(
                    f"Mahsulot topilmadi: "
                    f"{product_id}"
                ),
            )

        quantity = item_data["quantity"]

        warehouse_quantity = float(
            product.quantity or 0
        )

        if warehouse_quantity < quantity:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"{product.name} uchun "
                    f"omborda yetarli mahsulot yo'q. "
                    f"Mavjud: {warehouse_quantity}"
                ),
            )

        purchase_price = float(
            product.purchase_price or 0
        )

        sale_price = item_data["price"]

        if sale_price is None:
            sale_price = float(
                product.sale_price or 0
            )

        if sale_price < 0:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"{product.name} uchun narx "
                    f"manfiy bo'lishi mumkin emas"
                ),
            )

        line_total = (
            sale_price * quantity
        )

        line_profit = (
            sale_price - purchase_price
        ) * quantity

        prepared_items.append({
            "product": product,
            "quantity": quantity,
            "sale_price": sale_price,
            "purchase_price": purchase_price,
            "line_total": line_total,
            "line_profit": line_profit,
        })

        total_amount += line_total
        total_profit += line_profit

    # =================================================
    # SAQLASH
    # =================================================

    try:

        created_sales = []

        for item in prepared_items:

            product = item["product"]
            quantity = item["quantity"]

            # -----------------------------------------
            # OMBORDAN CHIQARISH
            # -----------------------------------------

            product.quantity = (
                float(product.quantity or 0)
                - quantity
            )

            # -----------------------------------------
            # SOTUV
            # -----------------------------------------

            sale = Sale(
                customer_id=customer.id,
                customer_name=customer.name,
                product_id=product.id,
                product_name=product.name,
                quantity=quantity,
                price=item["sale_price"],
                total=item["line_total"],
                payment_status=data.payment_status,
                profit=item["line_profit"],
            )

            db.add(sale)

            created_sales.append(sale)

            # -----------------------------------------
            # OMBOR TARIXI
            # -----------------------------------------

            history = WarehouseHistory(
                product_id=product.id,
                product_name=product.name,
                action="CHIQIM",
                quantity=quantity,
                unit=product.unit or "dona",
            )

            db.add(history)

        # ---------------------------------------------
        # QARZ
        # ---------------------------------------------

        if data.payment_status == "Qarz":

            customer.debt = (
                float(customer.debt or 0)
                + total_amount
            )

        db.commit()

        for sale in created_sales:
            db.refresh(sale)

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Komplekt sotuvini saqlashda xatolik",
        )

    return {
        "message": "Komplekt muvaffaqiyatli sotildi",
        "customer_id": customer.id,
        "customer_name": customer.name,
        "payment_status": data.payment_status,
        "items_count": len(created_sales),
        "total": total_amount,
        "profit": total_profit,
        "sales": created_sales,
    }
