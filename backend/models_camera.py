from sqlalchemy import Column, Integer, String, DateTime
from database import Base
from datetime import datetime



class CameraCatalog(Base):

    __tablename__ = "camera_catalog"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    model = Column(
        String,
        unique=True,
        nullable=False
    )

    brand = Column(
        String,
        nullable=False
    )

    name = Column(
        String,
        nullable=False
    )

    resolution = Column(
        String,
        nullable=True
    )

    camera_type = Column(
        String,
        nullable=True
    )

    connection = Column(
        String,
        nullable=True
    )

    warranty_month = Column(
        Integer,
        default=12
    )




class Camera(Base):

    __tablename__ = "cameras"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    customer_id = Column(
        Integer,
        nullable=True
    )


    object_name = Column(
        String,
        nullable=True
    )


    brand = Column(
        String,
        nullable=True
    )


    model = Column(
        String,
        nullable=True
    )


    serial_number = Column(
        String,
        nullable=True
    )


    ip_address = Column(
        String,
        nullable=True
    )


    username = Column(
        String,
        nullable=True
    )


    password = Column(
        String,
        nullable=True
    )


    install_date = Column(
        DateTime,
        default=datetime.utcnow
    )


    warranty_month = Column(
        Integer,
        default=12
    )


    note = Column(
        String,
        nullable=True
    )