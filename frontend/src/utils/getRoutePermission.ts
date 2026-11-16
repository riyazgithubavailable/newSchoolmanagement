import { ROLES } from "@/config/roles";

export const getHomeRoute = (roleName?: string) => {
    switch (roleName) {
        case ROLES.SUPER_ADMIN:
        case ROLES.PLANT_ADMIN:
        case ROLES.DIVISION_SUPER_ADMIN:
        case ROLES.DISTRICT_SUPER_ADMIN:
        case ROLES.ULB_SUPER_ADMIN:
            return "/dashboard";

        case ROLES.GATE_OPERATOR:
            return "/gateOperator-dashboard";

        case ROLES.WB_OPERATOR:
            return "/weight-bridge-operator-dashboard";

        case ROLES.PRIMARY_SEGREGATION_SUPERVISOR:
            return "/primary-segregation-dashboard";

        case ROLES.SECONDARY_SEGREGATION_SUPERVISOR:
            return "/secondary-segregation-dashboard";
            
        case ROLES.WASTE_PROCESSING_SUPERVISOR:
            return "/waste-processing-dashboard";
        
        case ROLES.STOCK_MANAGER:
            return "/waste-stock-dashboard";
        case ROLES.SALES_MANAGER:
            return "/sales-dashboard";
        default:
            return "/login";
    }
};