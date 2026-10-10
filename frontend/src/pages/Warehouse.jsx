import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API = "https://safe-home-erp.onrender.com";

const sections = [
  "Kameralar",
  "NVR / DVR",
  "Xotira",
  "Tarmoq",
  "Kabel",
  "Domofon",
  "Access Control",
  "Quvvat",
  "Boshqa",
];

const emptyForm = {
  name: "",
  brand: "",
  model: "",
  category: "Kameralar",
  serial_number: "",
  purchase_price_usd: "",
  purchase_price: "",
  sale_price: "",
  quantity: "",
  unit: "dona",
  warranty_month: "",
  supplier: "",
  note: "",
};

function numberValue(value) {
  var n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatNumber(value) {
  return numberValue(value).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}

function moneyUZS(value) {
  return formatNumber(value) + " so'm";
}

function moneyUSD(value) {
  return "$" + formatNumber(value);
}

function getCategory(product) {
  return product.category || "Boshqa";
}

function getBrand(product) {
  return product.brand || "Brendsiz";
}

export default function Warehouse() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [selectedSection, setSelectedSection] = useState("Kameralar");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [search, setSearch] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API + "/products/");

      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error(err);
      setError("Ombor ma'lumotlarini yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(function () {
    loadProducts();
  }, []);

  function updateForm(field, value) {
    setForm(function (old) {
      return {
        ...old,
        [field]: value,
      };
    });
  }

  function openAdd() {
    setForm({
      ...emptyForm,
      category: selectedSection,
    });
    setEditingProduct(null);
    setShowAdd(true);
  }

  function openEdit(product) {
    setEditingProduct(product);

    setForm({
      name: product.name || "",
      brand: product.brand || "",
      model: product.model || "",
      category: product.category || "Boshqa",
      serial_number: product.serial_number || "",
      purchase_price_usd:
        product.purchase_price_usd === null ||
        product.purchase_price_usd === undefined
          ? ""
          : product.purchase_price_usd,
      purchase_price:
        product.purchase_price === null ||
        product.purchase_price === undefined
          ? ""
          : product.purchase_price,
      sale_price:
        product.sale_price === null || product.sale_price === undefined
          ? ""
          : product.sale_price,
      quantity:
        product.quantity === null || product.quantity === undefined
          ? ""
          : product.quantity,
      unit: product.unit || "dona",
      warranty_month:
        product.warranty_month === null ||
        product.warranty_month === undefined
          ? ""
          : product.warranty_month,
      supplier: product.supplier || "",
      note: product.note || "",
    });

    setShowAdd(false);
  }

  function closeForms() {
    setShowAdd(false);
    setEditingProduct(null);
    setForm(emptyForm);
  }

  function buildPayload() {
    return {
      name: form.name.trim(),
      brand: form.brand.trim(),
      model: form.model.trim(),
      category: form.category,
      serial_number: form.serial_number.trim(),
      purchase_price_usd:
        form.purchase_price_usd === ""
          ? 0
          : numberValue(form.purchase_price_usd),
      purchase_price:
        form.purchase_price === "" ? 0 : numberValue(form.purchase_price),
      sale_price: form.sale_price === "" ? 0 : numberValue(form.sale_price),
      quantity: form.quantity === "" ? 0 : numberValue(form.quantity),
      unit: form.unit || "dona",
      warranty_month:
        form.warranty_month === "" ? 0 : numberValue(form.warranty_month),
      supplier: form.supplier.trim(),
      note: form.note.trim(),
      is_active: true,
    };
  }

  async function saveProduct(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      alert("Mahsulot nomini kiriting.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = buildPayload();

      if (editingProduct) {
        await axios.put(
          API + "/products/" + editingProduct.id,
          payload
        );
      } else {
        await axios.post(API + "/products/", payload);
      }

      await loadProducts();
      closeForms();
    } catch (err) {
      console.error(err);

      var message = "Mahsulotni saqlashda xatolik yuz berdi.";

      if (
        err &&
        err.response &&
        err.response.data &&
        err.response.data.detail
      ) {
        message =
          "Xatolik: " +
          (typeof err.response.data.detail === "string"
            ? err.response.data.detail
            : JSON.stringify(err.response.data.detail));
      }

      setError(message);
      alert(message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(product) {
    var ok = window.confirm(
      '"' +
        (product.name || "Mahsulot") +
        '" mahsulotini ombordan chiqarishga ishonchingiz komilmi?'
    );

    if (!ok) {
      return;
    }

    try {
      await axios.delete(API + "/products/" + product.id);
      await loadProducts();
    } catch (err) {
      console.error(err);
      alert("Mahsulotni o'chirishda xatolik yuz berdi.");
    }
  }

  const filteredProducts = useMemo(
    function () {
      var text = search.trim().toLowerCase();

      return products.filter(function (product) {
        var matchesSection =
          selectedSection === "Barcha" ||
          getCategory(product) === selectedSection;

        var matchesBrand =
          !selectedBrand || getBrand(product) === selectedBrand;

        var searchable = [
          product.name,
          product.brand,
          product.model,
          product.category,
          product.serial_number,
          product.supplier,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        var matchesSearch = !text || searchable.includes(text);

        return matchesSection && matchesBrand && matchesSearch;
      });
    },
    [products, selectedSection, selectedBrand, search]
  );

  const brands = useMemo(
    function () {
      var result = {};

      products
        .filter(function (product) {
          return getCategory(product) === selectedSection;
        })
        .forEach(function (product) {
          var brand = getBrand(product);
          result[brand] = true;
        });

      return Object.keys(result).sort();
    },
    [products, selectedSection]
  );

  const stats = useMemo(
    function () {
      var active = products.filter(function (product) {
        return product.is_active !== false;
      });

      var stockCount = active.reduce(function (sum, product) {
        return sum + numberValue(product.quantity);
      }, 0);

      var purchaseTotal = active.reduce(function (sum, product) {
        return (
          sum +
          numberValue(product.quantity) *
            numberValue(product.purchase_price)
        );
      }, 0);

      var saleTotal = active.reduce(function (sum, product) {
        return (
          sum +
          numberValue(product.quantity) * numberValue(product.sale_price)
        );
      }, 0);

      return {
        products: active.length,
        stockCount: stockCount,
        purchaseTotal: purchaseTotal,
        saleTotal: saleTotal,
        profit: saleTotal - purchaseTotal,
      };
    },
    [products]
  );

  function calculateProductProfit(product) {
    var qty = numberValue(product.quantity);
    var purchase = numberValue(product.purchase_price);
    var sale = numberValue(product.sale_price);

    return qty * (sale - purchase);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "1500px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg, #020617 0%, #0f172a 50%, #1d4ed8 100%)",
            borderRadius: "24px",
            padding: "28px",
            color: "#fff",
            boxShadow: "0 18px 45px rgba(15,23,42,0.18)",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "14px",
                  opacity: 0.75,
                  marginBottom: "6px",
                }}
              >
                SAFE HOME ERP
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: "32px",
                  fontWeight: 800,
                }}
              >
                Ombor
              </h1>

              <div
                style={{
                  marginTop: "8px",
                  opacity: 0.82,
                  fontSize: "15px",
                }}
              >
                Barcha mahsulotlar, tannarx va sotuv narxlarining yagona
                manbasi
              </div>
            </div>

            <button
              type="button"
              onClick={openAdd}
              style={{
                border: "0",
                borderRadius: "14px",
                padding: "14px 22px",
                background: "#fff",
                color: "#0f172a",
                fontWeight: 800,
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              + Mahsulot qo'shish
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: "#fef2f2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              padding: "14px 18px",
              borderRadius: "14px",
              marginBottom: "18px",
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "14px",
            marginBottom: "20px",
          }}
        >
          <StatCard
            title="Mahsulot turlari"
            value={formatNumber(stats.products)}
            subtitle="Faol mahsulotlar"
          />

          <StatCard
            title="Ombordagi dona"
            value={formatNumber(stats.stockCount)}
            subtitle="Jami miqdor"
          />

          <StatCard
            title="Tannarx qiymati"
            value={moneyUZS(stats.purchaseTotal)}
            subtitle="Ombordagi xarid qiymati"
          />

          <StatCard
            title="Sotuv qiymati"
            value={moneyUZS(stats.saleTotal)}
            subtitle="Potensial tushum"
          />

          <StatCard
            title="Potensial foyda"
            value={moneyUZS(stats.profit)}
            subtitle="Sotuv minus tannarx"
          />
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "18px",
            marginBottom: "18px",
            boxShadow: "0 8px 25px rgba(15,23,42,0.07)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "10px",
              overflowX: "auto",
              paddingBottom: "4px",
            }}
          >
            <CategoryButton
              active={selectedSection === "Barcha"}
              onClick={function () {
                setSelectedSection("Barcha");
                setSelectedBrand("");
              }}
              text="Barchasi"
            />

            {sections.map(function (section) {
              return (
                <CategoryButton
                  key={section}
                  active={selectedSection === section}
                  onClick={function () {
                    setSelectedSection(section);
                    setSelectedBrand("");
                  }}
                  text={section}
                />
              );
            })}
          </div>
        </div>

        {selectedSection !== "Barcha" && brands.length > 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              padding: "16px",
              marginBottom: "18px",
              boxShadow: "0 8px 25px rgba(15,23,42,0.06)",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                color: "#64748b",
                fontWeight: 700,
                marginBottom: "10px",
              }}
            >
              BRENDLAR
            </div>

            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={function () {
                  setSelectedBrand("");
                }}
                style={brandStyle(!selectedBrand)}
              >
                Barchasi
              </button>

              {brands.map(function (brand) {
                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={function () {
                      setSelectedBrand(brand);
                    }}
                    style={brandStyle(selectedBrand === brand)}
                  >
                    {brand}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div
          style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "18px",
            marginBottom: "20px",
            boxShadow: "0 8px 25px rgba(15,23,42,0.07)",
          }}
        >
          <input
            value={search}
            onChange={function (event) {
              setSearch(event.target.value);
            }}
            placeholder="Mahsulot, model, brend, serial yoki yetkazib beruvchi bo'yicha qidiring..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              border: "1px solid #dbe2ea",
              borderRadius: "14px",
              padding: "15px 16px",
              outline: "none",
              fontSize: "15px",
              background: "#f8fafc",
            }}
          />
        </div>

        {loading ? (
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "50px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            Ombor yuklanmoqda...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "60px 30px",
              textAlign: "center",
              boxShadow: "0 8px 25px rgba(15,23,42,0.06)",
            }}
          >
            <div
              style={{
                fontSize: "42px",
                marginBottom: "12px",
              }}
            >
              рџ“¦
            </div>

            <h2
              style={{
                margin: "0 0 8px",
                color: "#0f172a",
              }}
            >
              Mahsulot topilmadi
            </h2>

            <p
              style={{
                margin: 0,
                color: "#64748b",
              }}
            >
              Tanlangan bo'limda hozircha mahsulot yo'q.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "16px",
            }}
          >
            {filteredProducts.map(function (product) {
              var qty = numberValue(product.quantity);
              var purchase = numberValue(product.purchase_price);
              var sale = numberValue(product.sale_price);
              var unitProfit = sale - purchase;
              var margin =
                sale > 0 ? (unitProfit / sale) * 100 : 0;

              return (
                <div
                  key={product.id}
                  style={{
                    background: "#fff",
                    borderRadius: "20px",
                    padding: "20px",
                    boxShadow: "0 8px 25px rgba(15,23,42,0.07)",
                    border: "1px solid #edf1f5",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#64748b",
                          fontWeight: 700,
                          marginBottom: "5px",
                        }}
                      >
                        {getCategory(product)}
                      </div>

                      <h3
                        style={{
                          margin: 0,
                          color: "#0f172a",
                          fontSize: "19px",
                        }}
                      >
                        {product.name || "Nomsiz mahsulot"}
                      </h3>

                      <div
                        style={{
                          marginTop: "5px",
                          color: "#475569",
                          fontSize: "14px",
                        }}
                      >
                        {product.brand || ""}
                        {product.brand && product.model ? " вЂў " : ""}
                        {product.model || ""}
                      </div>
                    </div>

                    <div
                      style={{
                        background:
                          qty > 0 ? "#ecfdf5" : "#fef2f2",
                        color:
                          qty > 0 ? "#047857" : "#b91c1c",
                        padding: "7px 10px",
                        borderRadius: "10px",
                        height: "fit-content",
                        fontSize: "12px",
                        fontWeight: 800,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatNumber(qty)} {product.unit || "dona"}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                      marginTop: "18px",
                    }}
                  >
                    <PriceBox
                      title="Tannarx"
                      value={moneyUZS(purchase)}
                    />

                    <PriceBox
                      title="Sotuv narxi"
                      value={moneyUZS(sale)}
                    />
                  </div>

                  {numberValue(product.purchase_price_usd) > 0 && (
                    <div
                      style={{
                        marginTop: "10px",
                        padding: "10px 12px",
                        borderRadius: "12px",
                        background: "#f8fafc",
                        fontSize: "13px",
                        color: "#475569",
                      }}
                    >
                      Xarid USD:{" "}
                      <strong>
                        {moneyUSD(product.purchase_price_usd)}
                      </strong>
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: "12px",
                      padding: "12px",
                      borderRadius: "13px",
                      background:
                        unitProfit >= 0 ? "#f0fdf4" : "#fef2f2",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "10px",
                        fontSize: "13px",
                      }}
                    >
                      <span style={{ color: "#64748b" }}>
                        1 donadan foyda
                      </span>

                      <strong
                        style={{
                          color:
                            unitProfit >= 0
                              ? "#15803d"
                              : "#b91c1c",
                        }}
                      >
                        {moneyUZS(unitProfit)}
                      </strong>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "5px",
                        fontSize: "12px",
                        color: "#64748b",
                      }}
                    >
                      <span>Marja</span>
                      <span>{formatNumber(margin)}%</span>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "12px",
                      fontSize: "13px",
                      color: "#64748b",
                      lineHeight: 1.6,
                    }}
                  >
                    <div>
                      Ombor qiymati:{" "}
                      <strong style={{ color: "#0f172a" }}>
                        {moneyUZS(qty * purchase)}
                      </strong>
                    </div>

                    <div>
                      Potensial foyda:{" "}
                      <strong style={{ color: "#15803d" }}>
                        {moneyUZS(calculateProductProfit(product))}
                      </strong>
                    </div>

                    {numberValue(product.warranty_month) > 0 && (
                      <div>
                        Kafolat:{" "}
                        <strong style={{ color: "#0f172a" }}>
                          {product.warranty_month} oy
                        </strong>
                      </div>
                    )}

                    {product.supplier && (
                      <div>
                        Yetkazib beruvchi:{" "}
                        <strong style={{ color: "#0f172a" }}>
                          {product.supplier}
                        </strong>
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginTop: "16px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={function () {
                        openEdit(product);
                      }}
                      style={{
                        flex: 1,
                        border: "1px solid #cbd5e1",
                        background: "#f8fafc",
                        color: "#0f172a",
                        borderRadius: "12px",
                        padding: "11px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Tahrirlash
                    </button>

                    <button
                      type="button"
                      onClick={function () {
                        deleteProduct(product);
                      }}
                      style={{
                        border: "1px solid #fecaca",
                        background: "#fff1f2",
                        color: "#be123c",
                        borderRadius: "12px",
                        padding: "11px 14px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      O'chirish
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {(showAdd || editingProduct) && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(2,6,23,0.58)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              zIndex: 9999,
              overflowY: "auto",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "760px",
                background: "#fff",
                borderRadius: "24px",
                padding: "26px",
                boxSizing: "border-box",
                boxShadow: "0 25px 70px rgba(0,0,0,0.25)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      color: "#0f172a",
                    }}
                  >
                    {editingProduct
                      ? "Mahsulotni tahrirlash"
                      : "Yangi mahsulot"}
                  </h2>

                  <div
                    style={{
                      marginTop: "5px",
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    Narx shu yerda saqlanadi va keyinchalik boshqa
                    modullarda ishlatiladi.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeForms}
                  style={{
                    border: 0,
                    background: "#f1f5f9",
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontSize: "20px",
                  }}
                >
                  Г—
                </button>
              </div>

              <form onSubmit={saveProduct}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "14px",
                  }}
                >
                  <Field
                    label="Mahsulot nomi *"
                    value={form.name}
                    onChange={function (value) {
                      updateForm("name", value);
                    }}
                    placeholder="Masalan: IP Camera 4MP"
                  />

                  <Field
                    label="Brend"
                    value={form.brand}
                    onChange={function (value) {
                      updateForm("brand", value);
                    }}
                    placeholder="Hikvision / Dahua"
                  />

                  <Field
                    label="Model"
                    value={form.model}
                    onChange={function (value) {
                      updateForm("model", value);
                    }}
                    placeholder="DS-..."
                  />

                  <SelectField
                    label="Bo'lim"
                    value={form.category}
                    onChange={function (value) {
                      updateForm("category", value);
                    }}
                    options={sections}
                  />

                  <Field
                    label="Tannarx (UZS)"
                    type="number"
                    value={form.purchase_price}
                    onChange={function (value) {
                      updateForm("purchase_price", value);
                    }}
                    placeholder="0"
                  />

                  <Field
                    label="Xarid narxi (USD)"
                    type="number"
                    value={form.purchase_price_usd}
                    onChange={function (value) {
                      updateForm("purchase_price_usd", value);
                    }}
                    placeholder="0"
                  />

                  <Field
                    label="Sotuv narxi (UZS)"
                    type="number"
                    value={form.sale_price}
                    onChange={function (value) {
                      updateForm("sale_price", value);
                    }}
                    placeholder="0"
                  />

                  <Field
                    label="Miqdor"
                    type="number"
                    value={form.quantity}
                    onChange={function (value) {
                      updateForm("quantity", value);
                    }}
                    placeholder="0"
                  />

                  <SelectField
                    label="O'lchov birligi"
                    value={form.unit}
                    onChange={function (value) {
                      updateForm("unit", value);
                    }}
                    options={[
                      "dona",
                      "metr",
                      "buxta",
                      "xizmat",
                      "komplekt",
                    ]}
                  />

                  <Field
                    label="Kafolat (oy)"
                    type="number"
                    value={form.warranty_month}
                    onChange={function (value) {
                      updateForm("warranty_month", value);
                    }}
                    placeholder="12"
                  />

                  <Field
                    label="Serial raqam"
                    value={form.serial_number}
                    onChange={function (value) {
                      updateForm("serial_number", value);
                    }}
                    placeholder="Agar mavjud bo'lsa"
                  />

                  <Field
                    label="Yetkazib beruvchi"
                    value={form.supplier}
                    onChange={function (value) {
                      updateForm("supplier", value);
                    }}
                    placeholder="Firma / shaxs"
                  />
                </div>

                <div style={{ marginTop: "14px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#334155",
                      marginBottom: "7px",
                    }}
                  >
                    Izoh
                  </label>

                  <textarea
                    value={form.note}
                    onChange={function (event) {
                      updateForm("note", event.target.value);
                    }}
                    rows={3}
                    placeholder="Qo'shimcha ma'lumot..."
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      border: "1px solid #cbd5e1",
                      borderRadius: "12px",
                      padding: "12px",
                      resize: "vertical",
                      outline: "none",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div
                  style={{
                    marginTop: "20px",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                  }}
                >
                  <button
                    type="button"
                    onClick={closeForms}
                    style={{
                      border: "1px solid #cbd5e1",
                      background: "#fff",
                      borderRadius: "12px",
                      padding: "12px 20px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Bekor qilish
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      border: 0,
                      background: "#2563eb",
                      color: "#fff",
                      borderRadius: "12px",
                      padding: "12px 22px",
                      fontWeight: 800,
                      cursor: saving ? "not-allowed" : "pointer",
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    {saving ? "Saqlanmoqda..." : "Saqlash"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard(props) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "18px",
        padding: "18px",
        boxShadow: "0 8px 25px rgba(15,23,42,0.06)",
        border: "1px solid #edf1f5",
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: "13px",
          fontWeight: 700,
        }}
      >
        {props.title}
      </div>

      <div
        style={{
          color: "#0f172a",
          fontSize: "22px",
          fontWeight: 800,
          marginTop: "7px",
          wordBreak: "break-word",
        }}
      >
        {props.value}
      </div>

      <div
        style={{
          color: "#94a3b8",
          fontSize: "12px",
          marginTop: "5px",
        }}
      >
        {props.subtitle}
      </div>
    </div>
  );
}

function CategoryButton(props) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      style={{
        border: props.active ? "1px solid #2563eb" : "1px solid #e2e8f0",
        background: props.active ? "#eff6ff" : "#fff",
        color: props.active ? "#1d4ed8" : "#475569",
        borderRadius: "12px",
        padding: "11px 15px",
        fontWeight: 700,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {props.text}
    </button>
  );
}

function brandStyle(active) {
  return {
    border: active ? "1px solid #2563eb" : "1px solid #e2e8f0",
    background: active ? "#eff6ff" : "#fff",
    color: active ? "#1d4ed8" : "#475569",
    borderRadius: "10px",
    padding: "8px 12px",
    fontWeight: 700,
    cursor: "pointer",
  };
}

function PriceBox(props) {
  return (
    <div
      style={{
        background: "#f8fafc",
        borderRadius: "12px",
        padding: "11px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          color: "#64748b",
          fontWeight: 700,
        }}
      >
        {props.title}
      </div>

      <div
        style={{
          marginTop: "4px",
          color: "#0f172a",
          fontWeight: 800,
          fontSize: "14px",
        }}
      >
        {props.value}
      </div>
    </div>
  );
}

function Field(props) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "13px",
          fontWeight: 700,
          color: "#334155",
          marginBottom: "7px",
        }}
      >
        {props.label}
      </label>

      <input
        type={props.type || "text"}
        value={props.value}
        onChange={function (event) {
          props.onChange(event.target.value);
        }}
        placeholder={props.placeholder || ""}
        style={{
          width: "100%",
          boxSizing: "border-box",
          border: "1px solid #cbd5e1",
          borderRadius: "12px",
          padding: "11px 12px",
          outline: "none",
          fontSize: "14px",
        }}
      />
    </div>
  );
}

function SelectField(props) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "13px",
          fontWeight: 700,
          color: "#334155",
          marginBottom: "7px",
        }}
      >
        {props.label}
      </label>

      <select
        value={props.value}
        onChange={function (event) {
          props.onChange(event.target.value);
        }}
        style={{
          width: "100%",
          boxSizing: "border-box",
          border: "1px solid #cbd5e1",
          borderRadius: "12px",
          padding: "11px 12px",
          outline: "none",
          fontSize: "14px",
          background: "#fff",
        }}
      >
        {props.options.map(function (option) {
          return (
            <option key={option} value={option}>
              {option}
            </option>
          );
        })}
      </select>
    </div>
  );
}
