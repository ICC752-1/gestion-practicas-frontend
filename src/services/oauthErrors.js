const oauthErrorMessages = {
    unauthorized_domain:
        "El correo de Google no pertenece a un dominio institucional autorizado.",
    invalid_callback:
        "No se pudo validar el callback de Google. Intente iniciar sesion nuevamente.",
    missing_token:
        "No se recibio el token de autenticacion. Intente iniciar sesion nuevamente.",
    server_unavailable:
        "Servidor no disponible. Intente nuevamente en unos minutos.",
    user_not_found:
        "La cuenta de Google no esta asociada a un usuario activo del sistema.",
};

export const getOAuthErrorMessage = (errorCode) => {
    return (
        oauthErrorMessages[errorCode] ||
        "Error al iniciar sesion con Google."
    );
};
