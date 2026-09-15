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


const emptySupplier = {
  supplierCode: "",
  name: "",
  phone: "",
  email: "",
  address: "",
  active: true,
};


function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    ...emptySupplier,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =========================
  // GET ALL SUPPLIERS
  // =========================
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/suppliers");

      setSuppliers(response.data);

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load suppliers"
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchSuppliers();
  }, []);


  // =========================
  // ADD SUPPLIER
  // =========================
  const handleOpenAdd = () => {
    setEditingId(null);

    setForm({
      ...emptySupplier,
    });

    setError("");
    setOpen(true);
  };


  // =========================
  // EDIT SUPPLIER
  // =========================
  const handleOpenEdit = (supplier) => {
    setEditingId(supplier.id);

    setForm({
      supplierCode: supplier.supplierCode || "",
      name: supplier.name || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      active: supplier.active ?? true,
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

    setForm({
      ...emptySupplier,
    });
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
  // SAVE / UPDATE
  // =========================
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");

      // Validation
      if (!form.supplierCode.trim()) {
        throw new Error("Supplier code is required");
      }

      if (!form.name.trim()) {
        throw new Error("Supplier name is required");
      }

      if (!form.phone.trim()) {
        throw new Error("Phone number is required");
      }

      if (!form.email.trim()) {
        throw new Error("Email is required");
      }

      if (!form.address.trim()) {
        throw new Error("Address is required");
      }


      const supplierData = {
        supplierCode: form.supplierCode.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        active: form.active,
      };


      // =========================
      // UPDATE SUPPLIER
      // =========================
      if (editingId) {
        await api.put(
          `/suppliers/${editingId}`,
          supplierData
        );
      }

      // =========================
      // CREATE SUPPLIER
      // =========================
      else {
        await api.post(
          "/suppliers",
          supplierData
        );
      }


      handleClose();

      await fetchSuppliers();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        err.message ||
        (
          editingId
            ? "Failed to update supplier"
            : "Failed to create supplier"
        )
      );
    }
  };


  // =========================
  // DELETE SUPPLIER
  // =========================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this supplier?"
    );

    if (!confirmed) {
      return;
    }


    try {
      setError("");

      await api.delete(`/suppliers/${id}`);

      await fetchSuppliers();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to delete supplier"
      );
    }
  };


  // =========================
  // SEARCH
  // =========================
  const filteredSuppliers = suppliers.filter((supplier) => {
    const searchText = search
      .toLowerCase()
      .trim();

    return (
      supplier.supplierCode
        ?.toLowerCase()
        .includes(searchText) ||

      supplier.name
        ?.toLowerCase()
        .includes(searchText) ||

      supplier.phone
        ?.toLowerCase()
        .includes(searchText) ||

      supplier.email
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
            Suppliers
          </Typography>

          <Typography color="text.secondary">
            Manage your suppliers and supplier details.
          </Typography>

        </Box>


        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenAdd}
        >
          Add Supplier
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


      {/* SEARCH */}
      <Paper sx={{ p: 2, mb: 3 }}>

        <TextField
          fullWidth
          placeholder="Search by code, name, phone or email..."
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


      {/* TABLE */}
      <TableContainer component={Paper}>

        <Table>

          <TableHead>

            <TableRow>

              <TableCell>
                <strong>ID</strong>
              </TableCell>

              <TableCell>
                <strong>Supplier Code</strong>
              </TableCell>

              <TableCell>
                <strong>Name</strong>
              </TableCell>

              <TableCell>
                <strong>Phone</strong>
              </TableCell>

              <TableCell>
                <strong>Email</strong>
              </TableCell>

              <TableCell>
                <strong>Address</strong>
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
                  Loading suppliers...
                </TableCell>

              </TableRow>

            ) : filteredSuppliers.length === 0 ? (

              <TableRow>

                <TableCell
                  colSpan={8}
                  align="center"
                >
                  No suppliers found.
                </TableCell>

              </TableRow>

            ) : (

              filteredSuppliers.map((supplier) => (

                <TableRow
                  key={supplier.id}
                  hover
                >

                  <TableCell>
                    {supplier.id}
                  </TableCell>


                  <TableCell>

                    <Typography fontWeight="500">
                      {supplier.supplierCode}
                    </Typography>

                  </TableCell>


                  <TableCell>
                    {supplier.name}
                  </TableCell>


                  <TableCell>
                    {supplier.phone}
                  </TableCell>


                  <TableCell>
                    {supplier.email}
                  </TableCell>


                  <TableCell>
                    {supplier.address}
                  </TableCell>


                  <TableCell>

                    <Chip
                      label={
                        supplier.active
                          ? "Active"
                          : "Inactive"
                      }
                      color={
                        supplier.active
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
                        handleOpenEdit(supplier)
                      }
                    >
                      <Edit />
                    </IconButton>


                    <IconButton
                      color="error"
                      onClick={() =>
                        handleDelete(supplier.id)
                      }
                    >
                      <Delete />
                    </IconButton>

                  </TableCell>

                </TableRow>

              ))

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
            ? "Edit Supplier"
            : "Add Supplier"}

        </DialogTitle>


        <Box
          component="form"
          onSubmit={handleSubmit}
        >

          <DialogContent>

            {/* SUPPLIER CODE */}
            <TextField
              fullWidth
              required
              label="Supplier Code"
              name="supplierCode"
              value={form.supplierCode}
              onChange={handleChange}
              margin="normal"
            />


            {/* NAME */}
            <TextField
              fullWidth
              required
              label="Supplier Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              margin="normal"
            />


            {/* PHONE */}
            <TextField
              fullWidth
              required
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              margin="normal"
            />


            {/* EMAIL */}
            <TextField
              fullWidth
              required
              type="email"
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              margin="normal"
            />


            {/* ADDRESS */}
            <TextField
              fullWidth
              required
              multiline
              minRows={2}
              label="Address"
              name="address"
              value={form.address}
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
              label="Active Supplier"
              sx={{ mt: 1 }}
            />

          </DialogContent>


          {/* BUTTONS */}
          <DialogActions sx={{ p: 3 }}>

            <Button onClick={handleClose}>
              Cancel
            </Button>


            <Button
              type="submit"
              variant="contained"
            >
              {editingId
                ? "Update Supplier"
                : "Save Supplier"}
            </Button>

          </DialogActions>

        </Box>

      </Dialog>

    </Box>
  );
}


export default Suppliers;