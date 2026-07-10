import { useState, useEffect } from "react";

function Customers() {

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem("customers");
    return saved ? JSON.parse(saved) : [];
  });

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    object: "",
    debt: "",
  });


  useEffect(() => {
    localStorage.setItem(
      "customers",
      JSON.stringify(customers)
    );
  }, [customers]);


  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };


  const saveCustomer = () => {

    if (!form.name.trim()) {
      alert("Mijoz ismini kiriting");
      return;
    }


    if (editId) {

      setCustomers(
        customers.map((item) =>
          item.id === editId
            ? { ...form, id: editId }
            : item
        )
      );

      setEditId(null);

    } else {

      setCustomers([
        ...customers,
        {
          ...form,
          id: Date.now(),
        },
      ]);

    }


    setForm({
      name: "",
      phone: "",
      address: "",
      object: "",
      debt: "",
    });

    setOpen(false);
  };


  const editCustomer = (item) => {

    setForm({
      name: item.name,
      phone: item.phone,
      address: item.address,
      object: item.object,
      debt: item.debt,
    });

    setEditId(item.id);
    setOpen(true);

  };


  const deleteCustomer = (id) => {

    if (confirm("Mijoz o'chirilsinmi?")) {

      setCustomers(
        customers.filter(
          (item) => item.id !== id
        )
      );

    }

  };


  const totalDebt = customers.reduce(
    (sum, item) =>
      sum + (Number(item.debt) || 0),
    0
  );


  const filteredCustomers = customers.filter(
    (item) =>
      item.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      item.phone.includes(search)
  );


  return (

    <div style={{ padding:"30px" }}>

      <h1>👥 Mijozlar</h1>

      <h3>
        Jami mijoz: {customers.length}
      </h3>

      <h3>
        Umumiy qarz:
        {" "}
        {totalDebt.toLocaleString()} so'm
      </h3>


      <input
        placeholder="🔍 Qidirish"
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
      />


      <button
        onClick={()=>{
          setOpen(!open);
          setEditId(null);
        }}
      >
        + Yangi mijoz
      </button>


      {open && (

        <div>

          <input
            name="name"
            placeholder="F.I.Sh"
            value={form.name}
            onChange={handleChange}
          />


          <input
            name="phone"
            placeholder="Telefon"
            value={form.phone}
            onChange={handleChange}
          />


          <input
            name="address"
            placeholder="Manzil"
            value={form.address}
            onChange={handleChange}
          />


          <input
            name="object"
            placeholder="Obyekt"
            value={form.object}
            onChange={handleChange}
          />


          <input
            name="debt"
            placeholder="Qarz"
            value={form.debt}
            onChange={handleChange}
          />


          <button onClick={saveCustomer}>
            {editId ? "Yangilash" : "Saqlash"}
          </button>

        </div>

      )}



      <table border="1" width="100%">

        <thead>

          <tr>
            <th>F.I.Sh</th>
            <th>Telefon</th>
            <th>Manzil</th>
            <th>Obyekt</th>
            <th>Qarz</th>
            <th>Amal</th>
          </tr>

        </thead>


        <tbody>

        {
          filteredCustomers.map((item)=>(

            <tr key={item.id}>

              <td>{item.name}</td>

              <td>{item.phone}</td>

              <td>{item.address}</td>

              <td>{item.object}</td>

              <td>
                {Number(item.debt).toLocaleString()} so'm
              </td>


              <td>

                <button
                  onClick={()=>editCustomer(item)}
                >
                  ✏️
                </button>


                <button
                  onClick={()=>deleteCustomer(item.id)}
                >
                  🗑
                </button>

              </td>

            </tr>

          ))
        }

        </tbody>

      </table>


    </div>

  );

}

export default Customers;