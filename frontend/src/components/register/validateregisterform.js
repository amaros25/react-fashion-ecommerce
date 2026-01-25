

const ValidateRegisterForm = (formData, role, acceptedTerms, t) => {
    console.log("ValidateRegisterForm formData: ", formData);
    const isValidEmail = (email) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email);
    const isStrongPassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
    const isValidPhone = (phone) => /^[0-9]{8,15}$/.test(phone);

    const isValidName = (name) => /^[\p{L}\s]+$/u.test(name);


    // Check first name
    if (!formData.firstName) {
        return t("register.error.firstNameRequired");
    }
    if (formData.firstName.length < 4 || !isValidName(formData.firstName)) {
        return t("register.error.invalidFirstName");
    }

    // Check last name
    if (!formData.lastName) {
        return t("register.error.lastNameRequired");
    }
    if (formData.lastName.length < 4 || !isValidName(formData.lastName)) {
        return t("register.error.invalidLastName");
    }

    // Check email
    if (!formData.email || !isValidEmail(formData.email)) {
        return t("register.error.emailRequired");
    }

    // Check password
    if (!formData.password) {
        return t("register.error.passwordRequired");
    }
    if (!isStrongPassword(formData.password)) {
        return t("register.error.passwordStrength");
    }
    if (formData.password !== formData.confirmPassword) {
        return t("register.error.passwordMismatch");
    }
    // Check phone
    if (!formData.phone) {
        return t("register.error.phoneRequired");
    }
    if (!isValidPhone(formData.phone)) {
        return t("register.error.invalidPhone");
    }

    // Terms acceptance
    if (!acceptedTerms) {
        return t("register.error.acceptTerms");
    }

    // If everything is valid
    return null;
};

export default ValidateRegisterForm;
