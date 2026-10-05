import React, { useEffect, useMemo, useState } from "react";
import {
  FiArrowDown, FiArrowUp, FiCreditCard, FiSearch, FiBell, FiLogOut,
  FiPlus, FiEdit2, FiTrash2, FiClock, FiMoreHorizontal, FiGrid,
  FiList, FiBarChart2, FiCalendar, FiDollarSign, FiBriefcase,
  FiUsers, FiHome, FiPackage, FiSettings, FiFileText, FiX
} from "react-icons/fi";

const STORE = "SAFE_HOME_MOLIYA_V3";
const fmt = (v, c="UZS") => `${Number(v||0).toLocaleString("uz-UZ")} ${c}`;
const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;

const seed = {
  receivables: [
    {id:"r-ewmat", name:"ewmat", title:"Ish haqi", amount:100000, paid:1000, currency:"UZS", side:"receivable", due:"2026-12-08"}
  ],
  payables: [
    {id:"p-1",name:"Farrux yozna",title:"Kredit",amount:20000000,paid:1200000,currency:"UZS"},
    {id:"p-2",name:"Farrux yozna",title:"Ish haqi",amount:11800000,paid:0,currency:"UZS"},
    {id:"p-3",name:"Avtokredit",title:"Mashina",amount:130000000,paid:0,currency:"UZS"},
    {id:"p-4",name:"Ishonch",title:"Noutbuk",amount:8000000,paid:0,currency:"UZS"},
    {id:"p-5",name:"Ishonch",title:"Konditsioner",amount:6000000,paid:500000,currency:"UZS"},
    {id:"p-6",name:"Agrobank",title:"Issiqxona",amount:20000000,paid:0,currency:"UZS"},
    {id:"p-7",name:"Shurik aka",title:"Trade-in",amount:15000000,paid:0,currency:"UZS"},
    {id:"p-8",name:"Zarnigor Beshimova",title:"Foizli qarz",amount:900,paid:0,currency:"USD"},
    {id:"p-9",name:"Farrux yaznam",title:"Qarz",amount:9000000,paid:5650000,currency:"UZS"},
    {id:"p-10",name:"Farrux yaznam",title:"Keyingi qarz",amount:2800000,paid:1250000,currency:"UZS"},
    {id:"p-11",name:"iwonch",title:"Noutbuk",amount:5000000,paid:251000,currency:"UZS"},
    {id:"p-12",name:"iPhone 16 Pro Max",title:"Bo‘lib to‘lash",amount:885,paid:201,currency:"USD"},
    {id:"p-13",name:"Javoxrga",title:"Ishlagan",amount:700000,paid:700000,currency:"UZS"}
  ],
  payments: []
};

function loadData(){
  try{
    const raw = JSON.parse(localStorage.getItem(STORE)||"null");
    if(raw && (Array.isArray(raw.payables)||Array.isArray(raw.receivables))){
      const pay = Array.isArray(raw.payables)&&raw.payables.length ? raw.payables : seed.payables;
      const rec = Array.isArray(raw.receivables)&&raw.receivables.length ? raw.receivables : seed.receivables;
      return {...seed,...raw,payables:pay,receivables:rec,payments:Array.isArray(raw.payments)?raw.payments:[]};
    }
  }catch{}
  return seed;
}
const save = d => { try{localStorage.setItem(STORE,JSON.stringify(d));}catch{} };

const nav = [
  [FiHome,"Dashboard"],[FiBriefcase,"Obyektlar"],[FiUsers,"Mijozlar"],[FiPackage,"Ombor"],
  [FiCreditCard,"Moliya"],[FiFileText,"Xarajatlar"],[FiCalendar,"Buyurtmalar"],
  [FiBarChart2,"Hisobotlar"],[FiSettings,"Sozlamalar"]
];

