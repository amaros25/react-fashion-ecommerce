import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfileSellerHeader from '../profile_seller_header';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-toastify';


// 1. Mock Hooks and Dependencies
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
    },
}));

const mockUploadImage = jest.fn();
jest.mock('../../upload_image_profile/hooks/upload_image_api', () => ({
    __esModule: true,
    default: () => ({
        uploadImage: mockUploadImage,
    }),
}));

// Mock Translation
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
    }),
}));

// Mock City Data (Match your utils structure)
jest.mock('../../utils/const/cities', () => ({
    cities: ['Berlin', 'Munich'],
    citiesData: {
        'Berlin': ['Mitte', 'Pankow'],
        'Munich': ['Altstadt'],
    }
}));

const mockSeller = {
    shopName: "Astra Shop",
    firstName: "Astra",
    lastName: "User",
    email: "astra@test.com",
    city: 0, // Berlin
    subCity: 0, // Mitte
    address: "Street 123",
    phone: "123456",
    active: "verified",
    avgRating: 4.5,
    reviewCount: 10,
    productCount: 5,
    orderCount: 20,
    openOrders: 2,
    unreadMessages: 3,
    imageUrl: ""
};

describe('ProfileSellerHeader Component', () => {
    const mockUpdateAddress = jest.fn();
    const mockUpdatePhone = jest.fn();
    const mockUpdateImage = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        // For logout test
        delete window.location;
        window.location = { href: '' };
    });

    const renderComponent = (seller = mockSeller) => {
        return render(
            <BrowserRouter>
                <ProfileSellerHeader
                    seller={seller}
                    updateAddress={mockUpdateAddress}
                    updatePhone={mockUpdatePhone}
                    updateImage={mockUpdateImage}
                />
            </BrowserRouter>
        );
    };

    test('renders basic seller info correctly', () => {
        renderComponent();
        expect(screen.getByText('Astra Shop')).toBeInTheDocument();
        expect(screen.getByText('astra@test.com')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument(); // productCount
        expect(screen.getByText('(10)')).toBeInTheDocument(); // reviewCount
    });

    test('displays unread messages badge', () => {
        renderComponent();
        expect(screen.getByText('3')).toHaveClass('badge-count');
    });

    test('opens settings modal and updates phone number', async () => {
        renderComponent();

        // Open Modal
        fireEvent.click(screen.getByText('settings'));
        expect(screen.getByText('edit_profile')).toBeInTheDocument();

        // Change Phone
        const phoneInput = screen.getByPlaceholderText('enter_phone_number');
        fireEvent.change(phoneInput, { target: { name: 'phone', value: '999999' } });

        // Save
        fireEvent.click(screen.getByText('save_changes'));

        await waitFor(() => {
            expect(mockUpdatePhone).toHaveBeenCalledWith('999999');
            expect(toast.success).toHaveBeenCalledWith('profile_updated');
        });
    });

    test('shows error if saving changes with no actual changes', async () => {
        renderComponent();
        fireEvent.click(screen.getByText('settings'));
        fireEvent.click(screen.getByText('save_changes'));

        expect(toast.error).toHaveBeenCalledWith('no_changes');
    });

    test('handles logout and clears localStorage', () => {
        const spyRemove = jest.spyOn(Storage.prototype, 'removeItem');
        const originalLocation = window.location;
        delete window.location;
        window.location = { ...originalLocation, href: '', assign: jest.fn() };

        renderComponent();

        fireEvent.click(screen.getByText('logout'));

        expect(spyRemove).toHaveBeenCalledWith('token');
        expect(spyRemove).toHaveBeenCalledWith('userId');
        expect(window.location.href).toBe('/login');
        window.location = originalLocation;
    });

    test('triggers profile image upload on avatar click', async () => {
        mockUploadImage.mockResolvedValue('http://new-image-url.jpg');
        renderComponent();

        const file = new File(['test'], 'profile.png', { type: 'image/png' });
        // Finde den Avatar über den Alt-Text des Bildes
        const avatarImg = screen.getByAltText('Astra Shop');
        const input = screen.getByTestId('profile-file-input');

        fireEvent.change(input, { target: { files: [file] } });
        await waitFor(() => {
            expect(mockUploadImage).toHaveBeenCalledWith(file);
            expect(mockUpdateImage).toHaveBeenCalledWith({ imageUrl: 'http://new-image-url.jpg' });
        });
    });

    test('displays specific banner for banned users', () => {
        const bannedSeller = { ...mockSeller, active: 'banned' };
        renderComponent(bannedSeller);

        expect(screen.getByText('user_status.banned')).toBeInTheDocument();
    });

    test('navigates to chat when messages button is clicked', () => {
        renderComponent();
        fireEvent.click(screen.getByText('messages'));
        expect(mockNavigate).toHaveBeenCalledWith('/chat');
    });


});