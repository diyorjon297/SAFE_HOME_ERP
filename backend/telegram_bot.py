import os
import logging

from dotenv import load_dotenv

from telegram import Update, ReplyKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    ContextTypes,
    filters,
)

from database import SessionLocal
from models import Customer
from models_product import Product


# =========================================================
# ENV
# =========================================================

load_dotenv()

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

if not TOKEN:
    raise RuntimeError(
        "TELEGRAM_BOT_TOKEN .env faylda topilmadi"
    )


# =========================================================
# LOG
# =========================================================

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)

logger = logging.getLogger(__name__)


# =========================================================
# MENU
# =========================================================

MENU = [
    ["👤 Mijozlar", "➕ Mijoz qo‘shish"],
    ["📦 Mahsulotlar", "➕ Mahsulot qo‘shish"],
    ["💳 Qarzlar", "🛒 Sotuv"],
    ["📋 Buyurtmalar", "🔔 Eslatmalar"],
    ["📊 Hisobot"],
]


# =========================================================
# START
# =========================================================

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):

    context.user_data.clear()

    keyboard = ReplyKeyboardMarkup(
        MENU,
        resize_keyboard=True
    )

    await update.message.reply_text(
        "🏠 SAFE HOME ERP\n\n"
        "Telegram ERP bazasiga ulandi.\n\n"
        "Kerakli bo‘limni tanlang:",
        reply_markup=keyboard
    )


# =========================================================
# MIJOZLAR RO‘YXATI
# =========================================================

async def customers_list(update: Update, context: ContextTypes.DEFAULT_TYPE):

    db = SessionLocal()

    try:
        customers = (
            db.query(Customer)
            .order_by(Customer.id.desc())
            .all()
        )

        if not customers:
            await update.message.reply_text(
                "👤 Mijozlar bazasi hozircha bo‘sh."
            )
            return

        text = "👥 MIJOZLAR RO‘YXATI\n\n"

        for customer in customers:

            text += (
                f"🆔 ID: {customer.id}\n"
                f"👤 {customer.name}\n"
                f"📞 {customer.phone or '-'}\n"
                f"📍 {customer.address or '-'}\n"
            )

            if hasattr(customer, "object"):
                text += f"🏠 Obyekt: {customer.object or '-'}\n"

            text += (
                f"💳 Qarz: {customer.debt or 0:,.0f} so‘m\n"
                "────────────────────\n"
            )

        await update.message.reply_text(text)

    except Exception as e:

        logger.exception("Mijozlar ro‘yxatida xato")

        await update.message.reply_text(
            f"❌ Xatolik:\n{e}"
        )

    finally:
        db.close()


# =========================================================
# MAHSULOTLAR RO‘YXATI
# =========================================================

async def products_list(update: Update, context: ContextTypes.DEFAULT_TYPE):

    db = SessionLocal()

    try:

        products = (
            db.query(Product)
            .order_by(Product.id.desc())
            .all()
        )

        if not products:
            await update.message.reply_text(
                "📦 Mahsulotlar bazasi hozircha bo‘sh."
            )
            return

        text = "📦 OMBOR MAHSULOTLARI\n\n"

        for product in products:

            text += (
                f"🆔 ID: {product.id}\n"
                f"📦 {product.name}\n"
                f"🏷 Brend: {product.brand or '-'}\n"
                f"🔢 Model: {product.model or '-'}\n"
                f"📂 Kategoriya: {product.category or '-'}\n"
                f"📊 Qoldiq: {product.quantity or 0} {product.unit or 'dona'}\n"
                f"💰 Tannarx: {product.purchase_price or 0:,.0f} so‘m\n"
                f"💵 Sotuv narxi: {product.sale_price or 0:,.0f} so‘m\n"
                f"🛡 Kafolat: {product.warranty_month or 0} oy\n"
                "────────────────────\n"
            )

        await update.message.reply_text(text)

    except Exception as e:

        logger.exception("Mahsulotlar ro‘yxatida xato")

        await update.message.reply_text(
            f"❌ Xatolik:\n{e}"
        )

    finally:
        db.close()


# =========================================================
# MIJOZ QO‘SHISH
# =========================================================

