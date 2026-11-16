// src/config/roles.ts
export const ROLES = {
    ADMIN: 'Principal / Admin',
    TEACHER: 'Teacher',
    PARENT: 'Parent',
} as const;

export type RoleKey = keyof typeof ROLES;
export type RoleName = (typeof ROLES)[RoleKey];
// roles 
// Optional: DB ids if you want to use them later
// export const ROLE_IDS: Record<RoleKey, number> = {
//   SUPER_ADMIN: 0,
//   DIVISION_SUPER_ADMIN: 1007,
//   DISTRICT_SUPER_ADMIN: 1008,
//   ULB_SUPER_ADMIN: 1009,
//   PLANT_ADMIN: 1,
//   GATE_OPERATOR: 2,
//   WB_OPERATOR: 3,
//   PRIMARY_SEGREGATION_SUPERVISOR: 1014,
//   SECONDARY_SEGREGATION_SUPERVISOR: 1015,
//   WASTE_PROCESSING_SUPERVISOR: 1016,
//   STOCK_MANAGER: 1017,
//   SALES_MANAGER: 1018,
// };
