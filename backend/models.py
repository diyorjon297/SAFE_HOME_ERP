from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base
from datetime import datetime


# =========================
# CUSTOMERS
# =========================

class Customer(Base):
    __tablename__ = "customers"

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

    object = Column(
        String,
        nullable=True
    )

    debt = Column(
        Float,
        default=0
    )


# =========================
# SALES
# =========================

class Sale(Base):
    __tablename__ = "sales"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    customer_id = Column(
        Integer,
        nullable=True
    )

    customer_name = Column(
        String,
        nullable=True
    )

    product_id = Column(
        Integer,
        nullable=False
    )

    product_name = Column(
        String,
        nullable=False
    )

    unit = Column(
        String,
        default="dona"
    )

    quantity = Column(
        Float,
        nullable=False
    )

    price = Column(
        Float,
        nullable=False
    )

    total = Column(
        Float,
        nullable=False
    )

    payment_status = Column(
        String,
        default="Naqd"
    )

    profit = Column(
        Float,
        default=0
    )

    date = Column(
        DateTime,
        default=datetime.utcnow
    )


# =========================
# DEBTS
# =========================

class Debt(Base):
    __tablename__ = "debts"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    customer_id = Column(
        Integer,
        nullable=True
    )

    creditor = Column(
        String,
        nullable=True
    )

    title = Column(
        String,
        nullable=True
    )

    amount = Column(
        Float,
        default=0
    )

    paid = Column(
        Float,
        default=0
    )

    currency = Column(
        String,
        default="UZS"
    )

    status = Column(
        String,
        default="qarzdor"
    )

    note = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# =========================
# INSTALLATIONS
# =========================

class Installation(Base):
    __tablename__ = "installations"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    customer_id = Column(
        Integer,
        nullable=True
    )

    address = Column(
        String,
        nullable=True
    )

    camera_type = Column(
        String,
        nullable=True
    )

    camera_count = Column(
        Integer,
        default=0
    )

    nvr_model = Column(
        String,
        nullable=True
    )

    installation_date = Column(
        DateTime,
        nullable=True
    )

    warranty_month = Column(
        Integer,
        default=12
    )

    note = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )