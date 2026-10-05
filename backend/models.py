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
# MIJOZLAR
# =========================================================

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)

    address = Column(String, nullable=True)
    object = Column(String, nullable=True)

    debt = Column(Float, default=0)
    note = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# =========================================================
# SOTUVLAR
# =========================================================

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)

    customer_id = Column(Integer, nullable=True)
    customer_name = Column(String, nullable=True)

    item_type = Column(
        String,
        default="product"
    )

    product_id = Column(Integer, nullable=True)
    service_id = Column(Integer, nullable=True)

    product_name = Column(String, nullable=False)

    unit = Column(
        String,
        default="dona"
    )

    quantity = Column(
        Float,
        nullable=False
    )

    purchase_price = Column(
        Float,
        default=0
    )

    price = Column(
        Float,
        nullable=False
    )

    total = Column(
        Float,
        nullable=False
    )

    discount = Column(
        Float,
        default=0
    )

    payment_status = Column(
        String,
        default="Naqd"
    )

    paid_amount = Column(
        Float,
        default=0
    )

    debt_amount = Column(
        Float,
        default=0
    )

    profit = Column(
        Float,
        default=0
    )

    date = Column(
        DateTime,
        default=datetime.utcnow
    )


# =========================================================
# QARZLAR
# =========================================================

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

    due_date = Column(
        DateTime,
        nullable=True
    )

    note = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# =========================================================
# O‘RNATISHLAR / OBYEKTLAR
# =========================================================

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

    object_name = Column(
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
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# =========================================================
# XIZMATLAR
# =========================================================

class Service(Base):
    __tablename__ = "services"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    unit = Column(
        String,
        default="xizmat"
    )

    sale_price = Column(
        Float,
        default=0
    )

    cost_price = Column(
        Float,
        default=0
    )

    category = Column(
        String,
        nullable=True
    )

    description = Column(
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
# MUROJAATLAR
# =========================================================

class Inquiry(Base):
    __tablename__ = "inquiries"

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
        nullable=False
    )

    phone = Column(
        String,
        nullable=True
    )

    inquiry_type = Column(
        String,
        default="Kamera"
    )

    subject = Column(
        String,
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    address = Column(
        String,
        nullable=True
    )

    object_name = Column(
        String,
        nullable=True
    )

    priority = Column(
        String,
        default="Oddiy"
    )

    status = Column(
        String,
        default="Yangi"
    )

    responsible = Column(
        String,
        nullable=True
    )

    note = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# =========================================================
# XODIMLAR
# =========================================================

class Employee(Base):
    __tablename__ = "employees"

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

    position = Column(
        String,
        nullable=True
    )

    salary = Column(
        Float,
        default=0
    )

    is_active = Column(
        Boolean,
        default=True
    )

    note = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# =========================================================
# XODIM ISHLARI
# =========================================================

class EmployeeActivity(Base):
    __tablename__ = "employee_activities"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    employee_id = Column(
        Integer,
        nullable=True
    )

    employee_name = Column(
        String,
        nullable=True
    )

    action = Column(
        String,
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    cost = Column(
        Float,
        default=0
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# =========================================================
# XARAJATLAR
# =========================================================

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    category = Column(
        String,
        nullable=False
    )

    title = Column(
        String,
        nullable=False
    )

    amount = Column(
        Float,
        default=0
    )

    currency = Column(
        String,
        default="UZS"
    )

    employee_id = Column(
        Integer,
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
# ESLATMALAR
# =========================================================

class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String,
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    remind_at = Column(
        DateTime,
        nullable=False
    )

    status = Column(
        String,
        default="Yangi"
    )

    telegram_sent = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# =========================================================
# VALYUTA KURSLARI
# =========================================================

class CurrencyRate(Base):
    __tablename__ = "currency_rates"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    currency = Column(
        String,
        nullable=False
    )

    rate = Column(
        Float,
        nullable=False
    )

    source = Column(
        String,
        nullable=True
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow
    )