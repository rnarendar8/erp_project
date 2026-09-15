package com.erp.backend.service;

import com.erp.backend.model.Customer;
import com.erp.backend.model.Invoice;
import com.erp.backend.model.SalesOrder;
import com.erp.backend.repository.CustomerRepository;
import com.erp.backend.repository.InvoiceRepository;
import com.erp.backend.repository.SalesOrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private SalesOrderRepository salesOrderRepository;

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private InvoiceService invoiceService;


    @Test
    void shouldCreateInvoiceWithGST() {

        Customer customer = new Customer();
        customer.setId(1L);

        SalesOrder salesOrder = new SalesOrder();
        salesOrder.setId(10L);
        salesOrder.setOrderNumber("SO001");
        salesOrder.setStatus("CONFIRMED");
        salesOrder.setTotalAmount(new BigDecimal("10000"));
        salesOrder.setCustomer(customer);

        when(salesOrderRepository.findById(10L))
                .thenReturn(Optional.of(salesOrder));

        when(customerRepository.findById(1L))
                .thenReturn(Optional.of(customer));

        when(invoiceRepository.save(any(Invoice.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Invoice result =
                invoiceService.createInvoice(10L);

        assertEquals(
                "INV-SO001",
                result.getInvoiceNumber()
        );

        assertEquals(
                "UNPAID",
                result.getStatus()
        );

        assertEquals(
                new BigDecimal("1800"),
                result.getTax()
        );

        assertEquals(
                new BigDecimal("11800"),
                result.getTotalPayable()
        );

        assertEquals(
                customer,
                result.getCustomer()
        );

        assertEquals(
                salesOrder,
                result.getSalesOrder()
        );

        assertNotNull(result.getInvoiceDate());

        verify(salesOrderRepository)
                .findById(10L);

        verify(customerRepository)
                .findById(1L);

        verify(invoiceRepository)
                .save(any(Invoice.class));
    }


    @Test
    void shouldRejectInvoiceForUnconfirmedSalesOrder() {

        SalesOrder salesOrder = new SalesOrder();

        salesOrder.setId(10L);
        salesOrder.setOrderNumber("SO001");
        salesOrder.setStatus("PENDING");
        salesOrder.setTotalAmount(new BigDecimal("10000"));

        when(salesOrderRepository.findById(10L))
                .thenReturn(Optional.of(salesOrder));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> invoiceService.createInvoice(10L)
        );

        assertEquals(
                "Invoice can only be generated from a CONFIRMED Sales Order",
                exception.getMessage()
        );

        verify(invoiceRepository, never())
                .save(any(Invoice.class));
    }


    @Test
    void shouldRejectInvoiceWhenSalesOrderNotFound() {

        when(salesOrderRepository.findById(99L))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> invoiceService.createInvoice(99L)
        );

        assertEquals(
                "Sales Order not found with id: 99",
                exception.getMessage()
        );

        verify(invoiceRepository, never())
                .save(any(Invoice.class));
    }


    @Test
    void shouldRejectInvoiceWhenCustomerIsMissing() {

        SalesOrder salesOrder = new SalesOrder();

        salesOrder.setId(10L);
        salesOrder.setOrderNumber("SO001");
        salesOrder.setStatus("CONFIRMED");
        salesOrder.setTotalAmount(new BigDecimal("10000"));

        when(salesOrderRepository.findById(10L))
                .thenReturn(Optional.of(salesOrder));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> invoiceService.createInvoice(10L)
        );

        assertEquals(
                "Sales Order does not have a valid customer",
                exception.getMessage()
        );

        verify(customerRepository, never())
                .findById(anyLong());

        verify(invoiceRepository, never())
                .save(any(Invoice.class));
    }


    @Test
    void shouldMarkInvoiceAsPaid() {

        Invoice invoice = new Invoice();

        invoice.setId(1L);
        invoice.setStatus("UNPAID");

        when(invoiceRepository.findById(1L))
                .thenReturn(Optional.of(invoice));

        when(invoiceRepository.save(invoice))
                .thenReturn(invoice);

        Invoice result =
                invoiceService.markInvoiceAsPaid(1L);

        assertEquals(
                "PAID",
                result.getStatus()
        );

        verify(invoiceRepository)
                .findById(1L);

        verify(invoiceRepository)
                .save(invoice);
    }


    @Test
    void shouldThrowExceptionWhenInvoiceNotFound() {

        when(invoiceRepository.findById(99L))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> invoiceService.markInvoiceAsPaid(99L)
        );

        assertEquals(
                "Invoice not found with id: 99",
                exception.getMessage()
        );

        verify(invoiceRepository, never())
                .save(any(Invoice.class));
    }


    @Test
    void shouldGetAllInvoices() {

        Invoice invoice1 = new Invoice();
        Invoice invoice2 = new Invoice();

        when(invoiceRepository.findAll())
                .thenReturn(List.of(invoice1, invoice2));

        List<Invoice> result =
                invoiceService.getAllInvoices();

        assertEquals(2, result.size());

        verify(invoiceRepository)
                .findAll();
    }


    @Test
    void shouldGetInvoiceById() {

        Invoice invoice = new Invoice();
        invoice.setId(1L);

        when(invoiceRepository.findById(1L))
                .thenReturn(Optional.of(invoice));

        Optional<Invoice> result =
                invoiceService.getInvoiceById(1L);

        assertTrue(result.isPresent());

        assertEquals(
                1L,
                result.get().getId()
        );

        verify(invoiceRepository)
                .findById(1L);
    }
}