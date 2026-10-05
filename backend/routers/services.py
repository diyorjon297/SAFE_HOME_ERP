from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import get_db
from models import Service

router = APIRouter(
    prefix="/services",
    tags=["Services"]
)


# =========================
# SCHEMAS
# =========================

class ServiceCreate(BaseModel):
    name: str
    unit: str = "xizmat"
    sale_price: float = 0
    cost_price: float = 0
    category: Optional[str] = None
    description: Optional[str] = None


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    unit: Optional[str] = None
    sale_price: Optional[float] = None
    cost_price: Optional[float] = None
    category: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[int] = None


# =========================
# GET SERVICES
# =========================

@router.get("/")
def get_services(db: Session = Depends(get_db)):
    services = (
        db.query(Service)
        .order_by(Service.id.desc())
        .all()
    )

    return [
        {
            "id": item.id,
            "name": item.name,
            "unit": item.unit,
            "sale_price": item.sale_price,
            "cost_price": item.cost_price,
            "profit": (item.sale_price or 0) - (item.cost_price or 0),
            "category": item.category,
            "description": item.description,
            "is_active": item.is_active,
        }
        for item in services
    ]


# =========================
# GET ONE SERVICE
# =========================

@router.get("/{service_id}")
def get_service(
    service_id: int,
    db: Session = Depends(get_db)
):
    service = db.query(Service).filter(
        Service.id == service_id
    ).first()

    if not service:
        raise HTTPException(
            status_code=404,
            detail="Xizmat topilmadi"
        )

    return {
        "id": service.id,
        "name": service.name,
        "unit": service.unit,
        "sale_price": service.sale_price,
        "cost_price": service.cost_price,
        "profit": (service.sale_price or 0) - (service.cost_price or 0),
        "category": service.category,
        "description": service.description,
        "is_active": service.is_active,
    }


# =========================
# CREATE SERVICE
# =========================

@router.post("/")
def create_service(
    data: ServiceCreate,
    db: Session = Depends(get_db)
):
    service = Service(
        name=data.name,
        unit=data.unit,
        sale_price=data.sale_price,
        cost_price=data.cost_price,
        category=data.category,
        description=data.description,
        is_active=1,
    )

    db.add(service)
    db.commit()
    db.refresh(service)

    return {
        "message": "Xizmat qo‘shildi",
        "id": service.id,
        "name": service.name,
        "unit": service.unit,
        "sale_price": service.sale_price,
        "cost_price": service.cost_price,
        "profit": service.sale_price - service.cost_price,
    }


# =========================
# UPDATE SERVICE
# =========================

@router.put("/{service_id}")
def update_service(
    service_id: int,
    data: ServiceUpdate,
    db: Session = Depends(get_db)
):
    service = db.query(Service).filter(
        Service.id == service_id
    ).first()

    if not service:
        raise HTTPException(
            status_code=404,
            detail="Xizmat topilmadi"
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(service, key, value)

    db.commit()
    db.refresh(service)

    return {
        "message": "Xizmat yangilandi",
        "id": service.id,
        "name": service.name,
        "unit": service.unit,
        "sale_price": service.sale_price,
        "cost_price": service.cost_price,
        "profit": service.sale_price - service.cost_price,
        "category": service.category,
        "description": service.description,
        "is_active": service.is_active,
    }


# =========================
# DELETE SERVICE
# =========================

@router.delete("/{service_id}")
def delete_service(
    service_id: int,
    db: Session = Depends(get_db)
):
    service = db.query(Service).filter(
        Service.id == service_id
    ).first()

    if not service:
        raise HTTPException(
            status_code=404,
            detail="Xizmat topilmadi"
        )

    db.delete(service)
    db.commit()

    return {
        "message": "Xizmat o‘chirildi"
    }
