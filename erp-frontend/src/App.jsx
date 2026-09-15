import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import SalesOrders from "./pages/SalesOrders";
import PurchaseOrders from "./pages/PurchaseOrders";
import GoodsReceipts from "./pages/GoodsReceipts";
import Invoices from "./pages/Invoices";
import Reports from "./pages/Reports";

function App() {

    return (
        <BrowserRouter>

            <Routes>

                {/* ========================= */}
                {/* PUBLIC ROUTES */}
                {/* ========================= */}

                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* ========================= */}
                {/* PROTECTED ERP ROUTES */}
                {/* ========================= */}

                <Route element={<ProtectedRoute />}>

                    <Route
                        path="/"
                        element={<Layout />}
                    >

                        {/* Dashboard */}
                        <Route
                            index
                            element={<Dashboard />}
                        />

                        {/* Products */}
                        <Route
                            path="products"
                            element={<Products />}
                        />

                        {/* Customers */}
                        <Route
                            path="customers"
                            element={<Customers />}
                        />

                        {/* Suppliers */}
                        <Route
                            path="suppliers"
                            element={<Suppliers />}
                        />

                        {/* Sales Orders */}
                        <Route
                            path="sales-orders"
                            element={<SalesOrders />}
                        />

                        {/* Purchase Orders */}
                        <Route
                            path="purchase-orders"
                            element={<PurchaseOrders />}
                        />

                        {/* GRN */}
                        <Route
                            path="grn"
                            element={<GoodsReceipts />}
                        />

                        {/* Invoices */}
                        <Route
                            path="invoices"
                            element={<Invoices />}
                        />

                        {/* Reports */}
                        <Route
                            path="reports"
                            element={<Reports />}
                        />

                    </Route>

                </Route>

            </Routes>

        </BrowserRouter>
    );
}

export default App;