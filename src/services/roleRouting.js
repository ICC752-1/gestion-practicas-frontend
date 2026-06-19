const coordinatorRoles = [
    "Encargado de practica",
    "Director de carrera",
    "Coordinador",
    "Coordinador FICA",
    "Secretaria de Carrera",
];

export const normalizeRoleNames = (roles = []) =>
    roles
        .map((role) => {
            if (typeof role === "string") {
                return role;
            }

            return role?.role?.name || role?.name || null;
        })
        .filter(Boolean);

export const getRedirectPathForRoles = (roles = []) => {
    const roleNames = normalizeRoleNames(roles);

    if (roleNames.includes("Estudiante")) {
        return "/dashboard";
    }

    if (coordinatorRoles.some((role) => roleNames.includes(role))) {
        return "/coordinador";
    }

    if (roleNames.includes("Supervisor de practica")) {
        return "/supervisor";
    }

    return "/landing";
};
