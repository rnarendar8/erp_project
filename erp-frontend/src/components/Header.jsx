import { useLocation } from "react-router-dom";

const pageTitles = {
    "/": "Dashboard",
    "/products": "Products",
    "/customers": "Customers",
    "/suppliers": "Suppliers",
    "/sales-orders": "Sales Orders",
    "/purchase-orders": "Purchase Orders",
    "/grn": "Goods Receipt Notes",
    "/invoices": "Invoices",
    "/reports": "Reports",
};

export default function Header() {
    const location = useLocation();

    const title = pageTitles[location.pathname] || "ERP System";

    return (
        <header className="header">
            <div>
                <h1>{title}</h1>
                <p>Enterprise Resource Planning System</p>
            </div>

            <div className="header-user">
                <div className="user-avatar">N</div>

                <div>
                    <strong>Admin</strong>
                    <span>Administrator</span>
                </div>
            </div>
        </header>
    );
}