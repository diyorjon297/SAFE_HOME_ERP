import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Dashboard from "../pages/Dashboard";
import Customers from "../pages/Customers";
import Products from "../pages/Products";
import Cameras from "../pages/Cameras";
import Sales from "../pages/Sales";
import Warehouse from "../pages/Warehouse";


function AppRouter(){

  return (

    <BrowserRouter>

      <Routes>


        <Route element={<MainLayout />}>


          <Route
            path="/"
            element={<Dashboard />}
          />


          <Route
            path="/customers"
            element={<Customers />}
          />


          <Route
            path="/products"
            element={<Products />}
          />


          <Route
            path="/cameras"
            element={<Cameras />}
          />


          <Route
            path="/sales"
            element={<Sales />}
          />


          <Route
            path="/warehouse"
            element={<Warehouse />}
          />


        </Route>


      </Routes>


    </BrowserRouter>

  );

}


export default AppRouter;