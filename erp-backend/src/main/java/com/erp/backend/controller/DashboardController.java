package com.erp.backend.controller;

import com.erp.backend.model.Product;
import com.erp.backend.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    // =========================
    // SALES SUMMARY
    // =========================
    @GetMapping("/sales-summary")
    public Map<String, Object> getSalesSummary() {
        return dashboardService.getSalesSummary();
    }

    // =========================
    // PURCHASE SUMMARY
    // =========================
    @GetMapping("/purchase-summary")
    public Map<String, Object> getPurchaseSummary() {
        return dashboardService.getPurchaseSummary();
    }

    // =========================
    // LOW STOCK ALERTS
    // =========================
    @GetMapping("/stock-alerts")
    public List<Product> getStockAlerts() {
        return dashboardService.getStockAlerts();
    }

    // =========================
    // TOP SELLING PRODUCTS
    // =========================
    @GetMapping("/top-selling-products")
    public List<Map<String, Object>> getTopSellingProducts() {
        return dashboardService.getTopSellingProducts();
    }

    // =========================
    // SMART REORDER RECOMMENDATIONS
    // =========================
    @GetMapping("/reorder-recommendations")
    public List<Map<String, Object>> getReorderRecommendations() {
        return dashboardService.getReorderRecommendations();
    }
}