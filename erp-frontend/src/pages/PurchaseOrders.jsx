import { useEffect, useMemo, useState } from "react";
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
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";

import {
    Add,
    Delete,
    Edit,
    Visibility,
    CheckCircle,
    LocalShipping,
    Done,
    Cancel,
} from "@mui/icons-material";

const createEmptyForm = () => ({
    supplierId: "",
    orderNumber: "",
    orderDate: new Date()
        .toISOString()
        .split("T")[0],
    expectedDeliveryDate: "",
    status: "PENDING",
    items: [
        {
            productId: "",
            quantity: 1,
            unitPrice: "",
        },
    ],
});

function PurchaseOrders() {
    const [orders, setOrders] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [openForm, setOpenForm] = useState(false);
    const [openView, setOpenView] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [form, setForm] = useState(createEmptyForm());

    // =========================================================
    // API
    // =========================================================

    const fetchOrders = async () => {
        const response = await api.get("/purchase-orders");
        return response.data;
    };

    const fetchSuppliers = async () => {
        const response = await api.get("/suppliers");
        return response.data;
    };

    const fetchProducts = async () => {
        const response = await api.get("/products");
        return response.data;
    };

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                ordersData,
                suppliersData,
                productsData,
            ] = await Promise.all([
                fetchOrders(),
                fetchSuppliers(),
                fetchProducts(),
            ]);

            setOrders(ordersData);
            setSuppliers(suppliersData);
            setProducts(productsData);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                    err.response?.data ||
                    err.message ||
                    "Failed to load purchase orders."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // =========================================================
    // OPEN ADD
    // =========================================================

    const handleOpenAdd = () => {
        setEditingId(null);
        setForm(createEmptyForm());
        setError("");
        setOpenForm(true);
    };

    // =========================================================
    // OPEN EDIT
    // =========================================================

    const handleOpenEdit = (order) => {
        if (
            order.status &&
            order.status.toUpperCase() !== "PENDING"
        ) {
            setError(
                "Only PENDING Purchase Orders can be edited."
            );
            return;
        }

        setEditingId(order.id);

        setForm({
            supplierId:
                order.supplier?.id || "",

            orderNumber:
                order.orderNumber || "",

            orderDate:
                order.orderDate ||
                new Date()
                    .toISOString()
                    .split("T")[0],

            expectedDeliveryDate:
                order.expectedDeliveryDate || "",

            status:
                order.status || "PENDING",

            items:
                order.items?.length > 0
                    ? order.items.map((item) => ({
                          productId:
                              item.product?.id || "",

                          quantity:
                              item.quantity || 1,

                          unitPrice:
                              item.unitPrice ??
                              item.product?.price ??
                              "",
                      }))
                    : [
                          {
                              productId: "",
                              quantity: 1,
                              unitPrice: "",
                          },
                      ],
        });

        setError("");
        setOpenForm(true);
    };

    // =========================================================
    // CLOSE FORM
    // =========================================================

    const handleCloseForm = () => {
        setOpenForm(false);
        setEditingId(null);
        setForm(createEmptyForm());
    };

    // =========================================================
    // FORM CHANGES
    // =========================================================

    const handleSupplierChange = (event) => {
        setForm((previous) => ({
            ...previous,
            supplierId: event.target.value,
        }));
    };

    const handleBasicChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleItemChange = (
        index,
        field,
        value
    ) => {
        setForm((previous) => {
            const updatedItems = [
                ...previous.items,
            ];

            updatedItems[index] = {
                ...updatedItems[index],
                [field]: value,
            };

            // Automatically use product price
            if (field === "productId") {
                const product =
                    products.find(
                        (p) =>
                            String(p.id) ===
                            String(value)
                    );

                updatedItems[index] = {
                    ...updatedItems[index],
                    unitPrice:
                        product?.price ?? "",
                };
            }

            return {
                ...previous,
                items: updatedItems,
            };
        });
    };

    // =========================================================
    // ADD ITEM
    // =========================================================

    const addItem = () => {
        setForm((previous) => ({
            ...previous,
            items: [
                ...previous.items,
                {
                    productId: "",
                    quantity: 1,
                    unitPrice: "",
                },
            ],
        }));
    };

    // =========================================================
    // REMOVE ITEM
    // =========================================================

    const removeItem = (index) => {
        setForm((previous) => ({
            ...previous,
            items: previous.items.filter(
                (_, itemIndex) =>
                    itemIndex !== index
            ),
        }));
    };

    // =========================================================
    // TOTAL
    // =========================================================

    const calculatedTotal = useMemo(() => {
        return form.items.reduce(
            (total, item) => {
                return (
                    total +
                    Number(
                        item.quantity || 0
                    ) *
                        Number(
                            item.unitPrice || 0
                        )
                );
            },
            0
        );
    }, [form.items]);

    // =========================================================
    // SAVE
    // =========================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setError("");

            if (!form.supplierId) {
                throw new Error(
                    "Please select a supplier"
                );
            }

            if (!form.orderDate) {
                throw new Error(
                    "Order date is required"
                );
            }

            if (!form.expectedDeliveryDate) {
                throw new Error(
                    "Expected delivery date is required"
                );
            }

            if (
                form.expectedDeliveryDate <
                form.orderDate
            ) {
                throw new Error(
                    "Expected delivery date cannot be before order date"
                );
            }

            if (form.items.length === 0) {
                throw new Error(
                    "Add at least one product"
                );
            }

            for (const item of form.items) {
                if (!item.productId) {
                    throw new Error(
                        "Please select a product for every item"
                    );
                }

                if (
                    Number(item.quantity) <=
                    0
                ) {
                    throw new Error(
                        "Quantity must be greater than zero"
                    );
                }

                if (
                    Number(item.unitPrice) < 0
                ) {
                    throw new Error(
                        "Unit price cannot be negative"
                    );
                }
            }

            const supplier =
                suppliers.find(
                    (s) =>
                        String(s.id) ===
                        String(
                            form.supplierId
                        )
                );

            if (!supplier) {
                throw new Error(
                    "Selected supplier was not found"
                );
            }

            const orderItems =
                form.items.map((item) => {
                    const product =
                        products.find(
                            (p) =>
                                String(
                                    p.id
                                ) ===
                                String(
                                    item.productId
                                )
                        );

                    if (!product) {
                        throw new Error(
                            "Selected product was not found"
                        );
                    }

                    const quantity =
                        Number(
                            item.quantity
                        );

                    const unitPrice =
                        Number(
                            item.unitPrice
                        );

                    return {
                        product: product,
                        quantity: quantity,
                        unitPrice: unitPrice,
                        totalPrice:
                            quantity *
                            unitPrice,
                    };
                });

            const purchaseOrder = {
                supplier: supplier,

                // Backend keeps the existing
                // order number during edit.
                ...(editingId
                    ? {
                          orderNumber:
                              form.orderNumber,
                      }
                    : {}),

                orderDate:
                    form.orderDate,

                expectedDeliveryDate:
                    form.expectedDeliveryDate,

                // New POs always start as PENDING.
                status: editingId
                    ? form.status
                    : "PENDING",

                items: orderItems,

                totalAmount:
                    calculatedTotal,
            };

            if (editingId) {
                await api.put(
                    `/purchase-orders/${editingId}`,
                    purchaseOrder
                );
            } else {
                await api.post(
                    "/purchase-orders",
                    purchaseOrder
                );
            }

            handleCloseForm();

            await loadData();
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                    err.response?.data ||
                    err.message ||
                    "Failed to save purchase order."
            );
        }
    };

    // =========================================================
    // STATUS UPDATE
    // =========================================================

    const updateStatus = async (
        id,
        newStatus
    ) => {
        try {
            setError("");

            await api.put(
                `/purchase-orders/${id}/status?status=${encodeURIComponent(
                    newStatus
                )}`
            );

            await loadData();

            // Refresh selected order if view dialog is open
            if (
                selectedOrder &&
                selectedOrder.id === id
            ) {
                const refreshedResponse =
                    await api.get(
                        `/purchase-orders/${id}`
                    );

                setSelectedOrder(
                    refreshedResponse.data
                );
            }
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                    err.response?.data ||
                    err.message ||
                    "Failed to update purchase order status."
            );
        }
    };

    // =========================================================
    // STATUS ACTIONS
    // =========================================================

    const handleConfirm = async (order) => {
        if (
            !window.confirm(
                `Confirm ${order.orderNumber}?`
            )
        ) {
            return;
        }

        await updateStatus(
            order.id,
            "CONFIRMED"
        );
    };

    const handleStartReceiving = async (
        order
    ) => {
        if (
            !window.confirm(
                `Start receiving ${order.orderNumber}?`
            )
        ) {
            return;
        }

        await updateStatus(
            order.id,
            "RECEIVING"
        );
    };

    const handleComplete = async (order) => {
        if (
            !window.confirm(
                `Mark ${order.orderNumber} as completed?`
            )
        ) {
            return;
        }

        await updateStatus(
            order.id,
            "COMPLETED"
        );
    };

    const handleCancelOrder = async (
        order
    ) => {
        if (
            !window.confirm(
                `Cancel ${order.orderNumber}?`
            )
        ) {
            return;
        }

        await updateStatus(
            order.id,
            "CANCELLED"
        );
    };

    // =========================================================
    // DELETE
    // =========================================================

    const handleDelete = async (id) => {
        const order = orders.find(
            (item) => item.id === id
        );

        if (
            order &&
            order.status &&
            order.status.toUpperCase() !==
                "PENDING"
        ) {
            setError(
                "Only PENDING Purchase Orders can be deleted."
            );
            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this purchase order?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await api.delete(
                `/purchase-orders/${id}`
            );

            await loadData();
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                    err.response?.data ||
                    err.message ||
                    "Failed to delete purchase order."
            );
        }
    };

    // =========================================================
    // VIEW
    // =========================================================

    const handleView = async (order) => {
        try {
            setError("");

            const response =
                await api.get(
                    `/purchase-orders/${order.id}`
                );

            const data = response.data;

            setSelectedOrder(data);
            setOpenView(true);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                    err.response?.data ||
                    err.message ||
                    "Failed to load purchase order."
            );
        }
    };

    // =========================================================
    // SEARCH
    // =========================================================

    const filteredOrders =
        orders.filter((order) => {
            const text =
                search
                    .toLowerCase()
                    .trim();

            const orderNumber =
                order.orderNumber
                    ?.toLowerCase() || "";

            const supplierName =
                order.supplier?.name
                    ?.toLowerCase() || "";

            const status =
                order.status
                    ?.toLowerCase() || "";

            return (
                orderNumber.includes(
                    text
                ) ||
                supplierName.includes(
                    text
                ) ||
                status.includes(text)
            );
        });

    // =========================================================
    // STATUS COLOR
    // =========================================================

    const getStatusColor = (
        status
    ) => {
        switch (
            status?.toUpperCase()
        ) {
            case "CONFIRMED":
                return "success";

            case "RECEIVING":
                return "info";

            case "COMPLETED":
                return "success";

            case "CANCELLED":
                return "error";

            case "PENDING":
                return "warning";

            default:
                return "default";
        }
    };

    // =========================================================
    // CURRENCY
    // =========================================================

    const formatCurrency = (
        value
    ) => {
        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2,
            }
        ).format(
            Number(value || 0)
        );
    };

    // =========================================================
    // UI
    // =========================================================

    return (
        <Box sx={{ p: 4 }}>

            {/* HEADER */}

            <Box
                sx={{
                    display: "flex",
                    justifyContent:
                        "space-between",
                    alignItems: "center",
                    mb: 3,
                    gap: 2,
                }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        fontWeight="600"
                    >
                        Purchase Orders
                    </Typography>

                    <Typography color="text.secondary">
                        Create and manage supplier
                        purchase orders.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={
                        handleOpenAdd
                    }
                >
                    Create Purchase Order
                </Button>
            </Box>

            {/* ERROR */}

            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    onClose={() =>
                        setError("")
                    }
                >
                    {typeof error === "string"
                        ? error
                        : JSON.stringify(error)}
                </Alert>
            )}

            {/* SEARCH */}

            <Paper
                sx={{
                    p: 2,
                    mb: 3,
                }}
            >
                <TextField
                    fullWidth
                    label="Search Purchase Orders"
                    placeholder="Order number, supplier or status..."
                    value={search}
                    onChange={(event) =>
                        setSearch(
                            event.target.value
                        )
                    }
                />
            </Paper>

            {/* TABLE */}

            <TableContainer
                component={Paper}
            >
                <Table>

                    <TableHead>
                        <TableRow>

                            <TableCell>
                                <strong>ID</strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    Order Number
                                </strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    Order Date
                                </strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    Expected Delivery
                                </strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    Supplier
                                </strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    Items
                                </strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    Total Amount
                                </strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    Status
                                </strong>
                            </TableCell>

                            <TableCell align="right">
                                <strong>
                                    Actions
                                </strong>
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
                                    Loading purchase
                                    orders...
                                </TableCell>
                            </TableRow>
                        ) : filteredOrders.length ===
                          0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={9}
                                    align="center"
                                >
                                    No purchase orders
                                    found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOrders.map(
                                (order) => {
                                    const status =
                                        order.status?.toUpperCase() ||
                                        "PENDING";

                                    return (
                                        <TableRow
                                            key={
                                                order.id
                                            }
                                            hover
                                        >

                                            <TableCell>
                                                {
                                                    order.id
                                                }
                                            </TableCell>

                                            <TableCell>
                                                <Typography
                                                    fontWeight="600"
                                                >
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
                                                    order.expectedDeliveryDate ||
                                                    "-"
                                                }
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    order
                                                        .supplier
                                                        ?.name
                                                }
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    order
                                                        .items
                                                        ?.length ||
                                                    0
                                                }
                                            </TableCell>

                                            <TableCell>
                                                {formatCurrency(
                                                    order.totalAmount
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <Chip
                                                    label={
                                                        status
                                                    }
                                                    color={getStatusColor(
                                                        status
                                                    )}
                                                    size="small"
                                                />
                                            </TableCell>

                                            <TableCell align="right">

                                                {/* VIEW */}

                                                <IconButton
                                                    color="primary"
                                                    title="View"
                                                    onClick={() =>
                                                        handleView(
                                                            order
                                                        )
                                                    }
                                                >
                                                    <Visibility />
                                                </IconButton>

                                                {/* EDIT */}

                                                <IconButton
                                                    color="primary"
                                                    title="Edit"
                                                    disabled={
                                                        status !==
                                                        "PENDING"
                                                    }
                                                    onClick={() =>
                                                        handleOpenEdit(
                                                            order
                                                        )
                                                    }
                                                >
                                                    <Edit />
                                                </IconButton>

                                                {/* DELETE */}

                                                <IconButton
                                                    color="error"
                                                    title="Delete"
                                                    disabled={
                                                        status !==
                                                        "PENDING"
                                                    }
                                                    onClick={() =>
                                                        handleDelete(
                                                            order.id
                                                        )
                                                    }
                                                >
                                                    <Delete />
                                                </IconButton>

                                                {/* CONFIRM */}

                                                {status ===
                                                    "PENDING" && (
                                                    <IconButton
                                                        color="success"
                                                        title="Confirm Order"
                                                        onClick={() =>
                                                            handleConfirm(
                                                                order
                                                            )
                                                        }
                                                    >
                                                        <CheckCircle />
                                                    </IconButton>
                                                )}

                                                {/* CANCEL */}

                                                {status ===
                                                    "PENDING" && (
                                                    <IconButton
                                                        color="error"
                                                        title="Cancel Order"
                                                        onClick={() =>
                                                            handleCancelOrder(
                                                                order
                                                            )
                                                        }
                                                    >
                                                        <Cancel />
                                                    </IconButton>
                                                )}

                                                {/* START RECEIVING */}

                                                {status ===
                                                    "CONFIRMED" && (
                                                    <IconButton
                                                        color="info"
                                                        title="Start Receiving"
                                                        onClick={() =>
                                                            handleStartReceiving(
                                                                order
                                                            )
                                                        }
                                                    >
                                                        <LocalShipping />
                                                    </IconButton>
                                                )}

                                                {/* COMPLETE */}

                                                {status ===
                                                    "RECEIVING" && (
                                                    <IconButton
                                                        color="success"
                                                        title="Complete Order"
                                                        onClick={() =>
                                                            handleComplete(
                                                                order
                                                            )
                                                        }
                                                    >
                                                        <Done />
                                                    </IconButton>
                                                )}

                                            </TableCell>

                                        </TableRow>
                                    );
                                }
                            )
                        )}

                    </TableBody>

                </Table>
            </TableContainer>

            {/* =================================================
                CREATE / EDIT DIALOG
            ================================================= */}

            <Dialog
                open={openForm}
                onClose={
                    handleCloseForm
                }
                fullWidth
                maxWidth="md"
            >

                <DialogTitle>
                    {editingId
                        ? "Edit Purchase Order"
                        : "Create Purchase Order"}
                </DialogTitle>

                <Box
                    component="form"
                    onSubmit={
                        handleSubmit
                    }
                >

                    <DialogContent>

                        {/* BASIC DETAILS */}

                        <Stack
                            direction={{
                                xs: "column",
                                sm: "row",
                            }}
                            spacing={2}
                            sx={{
                                mb: 3,
                            }}
                        >

                            <TextField
                                fullWidth
                                label="Order Number"
                                value={
                                    editingId
                                        ? form.orderNumber
                                        : "Generated automatically"
                                }
                                disabled
                                helperText={
                                    editingId
                                        ? "PO number is generated by the backend."
                                        : "PO number will be generated automatically."
                                }
                            />

                            <TextField
                                fullWidth
                                required
                                type="date"
                                label="Order Date"
                                name="orderDate"
                                value={
                                    form.orderDate
                                }
                                onChange={
                                    handleBasicChange
                                }
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />

                        </Stack>

                        {/* DELIVERY DATE */}

                        <TextField
                            fullWidth
                            required
                            type="date"
                            label="Expected Delivery Date"
                            name="expectedDeliveryDate"
                            value={
                                form.expectedDeliveryDate
                            }
                            onChange={
                                handleBasicChange
                            }
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                min: form.orderDate,
                            }}
                            sx={{
                                mb: 3,
                            }}
                        />

                        {/* SUPPLIER */}

                        <FormControl
                            fullWidth
                            required
                            sx={{
                                mb: 3,
                            }}
                        >

                            <InputLabel>
                                Supplier
                            </InputLabel>

                            <Select
                                value={
                                    form.supplierId
                                }
                                label="Supplier"
                                onChange={
                                    handleSupplierChange
                                }
                            >

                                {suppliers
                                    .filter(
                                        (
                                            supplier
                                        ) =>
                                            supplier.active
                                    )
                                    .map(
                                        (
                                            supplier
                                        ) => (
                                            <MenuItem
                                                key={
                                                    supplier.id
                                                }
                                                value={
                                                    supplier.id
                                                }
                                            >
                                                {
                                                    supplier.supplierCode
                                                }{" "}
                                                -{" "}
                                                {
                                                    supplier.name
                                                }
                                            </MenuItem>
                                        )
                                    )}

                            </Select>

                        </FormControl>

                        {/* STATUS */}

                        {editingId && (
                            <FormControl
                                fullWidth
                                sx={{
                                    mb: 3,
                                }}
                            >

                                <InputLabel>
                                    Status
                                </InputLabel>

                                <Select
                                    value={
                                        form.status
                                    }
                                    label="Status"
                                    disabled
                                >

                                    <MenuItem value="PENDING">
                                        PENDING
                                    </MenuItem>

                                    <MenuItem value="CONFIRMED">
                                        CONFIRMED
                                    </MenuItem>

                                    <MenuItem value="RECEIVING">
                                        RECEIVING
                                    </MenuItem>

                                    <MenuItem value="COMPLETED">
                                        COMPLETED
                                    </MenuItem>

                                    <MenuItem value="CANCELLED">
                                        CANCELLED
                                    </MenuItem>

                                </Select>

                            </FormControl>
                        )}

                        {/* ITEMS */}

                        <Typography
                            variant="h6"
                            sx={{
                                mb: 2,
                            }}
                        >
                            Order Items
                        </Typography>

                        {form.items.map(
                            (
                                item,
                                index
                            ) => {

                                const itemTotal =
                                    Number(
                                        item.quantity ||
                                            0
                                    ) *
                                    Number(
                                        item.unitPrice ||
                                            0
                                    );

                                return (
                                    <Paper
                                        key={
                                            index
                                        }
                                        variant="outlined"
                                        sx={{
                                            p: 2,
                                            mb: 2,
                                        }}
                                    >

                                        <Stack
                                            direction={{
                                                xs: "column",
                                                md: "row",
                                            }}
                                            spacing={2}
                                            alignItems={{
                                                md: "center",
                                            }}
                                        >

                                            {/* PRODUCT */}

                                            <FormControl
                                                fullWidth
                                                required
                                            >

                                                <InputLabel>
                                                    Product
                                                </InputLabel>

                                                <Select
                                                    value={
                                                        item.productId
                                                    }
                                                    label="Product"
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleItemChange(
                                                            index,
                                                            "productId",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                >

                                                    {products
                                                        .filter(
                                                            (
                                                                product
                                                            ) =>
                                                                product.active
                                                        )
                                                        .map(
                                                            (
                                                                product
                                                            ) => (
                                                                <MenuItem
                                                                    key={
                                                                        product.id
                                                                    }
                                                                    value={
                                                                        product.id
                                                                    }
                                                                >
                                                                    {
                                                                        product.sku
                                                                    }{" "}
                                                                    -{" "}
                                                                    {
                                                                        product.name
                                                                    }
                                                                </MenuItem>
                                                            )
                                                        )}

                                                </Select>

                                            </FormControl>

                                            {/* QUANTITY */}

                                            <TextField
                                                label="Quantity"
                                                type="number"
                                                value={
                                                    item.quantity
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    handleItemChange(
                                                        index,
                                                        "quantity",
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                inputProps={{
                                                    min: 1,
                                                }}
                                                sx={{
                                                    minWidth: 120,
                                                }}
                                            />

                                            {/* UNIT PRICE */}

                                            <TextField
                                                label="Unit Price"
                                                type="number"
                                                value={
                                                    item.unitPrice
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    handleItemChange(
                                                        index,
                                                        "unitPrice",
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                inputProps={{
                                                    min: 0,
                                                    step: "0.01",
                                                }}
                                                sx={{
                                                    minWidth: 150,
                                                }}
                                            />

                                            {/* TOTAL */}

                                            <Typography
                                                fontWeight="600"
                                                sx={{
                                                    minWidth: 140,
                                                }}
                                            >
                                                {formatCurrency(
                                                    itemTotal
                                                )}
                                            </Typography>

                                            {/* REMOVE */}

                                            <Button
                                                color="error"
                                                onClick={() =>
                                                    removeItem(
                                                        index
                                                    )
                                                }
                                                disabled={
                                                    form
                                                        .items
                                                        .length ===
                                                    1
                                                }
                                            >
                                                Remove
                                            </Button>

                                        </Stack>

                                    </Paper>
                                );
                            }
                        )}

                        <Button
                            variant="outlined"
                            startIcon={
                                <Add />
                            }
                            onClick={
                                addItem
                            }
                            sx={{
                                mb: 3,
                            }}
                        >
                            Add Product
                        </Button>

                        {/* TOTAL */}

                        <Paper
                            sx={{
                                p: 2,
                                display:
                                    "flex",
                                justifyContent:
                                    "space-between",
                                alignItems:
                                    "center",
                            }}
                        >

                            <Typography
                                variant="h6"
                            >
                                Total Amount
                            </Typography>

                            <Typography
                                variant="h5"
                                fontWeight="700"
                            >
                                {formatCurrency(
                                    calculatedTotal
                                )}
                            </Typography>

                        </Paper>

                    </DialogContent>

                    <DialogActions
                        sx={{
                            p: 3,
                        }}
                    >

                        <Button
                            onClick={
                                handleCloseForm
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                        >
                            {editingId
                                ? "Update Purchase Order"
                                : "Create Purchase Order"}
                        </Button>

                    </DialogActions>

                </Box>

            </Dialog>

            {/* =================================================
                VIEW DIALOG
            ================================================= */}

            <Dialog
                open={openView}
                onClose={() =>
                    setOpenView(false)
                }
                fullWidth
                maxWidth="md"
            >

                <DialogTitle>
                    Purchase Order Details
                </DialogTitle>

                <DialogContent>

                    {selectedOrder && (
                        <>

                            {/* HEADER DETAILS */}

                            <Stack
                                direction={{
                                    xs: "column",
                                    sm: "row",
                                }}
                                spacing={3}
                                sx={{
                                    mb: 3,
                                }}
                            >

                                <Box>
                                    <Typography color="text.secondary">
                                        Order Number
                                    </Typography>

                                    <Typography fontWeight="600">
                                        {
                                            selectedOrder.orderNumber
                                        }
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography color="text.secondary">
                                        Order Date
                                    </Typography>

                                    <Typography>
                                        {
                                            selectedOrder.orderDate
                                        }
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography color="text.secondary">
                                        Expected Delivery
                                    </Typography>

                                    <Typography>
                                        {
                                            selectedOrder.expectedDeliveryDate ||
                                            "-"
                                        }
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography color="text.secondary">
                                        Supplier
                                    </Typography>

                                    <Typography>
                                        {
                                            selectedOrder
                                                .supplier
                                                ?.name
                                        }
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography color="text.secondary">
                                        Status
                                    </Typography>

                                    <Chip
                                        label={
                                            selectedOrder.status
                                        }
                                        color={getStatusColor(
                                            selectedOrder.status
                                        )}
                                        size="small"
                                    />
                                </Box>

                            </Stack>

                            {/* STATUS ACTIONS */}

                            <Stack
                                direction={{
                                    xs: "column",
                                    sm: "row",
                                }}
                                spacing={1}
                                sx={{
                                    mb: 3,
                                }}
                            >

                                {selectedOrder.status ===
                                    "PENDING" && (
                                    <>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            startIcon={
                                                <CheckCircle />
                                            }
                                            onClick={() =>
                                                handleConfirm(
                                                    selectedOrder
                                                )
                                            }
                                        >
                                            Confirm
                                        </Button>

                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={
                                                <Cancel />
                                            }
                                            onClick={() =>
                                                handleCancelOrder(
                                                    selectedOrder
                                                )
                                            }
                                        >
                                            Cancel
                                        </Button>
                                    </>
                                )}

                                {selectedOrder.status ===
                                    "CONFIRMED" && (
                                    <Button
                                        variant="contained"
                                        color="info"
                                        startIcon={
                                            <LocalShipping />
                                        }
                                        onClick={() =>
                                            handleStartReceiving(
                                                selectedOrder
                                            )
                                        }
                                    >
                                        Start Receiving
                                    </Button>
                                )}

                                {selectedOrder.status ===
                                    "RECEIVING" && (
                                    <Button
                                        variant="contained"
                                        color="success"
                                        startIcon={
                                            <Done />
                                        }
                                        onClick={() =>
                                            handleComplete(
                                                selectedOrder
                                            )
                                        }
                                    >
                                        Complete
                                    </Button>
                                )}

                            </Stack>

                            {/* ITEMS */}

                            <Typography
                                variant="h6"
                                sx={{
                                    mb: 2,
                                }}
                            >
                                Items
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
                                                Quantity
                                            </TableCell>

                                            <TableCell>
                                                Unit Price
                                            </TableCell>

                                            <TableCell>
                                                Total
                                            </TableCell>

                                        </TableRow>
                                    </TableHead>

                                    <TableBody>

                                        {selectedOrder.items?.map(
                                            (
                                                item
                                            ) => (
                                                <TableRow
                                                    key={
                                                        item.id
                                                    }
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
                                                            item.quantity
                                                        }
                                                    </TableCell>

                                                    <TableCell>
                                                        {formatCurrency(
                                                            item.unitPrice
                                                        )}
                                                    </TableCell>

                                                    <TableCell>
                                                        {formatCurrency(
                                                            item.totalPrice
                                                        )}
                                                    </TableCell>

                                                </TableRow>
                                            )
                                        )}

                                    </TableBody>

                                </Table>

                            </TableContainer>

                            {/* TOTAL */}

                            <Box
                                sx={{
                                    mt: 3,
                                    textAlign:
                                        "right",
                                }}
                            >

                                <Typography
                                    variant="h5"
                                    fontWeight="700"
                                >
                                    Total:{" "}
                                    {formatCurrency(
                                        selectedOrder.totalAmount
                                    )}
                                </Typography>

                            </Box>

                        </>
                    )}

                </DialogContent>

                <DialogActions
                    sx={{
                        p: 3,
                    }}
                >

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

export default PurchaseOrders;