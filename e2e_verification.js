const assert = require('assert');

const BASE_URL = 'http://localhost:8080';

async function runTests() {
  console.log('=== FUDCY FOODS COMPREHENSIVE END-TO-END VERIFICATION ===\n');

  // 1. PUBLIC PRODUCT CATALOGUE
  console.log('1. Testing Public Product Catalogue GET /api/products...');
  const prodRes = await fetch(`${BASE_URL}/api/products`);
  assert.strictEqual(prodRes.status, 200);
  const products = await prodRes.json();
  console.log(`✓ Loaded ${products.length} listed products.`);
  assert.ok(products.length >= 20, 'Expected at least 20 products');

  // Verify single product GET /api/products/:id
  const sampleProduct = products[0];
  console.log(`\n2. Testing Single Product GET /api/products/${sampleProduct.id}...`);
  const singleRes = await fetch(`${BASE_URL}/api/products/${sampleProduct.id}`);
  assert.strictEqual(singleRes.status, 200);
  const singleProduct = await singleRes.json();
  assert.strictEqual(singleProduct.name, sampleProduct.name);
  console.log(`✓ Product #${singleProduct.id} (${singleProduct.name}) loaded successfully. Stock: ${singleProduct.stockQuantity}`);

  // Test invalid product ID
  console.log('\n3. Testing Invalid Product ID GET /api/products/999999...');
  const invalidProdRes = await fetch(`${BASE_URL}/api/products/999999`);
  assert.strictEqual(invalidProdRes.status, 404);
  console.log('✓ Invalid product ID correctly returned 404 Not Found.');

  // 4. CUSTOMER REGISTRATION AND LOGIN
  console.log('\n4. Testing Customer Registration & Login...');
  const uniqueEmail = `test_customer_${Date.now()}@fudcytest.com`;
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Priya Nambiar',
      email: uniqueEmail,
      password: 'password123',
    }),
  });
  assert.strictEqual(regRes.status, 201);
  const regData = await regRes.json();
  assert.ok(regData.token, 'Token must be issued');
  assert.strictEqual(regData.user.email, uniqueEmail);
  assert.strictEqual(regData.user.role, 'CUSTOMER');
  assert.ok(!regData.user.passwordHash, 'Password hash must never be exposed');
  console.log(`✓ Customer registered: ${regData.user.name} (#${regData.user.id}). Token issued.`);

  const customerToken = regData.token;

  // Login with customer
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: uniqueEmail,
      password: 'password123',
    }),
  });
  assert.strictEqual(loginRes.status, 200);
  console.log('✓ Customer login verified with correct credentials.');

  // Test invalid login
  const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: uniqueEmail,
      password: 'wrongpassword',
    }),
  });
  assert.strictEqual(badLoginRes.status, 401);
  console.log('✓ Invalid password correctly rejected with 401 Unauthorized.');

  // Test customer accessing admin endpoint (should be 403 Forbidden)
  console.log('\n5. Testing Security: Customer access to Admin endpoint...');
  const forbiddenRes = await fetch(`${BASE_URL}/api/admin/stats`, {
    headers: { 'Authorization': `Bearer ${customerToken}` },
  });
  assert.strictEqual(forbiddenRes.status, 403);
  console.log('✓ Customer attempt to access /api/admin/stats correctly rejected with 403 Forbidden.');

  // 6. ORDER CREATION, STOCK DEDUCTION & COD CHECKOUT
  console.log('\n6. Testing Order Creation & Stock Deduction...');
  const initialStock = singleProduct.stockQuantity;
  const orderPhone = '9876543210';
  const orderQty = 2;

  const orderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`,
    },
    body: JSON.stringify({
      customerName: 'Priya Nambiar',
      phone: orderPhone,
      email: uniqueEmail,
      deliveryAddress: 'Flat 3C, Marine Drive, Kochi, Kerala 682011',
      items: [{ productId: singleProduct.id, quantity: orderQty }],
    }),
  });
  assert.strictEqual(orderRes.status, 201);
  const createdOrder = await orderRes.json();
  assert.ok(createdOrder.id, 'Order ID must exist');
  assert.strictEqual(createdOrder.status, 'PLACED');
  assert.strictEqual(createdOrder.customerId, regData.user.id);
  assert.strictEqual(Number(createdOrder.totalAmount), Number(singleProduct.price) * orderQty);
  console.log(`✓ Order #${createdOrder.id} placed successfully. Total: ₹${createdOrder.totalAmount}, Customer: #${createdOrder.customerId}`);

  // Verify stock was deducted
  const afterOrderProdRes = await fetch(`${BASE_URL}/api/products/${singleProduct.id}`);
  const afterOrderProd = await afterOrderProdRes.json();
  assert.strictEqual(afterOrderProd.stockQuantity, initialStock - orderQty);
  console.log(`✓ Stock deducted: ${initialStock} -> ${afterOrderProd.stockQuantity}`);

  // 7. ORDER SUCCESS / DETAILS RETRIEVAL BY ID
  console.log('\n7. Testing Order Success Retrieval GET /api/orders/:id...');
  // As order owner (with JWT)
  const successRes = await fetch(`${BASE_URL}/api/orders/${createdOrder.id}`, {
    headers: { 'Authorization': `Bearer ${customerToken}` },
  });
  assert.strictEqual(successRes.status, 200);
  const successOrder = await successRes.json();
  assert.strictEqual(successOrder.id, createdOrder.id);
  assert.strictEqual(successOrder.customerName, 'Priya Nambiar');
  assert.strictEqual(successOrder.deliveryAddress, 'Flat 3C, Marine Drive, Kochi, Kerala 682011');
  assert.ok(successOrder.items.length === 1);
  assert.strictEqual(successOrder.items[0].quantity, orderQty);
  console.log(`✓ Order Success details retrieved securely by owner. Items: ${successOrder.items[0].productName} × ${successOrder.items[0].quantity}`);

  // Guest order success retrieval with matching phone
  const guestSuccessRes = await fetch(`${BASE_URL}/api/orders/${createdOrder.id}?phone=${orderPhone}`);
  assert.strictEqual(guestSuccessRes.status, 200);
  console.log('✓ Order Success details retrieved by guest with verified phone number.');

  // Unauthorized access attempt without phone or token
  const unauthSuccessRes = await fetch(`${BASE_URL}/api/orders/${createdOrder.id}`);
  assert.strictEqual(unauthSuccessRes.status, 400); // Phone required for unauthenticated access
  console.log('✓ Unauthorized access attempt to order without phone correctly rejected.');

  // Unauthorized access attempt with wrong phone
  const wrongPhoneRes = await fetch(`${BASE_URL}/api/orders/${createdOrder.id}?phone=9999999999`);
  assert.strictEqual(wrongPhoneRes.status, 404);
  console.log('✓ Order lookup with mismatched phone correctly returned 404.');

  // 8. ADMIN LOGIN & DASHBOARD STATS
  console.log('\n8. Testing Admin Login & Dashboard Stats...');
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@fudcyfoods.com',
      password: 'Admin@123',
    }),
  });
  assert.strictEqual(adminLoginRes.status, 200);
  const adminAuth = await adminLoginRes.json();
  assert.strictEqual(adminAuth.user.role, 'ADMIN');
  const adminToken = adminAuth.token;
  console.log(`✓ Admin logged in: ${adminAuth.user.name} (${adminAuth.user.email}). Role: ADMIN.`);

  const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  assert.strictEqual(statsRes.status, 200);
  const stats = await statsRes.json();
  console.log('✓ Admin dashboard stats:', {
    totalProducts: stats.totalProducts,
    totalOrders: stats.totalOrders,
    registeredCustomers: stats.registeredCustomers,
    totalSales: stats.totalSales,
    recentOrdersCount: stats.recentOrders.length,
  });
  assert.ok(stats.totalOrders >= 1);
  assert.ok(stats.registeredCustomers >= 1);

  // 9. ADMIN ORDERS MANAGEMENT & STATUS UPDATE
  console.log('\n9. Testing Admin Orders GET /api/admin/orders & Status Update...');
  const adminOrdersRes = await fetch(`${BASE_URL}/api/admin/orders`, {
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  assert.strictEqual(adminOrdersRes.status, 200);
  const adminOrders = await adminOrdersRes.json();
  console.log(`✓ Admin retrieved ${adminOrders.length} orders.`);

  // Admin inspect single order
  const adminSingleOrderRes = await fetch(`${BASE_URL}/api/admin/orders/${createdOrder.id}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  assert.strictEqual(adminSingleOrderRes.status, 200);
  const adminSingleOrder = await adminSingleOrderRes.json();
  assert.strictEqual(adminSingleOrder.id, createdOrder.id);
  console.log(`✓ Admin retrieved single order #${adminSingleOrder.id} with items.`);

  // Admin update order status to CONFIRMED
  const updateStatusRes = await fetch(`${BASE_URL}/api/admin/orders/${createdOrder.id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: 'CONFIRMED' }),
  });
  assert.strictEqual(updateStatusRes.status, 200);
  const updatedOrder = await updateStatusRes.json();
  assert.strictEqual(updatedOrder.status, 'CONFIRMED');
  console.log(`✓ Order #${createdOrder.id} status updated to CONFIRMED.`);

  // 10. SAFE ORDER CANCELLATION & STOCK RESTORATION
  console.log('\n10. Testing Safe Order Cancellation & Stock Restoration...');
  const cancelRes = await fetch(`${BASE_URL}/api/admin/orders/${createdOrder.id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: 'CANCELLED' }),
  });
  assert.strictEqual(cancelRes.status, 200);
  const cancelledOrder = await cancelRes.json();
  assert.strictEqual(cancelledOrder.status, 'CANCELLED');
  assert.strictEqual(cancelledOrder.stockRestored, true);
  console.log(`✓ Order #${createdOrder.id} cancelled. stockRestored = true.`);

  // Verify stock was restored to original value!
  const restoredProdRes = await fetch(`${BASE_URL}/api/products/${singleProduct.id}`);
  const restoredProd = await restoredProdRes.json();
  assert.strictEqual(restoredProd.stockQuantity, initialStock);
  console.log(`✓ Stock restored safely: ${restoredProd.stockQuantity} (back to initial ${initialStock}).`);

  // Verify cancelling again DOES NOT double-restore stock
  await fetch(`${BASE_URL}/api/admin/orders/${createdOrder.id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: 'CANCELLED' }),
  });
  const checkDoubleRestore = await (await fetch(`${BASE_URL}/api/products/${singleProduct.id}`)).json();
  assert.strictEqual(checkDoubleRestore.stockQuantity, initialStock);
  console.log(`✓ Idempotency verified: cancelling again does not double-restore stock.`);

  // 11. REGISTERED CUSTOMER MANAGEMENT
  console.log('\n11. Testing Registered Customer Management GET /api/admin/customers...');
  const adminCustRes = await fetch(`${BASE_URL}/api/admin/customers`, {
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  assert.strictEqual(adminCustRes.status, 200);
  const adminCustomers = await adminCustRes.json();
  console.log(`✓ Admin retrieved ${adminCustomers.length} registered customers.`);

  // Find our registered customer
  const foundCust = adminCustomers.find(c => c.id === regData.user.id);
  assert.ok(foundCust, 'Registered customer must be in customer list');
  console.log(`✓ Customer #${foundCust.id} (${foundCust.name}) found. Order count: ${foundCust.orderCount}`);

  // Test Customer Details GET /api/admin/customers/:id
  const custDetRes = await fetch(`${BASE_URL}/api/admin/customers/${regData.user.id}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  assert.strictEqual(custDetRes.status, 200);
  const custDetail = await custDetRes.json();
  assert.strictEqual(custDetail.id, regData.user.id);
  assert.strictEqual(custDetail.name, 'Priya Nambiar');
  assert.strictEqual(custDetail.email, uniqueEmail);
  assert.ok(custDetail.orders.length >= 1);
  console.log(`✓ Customer details loaded. Total orders: ${custDetail.totalOrders}, Total spent (excluding cancelled): ₹${custDetail.totalSpent}`);

  // 12. ADMIN PRODUCT CRUD
  console.log('\n12. Testing Admin Product CRUD...');
  const newProductPayload = {
    name: 'Kallappam Mix Test ' + Date.now(),
    description: 'Crispy rice and coconut fermented pancakes mix.',
    price: 130.00,
    originalPrice: 160.00,
    stockQuantity: 40,
    category: 'VEG',
    packageWeight: '250g',
    imageUrl: '/images/categories/veg.png',
    listed: true,
  };

  const createProdRes = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
    body: JSON.stringify(newProductPayload),
  });
  assert.strictEqual(createProdRes.status, 201);
  const createdProd = await createProdRes.json();
  console.log(`✓ Created new product #${createdProd.id} (${createdProd.name}).`);

  // Update product
  const updateProdRes = await fetch(`${BASE_URL}/api/products/${createdProd.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      ...newProductPayload,
      price: 135.00,
      stockQuantity: 45,
    }),
  });
  assert.strictEqual(updateProdRes.status, 200);
  const updatedProd = await updateProdRes.json();
  assert.strictEqual(Number(updatedProd.price), 135.00);
  assert.strictEqual(updatedProd.stockQuantity, 45);
  console.log(`✓ Updated product #${updatedProd.id} price to ₹${updatedProd.price} and stock to ${updatedProd.stockQuantity}.`);

  // Delete product
  const delProdRes = await fetch(`${BASE_URL}/api/products/${createdProd.id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  assert.strictEqual(delProdRes.status, 200);
  console.log(`✓ Deleted test product #${createdProd.id}.`);

  console.log('\n======================================================');
  console.log('ALL VERIFICATION SUITES PASSED WITH ZERO FAILURES! 🎉');
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
