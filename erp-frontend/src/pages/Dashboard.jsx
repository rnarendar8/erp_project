import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    Grid,
    Typography,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
} from "@mui/material";
import api from "../services/api";

export default function Dashboard() {
    const [sales, setSales] = useState(null);
    const [purchases, setPurchases] = useState(null);
    const [stockAlerts, setStockAlerts] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [pendingInvoices, setPendingInvoices] = useState([]);
    const [reorderRecommendations, setReorderRecommendations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    salesResponse,
                    purchasesResponse,
                    stockResponse,
                    topProductsResponse,
                    invoicesResponse,
                    reorderResponse,
                ] = await Promise.all([
                    api.get("/dashboard/sales-summary"),
                    api.get("/dashboard/purchase-summary"),
                    api.get("/dashboard/stock-alerts"),
                    api.get("/dashboard/top-selling-products"),
                    api.get("/invoices"),
                    api.get("/dashboard/reorder-recommendations"),
                ]);

                setSales(salesResponse.data);
                setPurchases(purchasesResponse.data);
                setStockAlerts(stockResponse.data);
                setTopProducts(topProductsResponse.data);
                setReorderRecommendations(reorderResponse.data);

                const unpaidInvoices = invoicesResponse.data.filter(
                    (invoice) =>
                        invoice.status?.toUpperCase() === "UNPAID"
                );

                setPendingInvoices(unpaidInvoices);
            } catch (err) {
                console.error(err);

                setError(
                    err.response?.data?.message ||
                        err.response?.data ||
                        err.message ||
                        "Failed to load dashboard data."
                );
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    const formatCurrency = (value) => {
        return Number(value || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    if (loading) {
        return (
            <div className="loading-container">
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>

            <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3 }}
            >
                Overview of your ERP business operations.
            </Typography>

            {/* SUMMARY CARDS */}

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography
                                variant="subtitle1"
                                color="text.secondary"
                            >
                                Total Sales This Month
                            </Typography>

                            <Typography variant="h4" sx={{ mt: 1 }}>
                                ₹{formatCurrency(sales?.totalSales)}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1 }}
                            >
                                {sales?.totalOrders || 0} orders
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography
                                variant="subtitle1"
                                color="text.secondary"
                            >
                                Total Purchases This Month
                            </Typography>

                            <Typography variant="h4" sx={{ mt: 1 }}>
                                ₹{formatCurrency(
                                    purchases?.totalPurchases
                                )}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1 }}
                            >
                                {purchases?.totalOrders || 0} orders
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography
                                variant="subtitle1"
                                color="text.secondary"
                            >
                                Low Stock Alerts
                            </Typography>

                            <Typography variant="h4" sx={{ mt: 1 }}>
                                {stockAlerts.length}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1 }}
                            >
                                Products need attention
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography
                                variant="subtitle1"
                                color="text.secondary"
                            >
                                Pending Invoices
                            </Typography>

                            <Typography variant="h4" sx={{ mt: 1 }}>
                                {pendingInvoices.length}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1 }}
                            >
                                Unpaid invoices
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* SMART REORDER RECOMMENDATIONS */}

            <Card sx={{ mt: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Smart Inventory Reorder Recommendations
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        Recommendations based on current stock, reorder
                        level, and sales from the last 30 days.
                    </Typography>

                    {reorderRecommendations.length === 0 ? (
                        <Alert severity="success">
                            No immediate reorder recommendations.
                        </Alert>
                    ) : (
                        <TableContainer
                            component={Paper}
                            variant="outlined"
                        >
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            <strong>Product</strong>
                                        </TableCell>

                                        <TableCell align="right">
                                            <strong>Current Stock</strong>
                                        </TableCell>

                                        <TableCell align="right">
                                            <strong>Reorder Level</strong>
                                        </TableCell>

                                        <TableCell align="right">
                                            <strong>
                                                Sales (30 Days)
                                            </strong>
                                        </TableCell>

                                        <TableCell align="right">
                                            <strong>
                                                Days Remaining
                                            </strong>
                                        </TableCell>

                                        <TableCell>
                                            <strong>Priority</strong>
                                        </TableCell>

                                        <TableCell align="right">
                                            <strong>
                                                Recommended Qty
                                            </strong>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {reorderRecommendations.map(
                                        (recommendation) => (
                                            <TableRow
                                                key={
                                                    recommendation.productId
                                                }
                                            >
                                                <TableCell>
                                                    {
                                                        recommendation.productName
                                                    }
                                                </TableCell>

                                                <TableCell align="right">
                                                    {
                                                        recommendation.currentStock
                                                    }
                                                </TableCell>

                                                <TableCell align="right">
                                                    {
                                                        recommendation.reorderLevel
                                                    }
                                                </TableCell>

                                                <TableCell align="right">
                                                    {
                                                        recommendation.salesLast30Days
                                                    }
                                                </TableCell>

                                                <TableCell align="right">
                                                    {recommendation.daysOfStockRemaining ===
                                                    null
                                                        ? "-"
                                                        : recommendation.daysOfStockRemaining}
                                                </TableCell>

                                                <TableCell>
                                                    <Chip
                                                        label={
                                                            recommendation.priority
                                                        }
                                                        size="small"
                                                        color={
                                                            recommendation.priority ===
                                                            "HIGH"
                                                                ? "error"
                                                                : "warning"
                                                        }
                                                    />
                                                </TableCell>

                                                <TableCell align="right">
                                                    <strong>
                                                        {
                                                            recommendation.recommendedQuantity
                                                        }
                                                    </strong>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            {/* TOP SELLING PRODUCTS */}

            <Card sx={{ mt: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Top-Selling Products
                    </Typography>

                    {topProducts.length === 0 ? (
                        <Typography color="text.secondary">
                            No sales data available yet.
                        </Typography>
                    ) : (
                        <TableContainer
                            component={Paper}
                            variant="outlined"
                        >
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            <strong>Product</strong>
                                        </TableCell>

                                        <TableCell align="right">
                                            <strong>
                                                Quantity Sold
                                            </strong>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {topProducts.map(
                                        (product, index) => (
                                            <TableRow
                                                key={
                                                    product.productId ||
                                                    index
                                                }
                                            >
                                                <TableCell>
                                                    {
                                                        product.productName
                                                    }
                                                </TableCell>

                                                <TableCell align="right">
                                                    <Chip
                                                        label={
                                                            product.quantitySold
                                                        }
                                                        size="small"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            {/* LOW STOCK + PENDING INVOICES */}

            <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography
                                variant="h6"
                                gutterBottom
                            >
                                Low Stock Alerts
                            </Typography>

                            {stockAlerts.length === 0 ? (
                                <Typography color="text.secondary">
                                    No low stock products.
                                </Typography>
                            ) : (
                                <TableContainer
                                    component={Paper}
                                    variant="outlined"
                                >
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>
                                                    <strong>
                                                        Product
                                                    </strong>
                                                </TableCell>

                                                <TableCell align="right">
                                                    <strong>
                                                        Stock
                                                    </strong>
                                                </TableCell>

                                                <TableCell align="right">
                                                    <strong>
                                                        Reorder
                                                    </strong>
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {stockAlerts.map(
                                                (product) => (
                                                    <TableRow
                                                        key={
                                                            product.id
                                                        }
                                                    >
                                                        <TableCell>
                                                            {
                                                                product.name
                                                            }
                                                        </TableCell>

                                                        <TableCell align="right">
                                                            {
                                                                product.stockQuantity
                                                            }
                                                        </TableCell>

                                                        <TableCell align="right">
                                                            {
                                                                product.reorderLevel
                                                            }
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography
                                variant="h6"
                                gutterBottom
                            >
                                Pending Invoices
                            </Typography>

                            {pendingInvoices.length === 0 ? (
                                <Typography color="text.secondary">
                                    No pending invoices.
                                </Typography>
                            ) : (
                                <TableContainer
                                    component={Paper}
                                    variant="outlined"
                                >
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>
                                                    <strong>
                                                        Invoice
                                                    </strong>
                                                </TableCell>

                                                <TableCell>
                                                    <strong>
                                                        Customer
                                                    </strong>
                                                </TableCell>

                                                <TableCell align="right">
                                                    <strong>
                                                        Amount
                                                    </strong>
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {pendingInvoices.map(
                                                (invoice) => (
                                                    <TableRow
                                                        key={
                                                            invoice.id
                                                        }
                                                    >
                                                        <TableCell>
                                                            {
                                                                invoice.invoiceNumber
                                                            }
                                                        </TableCell>

                                                        <TableCell>
                                                            {
                                                                invoice
                                                                    .customer
                                                                    ?.name ||
                                                                "-"
                                                            }
                                                        </TableCell>

                                                        <TableCell align="right">
                                                            ₹
                                                            {formatCurrency(
                                                                invoice.totalPayable
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
}