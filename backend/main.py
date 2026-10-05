import sys
import os

# Joriy papkani Python qidiruv yo'liga avtomatik qo'shamiz (routers topilishi uchun)
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base

from routers.orders import router as orders_router
from routers.objects import router as objects_router
from routers.employees import router as employees_router

from models import (
    Customer,
    Sale,
    Debt,
    Installation,
    Service,
    Inquiry,
)

from models_product import (
    Product,
    ProductCatalog,
    WarehouseHistory,
)

from models_camera import (
    CameraCatalog,
    Camera,
)

from routers import products
from routers import cameras
from routers import customers
from routers import dashboard
from routers import sales
from routers import warehouse
from routers import auth
from routers import debts
from routers import finance
from routers import reports
from routers import services
from routers import inquiries


# =========================================================
# DATABASE
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# FASTAPI
# =========================================================

app = FastAPI(
    title="SAFE HOME ERP API",
    version="1.0.0",
    description="SAFE HOME ERP - Business Management System",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# ROUTERS
# =========================================================

app.include_router(products.router)
app.include_router(cameras.router)
app.include_router(customers.router)
app.include_router(dashboard.router)
app.include_router(sales.router)
app.include_router(warehouse.router)
app.include_router(auth.router)
app.include_router(debts.router)
app.include_router(finance.router)
app.include_router(reports.router)
app.include_router(services.router)
app.include_router(inquiries.router)

# Orders
app.include_router(orders_router)

# Objects
app.include_router(objects_router)

# Employees
app.include_router(employees_router)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "status": "OK",
        "message": "SAFE HOME ERP API ishlayapti",
        "version": "1.0.0",
    }


# =========================================================
# SERVER STARTUP (To'g'ridan-to'g'ri ishga tushirish uchun)
# =========================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8080, reload=True)