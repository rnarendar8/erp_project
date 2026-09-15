package com.erp.backend.controller;

import com.erp.backend.model.GoodsReceipt;
import com.erp.backend.service.GoodsReceiptService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goods-receipts")
public class GoodsReceiptController {

    private final GoodsReceiptService goodsReceiptService;

    public GoodsReceiptController(GoodsReceiptService goodsReceiptService) {
        this.goodsReceiptService = goodsReceiptService;
    }

    @PostMapping
    public GoodsReceipt createGoodsReceipt(
            @RequestBody GoodsReceipt goodsReceipt) {

        return goodsReceiptService.saveGoodsReceipt(goodsReceipt);
    }

    @GetMapping
    public List<GoodsReceipt> getAllGoodsReceipts() {
        return goodsReceiptService.getAllGoodsReceipts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoodsReceipt> getGoodsReceiptById(
            @PathVariable Long id) {

        return goodsReceiptService.getGoodsReceiptById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoodsReceipt(
            @PathVariable Long id) {

        if (goodsReceiptService.getGoodsReceiptById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        goodsReceiptService.deleteGoodsReceipt(id);

        return ResponseEntity.noContent().build();
    }
}