function Card({item,onPay,onEdit,onDelete,onHistory}){
  const remain=Math.max(0,Number(item.amount||0)-Number(item.paid||0));
  const pct=item.amount>0?Math.min(100,(item.paid/item.amount)*100):0;
  const done=remain<=0;
  return <div className="debt-card">
    <div className="card-top">
      <div><div className="person">{item.name}</div><div className="reason">{item.title}</div></div>
      <span className={done?"badge green":"badge red"}>{done?"To‘langan":pct>0?"Qisman":"Ochiq"}</span>
      <button className="dots"><FiMoreHorizontal/></button>
    </div>
    <div className="metrics">
      <div><span><b className="sq blue">↕</b> Jami</span><strong>{fmt(item.amount,item.currency)}</strong></div>
      <div><span><b className="sq green">✓</b> To‘langan</span><strong className="paid">{fmt(item.paid,item.currency)}</strong></div>
      <div><span><b className="sq red">▣</b> Qolgan</span><strong className="remain">{fmt(remain,item.currency)}</strong></div>
      <div className="ring" style={{"--p":`${pct}%`}}><span>{Math.round(pct)}%</span></div>
    </div>
    <div className="progress"><i style={{width:`${pct}%`}}/></div>
    <div className="card-actions">
      {!done && <button className="pay-btn" onClick={()=>onPay(item)}>To‘lov qilish</button>}
      <button className="icon-btn" onClick={()=>onHistory(item)} title="To‘lovlar tarixi"><FiClock/></button>
      <button className="icon-btn" onClick={()=>onEdit(item)} title="Tahrirlash"><FiEdit2/></button>
      <button className="icon-btn danger" onClick={()=>onDelete(item)} title="O‘chirish"><FiTrash2/></button>
    </div>
  </div>
}

