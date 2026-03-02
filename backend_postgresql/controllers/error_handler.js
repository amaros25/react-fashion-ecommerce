
const handleError = async (res, error, t = null, defaultMessage = "operation_failed") => {
    if (t) await t.rollback();

    console.error(`[Controller Error]: ${error.message}`, error);

    const knownErrors = [
        "no_changes_detected",
        "user_not_found",
        "seller_not_found",
        "phone_already_in_use",
        "missing_data",
        "shop_name_required",
        "user_exists_email",
        "user_exists_phone",
        "shop_name_already_taken",
        "order_already_rated",
        "unauthorized_access",
        "seller_already_rated_for_this_order",
        "product_not_found",
        "invalid_product_id_format",
        "invalid_seller_id",
        "missing_required_fields",
        "category_must_be_number",
        "invalid_price",
        "invalid_delivery_price",
        "at_least_one_image_required",
        "at_least_one_variant_required",
        "duplicate_variant_size_color_combination",
        "invalid_variant_structure_or_stock",
        "missing_product_ids",
        "products_not_found",
        "review_already_exists_error",
        "order_not_found_get_order_by_id",
        "order_not_found",
        "no_orders_found",
        "insufficient_stock",
        "product_not_active",
        "order_items_not_found",
        "at_least_one_item_required",
        "chat_not_found",
        "missing_type",
        "create_chat_error",
        "unauthorized_access",
        "login_error",
        "wrong_password",
        "reset_email_sent_if_exists",
        "reset_email_sent",
        "error_sending_reset_email",
        "invalid_or_expired_token",
        "password_reset_success",
        "error_resetting_password",
        "not_found",
        "unauthorized_access: user_banned",
        "unauthorized_access: user_pending",
        "unauthorized_access: user_deleted",
        "get_user_orders_error"
    ];

    const message = error.message || defaultMessage;
    const statusCode = knownErrors.includes(error.message) ? 400 : 500;

    return res.status(statusCode).json({ message });
};

// WICHTIG: Export für CommonJS (damit require funktioniert)
module.exports = { handleError };