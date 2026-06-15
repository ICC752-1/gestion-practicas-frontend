export const STUDENT_ROLE = "Estudiante";
export const PRACTICE_MANAGER_ROLE = "Encargado de practica";
export const CAREER_DIRECTOR_ROLE = "Director de carrera";
export const SECRETARY_ROLE = "Secretaria de Carrera";
export const SUPERVISOR_ROLE = "Supervisor de practica";
export const FICA_ROLE = "FICA";
export const SUPERADMIN_ROLE = "Superadmin";

export const adminRoles = [
    PRACTICE_MANAGER_ROLE,
    CAREER_DIRECTOR_ROLE,
    SECRETARY_ROLE,
];

export const decisionRoles = [
    PRACTICE_MANAGER_ROLE,
    CAREER_DIRECTOR_ROLE,
];

const rolePriority = [
    SUPERADMIN_ROLE,
    FICA_ROLE,
    PRACTICE_MANAGER_ROLE,
    CAREER_DIRECTOR_ROLE,
    SECRETARY_ROLE,
    SUPERVISOR_ROLE,
    STUDENT_ROLE,
];

export const getDisplayRoleForRoles = (roles = []) => {
    return rolePriority.find((role) => roles.includes(role)) || roles[0] || "Sin rol";
};

export const getAdminBasePathForRoles = (roles = []) => {
    if (roles.includes(PRACTICE_MANAGER_ROLE)) {
        return "/encargado";
    }

    if (roles.includes(CAREER_DIRECTOR_ROLE)) {
        return "/director";
    }

    if (roles.includes(SECRETARY_ROLE)) {
        return "/secretaria";
    }

    return "/landing";
};

export const getRedirectPathForRoles = (roles = []) => {
    if (roles.includes(SUPERADMIN_ROLE)) {
        return "/superadmin/usuarios";
    }

    if (roles.includes(FICA_ROLE)) {
        return "/fica";
    }

    if (roles.includes(STUDENT_ROLE)) {
        return "/dashboard";
    }

    if (adminRoles.some((role) => roles.includes(role))) {
        return getAdminBasePathForRoles(roles);
    }

    if (roles.includes(SUPERVISOR_ROLE)) {
        return "/supervisor";
    }

    return "/landing";
};
