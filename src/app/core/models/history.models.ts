export interface HistoryItemDto {
  id: string;            // Guid
  operationType: string;
  category: string;
  value1: number;
  unit1: string;
  value2: number;
  unit2: string;
  targetUnit: string;
  additionResult: string;
  subtractionResult: string;
  divisionResult: number;
  isEqual: boolean;
  isSuccess: boolean;
  errorMessage: string;
  createdAt: string;
}