async def start_customer_add(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    context.user_data.clear()
    context.user_data["action"] = "customer_name"

    await update.message.reply_text(
        "👤 Yangi mijoz\n\n"
        "Ism-familiyani kiriting:"
    )


# =========================================================
# MAHSULOT QO‘SHISH
# =========================================================

async def start_product_add(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    context.user_data.clear()
    context.user_data["action"] = "product_name"

    await update.message.reply_text(
        "📦 Yangi mahsulot\n\n"
        "Mahsulot nomini kiriting:\n"
        "Masalan: IP kamera"
    )


# =========================================================
# MATN QABUL QILISH
# =========================================================

async def text_handler(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    if not update.message or not update.message.text:
        return

    text = update.message.text.strip()

    action = context.user_data.get("action")


    # =====================================================
    # MENU
    # =====================================================

    if not action:

        if text == "👤 Mijozlar":
            await customers_list(update, context)
            return

        if text == "➕ Mijoz qo‘shish":
            await start_customer_add(update, context)
            return

        if text == "📦 Mahsulotlar":
            await products_list(update, context)
            return

        if text == "➕ Mahsulot qo‘shish":
            await start_product_add(update, context)
            return

        if text == "💳 Qarzlar":

            await update.message.reply_text(
                "💳 Qarzlar moduli.\n\n"
                "Keyingi bosqichda qarz qo‘shish, "
                "to‘lov kiritish va qarzdorlar ro‘yxatini ulaymiz."
            )
            return

        if text == "🛒 Sotuv":

            await update.message.reply_text(
                "🛒 Sotuv moduli keyingi bosqichda ulanadi."
            )
            return

        if text == "📋 Buyurtmalar":

            await update.message.reply_text(
                "📋 Buyurtmalar moduli keyingi bosqichda ulanadi."
            )
            return

        if text == "🔔 Eslatmalar":

            await update.message.reply_text(
                "🔔 Eslatmalar moduli keyingi bosqichda ulanadi."
            )
            return

        if text == "📊 Hisobot":

            await update.message.reply_text(
                "📊 Hisobot moduli keyingi bosqichda ulanadi."
            )
            return

        await update.message.reply_text(
            "Kerakli bo‘limni menyudan tanlang."
        )

        return


    # =====================================================
    # MIJOZ — ISM
    # =====================================================

    if action == "customer_name":

        context.user_data["customer_name"] = text
        context.user_data["action"] = "customer_phone"

        await update.message.reply_text(
            "📞 Telefon raqamini kiriting:\n\n"
            "Masalan:\n"
            "+998901234567\n\n"
            "Telefon bo‘lmasa: -"
        )

        return


    # =====================================================
    # MIJOZ — TELEFON
    # =====================================================

    if action == "customer_phone":

        context.user_data["customer_phone"] = (
            None if text == "-" else text
        )

        context.user_data["action"] = "customer_address"

        await update.message.reply_text(
            "📍 Manzilni kiriting:\n\n"
            "Masalan: Jondor tumani\n\n"
            "Manzil bo‘lmasa: -"
        )

        return


    # =====================================================
    # MIJOZ — MANZIL
    # =====================================================

    if action == "customer_address":

        name = context.user_data.get("customer_name")
        phone = context.user_data.get("customer_phone")
        address = None if text == "-" else text

        db = SessionLocal()

        try:

            customer = Customer(
                name=name,
                phone=phone,
                address=address,
            )

            db.add(customer)
            db.commit()
            db.refresh(customer)

            context.user_data.clear()

            await update.message.reply_text(
                "✅ MIJOZ BAZAGA QO‘SHILDI!\n\n"
                f"🆔 ID: {customer.id}\n"
                f"👤 Ism-familiya: {customer.name}\n"
                f"📞 Telefon: {customer.phone or '-'}\n"
                f"📍 Manzil: {customer.address or '-'}"
            )

        except Exception as e:

            db.rollback()

            logger.exception("Mijoz qo‘shishda xato")

            await update.message.reply_text(
                f"❌ Mijozni saqlashda xato:\n{e}"
            )

        finally:
            db.close()

        return


    # =====================================================
    # MAHSULOT — NOMI
    # =====================================================

    if action == "product_name":

        context.user_data["product_name"] = text
        context.user_data["action"] = "product_brand"

        await update.message.reply_text(
            "🏷 Brendini kiriting:\n\n"
            "Masalan: Hikvision\n\n"
            "Brend bo‘lmasa: -"
        )

        return


    # =====================================================
    # MAHSULOT — BREND
    # =====================================================

    if action == "product_brand":

        context.user_data["product_brand"] = (
            None if text == "-" else text
        )

        context.user_data["action"] = "product_model"

        await update.message.reply_text(
            "🔢 Modelini kiriting:\n\n"
            "Masalan: DS-2CD1043G2\n\n"
            "Model bo‘lmasa: -"
        )

        return


    # =====================================================
    # MAHSULOT — MODEL
    # =====================================================

    if action == "product_model":

        context.user_data["product_model"] = (
            None if text == "-" else text
        )

        context.user_data["action"] = "product_category"

        await update.message.reply_text(
            "📂 Kategoriyasini kiriting:\n\n"
            "Masalan:\n"
            "Kamera\n"
            "NVR\n"
            "Kabel\n"
            "PoE switch"
        )

        return


    # =====================================================
    # MAHSULOT — KATEGORIYA
    # =====================================================

    if action == "product_category":

        context.user_data["product_category"] = text
        context.user_data["action"] = "product_purchase_price"

        await update.message.reply_text(
            "💰 Tannarxini kiriting:\n\n"
            "Masalan:\n"
            "350000"
        )

        return


    # =====================================================
    # MAHSULOT — TANNARX
    # =====================================================

    if action == "product_purchase_price":

        try:
            price = float(
                text.replace(" ", "")
                    .replace(",", "")
            )

        except ValueError:

            await update.message.reply_text(
                "❌ Narx noto‘g‘ri.\n"
                "Faqat raqam kiriting.\n\n"
                "Masalan: 350000"
            )
            return

        context.user_data["product_purchase_price"] = price
        context.user_data["action"] = "product_sale_price"

        await update.message.reply_text(
            "💵 Mijozga beriladigan sotuv narxini kiriting:\n\n"
            "Masalan:\n"
            "500000"
        )

        return


    # =====================================================
    # MAHSULOT — SOTUV NARXI
    # =====================================================

    if action == "product_sale_price":

        try:
            price = float(
                text.replace(" ", "")
                    .replace(",", "")
            )

        except ValueError:

            await update.message.reply_text(
                "❌ Narx noto‘g‘ri.\n"
                "Masalan: 500000"
            )
            return

        context.user_data["product_sale_price"] = price
        context.user_data["action"] = "product_quantity"

        await update.message.reply_text(
            "📊 Ombordagi miqdorini kiriting:\n\n"
            "Masalan:\n"
            "10"
        )

        return


    # =====================================================
    # MAHSULOT — MIQDOR
    # =====================================================

    if action == "product_quantity":

        try:
            quantity = float(
                text.replace(" ", "")
                    .replace(",", ".")
            )

        except ValueError:

            await update.message.reply_text(
                "❌ Miqdor noto‘g‘ri.\n"
                "Masalan: 10"
            )
            return

        context.user_data["product_quantity"] = quantity
        context.user_data["action"] = "product_unit"

        await update.message.reply_text(
            "📏 O‘lchov birligini kiriting:\n\n"
            "dona\n"
            "metr\n"
            "quti\n"
            "kg\n\n"
            "Masalan: dona"
        )

        return


    # =====================================================
    # MAHSULOT — BIRLIK
    # =====================================================

    if action == "product_unit":

        unit = text

        context.user_data["product_unit"] = unit
        context.user_data["action"] = "product_warranty"

        await update.message.reply_text(
            "🛡 Kafolat muddatini oyda kiriting:\n\n"
            "Masalan: 12\n\n"
            "Kafolat bo‘lmasa: 0"
        )

        return


    # =====================================================
    # MAHSULOT — KAFOLAT VA SAQLASH
    # =====================================================

    if action == "product_warranty":

        try:
            warranty = int(text)

        except ValueError:

            await update.message.reply_text(
                "❌ Kafolat oyini raqam bilan kiriting.\n"
                "Masalan: 12"
            )
            return

        db = SessionLocal()

        try:

            product = Product(
                name=context.user_data.get("product_name"),
                brand=context.user_data.get("product_brand"),
                model=context.user_data.get("product_model"),
                category=context.user_data.get("product_category"),
                purchase_price=context.user_data.get(
                    "product_purchase_price",
                    0
                ),
                sale_price=context.user_data.get(
                    "product_sale_price",
                    0
                ),
                quantity=context.user_data.get(
                    "product_quantity",
                    0
                ),
                unit=context.user_data.get(
                    "product_unit",
                    "dona"
                ),
                warranty_month=warranty,
            )

            db.add(product)
            db.commit()
            db.refresh(product)

            name = product.name
            brand = product.brand or "-"
            model = product.model or "-"
            purchase = product.purchase_price or 0
            sale = product.sale_price or 0
            quantity = product.quantity or 0
            unit = product.unit or "dona"

            context.user_data.clear()

            await update.message.reply_text(
                "✅ MAHSULOT BAZAGA QO‘SHILDI!\n\n"
                f"🆔 ID: {product.id}\n"
                f"📦 Mahsulot: {name}\n"
                f"🏷 Brend: {brand}\n"
                f"🔢 Model: {model}\n"
                f"📊 Miqdor: {quantity} {unit}\n"
                f"💰 Tannarx: {purchase:,.0f} so‘m\n"
                f"💵 Sotuv narxi: {sale:,.0f} so‘m\n"
                f"🛡 Kafolat: {warranty} oy"
            )

        except Exception as e:

            db.rollback()

            logger.exception("Mahsulot qo‘shishda xato")

            await update.message.reply_text(
                f"❌ Mahsulotni saqlashda xato:\n{e}"
            )

        finally:
            db.close()

        return


# =========================================================
# BOT
# =========================================================

def main():

    application = (
        Application
        .builder()
        .token(TOKEN)
        .build()
    )

    application.add_handler(
        CommandHandler("start", start)
    )

    application.add_handler(
        MessageHandler(
            filters.TEXT & ~filters.COMMAND,
            text_handler
        )
    )

    print(
        "🏠 SAFE HOME ERP Telegram bot ishga tushdi!"
    )

    application.run_polling()


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":
    main()