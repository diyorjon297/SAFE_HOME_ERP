from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    Boolean,
    Text,
)

from database import Base


# =========================================================
# MAHSULOTLAR — OMBOR
# =========================================================

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

    purchase_price_usd = Column(
        Float,
        default=0
    )

    purchase_price = Column(
        Float,
        default=0
    )

    sale_price = Column(
        Float,
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

    supplier = Column(
        String,
        nullable=True
    )

    description = Column(
        Text,
        nullable=True
    )

    currency = Column(
        String,
        nullable=True,
        default="UZS"
    )

    is_active = Column(
        Boolean,
        default=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )


# =========================================================
# MAHSULOT KATALOGI
# =========================================================

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

    description = Column(
        Text,
        nullable=True
    )

    specifications = Column(
        Text,
        nullable=True
    )

    is_active = Column(
        Boolean,
        default=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# =========================================================
# OMBOR TARIXI
# =========================================================

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

    price = Column(
        Float,
        default=0
    )

    partner = Column(
        String,
        nullable=True
    )

    note = Column(
        Text,
        nullable=True
    )

    date = Column(
        DateTime,
        default=datetime.utcnow
    )


# =========================================================
# YETKAZIB BERUVCHILAR
# =========================================================

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    phone = Column(
        String,
        nullable=True
    )

    address = Column(
        String,
        nullable=True
    )

    contact_person = Column(
        String,
        nullable=True
    )

    note = Column(
        Text,
        nullable=True
    )

    debt = Column(
        Float,
        default=0
    )

    is_active = Column(
        Boolean,
        default=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )	