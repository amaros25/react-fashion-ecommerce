import { useState } from "react";
import { toast } from "react-toastify";

export default function useRegisterForm(t) {
    const [role, setRole] = useState("shoper");
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [error, setError] = useState("");

    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedSubCity, setSelectedSubCity] = useState(null);

    const [imageFile, setImageFile] = useState(null);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        shopName: "",
        address: "",
    });

    const validations = {
        isValidEmail: (email) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email),
        isStrongPassword: (p) =>
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(p),
        isValidPhone: (phone) => /^[0-9]{8,15}$/.test(phone),
        isValidName: (name) => /^[a-zA-Z\s]+$/.test(name),
    };

    const validateForm = () => {


        if (!formData.firstName) {
            setError(t("register.error.firstNameRequired"));
            toast.error(t("register.error.firstNameRequired"));
            return false;
        }

        if (formData.firstName.length < 4 || !validations.isValidName(formData.firstName)) {
            setError(t("register.error.invalidFirstName"));
            toast.error(t("register.error.invalidFirstName"));
            return false;
        }

        if (!formData.lastName) {
            setError(t("register.error.lastNameRequired"));
            toast.error(t("register.error.lastNameRequired"));
            return false;
        }
        if (formData.lastName.length < 4 || !validations.isValidName(formData.lastName)) {
            setError(t("register.error.invalidLastName"));
            toast.error(t("register.error.invalidLastName"));
            return false;
        }

        if (!formData.email || !validations.isValidEmail(formData.email)) {
            setError(t("register.error.emailRequired"));
            toast.error(t("register.error.emailRequired"));
            return false;
        }

        if (!formData.password) {
            setError(t("register.error.passwordRequired"));
            toast.error(t("register.error.passwordRequired"));
            return false;
        }

        if (!validations.isStrongPassword(formData.password)) {
            setError(t("register.error.passwordStrength"));
            toast.error(t("register.error.passwordStrength"));
            return false;
        }

        if (!formData.phone) {
            setError(t("register.error.phoneRequired"));
            toast.error(t("register.error.phoneRequired"));
            return false;
        }

        if (!validations.isValidPhone(formData.phone)) {
            setError(t("register.error.invalidPhone"));
            toast.error(t("register.error.invalidPhone"));
            return false;
        }

        if (!formData.address) {
            setError(t("register.error.addressRequired"));
            toast.error(t("register.error.addressRequired"));
            return false;
        }

        if (!selectedCity) {
            setError(t("register.error.cityRequired"));
            toast.error(t("register.error.cityRequired"));
            return false;
        }

        if (!selectedSubCity) {
            setError(t("register.error.subCityRequired"));
            toast.error(t("register.error.subCityRequired"));
            return false;
        }

        if (role === "seller") {
            if (!formData.shopName) {
                setError(t("register.error.fillShopNameAddress"));
                toast.error(t("register.error.fillShopNameAddress"));
                return false;
            }
            if (!imageFile) {
                setError(t("register.error.uploadProfileImage"));
                toast.error(t("register.error.uploadProfileImage"));
                return false;
            }
        }


        if (!acceptedTerms) {
            setError(t("register.error.acceptTerms"));
            toast.error(t("register.error.acceptTerms"));
            return false;
        }

        return true;
    };

    return {
        formData,
        setFormData,
        role,
        setRole,
        error,
        setError,
        acceptedTerms,
        setAcceptedTerms,
        validateForm,
        imageFile,
        setImageFile,
        setSelectedCity,
        selectedCity,
        setSelectedSubCity,
        selectedSubCity,


    };
}
