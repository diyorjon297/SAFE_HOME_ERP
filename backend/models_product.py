from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base
from datetime import datetime


# =========================
# MAHSULOTLAR OMBORI
# =========================

class Product(Base):
    __tablename__ = "products"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    brand = Column(
        String,
        nullable=True
    )

    model = Column(
        String,
        nullable=True
    )

    category = Column(
        String,
        nullable=True
    )

    serial_number = Column(
        String,
        nullable=True
    )

    purchase_price = Column(
        Float,
        nullable=True,
        default=0
    )

    sale_price = Column(
        Float,
        nullable=True,
        default=0
    )

    quantity = Column(
        Float,
        default=0
    )

    unit = Column(
        String,
        default="dona"
    )

    warranty_month = Column(
        Integer,
        default=12
    )


# =========================
# MAHSULOT KATALOGI
# =========================

class ProductCatalog(Base):
    __tablename__ = "product_catalog"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    brand = Column(
        String,
        nullable=True
    )

    model = Column(
        String,
        nullable=True
    )

    category = Column(
        String,
        nullable=True
    )

    unit = Column(
        String,
        default="dona"
    )

    warranty_month = Column(
        Integer,
        default=12
    )


# =========================
# OMBOR TARIXI
# =========================

class WarehouseHistory(Base):
    __tablename__ = "warehouse_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    product_id = Column(
        Integer,
        nullable=False
    )

    product_name = Column(
        String,
        nullable=False
    )

    action = Column(
        String,
        nullable=False
    )

    quantity = Column(
        Float,
        nullable=False
    )

    unit = Column(
        String,
        default="dona"
    )

    date = Column(
        DateTime,
        default=datetime.utcnow
    )