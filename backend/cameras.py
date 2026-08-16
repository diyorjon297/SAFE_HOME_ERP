from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models_camera import Camera


router = APIRouter(
    prefix="/cameras",
    tags=["Cameras"]
)


@router.get("/")
def get_cameras(db: Session = Depends(get_db)):

    return db.query(Camera).all()



@router.post("/")
def create_camera(
    camera: dict,
    db: Session = Depends(get_db)
):

    new_camera = Camera(

        customer_id=int(camera.get("customer_id")),

        object_name=camera.get("object_name"),

        brand=camera.get("brand"),

        model=camera.get("model"),

        serial_number=camera.get("serial_number"),

        ip_address=camera.get("ip_address"),

        username=camera.get("username"),

        password=camera.get("password"),

        install_date=camera.get("install_date"),

        warranty_month=int(camera.get("warranty_month")),

        note=camera.get("note")

    )


    db.add(new_camera)

    db.commit()

    db.refresh(new_camera)


    return new_camera



@router.delete("/{camera_id}")
def delete_camera(
    camera_id:int,
    db:Session = Depends(get_db)
):

    camera = db.query(Camera).filter(
        Camera.id == camera_id
    ).first()


    if camera:

        db.delete(camera)

        db.commit()


    return {
        "message":"Camera deleted"
    }