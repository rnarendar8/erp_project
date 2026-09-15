package com.erp.backend.service;

import com.erp.backend.model.Product;
import com.erp.backend.model.PurchaseOrder;
import com.erp.backend.model.SalesOrder;
import com.erp.backend.repository.ProductRepository;
import com.erp.backend.repository.PurchaseOrderRepository;
import com.erp.backend.repository.SalesOrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private SalesOrderRepository salesOrderRepository;

    @Mock
    private PurchaseOrderRepository purchaseOrderRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private DashboardService dashboardService;


    // =========================================================
    // SALES SUMMARY
    // =========================================================

    @Test
    void shouldCalculateSalesSummaryForCurrentMonth() {

        SalesOrder order1 = new SalesOrder();
        order1.setOrderDate(LocalDate.now());
        order1.setTotalAmount(new BigDecimal("10000"));

        SalesOrder order2 = new SalesOrder();
        order2.setOrderDate(LocalDate.now());
        order2.setTotalAmount(new BigDecimal("5000"));

        SalesOrder oldOrder = new SalesOrder();
        oldOrder.setOrderDate(
                LocalDate.now().minusMonths(1)
        );
        oldOrder.setTotalAmount(new BigDecimal("20000"));

        when(salesOrderRepository.findAll())
                .thenReturn(
                        List.of(
                                order1,
                                order2,
                                oldOrder
                        )
                );

        Map<String, Object> result =
                dashboardService.getSalesSummary();

        assertEquals(
                YearMonth.now().toString(),
                result.get("month")
        );

        assertEquals(
                2,
                result.get("totalOrders")
        );

        assertEquals(
                new BigDecimal("15000"),
                result.get("totalSales")
        );

        verify(salesOrderRepository)
                .findAll();
    }


    // =========================================================
    // SALES SUMMARY - NULL AMOUNT
    // =========================================================

    @Test
    void shouldIgnoreSalesOrdersWithNullAmount() {

        SalesOrder order1 = new SalesOrder();
        order1.setOrderDate(LocalDate.now());
        order1.setTotalAmount(null);

        SalesOrder order2 = new SalesOrder();
        order2.setOrderDate(LocalDate.now());
        order2.setTotalAmount(new BigDecimal("5000"));

        when(salesOrderRepository.findAll())
                .thenReturn(
                        List.of(order1, order2)
                );

        Map<String, Object> result =
                dashboardService.getSalesSummary();

        assertEquals(
                2,
                result.get("totalOrders")
        );

        assertEquals(
                new BigDecimal("5000"),
                result.get("totalSales")
        );
    }


    // =========================================================
    // PURCHASE SUMMARY
    // =========================================================

    @Test
    void shouldCalculatePurchaseSummaryForCurrentMonth() {

        PurchaseOrder order1 = new PurchaseOrder();
        order1.setOrderDate(LocalDate.now());
        order1.setTotalAmount(new BigDecimal("12000"));

        PurchaseOrder order2 = new PurchaseOrder();
        order2.setOrderDate(LocalDate.now());
        order2.setTotalAmount(new BigDecimal("8000"));

        PurchaseOrder oldOrder = new PurchaseOrder();
        oldOrder.setOrderDate(
                LocalDate.now().minusMonths(1)
        );
        oldOrder.setTotalAmount(new BigDecimal("30000"));

        when(purchaseOrderRepository.findAll())
                .thenReturn(
                        List.of(
                                order1,
                                order2,
                                oldOrder
                        )
                );

        Map<String, Object> result =
                dashboardService.getPurchaseSummary();

        assertEquals(
                YearMonth.now().toString(),
                result.get("month")
        );

        assertEquals(
                2,
                result.get("totalOrders")
        );

        assertEquals(
                new BigDecimal("20000"),
                result.get("totalPurchases")
        );

        verify(purchaseOrderRepository)
                .findAll();
    }


    // =========================================================
    // PURCHASE SUMMARY - NULL AMOUNT
    // =========================================================

    @Test
    void shouldIgnorePurchaseOrdersWithNullAmount() {

        PurchaseOrder order1 = new PurchaseOrder();
        order1.setOrderDate(LocalDate.now());
        order1.setTotalAmount(null);

        PurchaseOrder order2 = new PurchaseOrder();
        order2.setOrderDate(LocalDate.now());
        order2.setTotalAmount(new BigDecimal("7000"));

        when(purchaseOrderRepository.findAll())
                .thenReturn(
                        List.of(order1, order2)
                );

        Map<String, Object> result =
                dashboardService.getPurchaseSummary();

        assertEquals(
                2,
                result.get("totalOrders")
        );

        assertEquals(
                new BigDecimal("7000"),
                result.get("totalPurchases")
        );
    }


    // =========================================================
    // LOW STOCK ALERTS
    // =========================================================

    @Test
    void shouldReturnProductsWithLowStock() {

        Product lowStockProduct = new Product();
        lowStockProduct.setId(1L);
        lowStockProduct.setName("Laptop");
        lowStockProduct.setStockQuantity(5);
        lowStockProduct.setReorderLevel(10);

        Product normalStockProduct = new Product();
        normalStockProduct.setId(2L);
        normalStockProduct.setName("Mouse");
        normalStockProduct.setStockQuantity(50);
        normalStockProduct.setReorderLevel(10);

        Product exactReorderProduct = new Product();
        exactReorderProduct.setId(3L);
        exactReorderProduct.setName("Keyboard");
        exactReorderProduct.setStockQuantity(10);
        exactReorderProduct.setReorderLevel(10);

        when(productRepository.findAll())
                .thenReturn(
                        List.of(
                                lowStockProduct,
                                normalStockProduct,
                                exactReorderProduct
                        )
                );

        List<Product> result =
                dashboardService.getStockAlerts();

        assertEquals(
                2,
                result.size()
        );

        assertTrue(
                result.contains(lowStockProduct)
        );

        assertTrue(
                result.contains(exactReorderProduct)
        );

        assertFalse(
                result.contains(normalStockProduct)
        );

        verify(productRepository)
                .findAll();
    }


    // =========================================================
    // LOW STOCK - NULL VALUES
    // =========================================================

    @Test
    void shouldIgnoreProductsWithNullStockValues() {

        Product nullStock = new Product();
        nullStock.setId(1L);
        nullStock.setName("Product A");
        nullStock.setStockQuantity(null);
        nullStock.setReorderLevel(10);

        Product nullReorderLevel = new Product();
        nullReorderLevel.setId(2L);
        nullReorderLevel.setName("Product B");
        nullReorderLevel.setStockQuantity(5);
        nullReorderLevel.setReorderLevel(null);

        Product validProduct = new Product();
        validProduct.setId(3L);
        validProduct.setName("Product C");
        validProduct.setStockQuantity(5);
        validProduct.setReorderLevel(10);

        when(productRepository.findAll())
                .thenReturn(
                        List.of(
                                nullStock,
                                nullReorderLevel,
                                validProduct
                        )
                );

        List<Product> result =
                dashboardService.getStockAlerts();

        assertEquals(
                1,
                result.size()
        );

        assertEquals(
                validProduct,
                result.get(0)
        );
    }


    // =========================================================
    // NO LOW STOCK PRODUCTS
    // =========================================================

    @Test
    void shouldReturnEmptyListWhenNoProductsAreLowStock() {

        Product product = new Product();

        product.setId(1L);
        product.setName("Laptop");
        product.setStockQuantity(100);
        product.setReorderLevel(10);

        when(productRepository.findAll())
                .thenReturn(List.of(product));

        List<Product> result =
                dashboardService.getStockAlerts();

        assertTrue(
                result.isEmpty()
        );

        verify(productRepository)
                .findAll();
    }
}