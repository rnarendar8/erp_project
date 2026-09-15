import { useEffect, useState } from "react";
import api from "../services/api";

export default function Reports() {
    const [overview, setOverview] = useState(null);
    const [lowStock, setLowStock] = useState([]);
    const [salesOrders, setSalesOrders] = useState([]);
    const [purchaseOrders, setPurchaseOrders] = useState([]);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                overviewResponse,
                lowStockResponse,
                salesResponse,
                purchaseResponse,
            ] = await Promise.all([
                api.get("/reports/overview"),
                api.get("/reports/low-stock"),
                api.get("/sales-orders"),
                api.get("/purchase-orders"),
            ]);

            setOverview(overviewResponse.data);
            setLowStock(lowStockResponse.data);
            setSalesOrders(salesResponse.data || []);
            setPurchaseOrders(purchaseResponse.data || []);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                    err.response?.data ||
                    err.message ||
                    "Failed to load reports."
            );
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }).format(value || 0);
    };

    // =========================
    // DATE FILTER
    // =========================
    const isDateInRange = (date) => {
        if (!date) {
            return false;
        }

        if (startDate && date < startDate) {
            return false;
        }

        if (endDate && date > endDate) {
            return false;
        }

        return true;
    };

    const filteredSalesOrders = salesOrders.filter((order) =>
        isDateInRange(order.orderDate)
    );

    const filteredPurchaseOrders = purchaseOrders.filter((order) =>
        isDateInRange(order.orderDate)
    );

    // =========================
    // SALES SUMMARY
    // =========================
    const filteredSalesTotal = filteredSalesOrders.reduce(
        (total, order) =>
            total + Number(order.totalAmount || 0),
        0
    );

    // =========================
    // PURCHASE SUMMARY
    // =========================
    const filteredPurchaseTotal = filteredPurchaseOrders.reduce(
        (total, order) =>
            total + Number(order.totalAmount || 0),
        0
    );

    // =========================
    // CLEAR FILTER
    // =========================
    const clearFilters = () => {
        setStartDate("");
        setEndDate("");
    };

    if (loading) {
        return (
            <div className="page">
                <h1>Reports</h1>
                <p>Loading reports...</p>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Reports</h1>
                    <p>
                        Overview of your ERP business operations.
                    </p>
                </div>

                <button
                    className="primary-button"
                    onClick={loadReports}
                >
                    Refresh
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* DATE FILTER */}

            <div
                className="report-section"
                style={{ marginBottom: "24px" }}
            >
                <div className="section-header">
                    <div>
                        <h2>Date Filter</h2>
                        <p>
                            Filter sales and purchase reports by
                            order date.
                        </p>
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "16px",
                        alignItems: "end",
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "6px",
                                fontWeight: "600",
                            }}
                        >
                            Start Date
                        </label>

                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) =>
                                setStartDate(e.target.value)
                            }
                            style={{
                                padding: "10px",
                                border: "1px solid #ccc",
                                borderRadius: "6px",
                            }}
                        />
                    </div>

                    <div>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "6px",
                                fontWeight: "600",
                            }}
                        >
                            End Date
                        </label>

                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) =>
                                setEndDate(e.target.value)
                            }
                            style={{
                                padding: "10px",
                                border: "1px solid #ccc",
                                borderRadius: "6px",
                            }}
                        />
                    </div>

                    <button
                        className="primary-button"
                        onClick={clearFilters}
                    >
                        Clear Filter
                    </button>
                </div>
            </div>

            {overview && (
                <>
                    {/* OVERVIEW CARDS */}

                    <div className="report-grid">
                        <div className="report-card">
                            <h3>Total Products</h3>

                            <div className="report-value">
                                {overview.totalProducts}
                            </div>
                        </div>

                        <div className="report-card">
                            <h3>Total Stock</h3>

                            <div className="report-value">
                                {overview.totalStock}
                            </div>
                        </div>

                        <div className="report-card">
                            <h3>Stock Value</h3>

                            <div className="report-value">
                                {formatCurrency(
                                    overview.totalProductValue
                                )}
                            </div>
                        </div>

                        <div className="report-card">
                            <h3>Sales Orders</h3>

                            <div className="report-value">
                                {overview.totalSalesOrders}
                            </div>
                        </div>

                        <div className="report-card">
                            <h3>Purchase Orders</h3>

                            <div className="report-value">
                                {overview.totalPurchaseOrders}
                            </div>
                        </div>

                        <div className="report-card">
                            <h3>Goods Receipts</h3>

                            <div className="report-value">
                                {overview.totalGoodsReceipts}
                            </div>
                        </div>

                        <div className="report-card">
                            <h3>Invoices</h3>

                            <div className="report-value">
                                {overview.totalInvoices}
                            </div>
                        </div>
                    </div>

                    {/* FILTERED SALES / PURCHASE SUMMARY */}

                    <div className="report-grid">
                        <div className="report-card">
                            <h3>Filtered Sales</h3>

                            <div className="report-value">
                                {formatCurrency(
                                    filteredSalesTotal
                                )}
                            </div>

                            <p>
                                {filteredSalesOrders.length} sales
                                order
                                {filteredSalesOrders.length !== 1
                                    ? "s"
                                    : ""}
                            </p>
                        </div>

                        <div className="report-card">
                            <h3>Filtered Purchases</h3>

                            <div className="report-value">
                                {formatCurrency(
                                    filteredPurchaseTotal
                                )}
                            </div>

                            <p>
                                {filteredPurchaseOrders.length} purchase
                                order
                                {filteredPurchaseOrders.length !== 1
                                    ? "s"
                                    : ""}
                            </p>
                        </div>
                    </div>

                    {/* SALES REPORT */}

                    <div className="report-section">
                        <div className="section-header">
                            <div>
                                <h2>Sales Report</h2>

                                <p>
                                    Sales orders within the selected
                                    date range.
                                </p>
                            </div>

                            <span className="stock-count">
                                {filteredSalesOrders.length} order
                                {filteredSalesOrders.length !== 1
                                    ? "s"
                                    : ""}
                            </span>
                        </div>

                        {filteredSalesOrders.length === 0 ? (
                            <div className="empty-state">
                                <h3>No Sales Data</h3>

                                <p>
                                    No sales orders found for the
                                    selected date range.
                                </p>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Order Number</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Total Amount</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredSalesOrders.map(
                                            (order) => (
                                                <tr key={order.id}>
                                                    <td>
                                                        {
                                                            order.orderNumber
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            order.orderDate
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            order.status
                                                        }
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            {formatCurrency(
                                                                order.totalAmount
                                                            )}
                                                        </strong>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* PURCHASE REPORT */}

                    <div className="report-section">
                        <div className="section-header">
                            <div>
                                <h2>Purchase Report</h2>

                                <p>
                                    Purchase orders within the selected
                                    date range.
                                </p>
                            </div>

                            <span className="stock-count">
                                {filteredPurchaseOrders.length} order
                                {filteredPurchaseOrders.length !== 1
                                    ? "s"
                                    : ""}
                            </span>
                        </div>

                        {filteredPurchaseOrders.length === 0 ? (
                            <div className="empty-state">
                                <h3>No Purchase Data</h3>

                                <p>
                                    No purchase orders found for the
                                    selected date range.
                                </p>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Order Number</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Total Amount</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredPurchaseOrders.map(
                                            (order) => (
                                                <tr key={order.id}>
                                                    <td>
                                                        {
                                                            order.orderNumber
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            order.orderDate
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            order.status
                                                        }
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            {formatCurrency(
                                                                order.totalAmount
                                                            )}
                                                        </strong>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* SALES CHART */}

                    <div className="report-section">
                        <div className="section-header">
                            <div>
                                <h2>Sales Chart</h2>

                                <p>
                                    Sales order amounts by date.
                                </p>
                            </div>
                        </div>

                        {filteredSalesOrders.length === 0 ? (
                            <div className="empty-state">
                                <p>No sales data available.</p>
                            </div>
                        ) : (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "12px",
                                }}
                            >
                                {filteredSalesOrders.map(
                                    (order) => {
                                        const amount = Number(
                                            order.totalAmount || 0
                                        );

                                        const maxAmount = Math.max(
                                            ...filteredSalesOrders.map(
                                                (item) =>
                                                    Number(
                                                        item.totalAmount ||
                                                            0
                                                    )
                                            ),
                                            1
                                        );

                                        const width =
                                            (amount / maxAmount) *
                                            100;

                                        return (
                                            <div
                                                key={order.id}
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns:
                                                        "110px 1fr 120px",
                                                    gap: "12px",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <strong>
                                                    {
                                                        order.orderDate
                                                    }
                                                </strong>

                                                <div
                                                    style={{
                                                        height: "24px",
                                                        background:
                                                            "#e9ecef",
                                                        borderRadius:
                                                            "4px",
                                                        overflow:
                                                            "hidden",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: `${width}%`,
                                                            height: "100%",
                                                            background:
                                                                "#1976d2",
                                                            borderRadius:
                                                                "4px",
                                                        }}
                                                    />
                                                </div>

                                                <strong>
                                                    {formatCurrency(
                                                        amount
                                                    )}
                                                </strong>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        )}
                    </div>

                    {/* PURCHASE CHART */}

                    <div className="report-section">
                        <div className="section-header">
                            <div>
                                <h2>Purchase Chart</h2>

                                <p>
                                    Purchase order amounts by date.
                                </p>
                            </div>
                        </div>

                        {filteredPurchaseOrders.length === 0 ? (
                            <div className="empty-state">
                                <p>
                                    No purchase data available.
                                </p>
                            </div>
                        ) : (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "12px",
                                }}
                            >
                                {filteredPurchaseOrders.map(
                                    (order) => {
                                        const amount = Number(
                                            order.totalAmount || 0
                                        );

                                        const maxAmount = Math.max(
                                            ...filteredPurchaseOrders.map(
                                                (item) =>
                                                    Number(
                                                        item.totalAmount ||
                                                            0
                                                    )
                                            ),
                                            1
                                        );

                                        const width =
                                            (amount / maxAmount) *
                                            100;

                                        return (
                                            <div
                                                key={order.id}
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns:
                                                        "110px 1fr 120px",
                                                    gap: "12px",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <strong>
                                                    {
                                                        order.orderDate
                                                    }
                                                </strong>

                                                <div
                                                    style={{
                                                        height: "24px",
                                                        background:
                                                            "#e9ecef",
                                                        borderRadius:
                                                            "4px",
                                                        overflow:
                                                            "hidden",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: `${width}%`,
                                                            height: "100%",
                                                            background:
                                                                "#2e7d32",
                                                            borderRadius:
                                                                "4px",
                                                        }}
                                                    />
                                                </div>

                                                <strong>
                                                    {formatCurrency(
                                                        amount
                                                    )}
                                                </strong>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        )}
                    </div>

                    {/* LOW STOCK REPORT */}

                    <div className="report-section">
                        <div className="section-header">
                            <div>
                                <h2>Low Stock Report</h2>

                                <p>
                                    Products that have reached their
                                    reorder level.
                                </p>
                            </div>

                            <span className="stock-count">
                                {lowStock.length} product
                                {lowStock.length !== 1
                                    ? "s"
                                    : ""}
                            </span>
                        </div>

                        {lowStock.length === 0 ? (
                            <div className="empty-state">
                                <h3>No Low Stock Products</h3>

                                <p>
                                    All products currently have
                                    sufficient stock.
                                </p>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>SKU</th>
                                            <th>Product</th>
                                            <th>Category</th>
                                            <th>Stock</th>
                                            <th>Reorder Level</th>
                                            <th>Unit</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {lowStock.map((product) => (
                                            <tr key={product.id}>
                                                <td>
                                                    {product.sku}
                                                </td>

                                                <td>
                                                    {product.name}
                                                </td>

                                                <td>
                                                    {product.category}
                                                </td>

                                                <td>
                                                    <strong>
                                                        {
                                                            product.stockQuantity
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        product.reorderLevel
                                                    }
                                                </td>

                                                <td>
                                                    {product.unit}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}