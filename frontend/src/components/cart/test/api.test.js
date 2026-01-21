import { fetchSellersByIds, fetchSeller, createOrder, createMultipleOrders } from '../hooks/api';

// Mock global fetch
global.fetch = jest.fn();

describe('Cart API Hooks', () => {
    const apiUrl = process.env.REACT_APP_API_URL;

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('fetchSellersByIds', () => {
        it('should fetch sellers successfully', async () => {
            const mockSellers = [{ _id: '1', shopName: 'Shop 1' }, { _id: '2', shopName: 'Shop 2' }];
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockSellers,
            });

            const result = await fetchSellersByIds(['1', '2']);

            expect(fetch).toHaveBeenCalledWith(`${apiUrl}/sellers/getByIds?ids=1,2`);
            expect(result.success).toBe(true);
            expect(result.data).toEqual({
                '1': mockSellers[0],
                '2': mockSellers[1],
            });
        });

        it('should handle API errors', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ message: 'some_error' }),
            });

            const result = await fetchSellersByIds(['1']);

            expect(result.success).toBe(false);
            expect(result.errorKey).toBe('some_error');
        });

        it('should handle network errors', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            const result = await fetchSellersByIds(['1']);

            expect(result.success).toBe(false);
            expect(result.errorKey).toBe('server_error');
        });
    });

    describe('fetchSeller', () => {
        it('should fetch a single seller successfully', async () => {
            const mockSeller = { _id: '1', shopName: 'Shop 1' };
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockSeller,
            });

            const result = await fetchSeller('1', 'token123');

            expect(fetch).toHaveBeenCalledWith(`${apiUrl}/sellers/1`, {
                headers: { Authorization: 'Bearer token123' },
            });
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockSeller);
        });
    });

    describe('createMultipleOrders', () => {
        it('should create orders for multiple sellers successfully', async () => {
            const groupedCart = {
                'seller1': [{ productId: 'p1', quantity: 2, price: 10, delprice: 5 }],
                'seller2': [{ productId: 'p2', quantity: 1, price: 20, delprice: 5 }]
            };

            // Mock successful responses for both orders
            fetch.mockResolvedValue({
                ok: true,
                json: async () => ({ orderId: 'ord123' }),
            });

            const result = await createMultipleOrders(groupedCart, 'user1', 'token123', 1, true);

            expect(fetch).toHaveBeenCalledTimes(2);
            expect(result.success).toBe(true);
        });

        it('should return failure if one order fails', async () => {
            const groupedCart = {
                'seller1': [{ productId: 'p1', quantity: 2, price: 10 }]
            };
            fetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ message: 'stock_error' }),
            });

            const result = await createMultipleOrders(groupedCart, 'user1', 'token123', 1, true);

            expect(result.success).toBe(false);
            expect(result.errorKey).toBe('stock_error');
        });
    });
});
