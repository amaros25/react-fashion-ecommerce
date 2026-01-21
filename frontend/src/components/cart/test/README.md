# Cart Test Suite

This directory contains comprehensive tests for cart components using Jest and React Testing Library.

## Test Files

- `cart_page.test.js` - Tests for CartPage component

## Running Tests

### Run all cart tests:
```bash
npm test -- --testPathPattern=cart/test
```

### Run with coverage:
```bash
npm test -- --coverage --testPathPattern=cart/test
```

## Test Coverage

The test suite covers:

### Component Rendering
- ✓ Cart page renders correctly
- ✓ Empty state displays when cart is empty
- ✓ Cart items display correctly
- ✓ Summary section renders

### User Interactions
- ✓ Remove item from cart
- ✓ Toggle delivery/pickup
- ✓ Checkout process
- ✓ Navigation to product pages

### API Integration
- ✓ Fetch sellers data
- ✓ Create orders
- ✓ API error handling

### Edge Cases
- ✓ Empty cart handling
- ✓ Missing user data
- ✓ Invalid cart items

## Notes

- Cart already has API calls separated in `api.js` ✅
- Tests focus on user behavior and component integration
- All tests follow accessibility best practices
