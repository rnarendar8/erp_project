package com.erp.backend.service;

import com.erp.backend.model.Customer;
import com.erp.backend.model.Invoice;
import com.erp.backend.model.SalesOrder;
import com.erp.backend.repository.CustomerRepository;
import com.erp.backend.repository.InvoiceRepository;
import com.erp.backend.repository.SalesOrderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final CustomerRepository customerRepository;

    public InvoiceService(
            InvoiceRepository invoiceRepository,
            SalesOrderRepository salesOrderRepository,
            CustomerRepository customerRepository) {

        this.invoiceRepository = invoiceRepository;
        this.salesOrderRepository = salesOrderRepository;
        this.customerRepository = customerRepository;
    }

    public Invoice createInvoice(Long salesOrderId) {

        // Find Sales Order
        SalesOrder salesOrder = salesOrderRepository.findById(salesOrderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Sales Order not found with id: " + salesOrderId
                        )
                );

        // Only confirmed sales orders can generate invoices
        if (!"CONFIRMED".equalsIgnoreCase(salesOrder.getStatus())) {
            throw new RuntimeException(
                    "Invoice can only be generated from a CONFIRMED Sales Order"
            );
        }

        // Find Customer
        if (salesOrder.getCustomer() == null
                || salesOrder.getCustomer().getId() == null) {

            throw new RuntimeException(
                    "Sales Order does not have a valid customer"
            );
        }

        Long customerId = salesOrder.getCustomer().getId();

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found with id: " + customerId
                        )
                );

        // Create Invoice
        Invoice invoice = new Invoice();

        invoice.setInvoiceNumber(
                "INV-" + salesOrder.getOrderNumber()
        );

        invoice.setInvoiceDate(LocalDate.now());

        invoice.setCustomer(customer);

        invoice.setSalesOrder(salesOrder);

        // Sales Order total
        BigDecimal orderTotal = salesOrder.getTotalAmount();

        if (orderTotal == null) {
            orderTotal = BigDecimal.ZERO;
        }

        // GST = 18%
        BigDecimal tax = orderTotal
                .multiply(BigDecimal.valueOf(18))
                .divide(BigDecimal.valueOf(100));

        BigDecimal totalPayable = orderTotal.add(tax);

        invoice.setTax(tax);

        invoice.setTotalPayable(totalPayable);

        invoice.setStatus("UNPAID");

        return invoiceRepository.save(invoice);
    }

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    public Optional<Invoice> getInvoiceById(Long id) {
        return invoiceRepository.findById(id);
    }

    // Mark invoice as paid
    public Invoice markInvoiceAsPaid(Long id) {

        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invoice not found with id: " + id
                        )
                );

        invoice.setStatus("PAID");

        return invoiceRepository.save(invoice);
    }
}