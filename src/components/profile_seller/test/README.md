# Profile Seller Test Suite

This directory contains comprehensive tests for all profile_seller components using Jest and React Testing Library.

## Test Files

- `profile_seller.test.js` - Tests for main ProfileSeller component
- `profile_seller_header.test.js` - Tests for ProfileSellerHeader component
- `seller_order_card.test.js` - Tests for SellerOrderCard component
- `seller_orders.test.js` - Tests for SellerOrders component
- `seller_products.test.js` - Tests for SellerProducts component
- `status_select.test.js` - Tests for StatusSelect component

## Running Tests

### Run all profile_seller tests:
```bash
npm test -- --testPathPattern=profile_seller/test
```

### Run individual test files:
```bash
npm test -- profile_seller.test.js
npm test -- seller_products.test.js
npm test -- status_select.test.js
```

### Run tests in watch mode:
```bash
npm test -- --watch --testPathPattern=profile_seller/test
```

### Run tests with coverage:
```bash
npm test -- --coverage --testPathPattern=profile_seller/test
```

## Test Coverage

The test suite covers:

### Component Rendering
- ✓ Components render correctly with props
- ✓ Loading states display properly
- ✓ Empty states show appropriate messages
- ✓ Error states are handled gracefully

### User Interactions
- ✓ Tab navigation works correctly
- ✓ Search functionality operates as expected
- ✓ Pagination changes pages correctly
- ✓ Status changes trigger appropriate callbacks
- ✓ Form inputs update state properly

### API Integration
- ✓ Successful API calls render data correctly
- ✓ API errors are caught and handled
- ✓ Loading spinners show during async operations
- ✓ Fetch calls include correct parameters

### Edge Cases
- ✓ Missing or undefined data is handled
- ✓ Empty arrays don't break rendering
- ✓ Invalid status values default appropriately
- ✓ Missing localStorage values are handled

## Test Structure

Each test file follows this structure:

1. **Imports** - React Testing Library, component, and mocks
2. **Mock Setup** - Mock external dependencies (i18next, fetch, etc.)
3. **Test Suites** - Grouped by functionality
4. **Cleanup** - Clear mocks after each test

## Mocking Strategy

### External Dependencies
- `react-i18next` - Mocked to return translation keys
- `react-router-dom` - Mocked navigation functions
- `react-toastify` - Mocked toast notifications
- `fetch` - Mocked API calls with jest.fn()

### Child Components
- Complex child components are mocked to isolate testing
- Mocks return simple divs with test IDs for verification

## Best Practices

1. **Test Isolation** - Each test is independent
2. **Clear Descriptions** - Test names describe what they verify
3. **Arrange-Act-Assert** - Tests follow AAA pattern
4. **Async Handling** - Use waitFor for async operations
5. **Cleanup** - Mocks and state are cleared after each test

## Adding New Tests

When adding new tests:

1. Follow existing file structure
2. Mock all external dependencies
3. Test both success and error cases
4. Include edge case scenarios
5. Use descriptive test names
6. Clean up after tests

## Troubleshooting

### Tests failing due to async issues
- Use `waitFor` for async operations
- Ensure promises are properly resolved/rejected in mocks

### Mock not working
- Check mock is defined before component render
- Verify mock path matches actual import path
- Clear mocks between tests with `jest.clearAllMocks()`

### Component not rendering
- Check all required props are provided
- Verify mocks for child components are set up
- Ensure BrowserRouter wraps components using routing

## Notes

- Tests use Jest's built-in mocking capabilities
- React Testing Library encourages testing user behavior
- Tests focus on what users see and do, not implementation details
- All tests follow accessibility best practices
