from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base

from routers import products
from routers import cameras
from routers import customers
from routers import dashboard
from routers import sales
from routers import warehouse
from routers import auth
from routers import debts


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="SAFE HOME ERP API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(products.router)
app.include_router(cameras.router)
app.include_router(customers.router)
app.include_router(dashboard.router)
app.include_router(sales.router)
app.include_router(warehouse.router)
app.include_router(auth.router)
app.include_router(debts.router)


@app.get("/")
def root():
    return {
        "status": "OK",
        "message": "SAFE HOME ERP API ishlayapti"
    }
