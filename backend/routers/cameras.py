from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models_camera import Camera, CameraCatalog


router = APIRouter(
    prefix="/cameras",
    tags=["Cameras"]
)


# ==========================
# O'rnatilgan kameralar
# ==========================

@router.get("/")
def get_cameras(
    db: Session = Depends(get_db)
):
    return db.query(Camera).all()



@router.post("/")
def add_camera(
    camera: dict,
    db: Session = Depends(get_db)
):

    new_camera = Camera(

        customer_id=camera.get("customer_id"),

        object_name=camera.get("object_name"),

        brand=camera.get("brand"),

        model=camera.get("model"),

        serial_number=camera.get("serial_number"),

        ip_address=camera.get("ip_address"),

        username=camera.get("username"),

        password=camera.get("password"),

        install_date=camera.get("install_date"),

        warranty_month=camera.get("warranty_month"),

        note=camera.get("note")
    )


    db.add(new_camera)

    db.commit()

    db.refresh(new_camera)


    return new_camera




@router.put("/{camera_id}")
def update_camera(
    camera_id:int,
    camera:dict,
    db:Session = Depends(get_db)
):

    db_camera = db.query(Camera).filter(
        Camera.id == camera_id
    ).first()


    if not db_camera:

        return {
            "message":"Camera not found"
        }


    for key,value in camera.items():

        setattr(
            db_camera,
            key,
            value
        )


    db.commit()

    db.refresh(db_camera)


    return db_camera





@router.delete("/{camera_id}")
def delete_camera(
    camera_id:int,
    db:Session = Depends(get_db)
):

    camera = db.query(Camera).filter(
        Camera.id == camera_id
    ).first()


    if not camera:

        return {
            "message":"Camera not found"
        }


    db.delete(camera)

    db.commit()


    return {
        "message":"Camera deleted successfully"
    }




# ==========================
# Kamera katalog
# ==========================


# Barcha kamera modellari
@router.get("/catalog")
def get_camera_catalog(
    db:Session = Depends(get_db)
):

    return db.query(CameraCatalog).all()




# Yangi kamera model qo'shish

@router.post("/catalog")
def add_camera_catalog(
    camera:dict,
    db:Session = Depends(get_db)
):

    new_camera = CameraCatalog(

        model=camera.get("model"),

        brand=camera.get("brand"),

        name=camera.get("name"),

        resolution=camera.get("resolution"),

        camera_type=camera.get("camera_type"),

        connection=camera.get("connection"),

        warranty_month=camera.get(
            "warranty_month",
            12
        )
    )


    db.add(new_camera)

    db.commit()

    db.refresh(new_camera)


    return new_camera





# Model bo'yicha topish

@router.get("/catalog/{model}")
def search_camera_catalog(
    model:str,
    db:Session = Depends(get_db)
):

    camera = db.query(CameraCatalog).filter(
        CameraCatalog.model == model
    ).first()


    if not camera:

        return {
            "message":"Kamera topilmadi"
        }


    return camera