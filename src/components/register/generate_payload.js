// generateRegisterPayload.js

export const generateRegisterPayload = (apiUrl, formData, role, selectedCityIndex, selectedSubCityIndex) => {
    let endpoint = "";
    let payload = {};

    if (role === "seller") {
        endpoint = `${apiUrl}/sellers/create`;
        payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            shopName: formData.shopName,
            address: formData.address
                ? [
                    {
                        address: formData.address,
                        city: selectedCityIndex,
                        subCity: selectedSubCityIndex,
                        dateModified: new Date(),
                    },
                ]
                : [],
            phone: formData.phone
                ? [
                    {
                        phone: formData.phone,
                        dateModified: new Date(),
                    },
                ]
                : [],
            active: false,
            lastOnline: new Date(),
        };
    } else {
        endpoint = `${apiUrl}/users/create`;
        payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            address: formData.address
                ? [
                    {
                        address: formData.address,
                        city: selectedCityIndex,
                        subCity: selectedSubCityIndex,
                        dateModified: new Date(),
                    },
                ]
                : [],
            phone: formData.phone
                ? [
                    {
                        phone: formData.phone,
                        dateModified: new Date(),
                    },
                ]
                : [],
            active: true,
            lastOnline: new Date(),
        };
    }

    return { endpoint, payload };
};
