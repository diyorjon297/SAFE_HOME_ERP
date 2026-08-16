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

    warehouse = db.query(func.sum(Product.quantity)).scalar() or 0

    debt = db.query(func.sum(Customer.debt)).scalar() or 0

    today = datetime.utcnow().date()

    today_sales = (
        db.query(func.sum(Sale.total))
        .filter(func.date(Sale.date) == today)
        .scalar()
        or 0
    )

    profit = (
        db.query(func.sum(Sale.profit))
        .scalar()
        or 0
    )

    last_sales = (
        db.query(Sale)
        .order_by(Sale.id.desc())
        .limit(5)
        .all()
    )

    return {
        "customers": customers,
        "products": products,
        "warehouse": warehouse,
        "today_sales": today_sales,
        "profit": profit,
        "debt": debt,
        "last_sales": last_sales
    }