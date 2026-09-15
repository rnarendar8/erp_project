# ERP System for Inventory and Sales Management

A full-stack Enterprise Resource Planning (ERP) application developed using **Java Spring Boot** and **React** for managing products, customers, suppliers, sales orders, purchase orders, goods receipts, invoices, inventory, dashboard analytics, and reports.

---

## 📌 Project Overview

This ERP system provides a centralized platform for managing important business operations such as inventory, purchasing, sales, invoicing, and reporting.

The application uses a **Spring Boot REST API backend**, **React frontend**, and **PostgreSQL database**.

It also includes **JWT authentication**, **role-based access control**, **Swagger/OpenAPI documentation**, automated unit testing, and Postman API testing.

---

## ✨ Features

- JWT-based authentication
- Role-based access control
- Product management
- Customer management
- Supplier management
- Sales Order management
- Purchase Order management
- Goods Receipt Note (GRN) management
- Automatic inventory stock updates
- Stock availability validation
- Invoice generation
- Invoice PDF generation
- Invoice payment tracking
- Business dashboard
- Low stock alerts
- Top-selling products
- Smart inventory reorder recommendations
- Business reports
- REST APIs
- Swagger/OpenAPI documentation
- JUnit and Mockito unit testing
- Postman API testing

---

# 👥 User Roles

The system supports five roles:

| Role | Access |
|---|---|
| **Admin** | Full system access |
| **Sales Executive** | Customers, Sales Orders and Invoices |
| **Purchase Manager** | Suppliers, Purchase Orders and GRNs |
| **Inventory Manager** | Products, Suppliers, Purchase Orders and GRNs |
| **Accountant** | Customers, Suppliers, Sales Orders, Purchase Orders, GRNs and Invoices |

Access to protected APIs is controlled using **Spring Security and JWT-based authorization**.

---

# 🛠️ Technology Stack

## Backend

- Java 17
- Spring Boot
- Spring Security
- JWT
- Spring Data JPA
- PostgreSQL
- Maven
- REST APIs
- Swagger / OpenAPI
- OpenPDF

## Frontend

- React
- JavaScript
- Axios
- React Router
- HTML
- CSS

## Testing & Tools

- JUnit
- Mockito
- Postman
- Swagger UI
- IntelliJ IDEA
- Git
- GitHub

---

# 📦 Main Modules

## 1. Product Management

Manage product information including:

- SKU
- Product name
- Category
- Unit
- Price
- Stock quantity
- Reorder level
- Active status

---

## 2. Customer Management

Manage customer information used for sales operations.

Customers can be associated with Sales Orders and Invoices.

---

## 3. Supplier Management

Manage supplier information used during purchasing operations.

Suppliers are associated with Purchase Orders and Goods Receipt Notes.

---

## 4. Sales Order Management

Sales Orders are created for customers.

The system:

1. Selects a customer.
2. Selects products.
3. Validates available stock.
4. Calculates item totals.
5. Calculates the order total.
6. Updates inventory stock.
7. Allows order status management.
8. Generates an invoice after confirmation.

### Sales Flow

```text
Customer
    ↓
Sales Order
    ↓
Stock Availability Check
    ↓
Order Confirmation
    ↓
Invoice Generation
    ↓
Payment
```
## 5. Purchase Order Management

Purchase Orders are created for suppliers.

The system:

1. Selects a supplier
2. Selects products
3. Validates quantities
4. Calculates item totals
5. Calculates the total purchase amount
6. Manages purchase order status

### Purchase Order Status Flow

```text
PENDING
   ↓
CONFIRMED
   ↓
RECEIVING
   ↓
COMPLETED
```
## 6. Goods Receipt Note (GRN)

Goods Receipt Notes are used to record goods received from suppliers.

When goods are received, the system updates inventory stock.

### GRN Flow

```text
Purchase Order
      ↓
Goods Received
      ↓
GRN Created
      ↓
Inventory Stock Increased
```
## 7. Inventory Management

The inventory module tracks product stock levels.

The system supports:

1. Current stock tracking
2. Low stock detection
3. Reorder level monitoring
4. Stock increase through GRN
5. Stock reduction through Sales Orders
6. Smart reorder recommendations

## 8. Smart Inventory Reorder Recommendation

The system includes a Smart Inventory Reorder Recommendation feature.

Instead of relying only on a simple low-stock alert, the recommendation considers inventory and sales-related information such as:

1. Current stock
2. Reorder level
3. Recent sales
4. Replenishment priority


This helps identify products that require replenishment attention.

## 9. Invoice Management

Invoices can be generated from confirmed Sales Orders.

### Invoice Flow

```text
Confirmed Sales Order
        ↓
Invoice Generation
        ↓
Tax Calculation
        ↓
Total Payable
        ↓
UNPAID
        ↓
PAID
```

The system also supports generating invoices as PDF documents.

## 10. Dashboard

The dashboard provides an overview of business operations.

It includes:
1. Current stock
2. Total purchases
3. Low stock alerts
4. Top-selling products
5. Pending invoices
6. Smart reorder recommendations

## 11. Reports
The Reports module provides business and inventory information.

