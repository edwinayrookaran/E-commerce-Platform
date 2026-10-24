package com.fudcyfoods.service;

import com.fudcyfoods.entity.Product;
import com.fudcyfoods.repository.OrderItemRepository;
import com.fudcyfoods.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    public ProductService(ProductRepository productRepository, OrderItemRepository orderItemRepository) {
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
    }

    public List<Product> getListedProducts() {
        return productRepository.findByListedTrue();
    }

    public List<Product> getAllProductsForAdmin() {
        return productRepository.findAll();
    }

    public Product getListedProductById(Long id) {
        return productRepository.findByIdAndListedTrue(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found: " + id));
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found: " + id));
    }

    public Product createProduct(Product product) {
        validateProduct(product);
        if (product.getName() != null) {
            product.setName(product.getName().trim());
        }
        product.setListed(true);
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product updatedProduct) {
        Product existingProduct = getProductById(id);
        validateProduct(updatedProduct);

        if (updatedProduct.getName() != null) {
            existingProduct.setName(updatedProduct.getName().trim());
        }
        existingProduct.setDescription(updatedProduct.getDescription());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setStockQuantity(updatedProduct.getStockQuantity());
        existingProduct.setCategory(updatedProduct.getCategory());
        existingProduct.setImageUrl(updatedProduct.getImageUrl());
        existingProduct.setPackageWeight(updatedProduct.getPackageWeight());
        existingProduct.setOriginalPrice(updatedProduct.getOriginalPrice());
        existingProduct.setListed(updatedProduct.isListed());

        return productRepository.save(existingProduct);
    }

    public String deleteOrHideProduct(Long id) {
        Product existingProduct = getProductById(id);
        if (orderItemRepository.existsByProductId(id)) {
            existingProduct.setListed(false);
            productRepository.save(existingProduct);
            return "HIDDEN";
        }
        productRepository.delete(existingProduct);
        return "DELETED";
    }

    public Product hideSampleProduct(String name) {
        List<Product> matches = productRepository.findByNameIgnoreCase(name);
        if (matches.isEmpty()) {
            return null;
        }
        Product product = matches.get(0);
        product.setListed(false);
        return productRepository.save(product);
    }

    private void validateProduct(Product product) {
        if (product.getPrice() == null || product.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Price must be greater than zero.");
        }
        if (product.getStockQuantity() == null || product.getStockQuantity() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock cannot be negative.");
        }
        if (product.getOriginalPrice() != null && product.getOriginalPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Original price cannot be negative.");
        }
    }
}
