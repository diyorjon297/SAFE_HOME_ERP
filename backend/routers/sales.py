from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import Sale, Customer, Service
from models_product import Product, WarehouseHistory


router = APIRouter(
    prefix="/sales",
    tags=["Sales"]
)


# =====================================================
# SCHEMAS
# =====================================================

class SaleItem(BaseModel):
    item_type: str = "product"
    product_id: int | None = None
    service_id: int | None = None
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
# KOMPLEKT SOTUV
# MAHSULOT + XIZMAT
# =====================================================

@router.post("/batch")
def create_batch_sale(
    data: BatchSaleRequest,
    db: Session = Depends(get_db),
):

    if not data.items:
        raise HTTPException(
            status_code=400,
            detail="Kamida bitta mahsulot yoki xizmat qo'shing",
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

    prepared_items = []

    total_amount = 0.0
    total_profit = 0.0

    # =================================================
    # HAR BIR ITEMNI TEKSHIRISH
    # =================================================

    for item in data.items:

        if item.quantity <= 0:
            raise HTTPException(
                status_code=400,
                detail="Miqdor 0 dan katta bo'lishi kerak",
            )

        # =================================================
        # MAHSULOT
        # =================================================

        if item.item_type == "product":

            if not item.product_id:
                raise HTTPException(
                    status_code=400,
                    detail="Mahsulot tanlanmagan",
                )

            product = db.query(Product).filter(
                Product.id == item.product_id
            ).first()

            if not product:
                raise HTTPException(
                    status_code=404,
                    detail="Mahsulot topilmadi",
                )

            warehouse_quantity = float(
                product.quantity or 0
            )

            if warehouse_quantity < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"{product.name} uchun omborda "
                        f"yetarli mahsulot yo'q. "
                        f"Mavjud: {warehouse_quantity} "
                        f"{product.unit or 'dona'}"
                    ),
                )

            purchase_price = float(
                product.purchase_price or 0
            )

            sale_price = (
                float(item.price)
                if item.price is not None
                else float(product.sale_price or 0)
            )

            if sale_price < 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"{product.name} uchun narx noto'g'ri",
                )

            line_total = sale_price * item.quantity

            line_profit = (
                sale_price - purchase_price
            ) * item.quantity

            prepared_items.append({
                "item_type": "product",
                "product": product,
                "service": None,
                "quantity": float(item.quantity),
                "price": sale_price,
                "unit": product.unit or "dona",
                "name": product.name,
                "total": line_total,
                "profit": line_profit,
            })

            total_amount += line_total
            total_profit += line_profit

        # =================================================
        # XIZMAT
        # =================================================

        elif item.item_type == "service":

            if not item.service_id:
                raise HTTPException(
                    status_code=400,
                    detail="Xizmat tanlanmagan",
                )

            service = db.query(Service).filter(
                Service.id == item.service_id,
                Service.is_active == 1
            ).first()

            if not service:
                raise HTTPException(
                    status_code=404,
                    detail="Xizmat topilmadi",
                )

            sale_price = (
                float(item.price)
                if item.price is not None
                else float(service.sale_price or 0)
            )

            cost_price = float(
                service.cost_price or 0
            )

            if sale_price < 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"{service.name} uchun narx noto'g'ri",
                )

            line_total = sale_price * item.quantity

            line_profit = (
                sale_price - cost_price
            ) * item.quantity

            prepared_items.append({
                "item_type": "service",
                "product": None,
                "service": service,
                "quantity": float(item.quantity),
                "price": sale_price,
                "unit": service.unit or "xizmat",
                "name": service.name,
                "total": line_total,
                "profit": line_profit,
            })

            total_amount += line_total
            total_profit += line_profit

        else:

            raise HTTPException(
                status_code=400,
                detail=(
                    "item_type faqat 'product' yoki "
                    "'service' bo'lishi mumkin"
                ),
            )

    # =================================================
    # SAQLASH
    # =================================================

    try:

        created_sales = []

        for item in prepared_items:

            product = item["product"]

            # -----------------------------------------
            # MAHSULOT OMBORDAN CHIQADI
            # -----------------------------------------

            if item["item_type"] == "product":

                product.quantity = (
                    float(product.quantity or 0)
                    - item["quantity"]
                )

                history = WarehouseHistory(
                    product_id=product.id,
                    product_name=product.name,
                    action="CHIQIM",
                    quantity=item["quantity"],
                    unit=product.unit or "dona",
                )

                db.add(history)

            # -----------------------------------------
            # SOTUV YOZUVINI SAQLASH
            # -----------------------------------------

            sale = Sale(
                customer_id=customer.id,
                customer_name=customer.name,

                item_type=item["item_type"],

                product_id=(
                    product.id
                    if product
                    else None
                ),

                service_id=(
                    item["service"].id
                    if item["service"]
                    else None
                ),

                product_name=item["name"],

                unit=item["unit"],

                quantity=item["quantity"],

                price=item["price"],

                total=item["total"],

                payment_status=data.payment_status,

                profit=item["profit"],
            )

            db.add(sale)
            created_sales.append(sale)

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

    except Exception as e:

        db.rollback()

        print("SOTUV XATOSI:", e)

        raise HTTPException(
            status_code=500,
            detail="Sotuvni saqlashda xatolik",
        )

    return {
        "message": "Sotuv muvaffaqiyatli saqlandi",

        "customer_id": customer.id,

        "customer_name": customer.name,

        "payment_status": data.payment_status,

        "items_count": len(created_sales),

        "total": total_amount,

        "profit": total_profit,

        "sales": created_sales,
    }
