router.patch(
    "/notification-preferences",
    verifyJWT,
    updateNotificationPreferences
);