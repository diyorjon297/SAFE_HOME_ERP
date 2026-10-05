from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import get_db
from models import Inquiry


router = APIRouter(
    prefix="/inquiries",
    tags=["Inquiries"]
)


class InquiryCreate(BaseModel):
    customer_id: Optional[int] = None
    customer_name: str
    phone: Optional[str] = None
    inquiry_type: str = "Kamera"
    subject: str
    description: Optional[str] = None
    address: Optional[str] = None
    object_name: Optional[str] = None
    priority: str = "Oddiy"
    status: str = "Yangi"
    responsible: Optional[str] = None
    note: Optional[str] = None


class InquiryUpdate(BaseModel):
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    phone: Optional[str] = None
    inquiry_type: Optional[str] = None
    subject: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    object_name: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    responsible: Optional[str] = None
    note: Optional[str] = None


def inquiry_to_dict(item):
    return {
        "id": item.id,
        "customer_id": item.customer_id,
        "customer_name": item.customer_name,
        "phone": item.phone,
        "inquiry_type": item.inquiry_type,
        "subject": item.subject,
        "description": item.description,
        "address": item.address,
        "object_name": item.object_name,
        "priority": item.priority,
        "status": item.status,
        "responsible": item.responsible,
        "note": item.note,
        "created_at": item.created_at,
    }


@router.get("/")
def get_inquiries(db: Session = Depends(get_db)):
    items = (
        db.query(Inquiry)
        .order_by(Inquiry.id.desc())
        .all()
    )

    return [
        inquiry_to_dict(item)
        for item in items
    ]


@router.get("/{inquiry_id}")
def get_inquiry(
    inquiry_id: int,
    db: Session = Depends(get_db)
):
    item = (
        db.query(Inquiry)
        .filter(Inquiry.id == inquiry_id)
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Murojaat topilmadi"
        )

    return inquiry_to_dict(item)


@router.post("/")
def create_inquiry(
    data: InquiryCreate,
    db: Session = Depends(get_db)
):
    item = Inquiry(
        customer_id=data.customer_id,
        customer_name=data.customer_name,
        phone=data.phone,
        inquiry_type=data.inquiry_type,
        subject=data.subject,
        description=data.description,
        address=data.address,
        object_name=data.object_name,
        priority=data.priority,
        status=data.status,
        responsible=data.responsible,
        note=data.note,
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return inquiry_to_dict(item)


@router.put("/{inquiry_id}")
def update_inquiry(
    inquiry_id: int,
    data: InquiryUpdate,
    db: Session = Depends(get_db)
):
    item = (
        db.query(Inquiry)
        .filter(Inquiry.id == inquiry_id)
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Murojaat topilmadi"
        )

    fields = [
        "customer_id",
        "customer_name",
        "phone",
        "inquiry_type",
        "subject",
        "description",
        "address",
        "object_name",
        "priority",
        "status",
        "responsible",
        "note",
    ]

    for field in fields:
        value = getattr(data, field)

        if value is not None:
            setattr(item, field, value)

    db.commit()
    db.refresh(item)

    return inquiry_to_dict(item)


@router.delete("/{inquiry_id}")
def delete_inquiry(
    inquiry_id: int,
    db: Session = Depends(get_db)
):
    item = (
        db.query(Inquiry)
        .filter(Inquiry.id == inquiry_id)
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Murojaat topilmadi"
        )

    db.delete(item)
    db.commit()

    return {
        "status": "OK",
        "message": "Murojaat o'chirildi"
    }
