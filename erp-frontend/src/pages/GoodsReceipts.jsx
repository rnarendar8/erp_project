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
    Visibility,
} from "@mui/icons-material";

const createEmptyForm = () => ({
    receiptNumber: "",
    receiptDate: new Date()
        .toISOString()
        .split("T")[0],
    status: "RECEIVED",
    purchaseOrderId: "",
    items: [],
});

function GoodsReceipts() {
    const [receipts, setReceipts] = useState([]);
    const [purchaseOrders, setPurchaseOrders] =
        useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [openForm, setOpenForm] = useState(false);
    const [openView, setOpenView] = useState(false);

    const [selectedReceipt, setSelectedReceipt] =
        useState(null);

    const [form, setForm] =
        useState(createEmptyForm());

    // =========================================================
    // LOAD DATA
    // =========================================================

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                receiptsResponse,
                purchaseOrdersResponse,
            ] = await Promise.all([
                api.get("/goods-receipts"),
                api.get("/purchase-orders"),
            ]);

            setReceipts(receiptsResponse.data);
            setPurchaseOrders(
                purchaseOrdersResponse.data
            );
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                    err.response?.data ||
                    err.message ||
                    "Failed to load goods receipts"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // =========================================================
    // GENERATE RECEIPT NUMBER
    // =========================================================

    const generateReceiptNumber = () => {
        return `GRN${String(
            receipts.length + 1
        ).padStart(3, "0")}`;
    };

    // =========================================================
    // OPEN CREATE
    // =========================================================

    const handleOpenCreate = () => {
        setForm({
            ...createEmptyForm(),
            receiptNumber:
                generateReceiptNumber(),
        });

        setError("");
        setOpenForm(true);
    };

    // =========================================================
    // CLOSE CREATE
    // =========================================================

    const handleCloseForm = () => {
        setOpenForm(false);

        setForm(
            createEmptyForm()
        );
    };

    // =========================================================
    // PURCHASE ORDER CHANGE
    // =========================================================

    const handlePurchaseOrderChange = (
        event
    ) => {
        const purchaseOrderId =
            event.target.value;

        const purchaseOrder =
            purchaseOrders.find(
                (order) =>
                    String(order.id) ===
                    String(purchaseOrderId)
            );

        if (!purchaseOrder) {
            setForm((previous) => ({
                ...previous,
                purchaseOrderId,
                items: [],
            }));

            return;
        }

        const items =
            purchaseOrder.items?.map(
                (item) => ({
                    productId:
                        item.product?.id,

                    productName:
                        item.product?.name ||
                        "Unknown Product",

                    sku:
                        item.product?.sku ||
                        "",

                    orderedQuantity:
                        item.quantity || 0,

                    receivedQuantity: 0,
                })
            ) || [];

        setForm((previous) => ({
            ...previous,
            purchaseOrderId,
            items,
        }));
    };

    // =========================================================
    // BASIC FIELD CHANGE
    // =========================================================

    const handleBasicChange = (
        event
    ) => {
        const {
            name,
            value,
        } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // =========================================================
    // RECEIVED QUANTITY CHANGE
    // =========================================================

    const handleReceivedQuantityChange =
        (index, value) => {
            setForm((previous) => {
                const updatedItems =
                    [...previous.items];

                updatedItems[index] = {
                    ...updatedItems[index],
                    receivedQuantity:
                        value,
                };

                return {
                    ...previous,
                    items: updatedItems,
                };
            });
        };

    // =========================================================
    // TOTAL RECEIVED
    // =========================================================

    const totalReceived = useMemo(() => {
        return form.items.reduce(
            (
                total,
                item
            ) =>
                total +
                Number(
                    item.receivedQuantity ||
                        0
                ),
            0
        );
    }, [form.items]);

    // =========================================================
    // SAVE GRN
    // =========================================================

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        try {
            setError("");

            if (
                !form.receiptNumber.trim()
            ) {
                throw new Error(
                    "Receipt number is required"
                );
            }

            if (!form.receiptDate) {
                throw new Error(
                    "Receipt date is required"
                );
            }

            if (
                !form.purchaseOrderId
            ) {
                throw new Error(
                    "Please select a purchase order"
                );
            }

            if (
                form.items.length === 0
            ) {
                throw new Error(
                    "Selected purchase order has no items"
                );
            }

            const purchaseOrder =
                purchaseOrders.find(
                    (order) =>
                        String(
                            order.id
                        ) ===
                        String(
                            form.purchaseOrderId
                        )
                );

            if (!purchaseOrder) {
                throw new Error(
                    "Purchase order not found"
                );
            }

            // Validate quantities
            for (
                const item of form.items
            ) {
                const received =
                    Number(
                        item.receivedQuantity ||
                            0
                    );

                const ordered =
                    Number(
                        item.orderedQuantity ||
                            0
                    );

                if (received < 0) {
                    throw new Error(
                        `Received quantity cannot be negative for ${item.productName}`
                    );
                }

                if (
                    received >
                    ordered
                ) {
                    throw new Error(
                        `Received quantity for ${item.productName} cannot exceed ordered quantity (${ordered})`
                    );
                }
            }

            const goodsReceiptItems =
                form.items
                    .filter(
                        (item) =>
                            Number(
                                item.receivedQuantity ||
                                    0
                            ) > 0
                    )
                    .map(
                        (item) => ({
                            product: {
                                id:
                                    item.productId,
                            },

                            receivedQuantity:
                                Number(
                                    item.receivedQuantity
                                ),
                        })
                    );

            if (
                goodsReceiptItems.length ===
                0
            ) {
                throw new Error(
                    "Enter received quantity for at least one product"
                );
            }

            const goodsReceipt = {
                receiptNumber:
                    form.receiptNumber.trim(),

                receiptDate:
                    form.receiptDate,

                status:
                    form.status,

                purchaseOrder: {
                    id:
                        purchaseOrder.id,
                },

                items:
                    goodsReceiptItems,
            };

            await api.post(
                "/goods-receipts",
                goodsReceipt
            );

            handleCloseForm();

            await loadData();
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                    err.response?.data ||
                    err.message ||
                    "Failed to create goods receipt"
            );
        }
    };

    // =========================================================
    // DELETE
    // =========================================================

    const handleDelete = async (
        id
    ) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to delete this goods receipt?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await api.delete(
                `/goods-receipts/${id}`
            );

            await loadData();
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                    err.response?.data ||
                    err.message ||
                    "Failed to delete goods receipt"
            );
        }
    };

    // =========================================================
    // VIEW
    // =========================================================

    const handleView = async (
        receipt
    ) => {
        try {
            setError("");

            const response =
                await api.get(
                    `/goods-receipts/${receipt.id}`
                );

            setSelectedReceipt(
                response.data
            );

            setOpenView(true);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                    err.response?.data ||
                    err.message ||
                    "Failed to load goods receipt"
            );
        }
    };

    // =========================================================
    // SEARCH
    // =========================================================

    const filteredReceipts =
        receipts.filter(
            (receipt) => {
                const searchText =
                    search
                        .toLowerCase()
                        .trim();

                const receiptNumber =
                    receipt.receiptNumber
                        ?.toLowerCase() ||
                    "";

                const status =
                    receipt.status
                        ?.toLowerCase() ||
                    "";

                const orderNumber =
                    receipt
                        .purchaseOrder
                        ?.orderNumber
                        ?.toLowerCase() ||
                    "";

                return (
                    receiptNumber.includes(
                        searchText
                    ) ||
                    status.includes(
                        searchText
                    ) ||
                    orderNumber.includes(
                        searchText
                    )
                );
            }
        );

    // =========================================================
    // STATUS COLOR
    // =========================================================

    const getStatusColor = (
        status
    ) => {
        switch (status) {
            case "RECEIVED":
                return "success";

            case "PARTIAL":
                return "warning";

            case "CANCELLED":
                return "error";

            default:
                return "default";
        }
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
                    alignItems:
                        "center",
                    mb: 3,
                }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        fontWeight="600"
                    >
                        Goods Receipts
                    </Typography>

                    <Typography
                        color="text.secondary"
                    >
                        Receive products against purchase orders.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={
                        <Add />
                    }
                    onClick={
                        handleOpenCreate
                    }
                >
                    Create GRN
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
                    {typeof error ===
                    "string"
                        ? error
                        : JSON.stringify(
                              error
                          )}
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
                    label="Search Goods Receipts"
                    placeholder="Receipt number, PO number or status..."
                    value={search}
                    onChange={(
                        event
                    ) =>
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
                                <strong>
                                    ID
                                </strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    Receipt Number
                                </strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    Date
                                </strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    Purchase Order
                                </strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    Items
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
                                    colSpan={
                                        7
                                    }
                                    align="center"
                                >
                                    Loading goods receipts...
                                </TableCell>
                            </TableRow>
                        ) : filteredReceipts.length ===
                          0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={
                                        7
                                    }
                                    align="center"
                                >
                                    No goods receipts found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredReceipts.map(
                                (
                                    receipt
                                ) => (
                                    <TableRow
                                        hover
                                        key={
                                            receipt.id
                                        }
                                    >

                                        <TableCell>
                                            {
                                                receipt.id
                                            }
                                        </TableCell>

                                        <TableCell>
                                            <Typography
                                                fontWeight="600"
                                            >
                                                {
                                                    receipt.receiptNumber
                                                }
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            {
                                                receipt.receiptDate
                                            }
                                        </TableCell>

                                        <TableCell>
                                            {
                                                receipt
                                                    .purchaseOrder
                                                    ?.orderNumber ||
                                                "-"
                                            }
                                        </TableCell>

                                        <TableCell>
                                            {
                                                receipt
                                                    .items
                                                    ?.length ||
                                                0
                                            }
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={
                                                    receipt.status ||
                                                    "-"
                                                }
                                                color={getStatusColor(
                                                    receipt.status
                                                )}
                                                size="small"
                                            />
                                        </TableCell>

                                        <TableCell align="right">

                                            <IconButton
                                                color="primary"
                                                title="View"
                                                onClick={() =>
                                                    handleView(
                                                        receipt
                                                    )
                                                }
                                            >
                                                <Visibility />
                                            </IconButton>

                                            <IconButton
                                                color="error"
                                                title="Delete"
                                                onClick={() =>
                                                    handleDelete(
                                                        receipt.id
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
                CREATE GRN DIALOG
            ================================================= */}

            <Dialog
                open={openForm}
                onClose={
                    handleCloseForm
                }
                fullWidth
                maxWidth="lg"
            >

                <DialogTitle>
                    Create Goods Receipt
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
                                md: "row",
                            }}
                            spacing={2}
                            sx={{
                                mb: 3,
                            }}
                        >

                            <TextField
                                fullWidth
                                required
                                label="Receipt Number"
                                name="receiptNumber"
                                value={
                                    form.receiptNumber
                                }
                                onChange={
                                    handleBasicChange
                                }
                            />

                            <TextField
                                fullWidth
                                required
                                type="date"
                                label="Receipt Date"
                                name="receiptDate"
                                value={
                                    form.receiptDate
                                }
                                onChange={
                                    handleBasicChange
                                }
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />

                            <FormControl
                                fullWidth
                            >
                                <InputLabel>
                                    Status
                                </InputLabel>

                                <Select
                                    name="status"
                                    value={
                                        form.status
                                    }
                                    label="Status"
                                    onChange={
                                        handleBasicChange
                                    }
                                >
                                    <MenuItem value="RECEIVED">
                                        RECEIVED
                                    </MenuItem>

                                    <MenuItem value="PARTIAL">
                                        PARTIAL
                                    </MenuItem>

                                    <MenuItem value="CANCELLED">
                                        CANCELLED
                                    </MenuItem>
                                </Select>
                            </FormControl>

                        </Stack>

                        {/* PURCHASE ORDER */}

                        <FormControl
                            fullWidth
                            required
                            sx={{
                                mb: 3,
                            }}
                        >

                            <InputLabel>
                                Purchase Order
                            </InputLabel>

                            <Select
                                value={
                                    form.purchaseOrderId
                                }
                                label="Purchase Order"
                                onChange={
                                    handlePurchaseOrderChange
                                }
                            >

                                {purchaseOrders
                                    .filter(
                                        (
                                            order
                                        ) =>
                                            order.status !==
                                            "CANCELLED"
                                    )
                                    .map(
                                        (
                                            order
                                        ) => (
                                            <MenuItem
                                                key={
                                                    order.id
                                                }
                                                value={
                                                    order.id
                                                }
                                            >
                                                {
                                                    order.orderNumber
                                                }{" "}
                                                —{" "}
                                                {
                                                    order
                                                        .supplier
                                                        ?.name
                                                }{" "}
                                                —{" "}
                                                {
                                                    order.orderDate
                                                }
                                            </MenuItem>
                                        )
                                    )}

                            </Select>

                        </FormControl>

                        {/* ITEMS */}

                        {form.items.length >
                        0 ? (
                            <>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        mb: 2,
                                    }}
                                >
                                    Products to Receive
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
                                                    SKU
                                                </TableCell>

                                                <TableCell align="right">
                                                    Ordered
                                                </TableCell>

                                                <TableCell>
                                                    Received
                                                </TableCell>

                                                <TableCell align="right">
                                                    Remaining
                                                </TableCell>

                                            </TableRow>
                                        </TableHead>

                                        <TableBody>

                                            {form.items.map(
                                                (
                                                    item,
                                                    index
                                                ) => {

                                                    const remaining =
                                                        Number(
                                                            item.orderedQuantity ||
                                                                0
                                                        ) -
                                                        Number(
                                                            item.receivedQuantity ||
                                                                0
                                                        );

                                                    return (
                                                        <TableRow
                                                            key={
                                                                item.productId
                                                            }
                                                        >

                                                            <TableCell>
                                                                <Typography fontWeight="600">
                                                                    {
                                                                        item.productName
                                                                    }
                                                                </Typography>
                                                            </TableCell>

                                                            <TableCell>
                                                                {
                                                                    item.sku ||
                                                                    "-"
                                                                }
                                                            </TableCell>

                                                            <TableCell align="right">
                                                                {
                                                                    item.orderedQuantity
                                                                }
                                                            </TableCell>

                                                            <TableCell>

                                                                <TextField
                                                                    type="number"
                                                                    size="small"
                                                                    value={
                                                                        item.receivedQuantity
                                                                    }
                                                                    onChange={(
                                                                        event
                                                                    ) =>
                                                                        handleReceivedQuantityChange(
                                                                            index,
                                                                            event
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    inputProps={{
                                                                        min: 0,
                                                                        max: item.orderedQuantity,
                                                                    }}
                                                                    sx={{
                                                                        width: 130,
                                                                    }}
                                                                />

                                                            </TableCell>

                                                            <TableCell align="right">

                                                                <Chip
                                                                    label={
                                                                        remaining
                                                                    }
                                                                    color={
                                                                        remaining ===
                                                                        0
                                                                            ? "success"
                                                                            : "default"
                                                                    }
                                                                    size="small"
                                                                />

                                                            </TableCell>

                                                        </TableRow>
                                                    );
                                                }
                                            )}

                                        </TableBody>

                                    </Table>

                                </TableContainer>

                                <Box
                                    sx={{
                                        mt: 3,
                                        display:
                                            "flex",
                                        justifyContent:
                                            "flex-end",
                                    }}
                                >

                                    <Paper
                                        sx={{
                                            p: 2,
                                            minWidth: 220,
                                        }}
                                    >

                                        <Typography
                                            color="text.secondary"
                                        >
                                            Total Quantity Received
                                        </Typography>

                                        <Typography
                                            variant="h5"
                                            fontWeight="700"
                                        >
                                            {
                                                totalReceived
                                            }
                                        </Typography>

                                    </Paper>

                                </Box>
                            </>
                        ) : (
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 4,
                                    textAlign:
                                        "center",
                                }}
                            >
                                <Typography
                                    color="text.secondary"
                                >
                                    Select a purchase order to see its products.
                                </Typography>
                            </Paper>
                        )}

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
                            disabled={
                                form.items.length ===
                                0
                            }
                        >
                            Create GRN
                        </Button>

                    </DialogActions>

                </Box>

            </Dialog>

            {/* =================================================
                VIEW GRN DIALOG
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
                    Goods Receipt Details
                </DialogTitle>

                <DialogContent>

                    {selectedReceipt && (
                        <>

                            <Stack
                                direction={{
                                    xs: "column",
                                    sm: "row",
                                }}
                                spacing={4}
                                sx={{
                                    mb: 3,
                                }}
                            >

                                <Box>
                                    <Typography
                                        color="text.secondary"
                                    >
                                        Receipt Number
                                    </Typography>

                                    <Typography fontWeight="600">
                                        {
                                            selectedReceipt.receiptNumber
                                        }
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography
                                        color="text.secondary"
                                    >
                                        Receipt Date
                                    </Typography>

                                    <Typography>
                                        {
                                            selectedReceipt.receiptDate
                                        }
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography
                                        color="text.secondary"
                                    >
                                        Purchase Order
                                    </Typography>

                                    <Typography fontWeight="600">
                                        {
                                            selectedReceipt
                                                .purchaseOrder
                                                ?.orderNumber ||
                                            "-"
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
                                            selectedReceipt.status ||
                                            "-"
                                        }
                                        color={getStatusColor(
                                            selectedReceipt.status
                                        )}
                                        size="small"
                                    />
                                </Box>

                            </Stack>

                            <Typography
                                variant="h6"
                                sx={{
                                    mb: 2,
                                }}
                            >
                                Received Products
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
                                                SKU
                                            </TableCell>

                                            <TableCell align="right">
                                                Received Quantity
                                            </TableCell>

                                        </TableRow>
                                    </TableHead>

                                    <TableBody>

                                        {selectedReceipt.items?.map(
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
                                                            item
                                                                .product
                                                                ?.sku
                                                        }
                                                    </TableCell>

                                                    <TableCell align="right">
                                                        {
                                                            item.receivedQuantity
                                                        }
                                                    </TableCell>

                                                </TableRow>
                                            )
                                        )}

                                    </TableBody>

                                </Table>

                            </TableContainer>

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

export default GoodsReceipts;