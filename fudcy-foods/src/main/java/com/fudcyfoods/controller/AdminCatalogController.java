package com.fudcyfoods.controller;

import com.fudcyfoods.entity.Product;
import com.fudcyfoods.service.ProductService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminCatalogController {

    private final ProductService productService;

    public AdminCatalogController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/products")
    public List<Product> getAllProducts() {
        return productService.getAllProductsForAdmin();
    }
}
