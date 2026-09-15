package com.erp.backend.service;

import com.erp.backend.model.Product;
import com.erp.backend.model.PurchaseOrder;
import com.erp.backend.model.PurchaseOrderItem;
import com.erp.backend.model.Supplier;
import com.erp.backend.repository.ProductRepository;
import com.erp.backend.repository.PurchaseOrderRepository;
import com.erp.backend.repository.SupplierRepository;
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
class PurchaseOrderServiceTest {

    @Mock
    private PurchaseOrderRepository purchaseOrderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private SupplierRepository supplierRepository;

    @InjectMocks
    private PurchaseOrderService purchaseOrderService;


    @Test
    void shouldCreatePurchaseOrderAndCalculateTotal() {

        Supplier supplier = new Supplier();
        supplier.setId(1L);

        Product product = new Product();
        product.setId(10L);
        product.setName("Laptop");

        PurchaseOrderItem item = new PurchaseOrderItem();
        item.setQuantity(5);
        item.setUnitPrice(new BigDecimal("20000"));
        item.setProduct(product);

        PurchaseOrder order = new PurchaseOrder();
        order.setSupplier(supplier);
        order.setItems(List.of(item));

        when(purchaseOrderRepository.count())
                .thenReturn(0L);

        when(purchaseOrderRepository.findByOrderNumber("PO001"))
                .thenReturn(Optional.empty());

        when(supplierRepository.findById(1L))
                .thenReturn(Optional.of(supplier));

        when(productRepository.findById(10L))
                .thenReturn(Optional.of(product));

        when(purchaseOrderRepository.save(order))
                .thenReturn(order);

        PurchaseOrder result =
                purchaseOrderService.savePurchaseOrder(order);

        assertEquals(
                "PO001",
                result.getOrderNumber()
        );

        assertEquals(
                "PENDING",
                result.getStatus()
        );

        assertEquals(
                new BigDecimal("100000"),
                result.getTotalAmount()
        );

        assertEquals(
                new BigDecimal("100000"),
                item.getTotalPrice()
        );

        verify(supplierRepository).findById(1L);
        verify(productRepository).findById(10L);
        verify(purchaseOrderRepository).save(order);
    }


    @Test
    void shouldRejectZeroQuantity() {

        PurchaseOrderItem item = new PurchaseOrderItem();

        item.setQuantity(0);
        item.setUnitPrice(new BigDecimal("1000"));

        PurchaseOrder order = new PurchaseOrder();
        order.setItems(List.of(item));

        when(purchaseOrderRepository.count())
                .thenReturn(0L);

        when(purchaseOrderRepository.findByOrderNumber("PO001"))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> purchaseOrderService.savePurchaseOrder(order)
        );

        assertEquals(
                "Quantity must be greater than zero",
                exception.getMessage()
        );

        verify(purchaseOrderRepository, never())
                .save(any(PurchaseOrder.class));
    }


    @Test
    void shouldRejectNegativeUnitPrice() {

        PurchaseOrderItem item = new PurchaseOrderItem();

        item.setQuantity(2);
        item.setUnitPrice(new BigDecimal("-100"));

        PurchaseOrder order = new PurchaseOrder();
        order.setItems(List.of(item));

        when(purchaseOrderRepository.count())
                .thenReturn(0L);

        when(purchaseOrderRepository.findByOrderNumber("PO001"))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> purchaseOrderService.savePurchaseOrder(order)
        );

        assertEquals(
                "Unit price cannot be negative",
                exception.getMessage()
        );

        verify(purchaseOrderRepository, never())
                .save(any(PurchaseOrder.class));
    }


    @Test
    void shouldUpdatePendingPurchaseOrder() {

        PurchaseOrder existingOrder = new PurchaseOrder();

        existingOrder.setId(1L);
        existingOrder.setOrderNumber("PO001");
        existingOrder.setStatus("PENDING");

        PurchaseOrder updatedOrder = new PurchaseOrder();

        updatedOrder.setItems(List.of());

        when(purchaseOrderRepository.findById(1L))
                .thenReturn(Optional.of(existingOrder));

        when(purchaseOrderRepository.save(updatedOrder))
                .thenReturn(updatedOrder);

        PurchaseOrder result =
                purchaseOrderService.updatePurchaseOrder(
                        1L,
                        updatedOrder
                );

        assertEquals(
                1L,
                result.getId()
        );

        assertEquals(
                "PO001",
                result.getOrderNumber()
        );

        verify(purchaseOrderRepository)
                .findById(1L);

        verify(purchaseOrderRepository)
                .save(updatedOrder);
    }


    @Test
    void shouldRejectUpdateForNonPendingOrder() {

        PurchaseOrder existingOrder = new PurchaseOrder();

        existingOrder.setId(1L);
        existingOrder.setOrderNumber("PO001");
        existingOrder.setStatus("CONFIRMED");

        PurchaseOrder updatedOrder = new PurchaseOrder();

        when(purchaseOrderRepository.findById(1L))
                .thenReturn(Optional.of(existingOrder));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> purchaseOrderService.updatePurchaseOrder(
                        1L,
                        updatedOrder
                )
        );

        assertEquals(
                "Only PENDING Purchase Orders can be edited",
                exception.getMessage()
        );

        verify(purchaseOrderRepository, never())
                .save(any(PurchaseOrder.class));
    }


    @Test
    void shouldUpdateStatusFromPendingToConfirmed() {

        PurchaseOrder order = new PurchaseOrder();

        order.setId(1L);
        order.setStatus("PENDING");

        when(purchaseOrderRepository.findById(1L))
                .thenReturn(Optional.of(order));

        when(purchaseOrderRepository.save(order))
                .thenReturn(order);

        PurchaseOrder result =
                purchaseOrderService.updatePurchaseOrderStatus(
                        1L,
                        "CONFIRMED"
                );

        assertEquals(
                "CONFIRMED",
                result.getStatus()
        );

        verify(purchaseOrderRepository)
                .save(order);
    }


    @Test
    void shouldRejectInvalidStatusTransition() {

        PurchaseOrder order = new PurchaseOrder();

        order.setId(1L);
        order.setStatus("PENDING");

        when(purchaseOrderRepository.findById(1L))
                .thenReturn(Optional.of(order));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> purchaseOrderService.updatePurchaseOrderStatus(
                        1L,
                        "COMPLETED"
                )
        );

        assertTrue(
                exception.getMessage()
                        .contains("Invalid status transition")
        );

        verify(purchaseOrderRepository, never())
                .save(any(PurchaseOrder.class));
    }


    @Test
    void shouldDeletePendingPurchaseOrder() {

        PurchaseOrder order = new PurchaseOrder();

        order.setId(1L);
        order.setStatus("PENDING");

        when(purchaseOrderRepository.findById(1L))
                .thenReturn(Optional.of(order));

        purchaseOrderService.deletePurchaseOrder(1L);

        verify(purchaseOrderRepository)
                .findById(1L);

        verify(purchaseOrderRepository)
                .delete(order);
    }


    @Test
    void shouldRejectDeletingNonPendingPurchaseOrder() {

        PurchaseOrder order = new PurchaseOrder();

        order.setId(1L);
        order.setStatus("CONFIRMED");

        when(purchaseOrderRepository.findById(1L))
                .thenReturn(Optional.of(order));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> purchaseOrderService.deletePurchaseOrder(1L)
        );

        assertEquals(
                "Only PENDING Purchase Orders can be deleted",
                exception.getMessage()
        );

        verify(purchaseOrderRepository, never())
                .delete(any(PurchaseOrder.class));
    }
}