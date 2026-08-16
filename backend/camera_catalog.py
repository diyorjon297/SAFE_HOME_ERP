from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models_camera import CameraCatalog


router = APIRouter(
    prefix="/camera-catalog",
    tags=["Camera Catalog"]
)



@router.get("/")
def get_cameras(
    db: Session = Depends(get_db)
):

    return db.query(
        CameraCatalog
    ).all()




@router.post("/")
def add_camera(
    data: dict,
    db: Session = Depends(get_db)
):

    camera = CameraCatalog(

        model=data["model"],

        brand=data["brand"],

        name=data["name"],

        resolution=data.get("resolution"),

        camera_type=data.get("camera_type"),

        connection=data.get("connection"),

        warranty_month=data.get(
            "warranty_month",
            12
        )

    )


    db.add(camera)

    db.commit()

    db.refresh(camera)


    return camera