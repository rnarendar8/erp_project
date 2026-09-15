package com.erp.backend.service;

import com.erp.backend.model.Customer;
import com.erp.backend.model.Product;
import com.erp.backend.model.SalesOrder;
import com.erp.backend.model.SalesOrderItem;
import com.erp.backend.repository.CustomerRepository;
import com.erp.backend.repository.ProductRepository;
import com.erp.backend.repository.SalesOrderRepository;
import org.junit.jupiter.api.BeforeEach;
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
class SalesOrderServiceTest {

    @Mock
    private SalesOrderRepository salesOrderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private SalesOrderService salesOrderService;


    @BeforeEach
    void setUp() {
        // Mockito initializes mocks automatically.
    }


    @Test
    void shouldCalculateOrderTotalAndReduceStock() {

        Customer customer = new Customer();
        customer.setId(1L);

        Product product = new Product();
        product.setId(10L);
        product.setName("Laptop");
        product.setStockQuantity(20);

        SalesOrderItem item = new SalesOrderItem();
        item.setQuantity(2);
        item.setUnitPrice(new BigDecimal("50000"));
        item.setProduct(product);

        SalesOrder order = new SalesOrder();
        order.setCustomer(customer);
        order.setItems(List.of(item));

        when(customerRepository.findById(1L))
                .thenReturn(Optional.of(customer));

        when(productRepository.findById(10L))
                .thenReturn(Optional.of(product));

        when(salesOrderRepository.save(order))
                .thenReturn(order);

        SalesOrder result =
                salesOrderService.saveSalesOrder(order);

        assertEquals(
                new BigDecimal("100000"),
                result.getTotalAmount()
        );

        assertEquals(
                new BigDecimal("100000"),
                item.getTotalPrice()
        );

        assertEquals(
                18,
                product.getStockQuantity()
        );

        verify(productRepository).save(product);
        verify(salesOrderRepository).save(order);
    }


    @Test
    void shouldRejectOrderWhenStockIsInsufficient() {

        Customer customer = new Customer();
        customer.setId(1L);

        Product product = new Product();
        product.setId(10L);
        product.setName("Laptop");
        product.setStockQuantity(5);

        SalesOrderItem item = new SalesOrderItem();
        item.setQuantity(10);
        item.setUnitPrice(new BigDecimal("50000"));
        item.setProduct(product);

        SalesOrder order = new SalesOrder();
        order.setCustomer(customer);
        order.setItems(List.of(item));

        when(customerRepository.findById(1L))
                .thenReturn(Optional.of(customer));

        when(productRepository.findById(10L))
                .thenReturn(Optional.of(product));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> salesOrderService.saveSalesOrder(order)
        );

        assertTrue(
                exception.getMessage()
                        .contains("Insufficient stock")
        );

        verify(productRepository, never())
                .save(product);

        verify(salesOrderRepository, never())
                .save(any(SalesOrder.class));
    }


    @Test
    void shouldUpdateSalesOrderStatus() {

        SalesOrder order = new SalesOrder();
        order.setId(1L);
        order.setStatus("PENDING");

        when(salesOrderRepository.findById(1L))
                .thenReturn(Optional.of(order));

        when(salesOrderRepository.save(order))
                .thenReturn(order);

        SalesOrder result =
                salesOrderService.updateSalesOrderStatus(
                        1L,
                        "CONFIRMED"
                );

        assertEquals(
                "CONFIRMED",
                result.getStatus()
        );

        verify(salesOrderRepository).save(order);
    }


    @Test
    void shouldThrowExceptionWhenSalesOrderNotFound() {

        when(salesOrderRepository.findById(99L))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> salesOrderService.updateSalesOrderStatus(
                        99L,
                        "CONFIRMED"
                )
        );

        assertTrue(
                exception.getMessage()
                        .contains("Sales Order not found")
        );

        verify(salesOrderRepository, never())
                .save(any(SalesOrder.class));
    }


    @Test
    void shouldGetAllSalesOrders() {

        SalesOrder order1 = new SalesOrder();
        SalesOrder order2 = new SalesOrder();

        when(salesOrderRepository.findAll())
                .thenReturn(List.of(order1, order2));

        List<SalesOrder> result =
                salesOrderService.getAllSalesOrders();

        assertEquals(2, result.size());

        verify(salesOrderRepository).findAll();
    }


    @Test
    void shouldGetSalesOrderById() {

        SalesOrder order = new SalesOrder();
        order.setId(1L);

        when(salesOrderRepository.findById(1L))
                .thenReturn(Optional.of(order));

        Optional<SalesOrder> result =
                salesOrderService.getSalesOrderById(1L);

        assertTrue(result.isPresent());
        assertEquals(1L, result.get().getId());

        verify(salesOrderRepository).findById(1L);
    }
}