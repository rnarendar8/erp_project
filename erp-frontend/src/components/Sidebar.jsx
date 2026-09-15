import {
    Dashboard,
    Inventory,
    People,
    Business,
    ShoppingCart,
    ReceiptLong,
    LocalShipping,
    Description,
    Assessment,
    Logout,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

const menuItems = [
    {
        label: "Dashboard",
        icon: <Dashboard />,
        path: "/",
        roles: [
            "ADMIN",
            "SALES_EXECUTIVE",
            "PURCHASE_MANAGER",
            "INVENTORY_MANAGER",
            "ACCOUNTANT",
        ],
    },
    {
        label: "Products",
        icon: <Inventory />,
        path: "/products",
        roles: [
            "ADMIN",
            "SALES_EXECUTIVE",
            "PURCHASE_MANAGER",
            "INVENTORY_MANAGER",
            "ACCOUNTANT",
        ],
    },
    {
        label: "Customers",
        icon: <People />,
        path: "/customers",
        roles: [
            "ADMIN",
            "SALES_EXECUTIVE",
            "ACCOUNTANT",
        ],
    },
    {
        label: "Suppliers",
        icon: <Business />,
        path: "/suppliers",
        roles: [
            "ADMIN",
            "PURCHASE_MANAGER",
            "INVENTORY_MANAGER",
            "ACCOUNTANT",
        ],
    },
    {
        label: "Sales Orders",
        icon: <ShoppingCart />,
        path: "/sales-orders",
        roles: [
            "ADMIN",
            "SALES_EXECUTIVE",
            "ACCOUNTANT",
        ],
    },
    {
        label: "Purchase Orders",
        icon: <ReceiptLong />,
        path: "/purchase-orders",
        roles: [
            "ADMIN",
            "PURCHASE_MANAGER",
            "INVENTORY_MANAGER",
            "ACCOUNTANT",
        ],
    },
    {
        label: "GRN",
        icon: <LocalShipping />,
        path: "/grn",
        roles: [
            "ADMIN",
            "PURCHASE_MANAGER",
            "INVENTORY_MANAGER",
            "ACCOUNTANT",
        ],
    },
    {
        label: "Invoices",
        icon: <Description />,
        path: "/invoices",
        roles: [
            "ADMIN",
            "SALES_EXECUTIVE",
            "ACCOUNTANT",
        ],
    },
    {
        label: "Reports",
        icon: <Assessment />,
        path: "/reports",
        roles: [
            "ADMIN",
            "SALES_EXECUTIVE",
            "PURCHASE_MANAGER",
            "INVENTORY_MANAGER",
            "ACCOUNTANT",
        ],
    },
];

export default function Sidebar() {

    const navigate = useNavigate();

    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");

    const visibleMenuItems = menuItems.filter(
        (item) =>
            role && item.roles.includes(role)
    );

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");

        navigate("/login", {
            replace: true,
        });
    };

    return (
        <aside className="sidebar">

            <div className="sidebar-logo">
                <h2>ERP SYSTEM</h2>
            </div>

            <div className="sidebar-user">

                <strong>
                    {username || "User"}
                </strong>

                <span>
                    {role || "USER"}
                </span>

            </div>

            <nav className="sidebar-menu">

                {visibleMenuItems.map((item) => (
                    <button
                        key={item.path}
                        type="button"
                        className="sidebar-item"
                        onClick={() =>
                            navigate(item.path)
                        }
                    >
                        {item.icon}

                        <span>
                            {item.label}
                        </span>
                    </button>
                ))}

            </nav>

            <div className="sidebar-footer">

                <button
                    type="button"
                    className="sidebar-item logout-button"
                    onClick={handleLogout}
                >
                    <Logout />

                    <span>
                        Logout
                    </span>
                </button>

            </div>

        </aside>
    );
}