import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Paper,
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
  Search,
} from "@mui/icons-material";

import api from "../services/api";


const emptyProduct = {
  name: "",
  sku: "",
  category: "",
  price: "",
  stockQuantity: "",
  reorderLevel: "",
  unit: "PCS",
  active: true,
};


function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyProduct);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);


  // =========================
  // GET ALL PRODUCTS
  // =========================
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/products");

      setProducts(response.data);

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load products"
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProducts();
  }, []);


  // =========================
  // OPEN ADD PRODUCT
  // =========================
  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({ ...emptyProduct });
    setError("");
    setOpen(true);
  };


  // =========================
  // OPEN EDIT PRODUCT
  // =========================
  const handleOpenEdit = (product) => {
    setEditingId(product.id);

    setForm({
      name: product.name || "",
      sku: product.sku || "",
      category: product.category || "",
      price: product.price ?? "",
      stockQuantity: product.stockQuantity ?? "",
      reorderLevel: product.reorderLevel ?? "",
      unit: product.unit || "PCS",
      active: product.active ?? true,
    });

    setError("");
    setOpen(true);
  };


  // =========================
  // CLOSE DIALOG
  // =========================
  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setForm({ ...emptyProduct });
  };


  // =========================
  // FORM CHANGE
  // =========================
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // =========================
  // SAVE / UPDATE PRODUCT
  // =========================
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");

      // Basic validation
      if (!form.name.trim()) {
        throw new Error("Product name is required");
      }

      if (!form.sku.trim()) {
        throw new Error("SKU is required");
      }

      if (!form.category.trim()) {
        throw new Error("Category is required");
      }

      if (form.price === "" || Number(form.price) < 0) {
        throw new Error("Enter a valid price");
      }

      if (
        form.stockQuantity === "" ||
        Number(form.stockQuantity) < 0
      ) {
        throw new Error("Enter a valid stock quantity");
      }

      if (
        form.reorderLevel === "" ||
        Number(form.reorderLevel) < 0
      ) {
        throw new Error("Enter a valid reorder level");
      }

      if (!form.unit.trim()) {
        throw new Error("Unit is required");
      }


      const productData = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        category: form.category.trim(),
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        reorderLevel: Number(form.reorderLevel),
        unit: form.unit.trim(),
        active: form.active,
      };


      // =========================
      // CREATE OR UPDATE
      // =========================
      if (editingId) {
        await api.put(
          `/products/${editingId}`,
          productData
        );
      } else {
        await api.post(
          "/products",
          productData
        );
      }


      // Close form
      handleClose();

      // Refresh products
      await fetchProducts();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        err.message ||
        (
          editingId
            ? "Failed to update product"
            : "Failed to create product"
        )
      );
    }
  };


  // =========================
  // DELETE PRODUCT
  // =========================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }


    try {
      setError("");

      await api.delete(`/products/${id}`);

      await fetchProducts();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to delete product"
      );
    }
  };


  // =========================
  // SEARCH
  // =========================
  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase().trim();

    return (
      product.name
        ?.toLowerCase()
        .includes(searchText) ||

      product.sku
        ?.toLowerCase()
        .includes(searchText) ||

      product.category
        ?.toLowerCase()
        .includes(searchText)
    );
  });


  // =========================
  // UI
  // =========================
  return (
    <Box sx={{ p: 4 }}>

      {/* PAGE HEADER */}
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
            Products
          </Typography>

          <Typography color="text.secondary">
            Manage your products and inventory.
          </Typography>
        </Box>


        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenAdd}
        >
          Add Product
        </Button>

      </Box>


      {/* ERROR MESSAGE */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}


      {/* SEARCH */}
      <Paper sx={{ p: 2, mb: 3 }}>

        <TextField
          fullWidth
          placeholder="Search by product name, SKU or category..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          InputProps={{
            startAdornment: (
              <Search
                sx={{
                  mr: 1,
                  color: "text.secondary",
                }}
              />
            ),
          }}
        />

      </Paper>


      {/* PRODUCTS TABLE */}
      <TableContainer component={Paper}>

        <Table>

          <TableHead>

            <TableRow>

              <TableCell>
                <strong>ID</strong>
              </TableCell>

              <TableCell>
                <strong>Product</strong>
              </TableCell>

              <TableCell>
                <strong>SKU</strong>
              </TableCell>

              <TableCell>
                <strong>Category</strong>
              </TableCell>

              <TableCell>
                <strong>Price</strong>
              </TableCell>

              <TableCell>
                <strong>Stock</strong>
              </TableCell>

              <TableCell>
                <strong>Unit</strong>
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

            {/* LOADING */}
            {loading ? (

              <TableRow>

                <TableCell
                  colSpan={9}
                  align="center"
                >
                  Loading products...
                </TableCell>

              </TableRow>

            ) : filteredProducts.length === 0 ? (

              /* EMPTY */

              <TableRow>

                <TableCell
                  colSpan={9}
                  align="center"
                >
                  No products found.
                </TableCell>

              </TableRow>

            ) : (

              /* PRODUCTS */

              filteredProducts.map((product) => {

                const lowStock =
                  Number(product.stockQuantity) <=
                  Number(product.reorderLevel);


                return (

                  <TableRow
                    key={product.id}
                    hover
                  >

                    <TableCell>
                      {product.id}
                    </TableCell>


                    <TableCell>

                      <Typography fontWeight="500">
                        {product.name}
                      </Typography>

                    </TableCell>


                    <TableCell>
                      {product.sku}
                    </TableCell>


                    <TableCell>
                      {product.category}
                    </TableCell>


                    <TableCell>
                      ₹
                      {Number(product.price).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                        }
                      )}
                    </TableCell>


                    <TableCell>

                      <Chip
                        label={`${product.stockQuantity}${
                          lowStock
                            ? " • Low"
                            : ""
                        }`}
                        color={
                          lowStock
                            ? "warning"
                            : "default"
                        }
                        size="small"
                      />

                    </TableCell>


                    <TableCell>
                      {product.unit}
                    </TableCell>


                    <TableCell>

                      <Chip
                        label={
                          product.active
                            ? "Active"
                            : "Inactive"
                        }
                        color={
                          product.active
                            ? "success"
                            : "default"
                        }
                        size="small"
                      />

                    </TableCell>


                    <TableCell align="right">

                      <IconButton
                        color="primary"
                        onClick={() =>
                          handleOpenEdit(product)
                        }
                      >
                        <Edit />
                      </IconButton>


                      <IconButton
                        color="error"
                        onClick={() =>
                          handleDelete(product.id)
                        }
                      >
                        <Delete />
                      </IconButton>

                    </TableCell>

                  </TableRow>

                );
              })

            )}

          </TableBody>

        </Table>

      </TableContainer>


      {/* ADD / EDIT DIALOG */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle>
          {editingId
            ? "Edit Product"
            : "Add Product"}
        </DialogTitle>


        <Box
          component="form"
          onSubmit={handleSubmit}
        >

          <DialogContent>

            {/* PRODUCT NAME */}
            <TextField
              fullWidth
              required
              label="Product Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              margin="normal"
            />


            {/* SKU */}
            <TextField
              fullWidth
              required
              label="SKU"
              name="sku"
              value={form.sku}
              onChange={handleChange}
              margin="normal"
            />


            {/* CATEGORY */}
            <TextField
              fullWidth
              required
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              margin="normal"
            />


            {/* PRICE */}
            <TextField
              fullWidth
              required
              type="number"
              label="Price"
              name="price"
              value={form.price}
              onChange={handleChange}
              margin="normal"
              inputProps={{
                min: 0,
                step: "0.01",
              }}
            />


            {/* STOCK */}
            <TextField
              fullWidth
              required
              type="number"
              label="Stock Quantity"
              name="stockQuantity"
              value={form.stockQuantity}
              onChange={handleChange}
              margin="normal"
              inputProps={{
                min: 0,
              }}
            />


            {/* REORDER LEVEL */}
            <TextField
              fullWidth
              required
              type="number"
              label="Reorder Level"
              name="reorderLevel"
              value={form.reorderLevel}
              onChange={handleChange}
              margin="normal"
              inputProps={{
                min: 0,
              }}
            />


            {/* UNIT */}
            <TextField
              fullWidth
              required
              label="Unit"
              name="unit"
              value={form.unit}
              onChange={handleChange}
              margin="normal"
            />


            {/* ACTIVE */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.active}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      active:
                        event.target.checked,
                    }))
                  }
                />
              }
              label="Active Product"
              sx={{ mt: 1 }}
            />

          </DialogContent>


          {/* DIALOG BUTTONS */}
          <DialogActions sx={{ p: 3 }}>

            <Button onClick={handleClose}>
              Cancel
            </Button>


            <Button
              type="submit"
              variant="contained"
            >
              {editingId
                ? "Update Product"
                : "Save Product"}
            </Button>

          </DialogActions>

        </Box>

      </Dialog>

    </Box>
  );
}


export default Products;