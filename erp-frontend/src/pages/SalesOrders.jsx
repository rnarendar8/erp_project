import { useEffect, useMemo, useState } from "react";

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
    Visibility,
} from "@mui/icons-material";

import api from "../services/api";


const emptyForm = {
    customerId: "",
    orderNumber: "",
    orderDate: new Date().toISOString().split("T")[0],
    status: "PENDING",
    items: [
        {
            productId: "",
            quantity: 1,
        },
    ],
};


function SalesOrders() {
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [openCreate, setOpenCreate] = useState(false);
    const [openView, setOpenView] = useState(false);

    const [selectedOrder, setSelectedOrder] = useState(null);

    const [form, setForm] = useState({
        ...emptyForm,
    });

    const [search, setSearch] = useState("");


    // =========================================================
    // LOAD DATA
    // =========================================================

    const fetchOrders = async () => {
        const response = await api.get("/sales-orders");
        return response.data;
    };


    const fetchCustomers = async () => {
        const response = await api.get("/customers");
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
                customersData,
                productsData,
            ] = await Promise.all([
                fetchOrders(),
                fetchCustomers(),
                fetchProducts(),
            ]);

            setOrders(ordersData);
            setCustomers(customersData);
            setProducts(productsData);

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load sales order data"
            );

        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadData();
    }, []);


    // =========================================================
    // CREATE FORM
    // =========================================================

    const handleOpenCreate = () => {
        setForm({
            ...emptyForm,
            orderNumber: `SO${String(
                orders.length + 1
            ).padStart(3, "0")}`,
        });

        setError("");
        setOpenCreate(true);
    };


    const handleCloseCreate = () => {
        setOpenCreate(false);

        setForm({
            ...emptyForm,
        });
    };


    // =========================================================
    // CUSTOMER CHANGE
    // =========================================================

    const handleCustomerChange = (event) => {
        setForm((previous) => ({
            ...previous,
            customerId: event.target.value,
        }));
    };


    // =========================================================
    // ITEM CHANGE
    // =========================================================

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
    // CALCULATE TOTAL
    // =========================================================

    const calculatedTotal = useMemo(() => {
        return form.items.reduce(
            (total, item) => {
                const product = products.find(
                    (p) =>
                        String(p.id) ===
                        String(item.productId)
                );

                if (!product) {
                    return total;
                }

                return (
                    total +
                    Number(product.price || 0) *
                    Number(item.quantity || 0)
                );
            },
            0
        );
    }, [form.items, products]);


    // =========================================================
    // CREATE SALES ORDER
    // =========================================================

    const handleCreateOrder = async (
        event
    ) => {
        event.preventDefault();

        try {
            setError("");

            if (!form.customerId) {
                throw new Error(
                    "Please select a customer"
                );
            }

            if (!form.orderNumber.trim()) {
                throw new Error(
                    "Order number is required"
                );
            }

            if (!form.orderDate) {
                throw new Error(
                    "Order date is required"
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
                    Number(item.quantity) <= 0
                ) {
                    throw new Error(
                        "Quantity must be greater than zero"
                    );
                }
            }


            const customer = customers.find(
                (c) =>
                    String(c.id) ===
                    String(form.customerId)
            );


            if (!customer) {
                throw new Error(
                    "Selected customer was not found"
                );
            }


            const orderItems = form.items.map(
                (item) => {

                    const product =
                        products.find(
                            (p) =>
                                String(p.id) ===
                                String(item.productId)
                        );


                    if (!product) {
                        throw new Error(
                            "Selected product was not found"
                        );
                    }


                    const quantity = Number(
                        item.quantity
                    );

                    const unitPrice = Number(
                        product.price
                    );


                    return {
                        product: product,
                        quantity: quantity,
                        unitPrice: unitPrice,
                        totalPrice:
                            quantity *
                            unitPrice,
                    };
                }
            );


            const salesOrder = {
                customer: customer,

                orderNumber:
                    form.orderNumber.trim(),

                orderDate: form.orderDate,

                status: "PENDING",

                items: orderItems,

                totalAmount:
                    calculatedTotal,
            };


            await api.post(
                "/sales-orders",
                salesOrder
            );


            handleCloseCreate();

            await loadData();

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to create sales order"
            );
        }
    };


    // =========================================================
    // UPDATE STATUS
    // =========================================================

    const updateStatus = async (
        orderId,
        status
    ) => {
        try {
            setError("");

            await api.put(
                `/sales-orders/${orderId}/status?status=${encodeURIComponent(
                    status
                )}`
            );


            await loadData();


            if (
                selectedOrder &&
                selectedOrder.id === orderId
            ) {
                try {
                    const response =
                        await api.get(
                            `/sales-orders/${orderId}`
                        );

                    setSelectedOrder(
                        response.data
                    );

                } catch (refreshError) {
                    console.error(
                        refreshError
                    );
                }
            }

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to update order status"
            );
        }
    };


    // =========================================================
    // DELETE
    // =========================================================

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this sales order?"
        );

        if (!confirmed) {
            return;
        }


        try {
            setError("");

            await api.delete(
                `/sales-orders/${id}`
            );

            await loadData();

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to delete sales order"
            );
        }
    };


    // =========================================================
    // VIEW ORDER
    // =========================================================

    const handleView = async (order) => {
        try {
            setError("");

            const response =
                await api.get(
                    `/sales-orders/${order.id}`
                );

            setSelectedOrder(
                response.data
            );

            setOpenView(true);

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load sales order"
            );
        }
    };


    // =========================================================
    // SEARCH
    // =========================================================

    const filteredOrders = orders.filter(
        (order) => {
            const text = search
                .toLowerCase()
                .trim();

            const orderNumber =
                order.orderNumber
                    ?.toLowerCase() || "";

            const customerName =
                order.customer?.name
                    ?.toLowerCase() || "";

            const status =
                order.status
                    ?.toLowerCase() || "";

            return (
                orderNumber.includes(text) ||
                customerName.includes(text) ||
                status.includes(text)
            );
        }
    );


    // =========================================================
    // STATUS COLOR
    // =========================================================

    const getStatusColor = (status) => {
        switch (status) {

            case "CONFIRMED":
                return "success";

            case "CANCELLED":
                return "error";

            case "PENDING":
                return "warning";

            case "COMPLETED":
                return "info";

            default:
                return "default";
        }
    };


    // =========================================================
    // FORMAT CURRENCY
    // =========================================================

    const formatCurrency = (value) => {
        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2,
            }
        ).format(Number(value || 0));
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
                }}
            >

                <Box>

                    <Typography
                        variant="h4"
                        fontWeight="600"
                    >
                        Sales Orders
                    </Typography>

                    <Typography color="text.secondary">
                        Create and manage customer sales orders.
                    </Typography>

                </Box>


                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleOpenCreate}
                >
                    Create Sales Order
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
                    {error}
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
                    label="Search Sales Orders"
                    placeholder="Order number, customer or status..."
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
                                <strong>Order Number</strong>
                            </TableCell>

                            <TableCell>
                                <strong>Date</strong>
                            </TableCell>

                            <TableCell>
                                <strong>Customer</strong>
                            </TableCell>

                            <TableCell>
                                <strong>Items</strong>
                            </TableCell>

                            <TableCell>
                                <strong>Total Amount</strong>
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
                                    colSpan={8}
                                    align="center"
                                >
                                    Loading sales orders...
                                </TableCell>

                            </TableRow>

                        ) : filteredOrders.length === 0 ? (

                            <TableRow>

                                <TableCell
                                    colSpan={8}
                                    align="center"
                                >
                                    No sales orders found.
                                </TableCell>

                            </TableRow>

                        ) : (

                            filteredOrders.map(
                                (order) => (

                                    <TableRow
                                        key={order.id}
                                        hover
                                    >

                                        <TableCell>
                                            {order.id}
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
                                                order
                                                    .customer
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
                                                    order.status
                                                }
                                                color={getStatusColor(
                                                    order.status
                                                )}
                                                size="small"
                                            />

                                        </TableCell>


                                        <TableCell align="right">

                                            <IconButton
                                                color="primary"
                                                onClick={() =>
                                                    handleView(
                                                        order
                                                    )
                                                }
                                            >
                                                <Visibility />
                                            </IconButton>


                                            <IconButton
                                                color="error"
                                                onClick={() =>
                                                    handleDelete(
                                                        order.id
                                                    )
                                                }
                                            >
                                                <Delete />
                                            </IconButton>

                                        </TableCell>

                                    </TableRow>

                                )
                            )

                        )}

                    </TableBody>

                </Table>

            </TableContainer>


            {/* =================================================
                CREATE ORDER DIALOG
            ================================================= */}

            <Dialog
                open={openCreate}
                onClose={
                    handleCloseCreate
                }
                fullWidth
                maxWidth="md"
            >

                <DialogTitle>
                    Create Sales Order
                </DialogTitle>


                <Box
                    component="form"
                    onSubmit={
                        handleCreateOrder
                    }
                >

                    <DialogContent>

                        <Stack
                            direction={{
                                xs: "column",
                                sm: "row",
                            }}
                            spacing={2}
                            sx={{ mb: 3 }}
                        >

                            <TextField
                                fullWidth
                                required
                                label="Order Number"
                                value={
                                    form.orderNumber
                                }
                                onChange={(
                                    event
                                ) =>
                                    setForm(
                                        (
                                            previous
                                        ) => ({
                                            ...previous,
                                            orderNumber:
                                                event
                                                    .target
                                                    .value,
                                        })
                                    )
                                }
                            />


                            <TextField
                                fullWidth
                                required
                                type="date"
                                label="Order Date"
                                value={
                                    form.orderDate
                                }
                                onChange={(
                                    event
                                ) =>
                                    setForm(
                                        (
                                            previous
                                        ) => ({
                                            ...previous,
                                            orderDate:
                                                event
                                                    .target
                                                    .value,
                                        })
                                    )
                                }
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />

                        </Stack>


                        {/* CUSTOMER */}

                        <FormControl
                            fullWidth
                            required
                            sx={{ mb: 3 }}
                        >

                            <InputLabel>
                                Customer
                            </InputLabel>

                            <Select
                                value={
                                    form.customerId
                                }
                                label="Customer"
                                onChange={
                                    handleCustomerChange
                                }
                            >

                                {customers
                                    .filter(
                                        (
                                            customer
                                        ) =>
                                            customer.active
                                    )
                                    .map(
                                        (
                                            customer
                                        ) => (

                                            <MenuItem
                                                key={
                                                    customer.id
                                                }
                                                value={
                                                    customer.id
                                                }
                                            >
                                                {
                                                    customer.customerCode
                                                }{" "}
                                                -{" "}
                                                {
                                                    customer.name
                                                }
                                            </MenuItem>

                                        )
                                    )}

                            </Select>

                        </FormControl>


                        {/* ITEMS */}

                        <Typography
                            variant="h6"
                            sx={{ mb: 2 }}
                        >
                            Order Items
                        </Typography>


                        {form.items.map(
                            (item, index) => {

                                const product =
                                    products.find(
                                        (
                                            p
                                        ) =>
                                            String(
                                                p.id
                                            ) ===
                                            String(
                                                item.productId
                                            )
                                    );


                                const itemTotal =
                                    product
                                        ? Number(
                                              product.price
                                          ) *
                                          Number(
                                              item.quantity ||
                                              0
                                          )
                                        : 0;


                                return (

                                    <Paper
                                        key={index}
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

                                            <FormControl
                                                fullWidth
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
                                                                    }{" "}
                                                                    (
                                                                    {formatCurrency(
                                                                        product.price
                                                                    )}
                                                                    )
                                                                </MenuItem>

                                                            )
                                                        )}

                                                </Select>

                                            </FormControl>


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
                                                    minWidth: 130,
                                                }}
                                            />


                                            <TextField
                                                label="Unit Price"
                                                value={
                                                    product
                                                        ? formatCurrency(
                                                              product.price
                                                          )
                                                        : ""
                                                }
                                                InputProps={{
                                                    readOnly: true,
                                                }}
                                                sx={{
                                                    minWidth: 150,
                                                }}
                                            />


                                            <Typography
                                                sx={{
                                                    minWidth: 150,
                                                    fontWeight:
                                                        600,
                                                }}
                                            >
                                                {formatCurrency(
                                                    itemTotal
                                                )}
                                            </Typography>


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
                            startIcon={<Add />}
                            onClick={
                                addItem
                            }
                            sx={{ mb: 3 }}
                        >
                            Add Product
                        </Button>


                        {/* TOTAL */}

                        <Paper
                            sx={{
                                p: 2,
                                display: "flex",
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
                        sx={{ p: 3 }}
                    >

                        <Button
                            onClick={
                                handleCloseCreate
                            }
                        >
                            Cancel
                        </Button>


                        <Button
                            type="submit"
                            variant="contained"
                        >
                            Create Order
                        </Button>

                    </DialogActions>

                </Box>

            </Dialog>


            {/* =================================================
                VIEW ORDER DIALOG
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
                    Sales Order Details
                </DialogTitle>


                <DialogContent>

                    {selectedOrder && (
                        <>

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

                                    <Typography
                                        color="text.secondary"
                                    >
                                        Order Number
                                    </Typography>

                                    <Typography
                                        fontWeight="600"
                                    >
                                        {
                                            selectedOrder.orderNumber
                                        }
                                    </Typography>

                                </Box>


                                <Box>

                                    <Typography
                                        color="text.secondary"
                                    >
                                        Date
                                    </Typography>

                                    <Typography>
                                        {
                                            selectedOrder.orderDate
                                        }
                                    </Typography>

                                </Box>


                                <Box>

                                    <Typography
                                        color="text.secondary"
                                    >
                                        Customer
                                    </Typography>

                                    <Typography>
                                        {
                                            selectedOrder
                                                .customer
                                                ?.name
                                        }
                                    </Typography>

                                </Box>


                                <Box>

                                    <Typography
                                        color="text.secondary"
                                    >
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


                            <Typography
                                variant="h6"
                                sx={{ mb: 2 }}
                            >
                                Items
                            </Typography>


                            <TableContainer
                                component={
                                    Paper
                                }
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


                            {/* STATUS ACTIONS */}

                            <Box sx={{ mt: 3 }}>

                                <Typography
                                    variant="subtitle1"
                                    fontWeight="600"
                                    sx={{
                                        mb: 1,
                                    }}
                                >
                                    Change Status
                                </Typography>


                                <Stack
                                    direction="row"
                                    spacing={1}
                                    flexWrap="wrap"
                                >

                                    {[
                                        "PENDING",
                                        "CONFIRMED",
                                        "COMPLETED",
                                        "CANCELLED",
                                    ].map(
                                        (
                                            status
                                        ) => (

                                            <Button
                                                key={
                                                    status
                                                }
                                                variant={
                                                    selectedOrder.status ===
                                                    status
                                                        ? "contained"
                                                        : "outlined"
                                                }
                                                color={
                                                    status ===
                                                    "CANCELLED"
                                                        ? "error"
                                                        : "primary"
                                                }
                                                onClick={() =>
                                                    updateStatus(
                                                        selectedOrder.id,
                                                        status
                                                    )
                                                }
                                                disabled={
                                                    selectedOrder.status ===
                                                    status
                                                }
                                            >
                                                {
                                                    status
                                                }
                                            </Button>

                                        )
                                    )}

                                </Stack>

                            </Box>

                        </>
                    )}

                </DialogContent>


                <DialogActions
                    sx={{ p: 3 }}
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


export default SalesOrders;