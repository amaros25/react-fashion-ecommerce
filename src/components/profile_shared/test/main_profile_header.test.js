import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MainProfileHeader from '../main_profile_header.js'; // Single level up
import { toast } from 'react-toastify';

// 1. MOCK: External dependencies
jest.mock('react-toastify');
jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

// Mock the custom image upload hook
const mockUploadImage = jest.fn();
jest.mock('../../upload_image_profile/hooks/upload_image_api', () => () => ({
    uploadImage: mockUploadImage
}));

// Mock cities data constant
jest.mock('../../utils/const/cities', () => ({
    cities: ['Berlin', 'Munich'],
    citiesData: { 'Berlin': ['Mitte', 'Pankow'], 'Munich': ['Altstadt'] }
}));

describe('MainProfileHeader Component', () => {
    const mockUpdateAddress = jest.fn();
    const mockUpdatePhone = jest.fn();
    const mockUpdateImage = jest.fn();

    const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '123456',
        address: 'Main St 1',
        city: 0,
        subCity: 0,
        active: 'verified',
        imageUrl: null
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test: Basic Info Rendering
    test('renders user identity and contact info correctly', () => {
        render(
            <BrowserRouter>
                <MainProfileHeader data={userData} viewMode="user" />
            </BrowserRouter>
        );

        // Verification: Name, Email and Phone should be visible
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('123456')).toBeInTheDocument();
    });

    // Test: Modal Logic
    test('opens settings modal when clicking the settings button', () => {
        render(
            <BrowserRouter>
                <MainProfileHeader data={userData} />
            </BrowserRouter>
        );

        const settingsBtn = screen.getByText('settings');
        fireEvent.click(settingsBtn);

        // Verification: Modal title should appear
        expect(screen.getByText('edit_profile')).toBeInTheDocument();
    });

    // Test: Update Callback
    test('calls updateAddress when form is saved with changes', async () => {
        render(
            <BrowserRouter>
                <MainProfileHeader
                    data={userData}
                    updateAddress={mockUpdateAddress}
                    updatePhone={mockUpdatePhone}
                />
            </BrowserRouter>
        );

        // Open Modal
        fireEvent.click(screen.getByText('settings'));

        // Change Address Input
        const addressInput = screen.getByDisplayValue('Main St 1');
        fireEvent.change(addressInput, { target: { name: 'address', value: 'New Street 5' } });

        // Click Save
        fireEvent.click(screen.getByText('save_changes'));

        await waitFor(() => {
            // Check if API function was called with new data
            expect(mockUpdateAddress).toHaveBeenCalledWith(expect.objectContaining({
                address: 'New Street 5'
            }));
        });
    });

    // Test: Logout functionality
    test('clears local storage on logout', () => {
        const storageSpy = jest.spyOn(Storage.prototype, 'clear');

        // Mock window.location.href
        const originalLocation = window.location;
        delete window.location;
        window.location = { href: '' };

        render(
            <BrowserRouter>
                <MainProfileHeader data={userData} />
            </BrowserRouter>
        );

        fireEvent.click(screen.getByText('logout'));

        // Verification: Storage wiped and redirect triggered
        expect(storageSpy).toHaveBeenCalled();
        expect(window.location.href).toBe('/login');

        // Cleanup
        window.location = originalLocation;
    });
});