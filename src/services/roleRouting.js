const coordinatorRoles = [
    "Encargado de practica",
    "Director de carrera",
    "Coordinador",
    "Coordinador FICA",
    "Secretaria de Carrera",
];

export const getRedirectPathForRoles = (roles = []) => {
    if (roles.includes("Estudiante")) {
        return "/dashboard";
    }

    if (coordinatorRoles.some((role) => roles.includes(role))) {
        return "/coordinador";
    }

    if (roles.includes("Supervisor de practica")) {
        return "/supervisor";
    }

    return "/landing";
};
