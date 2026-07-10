import { useState, useEffect } from "react";

function ERP(){

const [page,setPage]=useState("dashboard");

const [customers,setCustomers]=useState(
JSON.parse(localStorage.getItem("customers")) || []
);

const [products,setProducts]=useState(
JSON.parse(localStorage.getItem("products")) || []
);

const [sales,setSales]=useState(
JSON.parse(localStorage.getItem("sales")) || []
);

const [debts,setDebts]=useState(
JSON.parse(localStorage.getItem("debts")) || []
);

const [expenses,setExpenses]=useState(
JSON.parse(localStorage.getItem("expenses")) || []
);


const [customer,setCustomer]=useState({
name:"",
phone:"",
address:"",
object:""
});


const [product,setProduct]=useState({
name:"",
count:"",
price:""
});


const [sale,setSale]=useState({
product:"",
cost:"",
price:"",
client:""
});


const [debt,setDebt]=useState({
name:"",
money:"",
date:""
});


const [expense,setExpense]=useState({
name:"",
money:"",
date:""
});



useEffect(()=>{
localStorage.setItem("customers",JSON.stringify(customers));
},[customers]);


useEffect(()=>{
localStorage.setItem("products",JSON.stringify(products));
},[products]);


useEffect(()=>{
localStorage.setItem("sales",JSON.stringify(sales));
},[sales]);


useEffect(()=>{
localStorage.setItem("debts",JSON.stringify(debts));
},[debts]);


useEffect(()=>{
localStorage.setItem("expenses",JSON.stringify(expenses));
},[expenses]);



function addCustomer(){

if(!customer.name)return;

setCustomers([...customers,customer]);

setCustomer({
name:"",
phone:"",
address:"",
object:""
});

}



function addProduct(){

if(!product.name)return;

setProducts([...products,product]);

setProduct({
name:"",
count:"",
price:""
});

}



function addSale(){

let profit=
Number(sale.price)-Number(sale.cost);


setSales([
...sales,
{
...sale,
profit
}
]);


setSale({
product:"",
cost:"",
price:"",
client:""
});

}



function addDebt(){

setDebts([
...debts,
debt
]);


setDebt({
name:"",
money:"",
date:""
});

}



function addExpense(){

setExpenses([
...expenses,
expense
]);


setExpense({
name:"",
money:"",
date:""
});

}



return(

<div style={{display:"flex",minHeight:"100vh"}}>


<div style={{
width:"220px",
background:"#111827",
color:"white",
padding:"20px"
}}>

<h2>SAFE HOME ERP</h2>


<button onClick={()=>setPage("dashboard")}>
Dashboard
</button>

<br/><br/>

<button onClick={()=>setPage("customers")}>
Mijozlar
</button>

<br/><br/>

<button onClick={()=>setPage("products")}>
Ombor
</button>

<br/><br/>

<button onClick={()=>setPage("sales")}>
Sotuv
</button>

<br/><br/>

<button onClick={()=>setPage("debts")}>
Qarz
</button>

<br/><br/>

<button onClick={()=>setPage("expenses")}>
Xarajat
</button>


</div>


<div style={{padding:"30px",flex:1}}>


{page==="dashboard" &&

<>

<h1>SAFE HOME SERVICES ERP</h1>

<h2>Dashboard</h2>

<p>Mijozlar: {customers.length}</p>

<p>Mahsulotlar: {products.length}</p>

<p>Sotuvlar: {sales.length}</p>

<p>Qarzlar: {debts.length}</p>

<p>Xarajatlar: {expenses.length}</p>

</>

}


{page==="customers" &&

<>
<h1>Mijozlar</h1>

<input placeholder="Ism"
value={customer.name}
onChange={e=>setCustomer({...customer,name:e.target.value})}
/>

<br/>

<input placeholder="Telefon"
value={customer.phone}
onChange={e=>setCustomer({...customer,phone:e.target.value})}
/>

<br/>

<input placeholder="Manzil"
value={customer.address}
onChange={e=>setCustomer({...customer,address:e.target.value})}
/>

<br/>

<input placeholder="Obyekt"
value={customer.object}
onChange={e=>setCustomer({...customer,object:e.target.value})}
/>

<br/><br/>

<button onClick={addCustomer}>
Saqlash
</button>

<hr/>

{
customers.map((c,i)=>
<div key={i}>
{c.name} | {c.phone} | {c.object}
</div>
)
}

</>

}
{page==="products" &&

<>

<h1>Ombor</h1>

<input
placeholder="Mahsulot nomi"
value={product.name}
onChange={e=>setProduct({
...product,
name:e.target.value
})}
/>

<br/>

<input
placeholder="Soni"
value={product.count}
onChange={e=>setProduct({
...product,
count:e.target.value
})}
/>

<br/>

<input
placeholder="Narxi"
value={product.price}
onChange={e=>setProduct({
...product,
price:e.target.value
})}
/>

<br/><br/>

<button onClick={addProduct}>
Saqlash
</button>


<hr/>

{
products.map((p,i)=>

<div key={i}>
{p.name} |
{p.count} dona |
{p.price} so'm
</div>

)
}

</>

}



{page==="sales" &&

<>

<h1>Sotuv va foyda</h1>


<input
placeholder="Mijoz"
value={sale.client}
onChange={e=>setSale({
...sale,
client:e.target.value
})}
/>


<br/>


<input
placeholder="Mahsulot"
value={sale.product}
onChange={e=>setSale({
...sale,
product:e.target.value
})}
/>


<br/>


<input
placeholder="Tannarx"
value={sale.cost}
onChange={e=>setSale({
...sale,
cost:e.target.value
})}
/>


<br/>


<input
placeholder="Sotuv narxi"
value={sale.price}
onChange={e=>setSale({
...sale,
price:e.target.value
})}
/>


<br/><br/>


<button onClick={addSale}>
Sotish
</button>


<hr/>


{
sales.map((s,i)=>

<div key={i}>

{s.client} |
{s.product} |

Foyda:
{s.profit} so'm

</div>

)
}


</>

}





{page==="debts" &&

<>

<h1>Qarzlar</h1>


<input
placeholder="Mijoz"
value={debt.name}
onChange={e=>setDebt({
...debt,
name:e.target.value
})}
/>


<br/>


<input
placeholder="Summa"
value={debt.money}
onChange={e=>setDebt({
...debt,
money:e.target.value
})}
/>


<br/>


<input
placeholder="Sana"
value={debt.date}
onChange={e=>setDebt({
...debt,
date:e.target.value
})}
/>


<br/><br/>


<button onClick={addDebt}>
Saqlash
</button>


<hr/>


{
debts.map((d,i)=>

<div key={i}>

{d.name} |
{d.money} so'm |
{d.date}

</div>

)

}


</>

}




{page==="expenses" &&

<>

<h1>Xarajatlar</h1>


<input
placeholder="Nima uchun"
value={expense.name}
onChange={e=>setExpense({
...expense,
name:e.target.value
})}
/>


<br/>


<input
placeholder="Summa"
value={expense.money}
onChange={e=>setExpense({
...expense,
money:e.target.value
})}
/>


<br/>


<input
placeholder="Sana"
value={expense.date}
onChange={e=>setExpense({
...expense,
date:e.target.value
})}
/>


<br/><br/>


<button onClick={addExpense}>
Saqlash
</button>


<hr/>


{
expenses.map((e,i)=>

<div key={i}>

{e.name} |
{e.money} so'm |
{e.date}

</div>

)

}


</>

}


</div>

</div>

);

}


export default ERP;