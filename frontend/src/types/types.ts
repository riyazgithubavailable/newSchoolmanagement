
export interface AttendanceData {
  attendanceId: string;
  plantEmployeeId: number;
  plantId: number;
  fullName: string;
  roleName: string;
  inTime: string;      // ISO date string
  outTime: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceResponse {
  success: boolean;
  data: AttendanceData[];
};
//For EmployeeRoles
export type EmployeeRole = {
  roleId: number;
  roleName: string;
  roleCode: string
  isActive: boolean;
}

export type EmployeeRoleResponse = {
  success: boolean;
  data: EmployeeRole[]
}
export type WeighBatch = {
  inputId: string;
  plantId: number;
  plantName: string;
  wasteType: string;
  quantityKg: number;
  pulledBy: string;
  pulledDate: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string
}
export type WeighBatchData = {
  success: boolean;
  data: WeighBatch[];
  available: {
    totalTon: number;
    dry: number;
    wet: number;
    mixed: number
  }
}
//forSecondarySegregationImport 
export type WeighBatchDataForSecondary = {
  success: boolean;
  data: WeighBatch[];
  available: {
    totalTon: number;
    dry: number;
    wet: number;
    hazardous: number;
    bioMedical: number
  }
}
export type wasteType = {
  weighBridgeWasteTypeId: number;
  wasteType: string;
  isActive: boolean;
  createdDate: string;
}
export type WeighBatchApiResponse = {
  success: boolean;
  data: wasteType[];

}

export type SecondarySegregationWasteType = {
  wasteSubTypeId: number;
  wasteTypeId: number;
  wasteSubTypeName: string;
  isActive: boolean;
  createdDate: string;
}
export interface SecondarySegregationWasteTypeApiResponse {
  success: boolean;
  data: SecondarySegregationWasteType | SecondarySegregationWasteType[];
  message?: string;
}
export type processingUnit = {
  inputId: string;
  plantId: number;
  plantName: string;
  wasteSubTypeId: number;
  wasteSubType: string;
  quantityKg: number;
  pulledBy: string;
  pulledDate: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
export type ProcessingUnitApiResponse = {
  success: boolean;
  data: processingUnit[];
   available:{
    totalTon: number;
    plastic: number;
    paper: number;
    metal: number;
    glass: number;
    others: number;
    organic: number;
    eWaste: number;
    chemical: number;
    medical: number;
    bioMedical: number
   }
}
export type ProcessingTransaction = {
  processingId: string;
  plantId: number;
  plantName: string;
  processingTypeId: number;
  processingType: string;
  outputCategoryId: number;
  outputCategory: string;
  quantityOutput: number;
  unitOfMeasure: string;
  processedBy: string;
  processedDate: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OutputCategoryItem = {
  outputCategoryId: number;
  outputCategoryName: string;
  totalQuantityTon: number;
};

export type WasteSubTypeItem = {
  wasteSubTypeId: number;
  wasteSubTypeName: string;
  totalQuantityTon: number;
  outputCategories: OutputCategoryItem[];
};

export type ProcessingSummaryItem = {
  wasteTypeId: number;
  wasteTypeName: string;
  subTypes: WasteSubTypeItem[];
};

export type ProcessingSummary = {
  totalQuantityTon: number;
  summary: ProcessingSummaryItem[];
};
//outputProcessing
export type ProcessingDetailsResponse = {
  success: boolean;
  data: ProcessingTransaction[];
     summary:any;
     available:{
      inProcessTon: number;
     }
};
export interface AvailableSubTypeForProcessing {
  wasteSubType: string;
  availableQty: number;
}

export interface AvailableWasteTypeForProcessing {
  wasteTypeId: number;
  subTypes: AvailableSubTypeForProcessing[];
}

export interface ProcessingSummaryType {
  totalQuantityTon: number;
  summary: ProcessingSummaryItem[];
}

//stock types
export type stockResponse = {
  success: boolean;
  data: stockData[];
  message?: string;
}
export type stockData = {
  stockId: string;
  plantId: number;
  plantName: string;
  outputCategoryId: number;
  outputCategory: string;
  quantityKg: number;
  unitOfMeasure: string;
  transferredBy: string;
  transferDate: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
//addStockresponse
export type addStockResponse = {
  success: boolean;
  message: string;
  data: {
    stockId: string;
    plantId: number;
    plantName: string | null;
    outputCategoryId: number;
    outputCategory: string;
    quantityKg: number;
    unitOfMeasure: string;
    transferredBy: string;
    transferDate: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
  }
}
//WasteProcessingImportType
export interface WasteProcessingImportResponse {
  success: boolean;
  data: WasteDataForProcessingImport[];
  available: {
    totalTon: number;
    summary: WasteSummaryForProcessingImport[];
  };
}

export interface WasteDataForProcessingImport {
  inputId: string;
  plantId: number;
  plantName: string;
  wasteSubTypeId: number;
  wasteSubType: string;
  quantityKg: number;
  pulledBy: string;
  pulledDate: string;   // ISO date string
  isDeleted: boolean;
  createdAt: string;    // ISO date string
  updatedAt: string;    // ISO date string
}

export interface WasteSummaryForProcessingImport {
  wasteTypeId: number;
  wasteTypeName: string;
  subTypes: WasteSubTypeForProcessingImport[];
  totalQuantityTon: number;
}

export interface WasteSubTypeForProcessingImport {
  wasteSubTypeId: number;
  wasteSubTypeName: string;
  totalQuantityTon: number;
}
