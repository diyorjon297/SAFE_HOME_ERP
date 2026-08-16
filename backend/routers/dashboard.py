from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from database import get_db
from models import Customer, Sale
from models_product import Product


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
def get_dashboard(db: Session = Depends(get_db)):

    customers = db.query(Customer).count()

    products = db.query(Product).count()

    warehouse = db.query(
        func.sum(Product.quantity)
    ).scalar() or 0


    sales = db.query(Sale).order_by(
        Sale.id.desc()
    ).limit(50).all()


    sales_data = []

    for sale in sales:

        sales_data.append({

            "id": sale.id,

            "total": float(sale.total or 0),

            "profit": float(sale.profit or 0),

            "date": sale.date.isoformat()
            if sale.date else "",

            "payment_status":
            getattr(
                sale,
                "payment_status",
                "Naqd"
            ),

            "customer":
            getattr(
                sale,
                "customer_name",
                "Mijoz"
            )

        })


    low_products = db.query(Product)\
        .filter(Product.quantity <= 5)\
        .all()


    low_products_data = []


    for p in low_products:

        low_products_data.append({

            "id":p.id,

            "name":p.name,

            "quantity":p.quantity

        })


    return {


        "customers": customers,


        "products": products,


        "warehouse": warehouse,


        "sales": sales_data,


        "last_sales": sales_data[:5],


        "low_products": low_products_data

    }