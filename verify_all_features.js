const assert = require('assert');

const BASE_URL = 'http://localhost:8080';

async function testAll() {
  console.log('--- TEST 1: Verify /api/products ---');
  const prodRes = await fetch(`${BASE_URL}/api/products`);
  assert.strictEqual(prodRes.status, 200);
  const products = await prodRes.json();
  console.log(`Verified ${products.length} products loaded from Spring Boot.`);
  assert.ok(products.length >= 21, 'Expected at least 21 products in database');
  
  // Verify Banana Chips (id 2) is preserved
  const bananaChips = products.find(p => p.id === 2);
  assert.ok(bananaChips, 'Product ID 2 (Banana Chips) must be preserved');
  console.log(`Preserved ID 2: ${bananaChips.name}, stock: ${bananaChips.stockQuantity}`);

  // Verify Fish Vattichathu 200g exists
  const fish = products.find(p => p.name?.includes('Fish Vattichathu'));
  assert.ok(fish, 'Fish Vattichathu must exist');
  console.log(`Found Fish Vattichathu: #${fish.id}, price: ₹${fish.price}`);

  console.log('\n--- TEST 2: Customer Registration & Login ---');
  const testEmail = `cust_${Date.now()}@example.com`;
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Rohan Varma',
      email: testEmail,
      password: 'mypassword123'
    })
  });
  assert.strictEqual(regRes.status, 201);
  const regUser = await regRes.json();
  console.log(`Customer registered: ID #${regUser.id}, email: ${regUser.email}`);
  assert.ok(!regUser.passwordHash, 'Password hash must NEVER be exposed in response');

  // Test Login with valid password
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'mypassword123'
    })
  });
  assert.strictEqual(loginRes.status, 200);
  const loginUser = await loginRes.json();
  assert.strictEqual(loginUser.email, testEmail);
  console.log('Customer login successful with valid password.');

  // Test Login with invalid password
  const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'wrong_password'
    })
  });
  assert.strictEqual(badLoginRes.status, 401);
  console.log('Invalid password correctly rejected with 401 Unauthorized.');

  console.log('\n--- TEST 3: Place Order with Real Product ---');
  const initialFishStock = fish.stockQuantity;
  const testPhone = '9876501234';
  const orderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Rohan Varma',
      phone: testPhone,
      email: testEmail,
      deliveryAddress: 'Flat 4B, Emerald Palms, Marine Drive, Kochi, Kerala 682011',
      items: [
        { productId: fish.id, quantity: 2 }
      ]
    })
  });
  assert.strictEqual(orderRes.status, 201);
  const order = await orderRes.json();
  console.log(`Order placed successfully: ID #${order.id}, total: ₹${order.totalAmount}, status: ${order.status}`);
  assert.strictEqual(order.status, 'PLACED');

  // Verify stock was decremented
  const fishAfterOrderRes = await fetch(`${BASE_URL}/api/products/${fish.id}`);
  const fishAfterOrder = await fishAfterOrderRes.json();
  assert.strictEqual(fishAfterOrder.stockQuantity, initialFishStock - 2, 'Stock should decrease by 2');
  console.log(`Verified stock decremented: ${initialFishStock} -> ${fishAfterOrder.stockQuantity}`);

  console.log('\n--- TEST 4: Track Order ---');
  const trackRes = await fetch(`${BASE_URL}/api/orders/${order.id}/track?phone=${testPhone}`);
  assert.strictEqual(trackRes.status, 200);
  const trackData = await trackRes.json();
  assert.strictEqual(trackData.status, 'PLACED');
  console.log(`Tracked order #${trackData.orderId}: status=${trackData.status}`);

  console.log('\n--- TEST 5: My Orders ---');
  const myOrdersRes = await fetch(`${BASE_URL}/api/orders/my-orders?phone=${testPhone}`);
  assert.strictEqual(myOrdersRes.status, 200);
  const myOrders = await myOrdersRes.json();
  assert.ok(myOrders.some(o => o.orderId === order.id), 'Placed order must appear in My Orders');
  console.log(`My Orders returned ${myOrders.length} order(s) for phone ${testPhone}.`);

  console.log('\n--- TEST 6: Order Cancellation & Stock Restoration ---');
  const cancelRes = await fetch(`${BASE_URL}/api/orders/${order.id}/cancel?phone=${testPhone}`, {
    method: 'PUT'
  });
  assert.strictEqual(cancelRes.status, 200);
  const cancelledOrder = await cancelRes.json();
  assert.strictEqual(cancelledOrder.status, 'CANCELLED');
  console.log(`Order #${order.id} cancelled successfully.`);

  // Verify stock was restored
  const fishAfterCancelRes = await fetch(`${BASE_URL}/api/products/${fish.id}`);
  const fishAfterCancel = await fishAfterCancelRes.json();
  assert.strictEqual(fishAfterCancel.stockQuantity, initialFishStock, 'Stock should be restored to initial quantity');
  console.log(`Verified stock restored: ${fishAfterOrder.stockQuantity} -> ${fishAfterCancel.stockQuantity}`);

  console.log('\n========================================');
  console.log('ALL 6 END-TO-END VERIFICATION SUITES PASSED!');
  console.log('========================================');
}

testAll().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
