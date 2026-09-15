package com.erp.backend.controller;

import com.erp.backend.model.Product;
import com.erp.backend.service.ReportService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/overview")
    public Map<String, Object> getOverviewReport() {
        return reportService.getOverviewReport();
    }

    @GetMapping("/low-stock")
    public List<Product> getLowStockReport() {
        return reportService.getLowStockReport();
    }
}