export interface QuantityInputDto {
  value1: number;
  unit1: string;
  value2?: number; // Used for add, subtract, divide, compare
  unit2: string;   // Used for target component, or compare unit
  category: string; // length, weight, volume, temperature
  targetUnit?: string;
}

export interface QuantityResponseDto {
  isSuccess: boolean;
  message?: string;
  result?: number;     // for math operations or convert
  resultUnit?: string;
  value1?: number;
  unit1?: string;
  value2?: number;
  unit2?: string;
}
