package com.erp.backend.controller;

import com.erp.backend.model.Invoice;
import com.erp.backend.service.InvoicePdfService;
import com.erp.backend.service.InvoiceService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final InvoicePdfService invoicePdfService;

    public InvoiceController(
            InvoiceService invoiceService,
            InvoicePdfService invoicePdfService) {

        this.invoiceService = invoiceService;
        this.invoicePdfService = invoicePdfService;
    }

    @PostMapping
    public ResponseEntity<Invoice> createInvoice(
            @RequestParam Long salesOrderId) {

        return ResponseEntity.ok(
                invoiceService.createInvoice(salesOrderId)
        );
    }

    @GetMapping
    public List<Invoice> getAllInvoices() {
        return invoiceService.getAllInvoices();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getInvoiceById(
            @PathVariable Long id) {

        return invoiceService.getInvoiceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<Invoice> markInvoiceAsPaid(
            @PathVariable Long id) {

        try {
            return ResponseEntity.ok(
                    invoiceService.markInvoiceAsPaid(id)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> generateInvoicePdf(
            @PathVariable Long id) {

        byte[] pdf =
                invoicePdfService.generateInvoicePdf(id);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=invoice-" + id + ".pdf"
                )
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}