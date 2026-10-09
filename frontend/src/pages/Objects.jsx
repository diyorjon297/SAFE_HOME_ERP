import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API = axios.create({ baseURL: "https://safe-home-erp.onrender.com", timeout: 20000 });

const STATUS = ["Yangi", "Rejalashtirilgan", "Jarayonda", "Tekshiruv", "Tugallandi", "To'lov kutilmoqda", "Yopilgan"];
const TYPES = ["Maktab", "Bog'cha", "Uy", "IIB", "Korxona", "Do'kon", "Ombor", "Ofis", "Tashkilot", "Xususiy mijoz", "Birja-Tender", "Boshqa"];
const WORK_TYPES = ["Yangi ustanovka", "Montaj", "Servis", "Ta'mirlash", "Kengaytirish", "Almashtirish", "Sozlash", "Yetkazib berish", "Faqat tovar", "Boshqa"];
const CURRENCIES = ["UZS", "USD"];
const PAYMENT_METHODS = ["Naqd", "Plastik karta", "Bank o\'tkazmasi", "Click", "Payme", "Terminal", "Boshqa"];
const ACCOUNTS = ["Asosiy kassa", "Agrobank", "Anorbank", "Ipak Yo\'li Bank", "Plastik karta", "Click", "Payme", "Boshqa hisob"];
const PAYMENT_PURPOSES = ["Avans", "To\'liq to\'lov", "Ustanovka / montaj avansi", "Kabel uchun avans", "Mahsulot / tovar avansi", "Material uchun to\'lov", "Xizmat uchun to\'lov", "Yakuniy to\'lov", "Qarz to\'lovi", "Boshqa"];
const EXPENSE_CATEGORIES = ["Material", "Ishchi", "Transport", "Yoqilg\'i", "Abet / ovqat", "Yo\'l kira", "Yetkazib berish", "Instrument", "Ijara", "Elektr", "Internet / aloqa", "Bank komissiyasi", "Reklama", "Telefon", "Servis / ta\'mirlash", "Ofis xarajati", "Qarz to\'lovi", "Soliq", "Boshqa"];
const MATERIAL_TYPES = ["NVR", "HDD", "PoE", "Kamera", "Kabel", "Boshqa"];
const NVR_MODELS = ["7604", "7608", "7616", "7632", "7716", "7732", "Boshqa"];
const HDD_CAPACITIES = ["500 GB", "1 TB", "2 TB", "4 TB", "6 TB", "8 TB", "10 TB", "12 TB", "Boshqa"];
const TAX_TYPES = ["Oylik", "Yillik"];
const TAX_MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
const RATE_TYPES = ["Kamera donasiga", "Kabel metriga", "Kunlik", "Oylik", "Kelishilgan summa"];
const UNITS = ["dona", "metr", "kun", "soat", "xizmat", "reys", "kg", "litr", "komplekt"];

const emptyObject = {
  name: "", object_type: "Maktab", work_type: "Yangi ustanovka", client: "", phone: "", address: "",
  start_date: "", end_date: "", status: "Yangi", total: "", currency: "UZS", advance: "", responsible: "", note: ""
};
const today = () => new Date().toISOString().slice(0, 10);
const nowIso = () => new Date().toISOString();
const formatDateTime = v => {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString("uz-UZ", { year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", second:"2-digit" });
};
const emptyPayment = { amount: "", currency: "UZS", payment_purpose: "Avans", payment_method: "Naqd", account_name: "Asosiy kassa", payment_date: today(), note: "" };
const emptyExpense = {
  category: "Material", product_id: "", name: "", quantity: 1, unit: "dona", price: "", currency: "UZS",
  employee: "", rate_type: "Kamera donasiga", days: 1, payment_method: "Naqd", account_name: "Kassa", date: today(), note: "",
  material_type: "NVR", material_model: "", material_capacity: "", brand: "", debt_id: "", debt_name: "", debt_remaining: 0,
  tax_type: "Oylik", tax_year: new Date().getFullYear(), tax_month: new Date().getMonth(), tax_amount: ""
};
const emptyEstimate = { name: "", category: "Material", brand: "", model: "", quantity: 1, unit: "dona", sale_price: "", cost_price: "", discount: 0, tax: 0, note: "" };
const ESTIMATE_CATEGORIES = ["Kamera", "NVR", "HDD", "PoE", "Kabel", "Router / 4G", "Domofon", "Elektron qulf", "Material", "Xizmat", "Ishchi", "Transport", "Boshqa"];

const n = v => Number(v || 0);
const money = (v, currency = "UZS") => `${new Intl.NumberFormat("uz-UZ").format(n(v))} ${currency}`;
const pct = (v, total) => total ? Math.round((n(v) / n(total)) * 100) : 0;
const arr = data => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.objects)) return data.objects;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

