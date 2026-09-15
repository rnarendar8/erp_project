import { useEffect, useState } from "react";
import api from "../services/api";

import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

import {
    Add,
    CheckCircle,
    PictureAsPdf,
    Visibility,
} from "@mui/icons-material";

function Invoices() {
    const [invoices, setInvoices] = useState([]);
    const [salesOrders, setSalesOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [openCreate, setOpenCreate] = useState(false);
    const [openView, setOpenView] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const [creating, setCreating] = useState(false);
    const [paying, setPaying] = useState(false);

    // =========================================================
    // LOAD DATA
    // =========================================================

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [invoicesResponse, salesOrdersResponse] =
                await Promise.all([
                    api.get("/invoices"),
                    api.get("/sales-orders"),
                ]);

            setInvoices(invoicesResponse.data);
            setSalesOrders(salesOrdersResponse.data);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                    err.response?.data ||
                    err.message ||
                    "Failed to load invoices"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // =========================================================
    // CREATE INVOICE
    // =========================================================

    const handleCreateInvoice = async (salesOrderId) => {
        try {
            setCreating(true);
            setError("");

            await api.post(
                `/invoices?salesOrderId=${salesOrderId}`
            );

            setOpenCreate(false);

            await loadData();
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                    err.response?.data ||
                    err.message ||
                    "Failed to create invoice"
            );
        } finally {
            setCreating(false);
        }
    };

    // =========================================================
    // VIEW INVOICE
    // =========================================================

    const handleViewInvoice = async (invoice) => {
        try {
            setError("");

            const response = await api.get(
                `/invoices/${invoice.id}`
            );

            setSelectedInvoice(response.data);
            setOpenView(true);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                    err.response?.data ||
                    err.message ||
                    "Failed to load invoice details"
            );
        }
    };

    // =========================================================
    // MARK INVOICE AS PAID
    // =========================================================

    const handleMarkAsPaid = async (invoiceId) => {
        try {
            const confirmed = window.confirm(
                "Are you sure you want to mark this invoice as PAID?"
            );

            if (!confirmed) {
                return;
            }

            setPaying(true);
            setError("");

            const response = await api.put(
                `/invoices/${invoiceId}/pay`
            );

            const updatedInvoice = response.data;

            if (
                selectedInvoice &&
                selectedInvoice.id === invoiceId
            ) {
                setSelectedInvoice(updatedInvoice);
            }

            await loadData();
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                    err.response?.data ||
                    err.message ||
                    "Failed to mark invoice as paid"
            );
        } finally {
            setPaying(false);
        }
    };

    // =========================================================
    // PDF
    // =========================================================

    const handleDownloadPdf = async (invoiceId) => {
        try {
            setError("");

            const response = await api.get(
                `/invoices/${invoiceId}/pdf`,
                {
                    responseType: "blob",
                }
            );

            const blob = new Blob([response.data], {
                type: "application/pdf",
            });

            const url = window.URL.createObjectURL(blob);

            window.open(url, "_blank");

            setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 60000);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                    "Failed to open invoice PDF"
            );
        }
    };

    // =========================================================
    // STATUS COLOR
    // =========================================================

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case "PAID":
                return "success";

            case "UNPAID":
                return "warning";

            case "CANCELLED":
                return "error";

            default:
                return "default";
        }
    };

    // =========================================================
    // FORMAT MONEY
    // =========================================================

    const formatMoney = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }).format(Number(amount || 0));
    };

    // =========================================================
    // CHECK WHETHER ORDER ALREADY HAS INVOICE
    // =========================================================

    const hasInvoice = (salesOrderId) => {
        return invoices.some(
            (invoice) =>
                invoice.salesOrder?.id === salesOrderId
        );
    };

    // =========================================================
    // CONFIRMED ORDERS
    // =========================================================

    const invoiceableOrders = salesOrders.filter(
        (order) =>
            order.status?.toUpperCase() === "CONFIRMED" &&
            !hasInvoice(order.id)
    );

    // =========================================================
    // UI
    // =========================================================

    return (
        <Box sx={{ p: 4 }}>
            {/* HEADER */}

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        fontWeight="600"
                    >
                        Invoices
                    </Typography>

                    <Typography color="text.secondary">
                        Manage invoices generated from confirmed
                        sales orders.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenCreate(true)}
                >
                    Create Invoice
                </Button>
            </Box>

            {/* ERROR */}

            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    onClose={() => setError("")}
                >
                    {error}
                </Alert>
            )}

            {/* SUMMARY */}

            <Stack
                direction={{
                    xs: "column",
                    sm: "row",
                }}
                spacing={2}
                sx={{ mb: 3 }}
            >
                <Paper
                    sx={{
                        p: 2,
                        flex: 1,
                    }}
                >
                    <Typography color="text.secondary">
                        Total Invoices
                    </Typography>

                    <Typography
                        variant="h5"
                        fontWeight="700"
                    >
                        {invoices.length}
                    </Typography>
                </Paper>

                <Paper
                    sx={{
                        p: 2,
                        flex: 1,
                    }}
                >
                    <Typography color="text.secondary">
                        Unpaid
                    </Typography>

                    <Typography
                        variant="h5"
                        fontWeight="700"
                    >
                        {
                            invoices.filter(
                                (invoice) =>
                                    invoice.status?.toUpperCase() ===
                                    "UNPAID"
                            ).length
                        }
                    </Typography>
                </Paper>

                <Paper
                    sx={{
                        p: 2,
                        flex: 1,
                    }}
                >
                    <Typography color="text.secondary">
                        Total Payable
                    </Typography>

                    <Typography
                        variant="h5"
                        fontWeight="700"
                    >
                        {formatMoney(
                            invoices.reduce(
                                (total, invoice) =>
                                    total +
                                    Number(
                                        invoice.totalPayable || 0
                                    ),
                                0
                            )
                        )}
                    </Typography>
                </Paper>
            </Stack>

            {/* INVOICE TABLE */}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <strong>ID</strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    Invoice Number
                                </strong>
                            </TableCell>

                            <TableCell>
                                <strong>Date</strong>
                            </TableCell>

                            <TableCell>
                                <strong>Customer</strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    Sales Order
                                </strong>
                            </TableCell>

                            <TableCell align="right">
                                <strong>Tax</strong>
                            </TableCell>

                            <TableCell align="right">
                                <strong>Total</strong>
                            </TableCell>

                            <TableCell>
                                <strong>Status</strong>
                            </TableCell>

                            <TableCell align="right">
                                <strong>Actions</strong>
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={9}
                                    align="center"
                                >
                                    Loading invoices...
                                </TableCell>
                            </TableRow>
                        ) : invoices.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={9}
                                    align="center"
                                >
                                    No invoices found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            invoices.map((invoice) => (
                                <TableRow
                                    hover
                                    key={invoice.id}
                                >
                                    <TableCell>
                                        {invoice.id}
                                    </TableCell>

                                    <TableCell>
                                        <Typography fontWeight="600">
                                            {
                                                invoice.invoiceNumber
                                            }
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        {
                                            invoice.invoiceDate
                                        }
                                    </TableCell>

                                    <TableCell>
                                        {
                                            invoice.customer
                                                ?.name || "-"
                                        }
                                    </TableCell>

                                    <TableCell>
                                        {
                                            invoice.salesOrder
                                                ?.orderNumber || "-"
                                        }
                                    </TableCell>

                                    <TableCell align="right">
                                        {formatMoney(
                                            invoice.tax
                                        )}
                                    </TableCell>

                                    <TableCell align="right">
                                        <Typography fontWeight="600">
                                            {formatMoney(
                                                invoice.totalPayable
                                            )}
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            label={
                                                invoice.status ||
                                                "-"
                                            }
                                            color={getStatusColor(
                                                invoice.status
                                            )}
                                            size="small"
                                        />
                                    </TableCell>

                                    <TableCell align="right">
                                        <Button
                                            size="small"
                                            startIcon={
                                                <Visibility />
                                            }
                                            onClick={() =>
                                                handleViewInvoice(
                                                    invoice
                                                )
                                            }
                                            sx={{ mr: 1 }}
                                        >
                                            View
                                        </Button>

                                        <Button
                                            size="small"
                                            startIcon={
                                                <PictureAsPdf />
                                            }
                                            onClick={() =>
                                                handleDownloadPdf(
                                                    invoice.id
                                                )
                                            }
                                            sx={{ mr: 1 }}
                                        >
                                            PDF
                                        </Button>

                                        {invoice.status?.toUpperCase() ===
                                            "UNPAID" && (
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="success"
                                                startIcon={
                                                    <CheckCircle />
                                                }
                                                disabled={
                                                    paying
                                                }
                                                onClick={() =>
                                                    handleMarkAsPaid(
                                                        invoice.id
                                                    )
                                                }
                                            >
                                                {paying
                                                    ? "Updating..."
                                                    : "Mark as Paid"}
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* CREATE INVOICE DIALOG */}

            <Dialog
                open={openCreate}
                onClose={() => setOpenCreate(false)}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>
                    Create Invoice
                </DialogTitle>

                <DialogContent>
                    <Typography
                        color="text.secondary"
                        sx={{ mb: 3 }}
                    >
                        Select a confirmed sales order to
                        generate its invoice.
                    </Typography>

                    {invoiceableOrders.length === 0 ? (
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 4,
                                textAlign: "center",
                            }}
                        >
                            <Typography color="text.secondary">
                                No confirmed sales orders are
                                available for invoicing.
                            </Typography>
                        </Paper>
                    ) : (
                        <TableContainer
                            component={Paper}
                            variant="outlined"
                        >
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            Sales Order
                                        </TableCell>

                                        <TableCell>
                                            Date
                                        </TableCell>

                                        <TableCell>
                                            Customer
                                        </TableCell>

                                        <TableCell align="right">
                                            Total
                                        </TableCell>

                                        <TableCell align="right">
                                            Action
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {invoiceableOrders.map(
                                        (order) => (
                                            <TableRow
                                                key={order.id}
                                                hover
                                            >
                                                <TableCell>
                                                    <Typography fontWeight="600">
                                                        {
                                                            order.orderNumber
                                                        }
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    {
                                                        order.orderDate
                                                    }
                                                </TableCell>

                                                <TableCell>
                                                    {
                                                        order
                                                            .customer
                                                            ?.name ||
                                                        "-"
                                                    }
                                                </TableCell>

                                                <TableCell align="right">
                                                    {formatMoney(
                                                        order.totalAmount
                                                    )}
                                                </TableCell>

                                                <TableCell align="right">
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        disabled={
                                                            creating
                                                        }
                                                        onClick={() =>
                                                            handleCreateInvoice(
                                                                order.id
                                                            )
                                                        }
                                                    >
                                                        {creating
                                                            ? "Creating..."
                                                            : "Create"}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 3 }}>
                    <Button
                        onClick={() =>
                            setOpenCreate(false)
                        }
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* VIEW INVOICE DIALOG */}

            <Dialog
                open={openView}
                onClose={() => setOpenView(false)}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>
                    Invoice Details
                </DialogTitle>

                <DialogContent>
                    {selectedInvoice && (
                        <>
                            <Stack
                                direction={{
                                    xs: "column",
                                    sm: "row",
                                }}
                                spacing={4}
                                sx={{ mb: 4 }}
                            >
                                <Box>
                                    <Typography color="text.secondary">
                                        Invoice Number
                                    </Typography>

                                    <Typography fontWeight="600">
                                        {
                                            selectedInvoice.invoiceNumber
                                        }
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography color="text.secondary">
                                        Invoice Date
                                    </Typography>

                                    <Typography>
                                        {
                                            selectedInvoice.invoiceDate
                                        }
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography color="text.secondary">
                                        Status
                                    </Typography>

                                    <Chip
                                        label={
                                            selectedInvoice.status ||
                                            "-"
                                        }
                                        color={getStatusColor(
                                            selectedInvoice.status
                                        )}
                                        size="small"
                                    />
                                </Box>
                            </Stack>

                            {/* CUSTOMER */}

                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    mb: 3,
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{ mb: 1 }}
                                >
                                    Customer
                                </Typography>

                                <Typography fontWeight="600">
                                    {
                                        selectedInvoice
                                            .customer?.name
                                    }
                                </Typography>

                                <Typography>
                                    {
                                        selectedInvoice
                                            .customer?.address
                                    }
                                </Typography>

                                <Typography>
                                    {
                                        selectedInvoice
                                            .customer?.email
                                    }
                                </Typography>

                                <Typography>
                                    {
                                        selectedInvoice
                                            .customer?.phone
                                    }
                                </Typography>
                            </Paper>

                            {/* SALES ORDER ITEMS */}

                            <Typography
                                variant="h6"
                                sx={{ mb: 2 }}
                            >
                                Sales Order Items
                            </Typography>

                            <TableContainer
                                component={Paper}
                                variant="outlined"
                            >
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>
                                                Product
                                            </TableCell>

                                            <TableCell>
                                                SKU
                                            </TableCell>

                                            <TableCell align="right">
                                                Quantity
                                            </TableCell>

                                            <TableCell align="right">
                                                Unit Price
                                            </TableCell>

                                            <TableCell align="right">
                                                Total
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {selectedInvoice.salesOrder?.items?.map(
                                            (item) => (
                                                <TableRow
                                                    key={item.id}
                                                >
                                                    <TableCell>
                                                        {
                                                            item
                                                                .product
                                                                ?.name
                                                        }
                                                    </TableCell>

                                                    <TableCell>
                                                        {
                                                            item
                                                                .product
                                                                ?.sku
                                                        }
                                                    </TableCell>

                                                    <TableCell align="right">
                                                        {
                                                            item.quantity
                                                        }
                                                    </TableCell>

                                                    <TableCell align="right">
                                                        {formatMoney(
                                                            item.unitPrice
                                                        )}
                                                    </TableCell>

                                                    <TableCell align="right">
                                                        {formatMoney(
                                                            item.totalPrice
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* TOTALS */}

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent:
                                        "flex-end",
                                    mt: 3,
                                }}
                            >
                                <Box sx={{ minWidth: 280 }}>
                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        sx={{ mb: 1 }}
                                    >
                                        <Typography>
                                            Subtotal =
                                        </Typography>

                                        <Typography>
                                            {formatMoney(
                                                selectedInvoice
                                                    .salesOrder
                                                    ?.totalAmount
                                            )}
                                        </Typography>
                                    </Stack>

                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        sx={{ mb: 1 }}
                                    >
                                        <Typography>
                                            GST (18%) =
                                        </Typography>

                                        <Typography>
                                            {formatMoney(
                                                selectedInvoice.tax
                                            )}
                                        </Typography>
                                    </Stack>

                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                    >
                                        <Typography fontWeight="700">
                                            Total Payable =
                                        </Typography>

                                        <Typography fontWeight="700">
                                            {formatMoney(
                                                selectedInvoice.totalPayable
                                            )}
                                        </Typography>
                                    </Stack>
                                </Box>
                            </Box>
                        </>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 3 }}>
                    {selectedInvoice && (
                        <>
                            {selectedInvoice.status?.toUpperCase() ===
                                "UNPAID" && (
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={
                                        <CheckCircle />
                                    }
                                    disabled={paying}
                                    onClick={() =>
                                        handleMarkAsPaid(
                                            selectedInvoice.id
                                        )
                                    }
                                >
                                    {paying
                                        ? "Updating..."
                                        : "Mark as Paid"}
                                </Button>
                            )}

                            <Button
                                variant="contained"
                                startIcon={
                                    <PictureAsPdf />
                                }
                                onClick={() =>
                                    handleDownloadPdf(
                                        selectedInvoice.id
                                    )
                                }
                            >
                                PDF
                            </Button>
                        </>
                    )}

                    <Button
                        onClick={() =>
                            setOpenView(false)
                        }
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Invoices;