export default function Moliya(){
  const [data,setData]=useState(loadData);
  const [tab,setTab]=useState("payables");
  const [query,setQuery]=useState("");
  const [currency,setCurrency]=useState("ALL");
  const [status,setStatus]=useState("ALL");
  const [view,setView]=useState("grid");
  const [modal,setModal]=useState(null);
  const [amount,setAmount]=useState("");
  const [edit,setEdit]=useState(null);
  const [historyItem,setHistoryItem]=useState(null);

  useEffect(()=>save(data),[data]);

  const payables=data.payables||[], receivables=data.receivables||[];
  const rem=x=>Math.max(0,Number(x.amount||0)-Number(x.paid||0));
  const recTotal=receivables.reduce((a,x)=>a+rem(x),0);
  const payUZS=payables.filter(x=>x.currency==="UZS").reduce((a,x)=>a+rem(x),0);
  const payUSD=payables.filter(x=>x.currency==="USD").reduce((a,x)=>a+rem(x),0);

  const source=tab==="receivables"?receivables:(tab==="payables"?payables:[...receivables,...payables]);
  const filtered=source.filter(x=>{
    const q=query.trim().toLowerCase();
    const qok=!q||`${x.name} ${x.title}`.toLowerCase().includes(q);
    const cok=currency==="ALL"||x.currency===currency;
    const r=rem(x);
    const sok=status==="ALL"||(status==="OPEN"&&r>0)||(status==="PAID"&&r<=0);
    return qok&&cok&&sok;
  });

  const top5=useMemo(()=>[...payables].sort((a,b)=>rem(b)-rem(a)).slice(0,5),[payables]);
  const maxTop=Math.max(1,...top5.filter(x=>x.currency==="UZS").map(rem));

  const addPayment=()=>{
    const value=Number(amount);
    if(!modal||!value||value<=0)return;
    const list=modal.side==="receivable"?"receivables":"payables";
    setData(d=>({...d,[list]:d[list].map(x=>x.id===modal.id?{...x,paid:Math.min(Number(x.amount),Number(x.paid||0)+value)}:x),
      payments:[...(d.payments||[]),{id:uid(),debtId:modal.id,amount:value,currency:modal.currency,date:new Date().toISOString()}]}));
    setAmount("");setModal(null);
  };

  const deleteItem=item=>{
    if(!confirm(`“${item.name} — ${item.title}” yozuvini o‘chirishni xohlaysizmi?`))return;
    const list=tab==="receivables"?"receivables":"payables";
    setData(d=>({...d,[list]:d[list].filter(x=>x.id!==item.id)}));
  };

  const editSave=e=>{
    e.preventDefault(); if(!edit)return;
    const list=edit.side==="receivable"?"receivables":"payables";
    setData(d=>({...d,[list]:d[list].map(x=>x.id===edit.id?{...x,name:edit.name,title:edit.title,amount:Number(edit.amount),currency:edit.currency}:x)}));
    setEdit(null);
  };

  return <div className="finance">
    <style>{css}</style>

    <main className="main">

      <section className="kpis">
        <div className="kpi blue"><span className="kicon"><FiArrowDown/></span><div><label>Mendan qarzdor</label><strong>{fmt(recTotal)}</strong><small>{receivables.length} ta yozuv</small></div></div>
        <div className="kpi red"><span className="kicon"><FiArrowUp/></span><div><label>Men qarzdorman</label><strong>{fmt(payUZS)}</strong><small>{payables.length} ta yozuv</small></div></div>
        <div className="kpi"><span className="kicon purple"><FiCreditCard/></span><div><label>Jami qarz yozuvlari</label><strong>{payables.length+receivables.length}</strong><small>Barchasi</small></div></div>
        <div className="chart-box"><b>Qarzlar nisbati (UZS)</b><div className="donut" style={{"--a":`${(payUZS/(payUZS+recTotal||1))*360}deg`}}><span>{(payUZS/1000000).toFixed(1)}M</span></div><div className="legend"><span><i className="dot red"/> Men qarzdorman <b>{(payUZS/1000000).toFixed(1)}M</b></span><span><i className="dot blue"/> Mendan qarzdor <b>{(recTotal/1000).toFixed(0)}K</b></span></div></div>
        <div className="chart-box top5"><b>Top 5 qarz summalar (UZS)</b>{top5.map((x,i)=><div className="bar-row" key={x.id}><span>{x.title}</span><div><i style={{width:`${Math.max(8,(rem(x)/maxTop)*100)}%`}}/></div><strong>{x.currency==="UZS"?Number(rem(x)).toLocaleString("uz-UZ"):"USD"}</strong></div>)}</div>
      </section>

      <div className="tabs">
        {[[FiGrid,"Umumiy","all"],[FiUsers,`Mendan qarzdorlar (${receivables.length})`,"receivables"],[FiCreditCard,`Men qarzdorman (${payables.length})`,"payables"],[FiBarChart2,"Diagrammalar","charts"],[FiClock,"To‘lovlar tarixi","history"],[FiDollarSign,"Valyuta","currency"],[FiBriefcase,"Banklar","banks"],[FiFileText,"Hisobot","reports"]].map(([I,t,v])=><button className={tab===v?"on":""} key={v} onClick={()=>setTab(v)}><I/>{t}</button>)}
      </div>


      {tab==="charts" && <section className="module-panel">
        <div className="panel-head"><div><h2>Diagrammalar</h2><p>Moliya bo‘yicha umumiy ko‘rsatkichlar</p></div></div>
        <div className="panel-grid">
          <div className="panel-card"><h3>Qarzlar nisbati</h3><div className="big-donut" style={{"--a":`${(payUZS/(payUZS+recTotal||1))*360}deg`}}><span>{((payUZS+recTotal)/1000000).toFixed(1)}M</span></div></div>
          <div className="panel-card"><h3>Top 5 qarz</h3>{top5.map(x=><div className="mini-bar" key={x.id}><span>{x.name}</span><div><i style={{width:`${Math.max(8,(rem(x)/maxTop)*100)}%`}}/></div><b>{fmt(rem(x),x.currency)}</b></div>)}</div>
          <div className="panel-card"><h3>Qarzlar holati</h3><div className="stat-row"><span>Ochiq</span><b>{payables.filter(x=>rem(x)>0).length+receivables.filter(x=>rem(x)>0).length}</b></div><div className="stat-row"><span>Qisman</span><b>{[...payables,...receivables].filter(x=>Number(x.paid||0)>0&&rem(x)>0).length}</b></div><div className="stat-row"><span>To‘langan</span><b>{[...payables,...receivables].filter(x=>rem(x)<=0).length}</b></div></div>
        </div>
      </section>}

      {tab==="history" && <section className="module-panel">
        <div className="panel-head"><div><h2>To‘lovlar tarixi</h2><p>Kiritilgan barcha to‘lovlar</p></div></div>
        <div className="history-table">
          <div className="history-row history-head"><span>Sana</span><span>Qarz</span><span>Summa</span><span>Valyuta</span></div>
          {(data.payments||[]).length===0 ? <div className="empty">Hozircha to‘lov tarixi yo‘q.</div> :
          data.payments.slice().reverse().map(p=>{const d=[...payables,...receivables].find(x=>x.id===p.debtId);return <div className="history-row" key={p.id}><span>{new Date(p.date).toLocaleString("uz-UZ")}</span><span>{d?`${d.name} — ${d.title}`:"Qarz"}</span><b>{Number(p.amount||0).toLocaleString("uz-UZ")}</b><span>{p.currency}</span></div>})}
        </div>
      </section>}

      {tab==="currency" && <section className="module-panel">
        <div className="panel-head"><div><h2>Valyuta</h2><p>UZS va USD bo‘yicha moliyaviy ko‘rsatkichlar</p></div></div>
        <div className="panel-grid three">
          <div className="panel-card currency-card"><span>UZS qarz</span><strong>{payUZS.toLocaleString("uz-UZ")} UZS</strong><small>Men qarzdorman</small></div>
          <div className="panel-card currency-card"><span>USD qarz</span><strong>{payUSD.toLocaleString("uz-UZ")} USD</strong><small>Men qarzdorman</small></div>
          <div className="panel-card currency-card"><span>Mendan qarzdor</span><strong>{recTotal.toLocaleString("uz-UZ")} UZS</strong><small>Qolgan summa</small></div>
        </div>
      </section>}

      {tab==="banks" && <section className="module-panel">
        <div className="panel-head"><div><h2>Banklar</h2><p>Bank va karta hisoblarini boshqarish</p></div><button className="add" onClick={()=>alert("Bank/karta qo‘shish oynasi keyingi bosqichda ulanadi.")}> <FiPlus/> Hisob qo‘shish</button></div>
        <div className="panel-grid three">
          <div className="panel-card account-card"><FiCreditCard/><h3>Asosiy karta</h3><strong>1 500 000 UZS</strong><small>Karta / bank hisoblari shu yerda ko‘rinadi</small></div>
          <div className="panel-card account-card"><FiBriefcase/><h3>Bank hisoblari</h3><strong>0 UZS</strong><small>Hozircha bank hisob qo‘shilmagan</small></div>
          <div className="panel-card account-card"><FiDollarSign/><h3>Kassa</h3><strong>0 UZS</strong><small>Naqd pul hisobi</small></div>
        </div>
      </section>}

      {tab==="reports" && <section className="module-panel">
        <div className="panel-head"><div><h2>Hisobot</h2><p>Qarzlar va to‘lovlar bo‘yicha qisqa hisobot</p></div><button className="excel">▣ Excel</button></div>
        <div className="report-list">
          <div><span>Jami qarz yozuvlari</span><b>{payables.length+receivables.length}</b></div>
          <div><span>Men qarzdorman</span><b>{fmt(payUZS)}</b></div>
          <div><span>Mendan qarzdor</span><b>{fmt(recTotal)}</b></div>
          <div><span>To‘lovlar soni</span><b>{(data.payments||[]).length}</b></div>
        </div>
      </section>}

      {(tab==="all" || tab==="receivables" || tab==="payables") && <section className="toolbar">
        <button className="add" onClick={()=>setEdit({id:null,side:tab==="receivables"?"receivable":"payable",name:"",title:"",amount:"",currency:"UZS"})}><FiPlus/> Qarz qo‘shish</button>
        <div className="search"><FiSearch/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Qidirish..."/></div>
        <select value={status} onChange={e=>setStatus(e.target.value)}><option value="ALL">Barcha holat</option><option value="OPEN">Ochiq</option><option value="PAID">To‘langan</option></select>
        <select value={currency} onChange={e=>setCurrency(e.target.value)}><option value="ALL">Barcha valyuta</option><option>UZS</option><option>USD</option></select>
        <button className={`view ${view==="grid"?"sel":""}`} onClick={()=>setView("grid")}><FiGrid/></button><button className={`view ${view==="list"?"sel":""}`} onClick={()=>setView("list")}><FiList/></button>
        <button className="excel">▣ Excel</button>
      </section>}

      {(tab==="all" || tab==="receivables" || tab==="payables") && <section className={view==="grid"?"cards":"cards list"}>
        {filtered.map(item=><Card key={item.id} item={item} onPay={x=>{setModal(x);setAmount("")}} onDelete={deleteItem} onEdit={x=>setEdit({...x})} onHistory={x=>setHistoryItem(x)}/>)}
      </section>}
    </main>

    {modal&&<div className="overlay"><div className="modal"><button className="close" onClick={()=>setModal(null)}><FiX/></button><h2>To‘lov qilish</h2><p>{modal.name} · {modal.title}</p><label>To‘lov summasi</label><input autoFocus type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Masalan: 500000"/><small>Qolgan: <b>{fmt(rem(modal),modal.currency)}</b></small><button className="save" onClick={addPayment}>To‘lovni saqlash</button></div></div>}

    {edit&&<div className="overlay"><form className="modal" onSubmit={editSave}><button type="button" className="close" onClick={()=>setEdit(null)}><FiX/></button><h2>{edit.id?"Qarz ma’lumotlarini tahrirlash":"Qarz qo‘shish"}</h2><label>Ism / tashkilot</label><input required value={edit.name} onChange={e=>setEdit({...edit,name:e.target.value})}/><label>Sabab</label><input required value={edit.title} onChange={e=>setEdit({...edit,title:e.target.value})}/><label>Jami summa</label><input required type="number" value={edit.amount} onChange={e=>setEdit({...edit,amount:e.target.value})}/><label>Valyuta</label><select value={edit.currency} onChange={e=>setEdit({...edit,currency:e.target.value})}><option>UZS</option><option>USD</option></select><div className="modal-actions"><button type="button" onClick={()=>setEdit(null)}>Bekor qilish</button><button className="save" type="submit">Saqlash</button></div></form></div>}

    {historyItem&&<div className="overlay"><div className="modal"><button className="close" onClick={()=>setHistoryItem(null)}><FiX/></button><h2>To‘lovlar tarixi</h2><p>{historyItem.name} · {historyItem.title}</p>{(data.payments||[]).filter(p=>p.debtId===historyItem.id).map(p=><div className="history-row" key={p.id}><span>{new Date(p.date).toLocaleString("uz-UZ")}</span><b>{fmt(p.amount,p.currency)}</b></div>)}{!(data.payments||[]).some(p=>p.debtId===historyItem.id)&&<div className="empty">Hozircha to‘lov tarixi yo‘q.</div>}</div></div>}
  </div>
}

const css = `
*{box-sizing:border-box}.finance{min-height:100%;width:100%;background:#061321;color:#e8f1ff;font-family:Inter,Segoe UI,Arial,sans-serif;display:block}.sidebar{width:242px;min-width:242px;background:linear-gradient(180deg,#071727,#051321);border-right:1px solid #19304a;padding:18px 14px;position:sticky;top:0;height:100vh}.brand{display:flex;gap:12px;align-items:center;padding:0 4px 20px;border-bottom:1px solid #18304a}.logo{width:46px;height:46px;border-radius:14px;background:linear-gradient(135deg,#1686ff,#2539e8);display:grid;place-items:center;font-size:25px;box-shadow:0 0 28px #1269ff55}.brand b{font-size:18px;letter-spacing:.5px}.brand small{display:block;color:#16c7ff;font-size:9px;font-weight:800;letter-spacing:1.5px;margin-top:3px}.menu-title{font-size:10px;color:#7c91aa;font-weight:800;letter-spacing:1.7px;margin:18px 5px 10px}.nav{height:47px;border-radius:12px;display:flex;align-items:center;gap:13px;padding:0 14px;color:#9db0c6;font-weight:700;font-size:14px;margin:5px 0;position:relative}.nav svg{font-size:20px;color:#42baff}.nav.active{background:linear-gradient(90deg,#087cf7,#3436e8);color:white;box-shadow:0 8px 28px #1168ff55}.nav.active svg{color:white}.nav i{width:6px;height:6px;background:#fff;border-radius:50%;margin-left:auto}.system{position:absolute;left:14px;right:14px;bottom:64px;border:1px solid #1d4665;background:#082036;border-radius:13px;padding:12px;display:flex;gap:9px;align-items:center}.system>span{width:8px;height:8px;background:#00ef7b;border-radius:50%;box-shadow:0 0 10px #00ef7b}.system b{font-size:12px}.system small,.foot{color:#7189a2;font-size:9px}.foot{position:absolute;bottom:16px;left:0;right:0;text-align:center;border-top:1px solid #18304a;padding-top:12px}.main{width:100%;padding:18px 20px 35px;overflow:hidden}.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}.header h1{font-size:25px;margin:0}.header p{margin:5px 0 0;color:#849ab3;font-size:12px}.header-right{display:flex;align-items:center;gap:11px}.head-search,.search{background:#0c2034;border:1px solid #1b3853;border-radius:11px;height:38px;display:flex;align-items:center;gap:8px;padding:0 12px;color:#7790aa}.head-search{width:246px;font-size:11px}.bell{width:38px;height:38px;border-radius:11px;background:#0c2034;border:1px solid #1b3853;color:#dbe9fa;position:relative}.bell i{position:absolute;width:6px;height:6px;background:#f34f58;border-radius:50%;right:8px;top:7px}.avatar{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#147aff,#3039df);font-weight:800}.admin small{display:block;color:#7389a2;font-size:9px;margin-top:2px}.admin b{font-size:12px}.logout{height:38px;border:1px solid #d94b54;background:#6e1720;color:#ffdce0;border-radius:9px;padding:0 14px;font-weight:700}.kpis{display:grid;grid-template-columns:1.05fr 1.05fr 1.05fr 1.35fr 1.55fr;gap:12px}.kpi,.chart-box{background:linear-gradient(145deg,#0a1d31,#081829);border:1px solid #183752;border-radius:13px;min-height:142px;padding:16px;box-shadow:0 10px 35px #00000025}.kpi{display:flex;gap:14px;align-items:flex-start}.kpi.red{background:linear-gradient(145deg,#251420,#101c2b);border-color:#542433}.kicon{width:52px;height:52px;border-radius:15px;background:linear-gradient(145deg,#176cff,#134bb6);display:grid;place-items:center;font-size:27px}.kpi.red .kicon{background:linear-gradient(145deg,#e33e47,#9c222b)}.kicon.purple{background:linear-gradient(145deg,#5c6dff,#3747bd)}.kpi label{display:block;color:#a9bfd5;font-size:12px;margin:2px 0 8px}.kpi strong{font-size:18px;display:block}.kpi small{display:block;color:#7389a2;margin-top:5px}.chart-box>b{font-size:12px}.donut{width:92px;height:92px;border-radius:50%;margin:8px 10px 0 0;display:inline-grid;place-items:center;background:conic-gradient(#ff4c55 var(--a),#142d49 0);position:relative;vertical-align:middle}.donut:after{content:"";position:absolute;inset:13px;border-radius:50%;background:#081829}.donut span{z-index:1;font-weight:800}.legend{display:inline-flex;vertical-align:middle;flex-direction:column;gap:12px;font-size:10px;color:#9cb1c7;max-width:170px}.legend b{color:#fff;margin-left:5px}.dot{width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:6px}.dot.red{background:#ff4b55}.dot.blue{background:#2685ff}.top5{padding-right:12px}.bar-row{display:grid;grid-template-columns:70px 1fr 76px;gap:7px;align-items:center;margin-top:9px;font-size:9px;color:#9cb0c5}.bar-row>div{height:8px;background:#102942;border-radius:10px;overflow:hidden}.bar-row i{display:block;height:100%;border-radius:10px;background:linear-gradient(90deg,#1680ff,#19b6ff)}.bar-row:nth-child(3) i{background:#ff4851}.bar-row:nth-child(4) i{background:#ff9f2e}.bar-row:nth-child(5) i{background:#2bd48a}.bar-row:nth-child(6) i{background:#9a69ff}.bar-row strong{font-size:9px;color:#dce9f8;text-align:right}.tabs{display:flex;gap:4px;margin-top:14px;background:#091c2f;border:1px solid #17344f;border-radius:12px;padding:5px;overflow:auto}.tabs button{border:0;background:transparent;color:#a0b2c5;height:38px;border-radius:9px;padding:0 14px;display:flex;align-items:center;gap:7px;white-space:nowrap;font-weight:700}.tabs button.on{background:#0877ed;color:white;box-shadow:0 5px 18px #0877ed55}.toolbar{display:flex;gap:9px;align-items:center;margin:14px 0}.add,.excel{height:38px;border:0;border-radius:9px;padding:0 15px;font-weight:800;color:white;display:flex;align-items:center;gap:7px}.add{background:linear-gradient(135deg,#087cff,#1655e7)}.excel{background:#087b49}.search{width:215px}.search input{background:none;border:0;outline:0;color:#e8f1ff;width:100%;font-size:12px}.toolbar select,.view{height:38px;background:#0b2136;border:1px solid #1a3853;color:#c8d7e7;border-radius:9px;padding:0 11px}.view{width:38px;padding:0;display:grid;place-items:center}.view.sel{background:#0d76ec;color:white}.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.debt-card{background:linear-gradient(145deg,#0a1c2e,#081727);border:1px solid #193953;border-radius:14px;padding:14px;min-height:190px;box-shadow:0 10px 25px #00000020}.card-top{display:grid;grid-template-columns:1fr auto 22px;gap:8px;align-items:start}.person{font-size:16px;font-weight:800;color:#f2f7ff}.reason{font-size:11px;color:#91a8c0;margin-top:4px}.badge{padding:5px 9px;border-radius:20px;font-size:9px;font-weight:800}.badge.red{background:#642530;color:#ff9da4}.badge.green{background:#123e35;color:#53e5ae}.dots{background:none;border:0;color:#9cb0c5}.metrics{display:grid;grid-template-columns:1fr 1fr 1fr 70px;gap:7px;margin-top:17px;align-items:center}.metrics span{display:block;font-size:10px;color:#9aafc4;margin-bottom:5px}.metrics strong{font-size:11px;color:#f2f7ff}.metrics .paid{color:#4fe0ac}.metrics .remain{color:#e9f3ff}.sq{display:inline-grid;place-items:center;width:17px;height:17px;border-radius:5px;margin-right:4px;font-size:10px;color:white}.sq.blue{background:#176fff}.sq.green{background:#0e9c6e}.sq.red{background:#a8323e}.ring{width:58px;height:58px;border-radius:50%;background:conic-gradient(#2683ff var(--p),#17304b 0);display:grid;place-items:center;position:relative}.ring:after{content:"";position:absolute;inset:8px;background:#0b1c2e;border-radius:50%}.ring span{z-index:1;font-size:12px;font-weight:800}.progress{height:7px;background:#17304b;border-radius:10px;margin-top:12px;overflow:hidden}.progress i{display:block;height:100%;background:linear-gradient(90deg,#087cff,#19b8ff);border-radius:10px}.card-actions{display:flex;gap:7px;margin-top:11px}.pay-btn{height:35px;flex:1;border:0;border-radius:8px;background:#087cff;color:white;font-weight:800}.icon-btn{height:35px;width:42px;border:1px solid #24415b;background:#091c2e;color:#c9d8e8;border-radius:8px;display:grid;place-items:center}.icon-btn.danger{border-color:#8b3440;color:#ff737b}.list{display:flex;flex-direction:column}.list .debt-card{min-height:auto}.list .metrics{grid-template-columns:1fr 1fr 1fr 70px}.module-panel{background:linear-gradient(145deg,#091c2e,#071625);border:1px solid #193953;border-radius:14px;padding:18px;box-shadow:0 12px 30px #0003;margin-top:14px}.panel-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}.panel-head h2{margin:0;font-size:20px}.panel-head p{margin:5px 0 0;color:#8198b0;font-size:11px}.panel-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.panel-grid.three{grid-template-columns:repeat(3,minmax(0,1fr))}.panel-card{background:#0b2034;border:1px solid #1b3b58;border-radius:12px;padding:16px;min-height:170px}.panel-card h3{margin:0 0 14px;font-size:14px}.big-donut{width:130px;height:130px;border-radius:50%;margin:10px auto;background:conic-gradient(#ff4c55 var(--a),#15314e 0);display:grid;place-items:center;position:relative}.big-donut:after{content:"";position:absolute;inset:18px;border-radius:50%;background:#091a2b}.big-donut span{z-index:1;font-size:18px;font-weight:800}.mini-bar{display:grid;grid-template-columns:90px 1fr 90px;gap:8px;align-items:center;margin:12px 0;font-size:10px;color:#a9bed3}.mini-bar>div{height:8px;background:#122c46;border-radius:10px;overflow:hidden}.mini-bar i{display:block;height:100%;background:linear-gradient(90deg,#1680ff,#19b6ff);border-radius:10px}.mini-bar b{text-align:right;color:#e8f1ff}.stat-row,.report-list>div{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #17334d;color:#9fb3c7}.stat-row b,.report-list b{color:#fff}.history-table{border:1px solid #1b3b58;border-radius:10px;overflow:hidden}.history-row{display:grid;grid-template-columns:170px 1fr 150px 90px;gap:12px;padding:12px 14px;border-bottom:1px solid #16334c;color:#b8c9da;font-size:11px}.history-head{background:#0d263e;color:#8fa7bd;font-weight:800}.history-row:last-child{border-bottom:0}.empty{padding:28px;text-align:center;color:#7890a8}.currency-card span,.account-card small{display:block;color:#829ab1;font-size:11px}.currency-card strong,.account-card strong{display:block;font-size:21px;margin:12px 0;color:#f2f7ff}.account-card svg{font-size:24px;color:#2990ff}.account-card h3{margin:12px 0 0}.report-list{background:#0b2034;border:1px solid #1b3b58;border-radius:12px;padding:4px 16px}@media(max-width:900px){.panel-grid,.panel-grid.three{grid-template-columns:1fr}.history-row{grid-template-columns:1fr 1fr}.history-row span:nth-child(4){display:none}}
.overlay{position:fixed;inset:0;background:#020a12aa;backdrop-filter:blur(5px);display:grid;place-items:center;z-index:1000;padding:20px}.modal{width:min(470px,100%);background:white;color:#152235;border-radius:16px;padding:24px;box-shadow:0 30px 80px #0008;position:relative}.modal h2{margin:0 0 7px}.modal p{color:#64748b}.modal label{display:block;font-size:12px;font-weight:800;margin:12px 0 6px}.modal input,.modal select{width:100%;height:42px;border:1px solid #d5deea;border-radius:9px;padding:0 11px;color:#172334;background:white;outline:0}.modal small{display:block;color:#64748b;margin-top:8px}.close{position:absolute;right:15px;top:15px;border:0;background:#eef2f7;border-radius:8px;width:32px;height:32px}.save{height:42px;border:0;border-radius:9px;background:#126ff1;color:white;font-weight:800;padding:0 18px;margin-top:16px;width:100%}.modal-actions{display:flex;gap:9px}.modal-actions>button:first-child{margin-top:16px;width:50%;height:42px;border:1px solid #d5deea;background:#f5f7fa;border-radius:9px}.modal-actions .save{width:50%}.history-row{display:flex;justify-content:space-between;border-bottom:1px solid #e5eaf0;padding:12px 0}.empty{padding:22px;text-align:center;color:#738095}@media(max-width:1200px){.kpis{grid-template-columns:repeat(3,1fr)}.chart-box.top5{grid-column:span 2}.cards{grid-template-columns:repeat(2,1fr)}}@media(max-width:900px){.main{padding:12px}.kpis{grid-template-columns:1fr}.chart-box.top5{grid-column:auto}.cards{grid-template-columns:1fr}.header-right .admin,.head-search{display:none}}
`;