function Card({ children, style = {}, className = "" }) {
  return <div className={className} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, boxShadow: "0 5px 18px rgba(15,23,42,.05)", ...style }}>{children}</div>;
}
function Btn({ children, onClick, primary, danger, small, disabled }) {
  return <button disabled={disabled} onClick={onClick} style={{ border: 0, borderRadius: 10, padding: small ? "8px 11px" : "10px 14px", background: danger ? "#fee2e2" : primary ? "#2563eb" : "#f1f5f9", color: danger ? "#b91c1c" : primary ? "#fff" : "#334155", fontWeight: 800, fontSize: 12, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .55 : 1 }}>{children}</button>;
}
function Field({ label, children }) { return <label style={{ display: "grid", gap: 6 }}><span style={{ fontSize: 11, fontWeight: 800, color: "#475569" }}>{label}</span>{children}</label>; }
function Input({ label, ...p }) { return <Field label={label}><input {...p} style={{ width: "100%", boxSizing: "border-box", padding: "10px 11px", border: "1px solid #cbd5e1", borderRadius: 10, fontSize: 13, outline: "none", ...p.style }} /></Field>; }
function Select({ label, children, ...p }) { return <Field label={label}><select {...p} style={{ width: "100%", boxSizing: "border-box", padding: "10px 11px", border: "1px solid #cbd5e1", borderRadius: 10, fontSize: 13, background: "#fff", ...p.style }}>{children}</select></Field>; }
function Textarea({ label, ...p }) { return <Field label={label}><textarea {...p} style={{ width: "100%", boxSizing: "border-box", minHeight: 75, padding: "10px 11px", border: "1px solid #cbd5e1", borderRadius: 10, fontSize: 13, ...p.style }} /></Field>; }
function Badge({ children, tone = "blue" }) { const c = { blue: ["#eff6ff", "#2563eb"], green: ["#f0fdf4", "#15803d"], red: ["#fef2f2", "#dc2626"], orange: ["#fff7ed", "#c2410c"], gray: ["#f1f5f9", "#475569"] }[tone] || ["#f1f5f9", "#475569"]; return <span style={{ padding: "5px 9px", borderRadius: 999, background: c[0], color: c[1], fontSize: 10, fontWeight: 900 }}>{children}</span>; }
function Stat({ label, value, tone = "blue", sub }) { const color = tone === "green" ? "#16a34a" : tone === "red" ? "#dc2626" : tone === "orange" ? "#f59e0b" : "#2563eb"; return <Card style={{ padding: 14, borderTop: `3px solid ${color}` }}><div style={{ fontSize: 10, color: "#64748b", fontWeight: 800 }}>{label}</div><div style={{ fontSize: 18, fontWeight: 950, marginTop: 5 }}>{value}</div>{sub && <div style={{ fontSize: 10, color: "#64748b", marginTop: 3 }}>{sub}</div>}</Card>; }
function Modal({ title, onClose, children, width = 760, drawer = false }) { return <div className={drawer ? "sh-overlay" : ""} style={{ position: "fixed", inset: 0, zIndex: 1000, background: drawer ? "rgba(15,23,42,.32)" : "rgba(15,23,42,.55)", display: "flex", alignItems: drawer ? "stretch" : "center", justifyContent: drawer ? "flex-end" : "center", padding: drawer ? 0 : 16 }}><div className={drawer ? "sh-drawer" : ""} style={{ width: "100%", maxWidth: width, maxHeight: drawer ? "100vh" : "92vh", height: drawer ? "100vh" : "auto", overflow: "auto", background: "#fff", borderRadius: drawer ? "24px 0 0 24px" : 18, boxShadow: drawer ? "-16px 0 45px rgba(15,23,42,.16)" : "0 20px 70px rgba(15,23,42,.22)" }}><div style={{ position: "sticky", top: 0, zIndex: 2, background: "rgba(255,255,255,.96)", backdropFilter: "blur(12px)", padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><b style={{ fontSize: 18 }}>{title}</b></div><button onClick={onClose} style={{ border: 0, background: "#f1f5f9", borderRadius: 10, width: 36, height: 36, cursor: "pointer", fontWeight: 900 }}>✕</button></div><div style={{ padding: drawer ? 20 : 18 }}>{children}</div></div></div>; }

export default function Objects() {
  const [objects, setObjects] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [debts, setDebts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [modal, setModal] = useState("");
  const [form, setForm] = useState(emptyObject);
  const [payment, setPayment] = useState(emptyPayment);
  const [expense, setExpense] = useState(emptyExpense);
  const [estimate, setEstimate] = useState(emptyEstimate);
  const [returnForm, setReturnForm] = useState({ mode:"Qaytarish", product_id:"", quantity:1, new_product_id:"", reason:"", date:today(), note:"" });
  const [locationLoading, setLocationLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");

  const notify = text => { setMsg(text); setTimeout(() => setMsg(""), 2800); };

  const load = async () => {
    setLoading(true); setError("");
    try {
      const results = await Promise.allSettled([
        API.get("/objects"), API.get("/products"), API.get("/customers"), API.get("/employees"), API.get("/debts/")
      ]);
      const [o, p, c, e, d] = results;
      if (o.status === "fulfilled") { const list = arr(o.value.data); setObjects(list); if (!selected && list[0]) setTimeout(() => detail(list[0].id), 0); }
      else setError(o.reason?.response?.data?.detail || "Obyektlar serverdan olinmadi");
      if (p.status === "fulfilled") setProducts(arr(p.value.data));
      if (c.status === "fulfilled") setCustomers(arr(c.value.data));
      if (e.status === "fulfilled") setEmployees(arr(e.value.data));
      if (d.status === "fulfilled") setDebts(arr(d.value.data));
    } catch (e) { setError(e.response?.data?.detail || e.message || "Server bilan bog'lanishda xato"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
  }, []);

  const detail = async id => {
    try { const r = await API.get(`/objects/${id}`); setSelected(r.data); setTab("general"); }
    catch (e) { notify(e.response?.data?.detail || "Obyektni ochib bo'lmadi"); }
  };

  const edit = o => { setForm({ ...emptyObject, ...o }); setModal("object"); };
  const saveObject = async () => {
    if (!form.name.trim()) return notify("Obyekt nomini kiriting");
    setSaving(true);
    try {
      const payload = { ...form, total: n(form.total), paid: n(form.advance), advance: n(form.advance) };
      const r = form.id ? await API.put(`/objects/${form.id}`, payload) : await API.post("/objects", payload);
      setModal(""); await load(); await detail(r.data.id || form.id); notify("Obyekt saqlandi");
    } catch (e) { notify(e.response?.data?.detail || "Saqlashda xato"); }
    finally { setSaving(false); }
  };

  const addPayment = async () => {
    if (!selected || n(payment.amount) <= 0) return notify("To'lov summasini kiriting");
    const stamp = nowIso();
    const payload = { ...payment, amount: n(payment.amount), payment_purpose: payment.payment_purpose, payment_datetime: stamp, created_at: stamp };
    try {
      const r = await API.post(`/objects/${selected.id}/payments`, payload);
      setSelected(r.data); setPayment({ ...emptyPayment, payment_date: today() }); setModal(""); await load(); notify("To'lov saqlandi");
    } catch (e) {
      try {
        await API.post(`/objects/${selected.id}/operations`, {
          operation_type: "payment", name: `To'lov — ${payment.payment_purpose}`, quantity: 1, unit: "xizmat",
          amount: n(payment.amount), currency: payment.currency, payment_purpose: payment.payment_purpose,
          payment_method: payment.payment_method, account_name: payment.account_name,
          operation_date: stamp, payment_datetime: stamp, created_at: stamp, note: payment.note
        });
        setPayment({ ...emptyPayment, payment_date: today() }); setModal(""); await detail(selected.id); await load(); notify("To'lov saqlandi");
      } catch (x) { notify(x.response?.data?.detail || e.response?.data?.detail || "To'lovni saqlab bo'lmadi"); }
    }
  };

  const saveObjectPhoto = async file => {
    if (!file || !selected) return;
    if (!file.type.startsWith("image/")) return notify("Faqat rasm faylini tanlang");
    if (file.size > 4 * 1024 * 1024) return notify("Rasm 4 MB dan katta bo'lmasin");
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || "");
      setPhotoPreview(dataUrl);
      try {
        await API.put(`/objects/${selected.id}`, { image_url: dataUrl, photo_url: dataUrl });
        await detail(selected.id); await load(); notify("Rasm saqlandi");
      } catch (e) {
        notify(e.response?.data?.detail || "Rasmni saqlab bo'lmadi");
      }
    };
    reader.readAsDataURL(file);
  };

  const saveLocation = () => {
    if (!selected) return;
    if (!navigator.geolocation) return notify("Brauzer lokatsiyani qo'llab-quvvatlamaydi");
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(async pos => {
      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;
      const locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
      try {
        await API.put(`/objects/${selected.id}`, { latitude, longitude, location_url: locationUrl });
        await detail(selected.id); notify("Lokatsiya saqlandi");
      } catch (e) {
        try {
          await API.post(`/objects/${selected.id}/operations`, { operation_type:"location", name:"Lokatsiya", quantity:1, unit:"xizmat", amount:0, currency:selected.currency||"UZS", operation_date:nowIso(), created_at:nowIso(), note:`GPS: ${latitude}, ${longitude} | ${locationUrl}` });
          await detail(selected.id); notify("Lokatsiya tarixga saqlandi");
        } catch (x) { notify(x.response?.data?.detail || e.response?.data?.detail || "Lokatsiyani saqlab bo'lmadi"); }
      }
      finally { setLocationLoading(false); }
    }, err => { setLocationLoading(false); notify("Lokatsiyaga ruxsat berilmadi"); }, { enableHighAccuracy:true, timeout:10000 });
  };

  const addReturnExchange = async () => {
    if (!selected || !returnForm.product_id) return notify("Mahsulotni tanlang");
    if (n(returnForm.quantity) <= 0) return notify("Miqdor 0 bo'lmasin");
    const oldProduct = products.find(p => String(p.id) === String(returnForm.product_id));
    const newProduct = products.find(p => String(p.id) === String(returnForm.new_product_id));
    const stamp = nowIso();
    const note = [
      `Amal: ${returnForm.mode}`,
      `Eski mahsulot: ${oldProduct?.name || oldProduct?.title || returnForm.product_id}`,
      returnForm.mode === "Almashtirish" ? `Yangi mahsulot: ${newProduct?.name || newProduct?.title || returnForm.new_product_id}` : "",
      `Miqdor: ${returnForm.quantity}`,
      `Sabab: ${returnForm.reason || "-"}`,
      returnForm.note ? `Izoh: ${returnForm.note}` : ""
    ].filter(Boolean).join(" | ");
    try {
      await API.post(`/objects/${selected.id}/operations`, {
        operation_type: returnForm.mode === "Almashtirish" ? "exchange" : "return",
        name: `${returnForm.mode}: ${oldProduct?.name || oldProduct?.title || "Mahsulot"}`,
        quantity: n(returnForm.quantity), unit: "dona", amount: 0, currency: selected.currency || "UZS",
        operation_date: stamp, created_at: stamp, return_product_id: returnForm.product_id,
        new_product_id: returnForm.new_product_id || null, reason: returnForm.reason, note
      });
      setReturnForm({ mode:"Qaytarish", product_id:"", quantity:1, new_product_id:"", reason:"", date:today(), note:"" });
      setModal(""); await detail(selected.id); await load(); notify(`${returnForm.mode} saqlandi`);
    } catch (e) { notify(e.response?.data?.detail || "Qaytarish/almashtirish saqlanmadi"); }
  };

  const addManualDebt = async () => {
    if (!selected || !expense.debt_name?.trim() || n(expense.debt_amount) <= 0) return notify("Qarz nomi va summasini kiriting");
    try {
      const r = await API.post("/debts/", {
        creditor: expense.debt_creditor || expense.debt_name,
        title: expense.debt_name,
        amount: n(expense.debt_amount),
        paid: 0,
        currency: expense.currency,
        status: "Ochiq",
        note: `Object: ${selected.name}${expense.note ? ` — ${expense.note}` : ""}`
      });
      const debtId = r.data?.id;
      if (debtId) setExpense({...expense, debt_id:String(debtId), debt_remaining:n(expense.debt_amount)});
      await load();
      notify("Yangi qarz saqlandi");
    } catch (e) { notify(e.response?.data?.detail || "Yangi qarzni saqlab bo'lmadi"); }
  };

  const selectedProduct = products.find(p => String(p.id) === String(expense.product_id));
  const selectedDebt = debts.find(d => String(d.id) === String(expense.debt_id));
  const expenseAmount = expense.category === "Ishchi"
    ? expense.rate_type === "Kunlik" ? n(expense.days) * n(expense.price) : n(expense.quantity) * n(expense.price)
    : expense.category === "Soliq" ? n(expense.tax_amount)
    : expense.category === "Qarz to'lovi" ? n(expense.debt_amount)
    : n(expense.quantity) * n(expense.price);

  const onExpenseCategory = category => {
    const next = { ...emptyExpense, category, date: today() };
    if (category === "Material") {
      next.material_type = "NVR";
      next.name = "";
      next.unit = "dona";
    } else if (category === "Ishchi") {
      next.name = "Ishchi xizmati";
      next.unit = "dona";
    } else if (category === "Qarz to'lovi") {
      next.unit = "to'lov";
    } else if (category === "Soliq") {
      next.unit = "oy";
      next.tax_year = new Date().getFullYear();
      next.tax_month = new Date().getMonth();
    }
    setExpense(next);
  };

  const onProduct = id => {
    const p = products.find(x => String(x.id) === String(id));
    setExpense({ ...expense, product_id: id, name: p?.name || p?.title || "", unit: p?.unit || "dona", price: p?.purchase_price ?? p?.cost_price ?? p?.price ?? "" });
  };

  const onMaterialType = type => {
    const next = { ...expense, material_type: type, material_model: "", material_capacity: "", brand: "" };
    if (type === "Kabel") { next.unit = "metr"; next.quantity = 1; }
    else { next.unit = "dona"; next.quantity = 1; }
    next.name = type;
    setExpense(next);
  };

  const addExpense = async () => {
    if (!selected) return;
    if (expense.category === "Qarz to'lovi") {
      if (!expense.debt_id) return notify("Avval qarzni tanlang");
      if (expenseAmount <= 0) return notify("To'lov summasini kiriting");
      try {
        await API.post(`/debts/${expense.debt_id}/payments`, { amount: expenseAmount, currency: expense.currency, payment_date: expense.date, note: `Object: ${selected.name}${expense.note ? ` — ${expense.note}` : ""}` });
        await API.post(`/objects/${selected.id}/operations`, { operation_type: "expense", name: `Qarz to'lovi: ${expense.debt_name || selectedDebt?.name || "Qarz"}`, quantity: 1, unit: "to'lov", amount: expenseAmount, currency: expense.currency, expense_type: "Qarz to'lovi", payment_method: expense.payment_method, account_name: expense.account_name, operation_date: nowIso(), expense_date: expense.date, created_at: nowIso(), note: expense.note });
        setExpense({ ...emptyExpense, date: today() }); setModal(""); await detail(selected.id); await load(); notify("Qarz to'lovi saqlandi va qarzdan kamaytirildi");
      } catch (e) { notify(e.response?.data?.detail || "Qarz to'lovini saqlab bo'lmadi"); }
      return;
    }
    if (expense.category === "Soliq") {
      if (expenseAmount <= 0) return notify("Soliq summasini kiriting");
      const period = expense.tax_type === "Yillik" ? `Yillik ${expense.tax_year}` : `${TAX_MONTHS[Number(expense.tax_month)]} ${expense.tax_year}`;
      try {
        await API.post(`/objects/${selected.id}/operations`, { operation_type: "expense", name: `Soliq — ${period}`, quantity: 1, unit: expense.tax_type === "Yillik" ? "yil" : "oy", amount: expenseAmount, currency: expense.currency, expense_type: "Soliq", payment_method: expense.payment_method, account_name: expense.account_name, operation_date: expense.date, note: `${period}${expense.note ? ` — ${expense.note}` : ""}`, tax_type: expense.tax_type, tax_year: Number(expense.tax_year), tax_month: expense.tax_type === "Oylik" ? Number(expense.tax_month) : null });
        setExpense({ ...emptyExpense, date: today() }); setModal(""); await detail(selected.id); notify("Soliq to'lovi saqlandi");
      } catch (e) { notify(e.response?.data?.detail || "Soliqni saqlab bo'lmadi"); }
      return;
    }
    if (!expense.name.trim()) return notify(expense.category === "Material" ? "Materialni tanlang" : "Xarajat nomini kiriting");
    if (expenseAmount <= 0) return notify("Summa 0 bo'lishi mumkin emas");
    const operation_type = expense.category === "Material" ? "material" : expense.category === "Ishchi" ? "employee" : "expense";
    const materialName = expense.category === "Material" ? [expense.material_type, expense.brand, expense.material_model, expense.material_capacity].filter(Boolean).join(" ") : expense.name;
    try {
      await API.post(`/objects/${selected.id}/operations`, { operation_type, name: materialName, quantity: n(expense.quantity), unit: expense.unit, price: n(expense.price), amount: expenseAmount, currency: expense.currency, employee: expense.category === "Ishchi" ? expense.employee : "", employee_rate_type: expense.category === "Ishchi" ? expense.rate_type : "", employee_rate: expense.category === "Ishchi" ? n(expense.price) : 0, days: expense.category === "Ishchi" && expense.rate_type === "Kunlik" ? n(expense.days) : 0, expense_type: expense.category, material_type: expense.material_type, material_model: expense.material_model, material_capacity: expense.material_capacity, brand: expense.brand, payment_method: expense.payment_method, account_name: expense.account_name, operation_date: nowIso(), expense_date: expense.date, created_at: nowIso(), note: expense.note });
      setExpense({ ...emptyExpense, date: today() }); setModal(""); await detail(selected.id); notify("Xarajat saqlandi");
    } catch (e) { notify(e.response?.data?.detail || "Xarajat saqlanmadi"); }
  };

  const addEstimate = async () => {
    if (!selected || !estimate.name.trim()) return notify("Smeta nomini kiriting");
    try { await API.post(`/objects/${selected.id}/estimates`, { ...estimate, quantity: n(estimate.quantity), sale_price: n(estimate.sale_price), cost_price: n(estimate.cost_price), discount: n(estimate.discount), tax: n(estimate.tax) }); setEstimate(emptyEstimate); setModal(""); await detail(selected.id); notify("Smeta saqlandi"); }
    catch (e) { notify(e.response?.data?.detail || "Smeta saqlanmadi"); }
  };

  const deleteObject = async () => {
    if (!selected) return;
    const ok = window.confirm(`"${selected.name || "Nomsiz obyekt"}" obyektini butunlay o'chirishni tasdiqlaysizmi?\n\nBu amal qaytarib bo'lmaydi.`);
    if (!ok) return;
    try {
      await API.delete(`/objects/${selected.id}`);
      setSelected(null);
      setTab("general");
      await load();
      notify("Obyekt o'chirildi");
    } catch (e) {
      notify(e.response?.data?.detail || "Obyektni o'chirib bo'lmadi. Backend DELETE /objects/{id} endpointini tekshiring.");
    }
  };

  const closeObject = async () => {
    if (!selected) return;
    const balance = Math.max(n(selected.total) - n(selected.paid), 0);
    if (balance > 0) return notify("Avval mijoz qarzini yopish kerak");
    try { await API.put(`/objects/${selected.id}`, { status: "Yopilgan" }); await detail(selected.id); await load(); notify("Obyekt yopildi"); }
    catch (e) { notify(e.response?.data?.detail || "Yopishda xato"); }
  };

  const filtered = useMemo(() => objects.filter(o => {
    const q = search.trim().toLowerCase();
    const matchQ = !q || [o.name, o.client, o.phone, o.address].some(v => String(v || "").toLowerCase().includes(q));
    return matchQ && (!statusFilter || o.status === statusFilter) && (!typeFilter || o.object_type === typeFilter);
  }), [objects, search, statusFilter, typeFilter]);

  const totals = useMemo(() => ({
    count: objects.length,
    active: objects.filter(o => o.status !== "Yopilgan").length,
    contract: objects.reduce((s, o) => s + n(o.total), 0),
    paid: objects.reduce((s, o) => s + n(o.paid), 0),
    debt: objects.reduce((s, o) => s + Math.max(n(o.total) - n(o.paid), 0), 0)
  }), [objects]);

  const operations = selected?.operations || [];
  const payments = selected?.payments || operations.filter(x => x.operation_type === "payment");
  const expenses = operations.filter(x => ["material", "employee", "expense"].includes(x.operation_type));
  const taxOperations = operations.filter(x => x.expense_type === "Soliq");
  const paidTaxMonths = new Set(taxOperations.filter(x => x.tax_type !== "Yillik").map(x => `${x.tax_year || String(x.operation_date || "").slice(0,4)}-${x.tax_month}`));
  const currentTaxYear = new Date().getFullYear();
  const materialCost = operations.filter(x => x.operation_type === "material").reduce((s, x) => s + n(x.amount), 0);
  const employeeCost = operations.filter(x => x.operation_type === "employee").reduce((s, x) => s + n(x.amount), 0);
  const otherCost = operations.filter(x => x.operation_type === "expense").reduce((s, x) => s + n(x.amount), 0);
  const totalCost = materialCost + employeeCost + otherCost;
  const balance = Math.max(n(selected?.total) - n(selected?.paid), 0);
  const profit = n(selected?.total) - totalCost;

  const typeIcon = type => ({Maktab:"🏫", "Bog'cha":"🧒", Uy:"🏠", IIB:"👮", Korxona:"🏢", "Do'kon":"🛒", Ombor:"📦", Ofis:"💼", Tashkilot:"🏛️", "Xususiy mijoz":"👤", "Birja-Tender":"📑", Boshqa:"◈"}[type] || "◈");
  const operationIcon = type => ({payment:"💰",material:"📦",employee:"👷",expense:"💸",return:"↩️",exchange:"🔄"}[type] || "•");
  const statusTone = status => {
    if (status === "Faol" || status === "Tugallandi") return "green";
    if (status === "Jarayonda" || status === "Rejalashtirilgan") return "orange";
    if (status === "Yopilgan") return "gray";
    return "blue";
  };

  const objectPhotos = selected ? [
    selected.image_url,
    selected.photo_url,
    ...(Array.isArray(selected.photos) ? selected.photos.map(x => typeof x === "string" ? x : x?.url || x?.file_url) : [])
  ].filter(Boolean).slice(0, 5) : [];

  const detailRows = [
    ["Mijoz", selected?.client || "-"],
    ["Turi", selected?.object_type || "-"],
    ["Ish turi", selected?.work_type || "-"],
    ["Manzil", selected?.address || "-"],
    ["Telefon", selected?.phone || "-"],
    ["Mas'ul", selected?.responsible || "-"],
    ["Boshlanish", selected?.start_date || "-"],
    ["Tugash", selected?.end_date || "-"],
    ["Lokatsiya", selected?.latitude && selected?.longitude ? `${selected.latitude}, ${selected.longitude}` : "Kiritilmagan"],
  ];

  const expenseRows = expenses;
  const historyRows = [...operations].sort((a, b) => String(b.operation_date || "").localeCompare(String(a.operation_date || "")));

  return <div style={{ minHeight: "100vh", background: "#f5f8fc", color: "#10233f", margin: "-24px clamp(-32px,-3vw,-14px)", padding: "0 0 32px" }}>
    <style>{`
      .oh-page{max-width:none;margin:0;padding:22px 24px 34px;margin-right:610px}
      .oh-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:16px 0}
      .oh-stat{background:#fff;border:1px solid #e5ebf3;border-radius:14px;padding:15px 16px;box-shadow:0 4px 16px rgba(16,35,63,.045)}
      .oh-stat-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:19px;float:left;margin-right:10px}
      .oh-stat-label{font-size:11px;color:#64748b;font-weight:800}.oh-stat-value{font-size:20px;font-weight:950;margin-top:4px}.oh-stat-sub{font-size:10px;color:#16a34a;margin-top:3px}
      .oh-toolbar{background:#fff;border:1px solid #e4eaf2;border-radius:14px;padding:12px;box-shadow:0 4px 16px rgba(16,35,63,.04)}
      .oh-table{background:#fff;border:1px solid #e4eaf2;border-radius:14px;overflow:hidden;box-shadow:0 4px 16px rgba(16,35,63,.04)}
      .oh-table th{background:#f8fafc;color:#64748b;font-size:10px;font-weight:900;text-transform:none;padding:10px 9px;text-align:left;border-bottom:1px solid #e5eaf1;white-space:nowrap}
      .oh-table td{padding:9px;border-bottom:1px solid #eef2f7;font-size:11px;vertical-align:middle}
      .oh-table tbody tr{cursor:pointer;transition:.14s}.oh-table tbody tr:hover{background:#f7fbff}
      .oh-thumb{width:42px;height:42px;border-radius:9px;object-fit:cover;background:#eaf2ff;display:flex;align-items:center;justify-content:center;color:#2563eb;font-weight:900;flex:none}
      .oh-actions{display:flex;gap:5px}.oh-icon-btn{width:29px;height:29px;border:1px solid #dbe3ed;background:#fff;border-radius:7px;cursor:pointer;color:#334155}.oh-icon-btn:hover{background:#eff6ff;color:#2563eb}
      .oh-drawer{position:fixed;right:0;top:72px;height:calc(100vh - 72px);width:610px;background:#fff;z-index:30;box-shadow:-8px 0 24px rgba(15,23,42,.08);overflow:auto;border-left:1px solid #e2e8f0}
      .oh-overlay{display:none}
      @keyframes ohIn{from{transform:translateX(30px);opacity:.6}to{transform:none;opacity:1}}
      .oh-drawer-head{position:sticky;top:0;z-index:4;background:#fff;padding:12px 14px;border-bottom:1px solid #e6ebf2}
      .oh-tabs{display:flex;gap:5px;overflow:auto;padding:6px;background:#f1f5f9;border-radius:10px;margin:13px 0}
      .oh-tab{border:0;background:transparent;border-radius:8px;padding:9px 12px;white-space:nowrap;font-size:11px;font-weight:900;color:#64748b;cursor:pointer}
      .oh-tab.active{background:#fff;color:#1769e0;box-shadow:0 2px 7px rgba(15,23,42,.08)}
      .oh-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .oh-info{background:#fff;border:1px solid #e6ecf3;border-radius:12px;padding:14px}
      .oh-info h3{font-size:13px;margin:0 0 12px}.oh-kv{display:grid;grid-template-columns:105px 1fr;gap:8px;font-size:11px;border-bottom:1px solid #f0f3f7;padding:7px 0}.oh-kv:last-child{border-bottom:0}.oh-k{color:#64748b}.oh-v{font-weight:800}
      .oh-mini-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0}.oh-mini{border-radius:11px;padding:11px;border:1px solid #e4eaf2;background:#fff}.oh-mini b{display:block;font-size:14px;margin-top:4px}
      .oh-photo-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.oh-photo{height:70px;border-radius:9px;object-fit:cover;width:100%;background:#e8eef7}
      .oh-op-head{display:flex;justify-content:space-between;align-items:center;margin:14px 0 8px}
      .oh-empty{padding:30px;text-align:center;color:#94a3b8;font-size:12px}
      @media(max-width:1050px){.oh-stats{grid-template-columns:repeat(2,1fr)}.oh-grid{grid-template-columns:1fr}.oh-mini-cards{grid-template-columns:repeat(2,1fr)}}
      @media(max-width:650px){.oh-page{padding:15px}.oh-stats{grid-template-columns:1fr}.oh-table{overflow:auto}.oh-table table{min-width:850px}}
    `}</style>

    {msg && <div style={{position:"fixed",top:18,right:18,zIndex:2000,background:"#10233f",color:"#fff",padding:"11px 15px",borderRadius:10,fontWeight:800,fontSize:12,boxShadow:"0 10px 30px rgba(0,0,0,.18)"}}>{msg}</div>}

    <div className="oh-page">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
        <div>
          <div style={{fontSize:27,fontWeight:950,letterSpacing:-.7}}>Obyektlar</div>
          <div style={{fontSize:12,color:"#64748b",marginTop:3}}>Barcha obyektlar ro'yxati va moliyaviy holati</div>
        </div>
        <Btn primary onClick={() => {setForm({...emptyObject});setModal("object");}}>＋ Yangi obyekt</Btn>
      </div>

      <div className="oh-stats">
        <div className="oh-stat"><div className="oh-stat-icon" style={{background:"#eaf2ff",color:"#2563eb"}}>▦</div><div className="oh-stat-label">Jami obyekt</div><div className="oh-stat-value">{totals.count}</div><div className="oh-stat-sub">↗ {totals.active} faol</div></div>
        <div className="oh-stat"><div className="oh-stat-icon" style={{background:"#eafbf0",color:"#16a34a"}}>●</div><div className="oh-stat-label">Faol obyekt</div><div className="oh-stat-value">{totals.active}</div><div className="oh-stat-sub">Faol loyihalar</div></div>
        <div className="oh-stat"><div className="oh-stat-icon" style={{background:"#fff5dc",color:"#f59e0b"}}>◉</div><div className="oh-stat-label">Jami tushum</div><div className="oh-stat-value">{money(totals.paid)}</div><div className="oh-stat-sub" style={{color:"#64748b"}}>UZS</div></div>
        <div className="oh-stat"><div className="oh-stat-icon" style={{background:"#ffecec",color:"#ef4444"}}>▣</div><div className="oh-stat-label">Jami xarajat</div><div className="oh-stat-value">{money(objects.reduce((s,o)=>s+n(o.expense_total),0))}</div><div className="oh-stat-sub" style={{color:"#64748b"}}>UZS</div></div>
      </div>

      {error && <Card style={{padding:13,marginBottom:12,borderColor:"#fecaca",background:"#fff7f7"}}><b style={{color:"#b91c1c"}}>Server bilan bog'lanishda muammo</b><div style={{fontSize:11,color:"#7f1d1d",marginTop:3}}>{error}</div><div style={{marginTop:8}}><Btn onClick={load}>Qayta yuklash</Btn></div></Card>}

      <div className="oh-toolbar">
        <div style={{display:"grid",gridTemplateColumns:"1.5fr .8fr .8fr auto auto",gap:8,alignItems:"end"}}>
          <Input label="Qidiruv" placeholder="Obyekt, mijoz, telefon bo'yicha qidiring..." value={search} onChange={e=>setSearch(e.target.value)} />
          <Select label="Status" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="">Barcha statuslar</option>{STATUS.map(x=><option key={x}>{x}</option>)}</Select>
          <Select label="Turi" value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}><option value="">Barcha turlar</option>{TYPES.map(x=><option key={x}>{x}</option>)}</Select>
          <Btn onClick={()=>{setSearch("");setStatusFilter("");setTypeFilter("");}}>Tozalash</Btn>
          <Btn onClick={()=>notify("Excel eksporti keyingi bosqichda ulanadi")}>▣ Excel</Btn>
        </div>
      </div>

      <div className="oh-table" style={{marginTop:12}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["#","Obyekt nomi","Mijoz","Manzil","Status","Turi","Tushum","Xarajat","Foyda","Amallar"].map(h=><th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {loading ? <tr><td colSpan="10" className="oh-empty">Yuklanmoqda...</td></tr> :
            filtered.length===0 ? <tr><td colSpan="10" className="oh-empty">Obyekt topilmadi</td></tr> :
            filtered.map((o,i)=>{
              const d=Math.max(n(o.total)-n(o.paid),0);
              const cost=n(o.expense_total);
              const pf=n(o.total)-cost;
              const img=o.image_url||o.photo_url;
              return <tr key={o.id} onClick={()=>detail(o.id)}>
                <td>{i+1}</td>
                <td><div style={{display:"flex",gap:8,alignItems:"center"}}><div className="oh-thumb">{img?<img src={img} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:9}}/>:"▦"}</div><div><b>{o.name||"Nomsiz obyekt"}</b><div style={{fontSize:9,color:"#64748b"}}>{o.object_type||"Obyekt"}</div></div></div></td>
                <td><b>{o.client||"-"}</b><div style={{fontSize:9,color:"#64748b"}}>{o.phone||""}</div></td>
                <td>{o.address||"-"}</td>
                <td><Badge tone={statusTone(o.status)}>{o.status||"Yangi"}</Badge></td>
                <td><span style={{fontSize:15,marginRight:5}}>{typeIcon(o.object_type)}</span>{o.object_type||"-"}</td>
                <td style={{fontWeight:900}}>{money(o.paid,o.currency)}</td>
                <td style={{fontWeight:900}}>{money(cost,o.currency)}</td>
                <td style={{fontWeight:900,color:pf>=0?"#16a34a":"#dc2626"}}>{money(pf,o.currency)}</td>
                <td><div className="oh-actions"><button className="oh-icon-btn" onClick={e=>{e.stopPropagation();detail(o.id)}}>◉</button><button className="oh-icon-btn" onClick={e=>{e.stopPropagation();edit(o)}}>✎</button><button className="oh-icon-btn" style={{color:"#dc2626"}} onClick={e=>{e.stopPropagation();detail(o.id)}}>▣</button></div></td>
              </tr>
            })}
          </tbody>
        </table>
      </div>
    </div>

    {selected && <><div className="oh-overlay" onClick={()=>setSelected(null)}></div><aside className="oh-drawer">
      <div className="oh-drawer-head">
        <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"flex-start"}}>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <div className="oh-thumb" style={{width:58,height:58}}>{objectPhotos[0]?<img src={objectPhotos[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:9}}/>:"▦"}</div>
            <div><div style={{fontSize:18,fontWeight:950}}>{selected.name||"Nomsiz obyekt"}</div><div style={{fontSize:11,color:"#64748b",marginTop:3}}>{typeIcon(selected.object_type)} {selected.object_type||"Obyekt"} &nbsp; • &nbsp; {selected.address||"Manzil yo'q"}</div><div style={{marginTop:6}}><Badge tone={statusTone(selected.status)}>{selected.status||"Yangi"}</Badge></div></div>
          </div>
          <div style={{display:"flex",gap:6}}><Btn small onClick={()=>edit(selected)}>✎ Tahrirlash</Btn><Btn small danger onClick={deleteObject}>▣ O'chirish</Btn><button className="oh-icon-btn" onClick={()=>setSelected(null)}>✕</button></div>
        </div>
      </div>

      <div style={{padding:"0 15px 28px"}}>
        <div className="oh-tabs">
          {[["general","⌂ Umumiy"],["payments","▤ To'lovlar"],["expenses","▣ Xarajatlar"],["estimate","▧ Smeta"],["devices","◈ Qurilmalar"],["return","↔ Qaytarish"],["files","▤ Fayllar"],["history","◷ Tarix"]].map(([k,l])=><button key={k} className={`oh-tab ${tab===k?"active":""}`} onClick={()=>setTab(k)}>{l}</button>)}
        </div>

        {tab==="general" && <>
          <div className="oh-grid">
            <div className="oh-info"><h3>Asosiy ma'lumotlar</h3>{detailRows.map(([k,v])=><div className="oh-kv" key={k}><span className="oh-k">{k}</span><span className="oh-v">{v}</span></div>)}</div>
            <div className="oh-info"><h3>Rasmlar</h3>{objectPhotos.length > 0 ? (
  <div className="oh-photo-grid">{objectPhotos.map((p,i)=><img key={i} className="oh-photo" src={p} alt="" />)}</div>
) : (
  <div className="oh-empty" style={{padding:20}}>Rasm biriktirilmagan</div>
)}<h3 style={{marginTop:16}}>Joylashuv</h3>
              <div style={{padding:11,borderRadius:10,background:"#f1f5f9",fontSize:11}}>📍 {selected.address||"Joylashuv kiritilmagan"}</div>
              <div style={{display:"flex",gap:7,marginTop:8,flexWrap:"wrap"}}>
                <Btn small onClick={saveLocation} disabled={locationLoading}>{locationLoading?"Aniqlanmoqda...":"📍 Mening lokatsiyam"}</Btn>
                {selected?.latitude&&selected?.longitude&&<a href={`https://maps.google.com/?q=${selected.latitude},${selected.longitude}`} target="_blank" rel="noreferrer" style={{textDecoration:"none"}}><Btn small>🗺️ Xarita</Btn></a>}
              </div>
            </div>
          </div>
          <div className="oh-info" style={{marginTop:10}}><h3>Moliyaviy holat</h3><div className="oh-mini-cards">
            <div className="oh-mini" style={{background:"#f0fdf4"}}><span style={{fontSize:10,color:"#64748b"}}>Jami tushum</span><b style={{color:"#15803d"}}>{money(selected.paid,selected.currency)}</b></div>
            <div className="oh-mini" style={{background:"#fff1f2"}}><span style={{fontSize:10,color:"#64748b"}}>Jami xarajat</span><b style={{color:"#dc2626"}}>{money(totalCost,selected.currency)}</b></div>
            <div className="oh-mini" style={{background:"#eff6ff"}}><span style={{fontSize:10,color:"#64748b"}}>Foyda</span><b style={{color:"#2563eb"}}>{money(profit,selected.currency)}</b></div>
            <div className="oh-mini" style={{background:"#fff7ed"}}><span style={{fontSize:10,color:"#64748b"}}>Foyda %</span><b>{pct(profit,selected.total)}%</b></div>
          </div></div>
          <div className="oh-op-head"><b>Operatsiyalar</b><Btn primary small onClick={()=>{setExpense({...emptyExpense,date:today()});setModal("expense")}}>＋ Xarajat qo'shish</Btn></div>
          <div className="oh-info"><div style={{display:"flex",gap:6,flexWrap:"wrap"}}><Btn small onClick={()=>setModal("payment")}>▣ To'lov</Btn><Btn small onClick={()=>{setExpense({...emptyExpense,category:"Material",date:today()});setModal("expense")}}>Material</Btn><Btn small onClick={()=>{setExpense({...emptyExpense,category:"Ishchi",date:today()});setModal("expense")}}>Ishchi</Btn><Btn small onClick={()=>{setExpense({...emptyExpense,category:"Qarz to'lovi",date:today()});setModal("expense")}}>Qarz to'lovi</Btn><Btn small onClick={()=>{setExpense({...emptyExpense,category:"Soliq",date:today()});setModal("expense")}}>Soliq</Btn><Btn small onClick={()=>{setExpense({...emptyExpense,category:"Boshqa",date:today()});setModal("expense")}}>Boshqa</Btn></div></div>
        </>}

        {tab==="payments" && <div className="oh-info"><div className="oh-op-head"><div><h3 style={{margin:0}}>To'lovlar</h3><div style={{fontSize:10,color:"#64748b"}}>Mijozdan kelgan barcha tushumlar</div></div><Btn primary small onClick={()=>setModal("payment")}>＋ To'lov qo'shish</Btn></div><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Sana / vaqt","Maqsad","Summa","Usul","Hisob","Izoh"].map(x=><th key={x} style={{padding:8,textAlign:"left",fontSize:9,color:"#64748b"}}>{x}</th>)}</tr></thead><tbody>{payments.length > 0 ? (
  payments.map((p,i)=><tr key={p.id||i}>
    <td style={{padding:8,fontSize:10}}>{formatDateTime(p.payment_datetime || p.created_at || p.payment_date || p.operation_date)}</td>
    <td style={{padding:8,fontSize:10}}><Badge tone="blue">{p.payment_purpose || p.purpose || "Boshqa"}</Badge></td>
    <td style={{padding:8,fontWeight:900,color:"#15803d"}}>{money(p.amount,p.currency||selected.currency)}</td>
    <td style={{padding:8,fontSize:10}}>{p.payment_method||"-"}</td>
    <td style={{padding:8,fontSize:10}}>{p.account_name||"-"}</td>
    <td style={{padding:8,fontSize:10}}>{p.note||"-"}</td>
  </tr>)
) : (
  <tr><td colSpan="6" className="oh-empty">Hali to'lov yo'q</td></tr>
)}</tbody></table></div>}

        {tab==="expenses" && <div className="oh-info"><div className="oh-op-head"><div><h3 style={{margin:0}}>Xarajatlar</h3><div style={{fontSize:10,color:"#64748b"}}>Material, ishchi, qarz, soliq va boshqa xarajatlar</div></div><Btn primary small onClick={()=>{setExpense({...emptyExpense,date:today()});setModal("expense")}}>＋ Xarajat qo'shish</Btn></div><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Sana","Turi","Nomi","Miqdor","Summa"].map(x=><th key={x} style={{padding:8,textAlign:"left",fontSize:9,color:"#64748b"}}>{x}</th>)}</tr></thead><tbody>{expenseRows.length > 0 ? (
  expenseRows.map((x,i)=><tr key={x.id||i}>
    <td style={{padding:8,fontSize:10}}>{formatDateTime(x.created_at || x.operation_date)}</td>
    <td style={{padding:8}}><Badge>{x.expense_type||"Boshqa"}</Badge></td>
    <td style={{padding:8,fontSize:10}}><b>{x.name||"-"}</b>{x.employee&&<div style={{color:"#64748b"}}>{x.employee}</div>}</td>
    <td style={{padding:8,fontSize:10}}>{x.quantity||"-"} {x.unit||""}</td>
    <td style={{padding:8,fontWeight:900}}>{money(x.amount,x.currency||selected.currency)}</td>
  </tr>)
) : (
  <tr><td colSpan="5" className="oh-empty">Hali xarajat yo'q</td></tr>
)}</tbody></table></div>}

        {tab==="estimate" && <div className="oh-info"><div className="oh-op-head"><h3 style={{margin:0}}>Smeta</h3><Btn primary small onClick={()=>setModal("estimate")}>＋ Qator</Btn></div><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Kategoriya","Nomi","Miqdor","Sotuv","Tannarx","Foyda"].map(x=><th key={x} style={{padding:8,textAlign:"left",fontSize:9,color:"#64748b"}}>{x}</th>)}</tr></thead><tbody>{(selected.estimates||[]).map((x,i)=><tr key={x.id||i}><td style={{padding:8,fontSize:10}}>{x.category||"Boshqa"}</td><td style={{padding:8,fontSize:10}}><b>{x.name}</b>{x.brand||x.model?<div style={{fontSize:9,color:"#64748b"}}>{[x.brand,x.model].filter(Boolean).join(" ")}</div>:null}</td><td style={{padding:8,fontSize:10}}>{x.quantity} {x.unit}</td><td style={{padding:8}}>{money(x.sale_total ?? n(x.sale_price)*n(x.quantity),selected.currency)}</td><td style={{padding:8}}>{money(x.cost_total ?? n(x.cost_price)*n(x.quantity),selected.currency)}</td><td style={{padding:8,fontWeight:900,color:n(x.profit)>=0?"#15803d":"#dc2626"}}>{money(x.profit ?? (n(x.sale_total)-n(x.cost_total)),selected.currency)}</td></tr>)}</tbody></table></div>}

        {tab==="devices" && <div className="oh-info"><div className="oh-op-head"><div><h3 style={{margin:0}}>Qurilmalar</h3><div style={{fontSize:10,color:"#64748b"}}>Obyektga biriktirilgan kamera, NVR, HDD, PoE va boshqa uskunalar</div></div><Btn primary small onClick={()=>{setExpense({...emptyExpense,category:"Material",date:today()});setModal("expense")}}>＋ Qurilma qo'shish</Btn></div><div className="oh-mini-cards">{expenses.filter(x=>x.operation_type==="material").length===0?<div className="oh-empty" style={{gridColumn:"1/-1"}}>Qurilmalar hali kiritilmagan</div>:expenses.filter(x=>x.operation_type==="material").map((x,i)=><div className="oh-mini" key={x.id||i}><span style={{fontSize:10,color:"#64748b"}}>📦 {x.material_type||"Material"}</span><b>{x.name||"-"}</b><div style={{fontSize:10,color:"#64748b"}}>{x.quantity||1} {x.unit||"dona"}</div></div>)}</div></div>}
{tab==="return" && <div className="oh-info"><div className="oh-op-head"><div><h3 style={{margin:0}}>Qaytarish / Almashtirish</h3><div style={{fontSize:10,color:"#64748b"}}>Obyektdagi mahsulotni qaytarish yoki boshqa mahsulotga almashtirish</div></div><Btn primary small onClick={()=>setModal("return")}>＋ Amal qo'shish</Btn></div><div className="oh-empty">Qaytarish va almashtirish tarixi shu yerda ko'rsatiladi.</div></div>}
{tab==="files" && <div className="oh-info"><h3>Fayllar</h3><div className="oh-empty">Hozircha fayl biriktirilmagan</div></div>}
        {tab==="history" && <div className="oh-info"><h3>Obyekt tarixi</h3>{historyRows.length > 0 ? (
  historyRows.map((x,i)=><div key={x.id||i} className="oh-kv">
    <span className="oh-k">{formatDateTime(x.created_at || x.payment_datetime || x.operation_date)}</span>
    <span className="oh-v">{operationIcon(x.operation_type)} {x.name||x.operation_type||"-"} — {money(x.amount,x.currency||selected.currency)}</span>
  </div>)
) : (
  <div className="oh-empty">Tarix mavjud emas</div>
)}</div>}
      </div>
    </aside></>}

    {modal==="object" && <Modal title={form.id?"Obyektni tahrirlash":"Yangi obyekt"} onClose={()=>setModal("")} width={850}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        <Input label="Obyekt nomi *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <Select label="Obyekt turi" value={form.object_type} onChange={e=>setForm({...form,object_type:e.target.value})}>{TYPES.map(x=><option key={x}>{x}</option>)}</Select>
        <Select label="Ish turi" value={form.work_type} onChange={e=>setForm({...form,work_type:e.target.value})}>{WORK_TYPES.map(x=><option key={x}>{x}</option>)}</Select>
        <Select label="Mijoz" value={form.client} onChange={e=>{const c=customers.find(x=>String(x.name||x.full_name||"")===e.target.value);setForm({...form,client:e.target.value,phone:c?.phone||form.phone})}}><option value="">Tanlang</option>{customers.map((x,i)=><option key={x.id||i} value={x.name||x.full_name}>{x.name||x.full_name}</option>)}</Select>
        <Input label="Telefon" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
        <Select label="Mas'ul" value={form.responsible} onChange={e=>setForm({...form,responsible:e.target.value})}><option value="">Tanlang</option>{employees.map((x,i)=><option key={x.id||i}>{x.name||x.full_name}</option>)}</Select>
        <Input label="Manzil" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/>
        <Input label="Boshlanish" type="date" value={form.start_date||""} onChange={e=>setForm({...form,start_date:e.target.value})}/>
        <Input label="Deadline" type="date" value={form.end_date||""} onChange={e=>setForm({...form,end_date:e.target.value})}/>
        <Select label="Status" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{STATUS.map(x=><option key={x}>{x}</option>)}</Select>
        <Input label="Shartnoma summasi" type="number" value={form.total} onChange={e=>setForm({...form,total:e.target.value})}/>
        <Select label="Valyuta" value={form.currency} onChange={e=>setForm({...form,currency:e.target.value})}>{CURRENCIES.map(x=><option key={x}>{x}</option>)}</Select>
      </div>
      <div style={{marginTop:12}}><Textarea label="Izoh" value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/></div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:14}}><Btn onClick={()=>setModal("")}>Bekor qilish</Btn><Btn primary onClick={saveObject} disabled={saving}>{saving?"Saqlanmoqda...":"Saqlash"}</Btn></div>
    </Modal>}

    {modal==="payment" && <Modal title="To'lov qo'shish" onClose={()=>setModal("")} width={650}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Select label="To'lov maqsadi" value={payment.payment_purpose} onChange={e=>setPayment({...payment,payment_purpose:e.target.value})}>{PAYMENT_PURPOSES.map(x=><option key={x}>{x}</option>)}</Select>
        <Input label="Summa *" type="number" value={payment.amount} onChange={e=>setPayment({...payment,amount:e.target.value})}/>
        <Select label="Valyuta" value={payment.currency} onChange={e=>setPayment({...payment,currency:e.target.value})}>{CURRENCIES.map(x=><option key={x}>{x}</option>)}</Select>
        <Select label="To'lov usuli" value={payment.payment_method} onChange={e=>setPayment({...payment,payment_method:e.target.value})}>{PAYMENT_METHODS.map(x=><option key={x}>{x}</option>)}</Select>
        <Select label="Hisob" value={payment.account_name} onChange={e=>setPayment({...payment,account_name:e.target.value})}>{ACCOUNTS.map(x=><option key={x}>{x}</option>)}</Select>
        <Input label="Sana" type="date" value={payment.payment_date} onChange={e=>setPayment({...payment,payment_date:e.target.value})}/>
      </div>
      <div style={{marginTop:12}}><Textarea label="Izoh" value={payment.note} onChange={e=>setPayment({...payment,note:e.target.value})}/></div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:13}}><Btn onClick={()=>setModal("")}>Bekor qilish</Btn><Btn primary onClick={addPayment}>Saqlash</Btn></div>
    </Modal>}

    {modal==="expense" && <Modal title="Xarajat qo'shish" onClose={()=>setModal("")} width={850}>
      <Card style={{padding:12,background:"#f8fafc",marginBottom:13}}>
        <b style={{fontSize:13}}>Xarajat turini tanlang</b>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginTop:9}}>{EXPENSE_CATEGORIES.map(c=><button key={c} onClick={()=>onExpenseCategory(c)} style={{border:expense.category===c?"2px solid #2563eb":"1px solid #cbd5e1",borderRadius:10,padding:"10px 6px",background:expense.category===c?"#eff6ff":"#fff",color:expense.category===c?"#1d4ed8":"#334155",fontWeight:850,fontSize:11,cursor:"pointer"}}>{c}</button>)}</div>
      </Card>
      {expense.category==="Material" && <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        <Select label="Material turi" value={expense.material_type} onChange={e=>onMaterialType(e.target.value)}>{MATERIAL_TYPES.map(x=><option key={x}>{x}</option>)}</Select>
        {expense.material_type==="NVR" && <Select label="NVR modeli" value={expense.material_model} onChange={e=>setExpense({...expense,material_model:e.target.value,name:`NVR ${e.target.value}`})}><option value="">Modelni tanlang</option>{NVR_MODELS.map(x=><option key={x}>{x}</option>)}</Select>}
        {expense.material_type==="HDD" && <Select label="HDD sig'imi" value={expense.material_capacity} onChange={e=>setExpense({...expense,material_capacity:e.target.value,name:`HDD ${e.target.value}`})}><option value="">Sig'imni tanlang</option>{HDD_CAPACITIES.map(x=><option key={x}>{x}</option>)}</Select>}
        {(expense.material_type==="Kamera"||expense.material_type==="PoE") && <Input label="Marka / model" value={expense.brand} onChange={e=>setExpense({...expense,brand:e.target.value,name:`${expense.material_type} ${e.target.value}`})} placeholder="Hikvision / Dahua..."/>}
        {expense.material_type==="Kabel" && <Input label="Kabel turi" value={expense.material_model} onChange={e=>setExpense({...expense,material_model:e.target.value,name:`Kabel ${e.target.value}`})} placeholder="UTP / FTP / optika..."/>}
        {expense.material_type==="Boshqa" && <Input label="Mahsulot nomi" value={expense.name} onChange={e=>setExpense({...expense,name:e.target.value})}/>}
        <Input label={expense.material_type==="Kabel"?"Metr":"Miqdor"} type="number" min="0" value={expense.quantity} onChange={e=>setExpense({...expense,quantity:e.target.value,unit:expense.material_type==="Kabel"?"metr":"dona"})}/>
        <Input label="Narx" type="number" min="0" value={expense.price} onChange={e=>setExpense({...expense,price:e.target.value})}/>
      </div>}
      {expense.category==="Ishchi" && <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
        <Select label="Xodim" value={expense.employee} onChange={e=>setExpense({...expense,employee:e.target.value})}><option value="">Xodimni tanlang</option>{employees.map((x,i)=><option key={x.id||i}>{x.name||x.full_name}</option>)}</Select>
        <Select label="Hisoblash turi" value={expense.rate_type} onChange={e=>setExpense({...expense,rate_type:e.target.value,unit:e.target.value==="Kabel metriga"?"metr":e.target.value==="Kunlik"?"kun":"dona"})}>{RATE_TYPES.map(x=><option key={x}>{x}</option>)}</Select>
        <Input label={expense.rate_type==="Kunlik"?"Ish kuni":expense.rate_type==="Kamera donasiga"?"Kamera soni":expense.rate_type==="Kabel metriga"?"Kabel metri":"Miqdor"} type="number" min="0" value={expense.quantity} onChange={e=>setExpense({...expense,quantity:e.target.value,days:e.target.value})}/>
        <Input label="Stavka" type="number" min="0" value={expense.price} onChange={e=>setExpense({...expense,price:e.target.value})}/>
        <Select label="Valyuta" value={expense.currency} onChange={e=>setExpense({...expense,currency:e.target.value})}>{CURRENCIES.map(x=><option key={x}>{x}</option>)}</Select>
        <Input label="Sana" type="date" value={expense.date} onChange={e=>setExpense({...expense,date:e.target.value})}/>
      </div>}
      {expense.category==="Qarz to'lovi" && <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:12}}>
        <Select label="Asosiy qarzni tanlang" value={expense.debt_id} onChange={e=>{const d=debts.find(x=>String(x.id)===String(e.target.value));setExpense({...expense,debt_id:e.target.value,debt_name:d?.title||d?.name||d?.creditor||"Qarz",debt_remaining:Math.max(n(d?.amount)-n(d?.paid),0),debt_amount:""})}}><option value="">Qarzni tanlang</option>{debts.map((d,i)=>{const rem=Math.max(n(d.amount)-n(d.paid),0);return <option key={d.id||i} value={d.id}>{d.title||d.name||d.creditor||`Qarz ${d.id}`} — {money(rem,d.currency||"UZS")} qoldiq</option>})}</Select>
        <Input label="To'lov summasi" type="number" min="0" value={expense.debt_amount} onChange={e=>setExpense({...expense,debt_amount:e.target.value})}/>
        <Input label="Yangi qarz nomi (qo'lda)" value={expense.debt_name||""} onChange={e=>setExpense({...expense,debt_name:e.target.value})} placeholder="Masalan: Agrobank krediti"/>
        <Input label="Kimga / kimdan" value={expense.debt_creditor||""} onChange={e=>setExpense({...expense,debt_creditor:e.target.value})}/>
        <Btn primary onClick={addManualDebt}>＋ Qo'lda yangi qarz saqlash</Btn>
        <Input label="Sana" type="date" value={expense.date} onChange={e=>setExpense({...expense,date:e.target.value})}/>
        <Select label="Valyuta" value={expense.currency} onChange={e=>setExpense({...expense,currency:e.target.value})}>{CURRENCIES.map(x=><option key={x}>{x}</option>)}</Select>
        {expense.debt_id&&<div style={{gridColumn:"1/-1",padding:11,borderRadius:10,background:"#fff7ed",color:"#9a3412",fontWeight:850}}>Qoldiq: {money(expense.debt_remaining,selected?.currency||"UZS")}</div>}
      </div>}
      {expense.category==="Soliq" && <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
        <Select label="Soliq turi" value={expense.tax_type} onChange={e=>setExpense({...expense,tax_type:e.target.value})}>{TAX_TYPES.map(x=><option key={x}>{x}</option>)}</Select>
        <Input label="Yil" type="number" value={expense.tax_year} onChange={e=>setExpense({...expense,tax_year:e.target.value})}/>
        {expense.tax_type==="Oylik"&&<Select label="Oy" value={expense.tax_month} onChange={e=>setExpense({...expense,tax_month:Number(e.target.value)})}>{TAX_MONTHS.map((x,i)=><option key={x} value={i}>{x}</option>)}</Select>}
        <Input label="Soliq summasi" type="number" min="0" value={expense.tax_amount} onChange={e=>setExpense({...expense,tax_amount:e.target.value})}/>
        <Input label="To'langan sana" type="date" value={expense.date} onChange={e=>setExpense({...expense,date:e.target.value})}/>
        <Select label="Valyuta" value={expense.currency} onChange={e=>setExpense({...expense,currency:e.target.value})}>{CURRENCIES.map(x=><option key={x}>{x}</option>)}</Select>
        <div style={{gridColumn:"1/-1"}}><Card style={{overflow:"hidden"}}><div style={{padding:10,borderBottom:"1px solid #e2e8f0",fontWeight:900}}>Soliq — {currentTaxYear} oyma-oy holat</div>{TAX_MONTHS.map((m,i)=>{const paid=paidTaxMonths.has(`${currentTaxYear}-${i}`);return <div key={m} style={{display:"flex",justifyContent:"space-between",padding:"7px 10px",borderBottom:"1px solid #f1f5f9",fontSize:11}}><span>{m}</span><Badge tone={paid?"green":"red"}>{paid?"To'langan":"To'lanmagan"}</Badge></div>})}</Card></div>
      </div>}
      {!["Material","Ishchi","Qarz to'lovi","Soliq"].includes(expense.category)&&<div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:12}}><Input label="Xarajat nomi" value={expense.name} onChange={e=>setExpense({...expense,name:e.target.value})}/><Input label="Miqdor" type="number" value={expense.quantity} onChange={e=>setExpense({...expense,quantity:e.target.value})}/><Input label="Narx" type="number" value={expense.price} onChange={e=>setExpense({...expense,price:e.target.value})}/></div>}
      {expense.category!=="Soliq"&&expense.category!=="Qarz to'lovi"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:12}}><Select label="To'lov usuli" value={expense.payment_method} onChange={e=>setExpense({...expense,payment_method:e.target.value})}>{PAYMENT_METHODS.map(x=><option key={x}>{x}</option>)}</Select><Select label="Hisob" value={expense.account_name} onChange={e=>setExpense({...expense,account_name:e.target.value})}>{ACCOUNTS.map(x=><option key={x}>{x}</option>)}</Select></div>}
      <div style={{marginTop:13,padding:13,borderRadius:12,background:"#eff6ff",display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:800}}>Hisoblangan summa</span><b style={{fontSize:19,color:"#1d4ed8"}}>{money(expenseAmount,expense.currency)}</b></div>
      <div style={{marginTop:12}}><Textarea label="Izoh" value={expense.note} onChange={e=>setExpense({...expense,note:e.target.value})}/></div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:13}}><Btn onClick={()=>setModal("")}>Bekor qilish</Btn><Btn primary onClick={addExpense}>Saqlash</Btn></div>
    </Modal>}

    {modal==="return"&&<Modal title="↔ Mahsulot qaytarish / almashtirish" onClose={()=>setModal("")} width={760}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Select label="Amal turi" value={returnForm.mode} onChange={e=>setReturnForm({...returnForm,mode:e.target.value})}><option>Qaytarish</option><option>Almashtirish</option></Select>
        <Select label="Mahsulot" value={returnForm.product_id} onChange={e=>setReturnForm({...returnForm,product_id:e.target.value})}><option value="">Mahsulotni tanlang</option>{products.map((p,i)=><option key={p.id||i} value={p.id}>{p.name||p.title||`Mahsulot ${p.id}`}</option>)}</Select>
        <Input label="Miqdor" type="number" min="1" value={returnForm.quantity} onChange={e=>setReturnForm({...returnForm,quantity:e.target.value})}/>
        {returnForm.mode==="Almashtirish"&&<Select label="Yangi mahsulot" value={returnForm.new_product_id} onChange={e=>setReturnForm({...returnForm,new_product_id:e.target.value})}><option value="">Yangi mahsulotni tanlang</option>{products.map((p,i)=><option key={p.id||i} value={p.id}>{p.name||p.title||`Mahsulot ${p.id}`}</option>)}</Select>}
        <Input label="Sabab" value={returnForm.reason} onChange={e=>setReturnForm({...returnForm,reason:e.target.value})} placeholder="Nosozlik, ortiqcha qoldi, model almashtirildi..."/>
        <Input label="Sana" type="date" value={returnForm.date} onChange={e=>setReturnForm({...returnForm,date:e.target.value})}/>
      </div>
      <div style={{marginTop:12}}><Textarea label="Izoh" value={returnForm.note} onChange={e=>setReturnForm({...returnForm,note:e.target.value})}/></div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:13}}><Btn onClick={()=>setModal("")}>Bekor qilish</Btn><Btn primary onClick={addReturnExchange}>Saqlash</Btn></div>
    </Modal>}

    {modal==="estimate"&&<Modal title="📋 Smeta qatori" onClose={()=>setModal("")} width={900}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
        <Select label="Kategoriya" value={estimate.category} onChange={e=>setEstimate({...estimate,category:e.target.value})}>{ESTIMATE_CATEGORIES.map(x=><option key={x}>{x}</option>)}</Select>
        <Input label="Nomi *" value={estimate.name} onChange={e=>setEstimate({...estimate,name:e.target.value})}/>
        <Input label="Brend" value={estimate.brand} onChange={e=>setEstimate({...estimate,brand:e.target.value})} placeholder="Hikvision / Dahua..."/>
        <Input label="Model / sig'im" value={estimate.model} onChange={e=>setEstimate({...estimate,model:e.target.value})}/>
        <Input label="Miqdor" type="number" value={estimate.quantity} onChange={e=>setEstimate({...estimate,quantity:e.target.value})}/>
        <Select label="Birlik" value={estimate.unit} onChange={e=>setEstimate({...estimate,unit:e.target.value})}>{UNITS.map(x=><option key={x}>{x}</option>)}</Select>
        <Input label="Sotuv narxi" type="number" value={estimate.sale_price} onChange={e=>setEstimate({...estimate,sale_price:e.target.value})}/>
        <Input label="Tannarx" type="number" value={estimate.cost_price} onChange={e=>setEstimate({...estimate,cost_price:e.target.value})}/>
        <Input label="Chegirma" type="number" value={estimate.discount} onChange={e=>setEstimate({...estimate,discount:e.target.value})}/>
        <Input label="Soliq %" type="number" value={estimate.tax} onChange={e=>setEstimate({...estimate,tax:e.target.value})}/>
      </div>
      <div style={{marginTop:12}}><Textarea label="Izoh / texnik tavsif" value={estimate.note} onChange={e=>setEstimate({...estimate,note:e.target.value})}/></div>
      <div style={{marginTop:12,padding:12,borderRadius:11,background:"#eff6ff",fontSize:11}}>Smeta qatorida mahsulot, xizmat, ishchi, transport, miqdor, narx, tannarx, chegirma, soliq va izohni saqlash mumkin.</div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:13}}><Btn onClick={()=>setModal("")}>Bekor qilish</Btn><Btn primary onClick={addEstimate}>Saqlash</Btn></div>
    </Modal>}
  </div>;
}

