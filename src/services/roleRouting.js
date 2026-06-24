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

export const normalizeRoleNames = (roles = []) =>
    roles
        .map((role) => {
            if (typeof role === "string") {
                return role;
            }

            return role?.role?.name || role?.name || null;
        })
        .filter(Boolean);

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
    const roleNames = normalizeRoleNames(roles);

    return rolePriority.find((role) => roleNames.includes(role)) || roleNames[0] || "Sin rol";
};

export const getAdminBasePathForRoles = (roles = []) => {
    const roleNames = normalizeRoleNames(roles);

    if (roleNames.includes(PRACTICE_MANAGER_ROLE)) {
        return "/encargado";
    }

    if (roleNames.includes(CAREER_DIRECTOR_ROLE)) {
        return "/director";
    }

    if (roleNames.includes(SECRETARY_ROLE)) {
        return "/secretaria";
    }

    return "/landing";
};

export const getRedirectPathForRoles = (roles = []) => {
    const roleNames = normalizeRoleNames(roles);

    if (roleNames.includes(SUPERADMIN_ROLE)) {
        return "/superadmin/usuarios";
    }

    if (roleNames.includes(FICA_ROLE)) {
        return "/fica";
    }

    if (roleNames.includes(STUDENT_ROLE)) {
        return "/dashboard";
    }

    if (adminRoles.some((role) => roleNames.includes(role))) {
        return getAdminBasePathForRoles(roleNames);
    }

    if (roleNames.includes(SUPERVISOR_ROLE)) {
        return "/supervisor";
    }

    return "/landing";
};