Current reports include:
1. Total products
2. Total stock
3. Stock value
4. Total Sales Orders
5. Total Purchase Orders
6. Total Goods Receipts
7. Total Invoices
8. Low-stock products

## 🔐 Authentication & Security
The application uses Spring Security with JWT authentication.

### Authentication Flow
```text
User Login
     ↓
Username & Password Validation
     ↓
Spring Security
     ↓
JWT Token Generated
     ↓
Token Stored by Frontend
     ↓
Token Sent with API Requests
     ↓
JWT Validation
     ↓
Role-Based Authorization
     ↓
Protected API Access
```
Authenticated requests include the JWT token in the Authorization header:
Authorization: Bearer <JWT_TOKEN>

## 🔌 REST APIs
The backend provides REST APIs for the major ERP modules.

### Main API groups include:
```text
/api/auth
/api/products
/api/customers
/api/suppliers
/api/sales-orders
/api/purchase-orders
/api/grn
/api/invoices
/api/dashboard
/api/reports
```
## 📖 Swagger / OpenAPI
Swagger/OpenAPI is integrated into the backend for API documentation and testing.

When the backend is running:
http://localhost:8080/swagger-ui.html

### Swagger can be used to:
1. View available APIs
2. View request/response structures
3. Test REST endpoints
4. Understand API documentation

## 🧪 Testing
The project includes unit testing using:
1. JUnit
2. Mockito

## Important business logic tested includes:
1. Sales Order creation
2. Sales Order total calculation
3. Stock reduction
4. Insufficient stock validation
5. Purchase Order creation
6. Purchase Order total calculation
7. Purchase Order validation
8. Purchase Order status transitions
9. Invoice creation
10. Invoice validation
11. Invoice payment status
12. Dashboard calculations
13. Low-stock detection

API testing was performed using Postman.

Swagger/OpenAPI was also used for API verification and testing.

## 🗄️ Database

The application uses PostgreSQL.

### Main entities include:
1. Users
2. Products
3. Customers
4. Suppliers
5. Sales Orders
6. Sales Order Items
7. Purchase Orders
8. Purchase Order Items
9. Goods Receipts
10. Invoices

## Example environment variables:
```text
DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET
```

## 🏗️ System Architecture
```text
                React Frontend
                      │
                      │ Axios / REST API
                      ↓
              Spring Boot Backend
                      │
          ┌───────────┴───────────┐
          │                       │
   Spring Security             Services
       + JWT                      │
          │                       ↓
          │                  Spring Data JPA
          │                       │
          └───────────────────────┤
                                  ↓
                             PostgreSQL
```
## 🔄 Business Workflows
### Purchasing Workflow
```text
Supplier
   ↓
Purchase Order
   ↓
Goods Receipt
   ↓
GRN
   ↓
Inventory Stock Increased
```
### Sales Workflow
```text
Customer
   ↓
Sales Order
   ↓
Stock Validation
   ↓
Stock Reduced
   ↓
Order Confirmation
   ↓
Invoice
   ↓
Payment
```
## 📁 Project Structure
```text
erp_project/
│
├── erp-backend/
│   │
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/erp/backend/
│   │   │   │
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   │
│   │   └── test/
│   │       └── java/
│   │           └── com/erp/backend/
│   │
│   └── pom.xml
│
├── erp-frontend/
│   │
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── postman/
│
├── .gitignore
│
└── README.md
```
## 🚀 How to Run the Project
### Backend
Navigate to the backend directory:

cd erp-backend

Run the Spring Boot application using IntelliJ IDEA or Maven.

### Backend URL:
http://localhost:8080

### Frontend
Navigate to the frontend directory:

cd erp-frontend
### Install dependencies:
npm install
### Start the React application:
npm run dev
### Frontend URL:
http://localhost:5173

## 🔑 Environment Configuration
Before running the backend, configure the required environment variables:
```text
DB_URL=jdbc:postgresql://localhost:5432/erp_db
DB_USERNAME=postgres
DB_PASSWORD=<your_database_password>
JWT_SECRET=<your_jwt_secret>
```
## 📌 Project Highlights
### Full-Stack Application

The project demonstrates end-to-end development using:

1. React frontend
2. Spring Boot REST backend
3. Spring Security
4. JWT authentication
5. PostgreSQL database

### Business Logic

The application implements:

1. Stock availability validation
2. Automatic stock reduction during sales
3. Automatic stock increase during goods receipt
4. Order total calculation
5. Invoice tax calculation
6. Invoice payment tracking
7. Purchase Order status management
8. Role-based authorization
9. Low stock detection
10. Smart reorder recommendations

## 🔮 Future Enhancements
Possible future improvements include:
- Email notifications
- QR code invoices
- CSV export
- Pagination
- Advanced filtering
- Role-based dashboard graphs
- Mobile-friendly interface

## 👨‍💻 Author
### Ramavath Narendar
B.Tech – Information Technology

Full-Stack Development Project

### One important correction

I intentionally **didn't claim features that we haven't confirmed are actually implemented**, such as email notifications or CSV export. Those are listed only under future enhancements.

Also, keep this README at:

```text
erp_project/
└── README.md
```