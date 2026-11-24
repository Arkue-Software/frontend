// Espejo SOLO de UX: oculta lo que el rol no puede hacer. La autoridad real es el backend (403).
export const ROLES = {
  U3: 'Operador de banco',
  U4: 'Administrador de banco',
  U5: 'Coordinador territorial',
  U6: 'Administrador nacional',
};

const CREABLES = { U6: ['U5', 'U4', 'U3'], U5: ['U4', 'U3'], U4: ['U3'] };

export const rolesCreables = (rol) => CREABLES[rol] ?? [];
export const puedeCrearUsuarios = (rol) => rolesCreables(rol).length > 0;
