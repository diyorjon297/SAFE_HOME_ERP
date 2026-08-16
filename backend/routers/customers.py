from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import get_db
from models import Customer


router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)


# =========================
# SCHEMAS
# =========================

class CustomerCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    object: Optional[str] = None
    debt: float = 0


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    object: Optional[str] = None
    debt: Optional[float] = None


# =========================
# GET ALL CUSTOMERS
# =========================

@router.get("/")
def get_customers(db: Session = Depends(get_db)):
    customers = (
        db.query(Customer)
        .order_by(Customer.id.desc())
        .all()
    )

    return [
        {
            "id": customer.id,
            "name": customer.name,
            "phone": customer.phone,
            "address": customer.address,
            "object": customer.object,
            "debt": customer.debt or 0,
        }
        for customer in customers
    ]


# =========================
# GET ONE CUSTOMER
# =========================

@router.get("/{customer_id}")
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Mijoz topilmadi"
        )

    return {
        "id": customer.id,
        "name": customer.name,
        "phone": customer.phone,
        "address": customer.address,
        "object": customer.object,
        "debt": customer.debt or 0,
    }


# =========================
# CREATE CUSTOMER
# =========================

@router.post("/")
def create_customer(
    data: CustomerCreate,
    db: Session = Depends(get_db)
):
    customer = Customer(
        name=data.name,
        phone=data.phone,
        address=data.address,
        object=data.object,
        debt=data.debt,
    )

    db.add(customer)
    db.commit()
    db.refresh(customer)

    return {
        "id": customer.id,
        "name": customer.name,
        "phone": customer.phone,
        "address": customer.address,
        "object": customer.object,
        "debt": customer.debt or 0,
    }


# =========================
# UPDATE CUSTOMER
# =========================

@router.put("/{customer_id}")
def update_customer(
    customer_id: int,
    data: CustomerUpdate,
    db: Session = Depends(get_db)
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Mijoz topilmadi"
        )

    if data.name is not None:
        customer.name = data.name

    if data.phone is not None:
        customer.phone = data.phone

    if data.address is not None:
        customer.address = data.address

    if data.object is not None:
        customer.object = data.object

    if data.debt is not None:
        customer.debt = data.debt

    db.commit()
    db.refresh(customer)

    return {
        "id": customer.id,
        "name": customer.name,
        "phone": customer.phone,
        "address": customer.address,
        "object": customer.object,
        "debt": customer.debt or 0,
    }


# =========================
# DELETE CUSTOMER
# =========================

@router.delete("/{customer_id}")
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Mijoz topilmadi"
        )

    db.delete(customer)
    db.commit()

    return {
        "status": "OK",
        "message": "Mijoz o'chirildi"
    }