package com.erp.backend.service;

import com.erp.backend.model.Product;
import com.erp.backend.model.PurchaseOrder;
import com.erp.backend.model.SalesOrder;
import com.erp.backend.repository.ProductRepository;
import com.erp.backend.repository.PurchaseOrderRepository;
import com.erp.backend.repository.SalesOrderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final SalesOrderRepository salesOrderRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ProductRepository productRepository;

    public DashboardService(
            SalesOrderRepository salesOrderRepository,
            PurchaseOrderRepository purchaseOrderRepository,
            ProductRepository productRepository) {

        this.salesOrderRepository = salesOrderRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.productRepository = productRepository;
    }

    // =========================
    // TOTAL SALES THIS MONTH
    // =========================
    public Map<String, Object> getSalesSummary() {

        YearMonth currentMonth = YearMonth.now();

        List<SalesOrder> orders = salesOrderRepository.findAll()
                .stream()
                .filter(order ->
                        order.getOrderDate() != null
                                && YearMonth.from(order.getOrderDate())
                                .equals(currentMonth)
                )
                .collect(Collectors.toList());

        BigDecimal totalSales = orders.stream()
                .map(SalesOrder::getTotalAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> summary = new HashMap<>();

        summary.put("month", currentMonth.toString());
        summary.put("totalOrders", orders.size());
        summary.put("totalSales", totalSales);

        return summary;
    }

    // =========================
    // TOTAL PURCHASES THIS MONTH
    // =========================
    public Map<String, Object> getPurchaseSummary() {

        YearMonth currentMonth = YearMonth.now();

        List<PurchaseOrder> orders = purchaseOrderRepository.findAll()
                .stream()
                .filter(order ->
                        order.getOrderDate() != null
                                && YearMonth.from(order.getOrderDate())
                                .equals(currentMonth)
                )
                .collect(Collectors.toList());

        BigDecimal totalPurchases = orders.stream()
                .map(PurchaseOrder::getTotalAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> summary = new HashMap<>();

        summary.put("month", currentMonth.toString());
        summary.put("totalOrders", orders.size());
        summary.put("totalPurchases", totalPurchases);

        return summary;
    }

    // =========================
    // LOW STOCK ALERTS
    // =========================
    public List<Product> getStockAlerts() {

        return productRepository.findAll()
                .stream()
                .filter(product ->
                        product.getStockQuantity() != null
                                && product.getReorderLevel() != null
                                && product.getStockQuantity()
                                <= product.getReorderLevel()
                )
                .collect(Collectors.toList());
    }

    // =========================
    // TOP SELLING PRODUCTS
    // =========================
    public List<Map<String, Object>> getTopSellingProducts() {

        Map<Long, Map<String, Object>> productSales = new HashMap<>();

        salesOrderRepository.findAll()
                .forEach(order -> {

                    if (order.getItems() == null) {
                        return;
                    }

                    order.getItems().forEach(item -> {

                        if (item.getProduct() == null
                                || item.getProduct().getId() == null
                                || item.getQuantity() == null) {
                            return;
                        }

                        Long productId = item.getProduct().getId();

                        Map<String, Object> data =
                                productSales.computeIfAbsent(
                                        productId,
                                        id -> {
                                            Map<String, Object> map =
                                                    new HashMap<>();

                                            map.put("productId", id);
                                            map.put(
                                                    "productName",
                                                    item.getProduct().getName()
                                            );
                                            map.put("quantitySold", 0);

                                            return map;
                                        }
                                );

                        int currentQuantity =
                                ((Number) data.get("quantitySold"))
                                        .intValue();

                        data.put(
                                "quantitySold",
                                currentQuantity + item.getQuantity()
                        );
                    });
                });

        return productSales.values()
                .stream()
                .sorted((a, b) ->
                        Integer.compare(
                                ((Number) b.get("quantitySold"))
                                        .intValue(),
                                ((Number) a.get("quantitySold"))
                                        .intValue()
                        )
                )
                .limit(5)
                .collect(Collectors.toList());
    }

    // =========================
    // SMART REORDER RECOMMENDATIONS
    // =========================
    public List<Map<String, Object>> getReorderRecommendations() {

        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysAgo = today.minusDays(30);

        List<SalesOrder> recentOrders = salesOrderRepository.findAll()
                .stream()
                .filter(order ->
                        order.getOrderDate() != null
                                && !order.getOrderDate().isBefore(thirtyDaysAgo)
                                && !order.getOrderDate().isAfter(today)
                )
                .collect(Collectors.toList());

        Map<Long, Integer> recentSales = new HashMap<>();

        for (SalesOrder order : recentOrders) {

            if (order.getItems() == null) {
                continue;
            }

            order.getItems().forEach(item -> {

                if (item.getProduct() == null
                        || item.getProduct().getId() == null
                        || item.getQuantity() == null) {
                    return;
                }

                Long productId = item.getProduct().getId();

                recentSales.merge(
                        productId,
                        item.getQuantity(),
                        Integer::sum
                );
            });
        }

        return productRepository.findAll()
                .stream()
                .filter(product ->
                        product.getStockQuantity() != null
                                && product.getReorderLevel() != null
                )
                .map(product -> {

                    Long productId = product.getId();

                    int currentStock = product.getStockQuantity();
                    int reorderLevel = product.getReorderLevel();

                    int salesLast30Days =
                            recentSales.getOrDefault(productId, 0);

                    double averageDailySales =
                            salesLast30Days / 30.0;

                    double daysOfStockRemaining;

                    if (averageDailySales > 0) {
                        daysOfStockRemaining =
                                currentStock / averageDailySales;
                    } else {
                        daysOfStockRemaining = 999;
                    }

                    String priority;

                    if (currentStock <= reorderLevel) {
                        priority = "HIGH";
                    } else if (averageDailySales > 0
                            && daysOfStockRemaining <= 14) {
                        priority = "MEDIUM";
                    } else {
                        priority = "LOW";
                    }

                    int recommendedQuantity = 0;

                    if (currentStock <= reorderLevel) {

                        recommendedQuantity =
                                Math.max(
                                        reorderLevel * 2 - currentStock,
                                        reorderLevel
                                );
                    }

                    Map<String, Object> recommendation =
                            new HashMap<>();

                    recommendation.put(
                            "productId",
                            productId
                    );

                    recommendation.put(
                            "productName",
                            product.getName()
                    );

                    recommendation.put(
                            "currentStock",
                            currentStock
                    );

                    recommendation.put(
                            "reorderLevel",
                            reorderLevel
                    );

                    recommendation.put(
                            "salesLast30Days",
                            salesLast30Days
                    );

                    recommendation.put(
                            "averageDailySales",
                            Math.round(
                                    averageDailySales * 100.0
                            ) / 100.0
                    );

                    recommendation.put(
                            "daysOfStockRemaining",
                            daysOfStockRemaining == 999
                                    ? null
                                    : Math.round(
                                    daysOfStockRemaining * 10.0
                            ) / 10.0
                    );

                    recommendation.put(
                            "priority",
                            priority
                    );

                    recommendation.put(
                            "recommendedQuantity",
                            recommendedQuantity
                    );

                    return recommendation;
                })
                .filter(recommendation ->
                        !"LOW".equals(
                                recommendation.get("priority")
                        )
                )
                .sorted((a, b) -> {

                    String priorityA =
                            (String) a.get("priority");

                    String priorityB =
                            (String) b.get("priority");

                    if (!priorityA.equals(priorityB)) {

                        if ("HIGH".equals(priorityA)) {
                            return -1;
                        }

                        if ("HIGH".equals(priorityB)) {
                            return 1;
                        }

                        if ("MEDIUM".equals(priorityA)) {
                            return -1;
                        }

                        return 1;
                    }

                    double daysA =
                            a.get("daysOfStockRemaining") == null
                                    ? Double.MAX_VALUE
                                    : ((Number) a.get(
                                    "daysOfStockRemaining"
                            )).doubleValue();

                    double daysB =
                            b.get("daysOfStockRemaining") == null
                                    ? Double.MAX_VALUE
                                    : ((Number) b.get(
                                    "daysOfStockRemaining"
                            )).doubleValue();

                    return Double.compare(daysA, daysB);
                })
                .collect(Collectors.toList());
    }
}