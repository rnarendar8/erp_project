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


const emptyCustomer = {
  customerCode: "",
  name: "",
  phone: "",
  email: "",
  address: "",
  active: true,
};


function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    ...emptyCustomer,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =========================
  // GET ALL CUSTOMERS
  // =========================
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/customers");

      setCustomers(response.data);

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load customers"
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchCustomers();
  }, []);


  // =========================
  // ADD CUSTOMER
  // =========================
  const handleOpenAdd = () => {
    setEditingId(null);

    setForm({
      ...emptyCustomer,
    });

    setError("");
    setOpen(true);
  };


  // =========================
  // EDIT CUSTOMER
  // =========================
  const handleOpenEdit = (customer) => {
    setEditingId(customer.id);

    setForm({
      customerCode: customer.customerCode || "",
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      active: customer.active ?? true,
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
      ...emptyCustomer,
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
      if (!form.customerCode.trim()) {
        throw new Error("Customer code is required");
      }

      if (!form.name.trim()) {
        throw new Error("Customer name is required");
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


      const customerData = {
        customerCode: form.customerCode.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        active: form.active,
      };


      // =========================
      // UPDATE CUSTOMER
      // =========================
      if (editingId) {
        await api.put(
          `/customers/${editingId}`,
          customerData
        );
      }

      // =========================
      // CREATE CUSTOMER
      // =========================
      else {
        await api.post(
          "/customers",
          customerData
        );
      }


      handleClose();

      await fetchCustomers();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        err.message ||
        (
          editingId
            ? "Failed to update customer"
            : "Failed to create customer"
        )
      );
    }
  };


  // =========================
  // DELETE CUSTOMER
  // =========================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) {
      return;
    }


    try {
      setError("");

      await api.delete(`/customers/${id}`);

      await fetchCustomers();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to delete customer"
      );
    }
  };


  // =========================
  // SEARCH
  // =========================
  const filteredCustomers = customers.filter((customer) => {
    const searchText = search
      .toLowerCase()
      .trim();

    return (
      customer.customerCode
        ?.toLowerCase()
        .includes(searchText) ||

      customer.name
        ?.toLowerCase()
        .includes(searchText) ||

      customer.phone
        ?.toLowerCase()
        .includes(searchText) ||

      customer.email
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
            Customers
          </Typography>

          <Typography color="text.secondary">
            Manage your customers and customer details.
          </Typography>

        </Box>


        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenAdd}
        >
          Add Customer
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
                <strong>Customer Code</strong>
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
                  Loading customers...
                </TableCell>

              </TableRow>

            ) : filteredCustomers.length === 0 ? (

              <TableRow>

                <TableCell
                  colSpan={8}
                  align="center"
                >
                  No customers found.
                </TableCell>

              </TableRow>

            ) : (

              filteredCustomers.map((customer) => (

                <TableRow
                  key={customer.id}
                  hover
                >

                  <TableCell>
                    {customer.id}
                  </TableCell>


                  <TableCell>

                    <Typography fontWeight="500">
                      {customer.customerCode}
                    </Typography>

                  </TableCell>


                  <TableCell>
                    {customer.name}
                  </TableCell>


                  <TableCell>
                    {customer.phone}
                  </TableCell>


                  <TableCell>
                    {customer.email}
                  </TableCell>


                  <TableCell>
                    {customer.address}
                  </TableCell>


                  <TableCell>

                    <Chip
                      label={
                        customer.active
                          ? "Active"
                          : "Inactive"
                      }
                      color={
                        customer.active
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
                        handleOpenEdit(customer)
                      }
                    >
                      <Edit />
                    </IconButton>


                    <IconButton
                      color="error"
                      onClick={() =>
                        handleDelete(customer.id)
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
            ? "Edit Customer"
            : "Add Customer"}

        </DialogTitle>


        <Box
          component="form"
          onSubmit={handleSubmit}
        >

          <DialogContent>

            {/* CUSTOMER CODE */}
            <TextField
              fullWidth
              required
              label="Customer Code"
              name="customerCode"
              value={form.customerCode}
              onChange={handleChange}
              margin="normal"
            />


            {/* NAME */}
            <TextField
              fullWidth
              required
              label="Customer Name"
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
              label="Active Customer"
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
                ? "Update Customer"
                : "Save Customer"}
            </Button>

          </DialogActions>

        </Box>

      </Dialog>

    </Box>
  );
}


export default Customers;