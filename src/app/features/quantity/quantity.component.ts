import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QuantityService } from '../../core/services/quantity.service';
import { HistoryService } from '../../core/services/history.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quantity',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quantity.component.html',
  styleUrl: './quantity.component.css'
})
export class QuantityComponent implements OnInit {
  quantityService = inject(QuantityService);
  historyService = inject(HistoryService);
  authService = inject(AuthService);
  router = inject(Router);
  fb = inject(FormBuilder);

  operations = ['convert', 'compare', 'add', 'subtract', 'divide'];
  categories = ['length', 'weight', 'volume', 'temperature'];
  units: string[] = [];

  quantityForm: FormGroup = this.fb.group({
    operation: ['convert', Validators.required],
    category: ['length', Validators.required],
    value1: [0, [Validators.required, Validators.min(0)]], // 0 because temperatures can go negative, but generally basic quantities are positive. For this simple app, we'll omit min(0) on temperatures, but we'll deal with it later. Removing min(0) to be safe for temperatures.
    unit1: ['', Validators.required],
    value2: [0], // used for operations like add, subtract, compare
    unit2: ['', Validators.required]
  });

  isLoadingUnits = false;
  isProcessing = false;
  isSaving = false;
  resultMessage = '';
  isSuccess = false;
  
  // Keep track of the last successful run to save
  lastOperationPayload: any = null;

  ngOnInit() {
    // Basic setup: omit Validator.min(0) for broader use
    this.quantityForm.get('value1')?.setValidators([Validators.required]);
    
    this.loadUnitsForCategory('length');

    // Re-fetch units when category changes
    this.quantityForm.get('category')?.valueChanges.subscribe(category => {
      this.loadUnitsForCategory(category);
    });
  }

  loadUnitsForCategory(category: string) {
    this.isLoadingUnits = true;
    this.quantityService.getUnitsByCategory(category).subscribe({
      next: (units) => {
        this.units = units;
        this.isLoadingUnits = false;
        if (units.length > 0) {
           this.quantityForm.patchValue({ unit1: units[0], unit2: units[0] });
        }
      },
      error: () => {
        this.units = [];
        this.isLoadingUnits = false;
      }
    });
  }

  get isMathOperation(): boolean {
    const op = this.quantityForm.get('operation')?.value;
    return op === 'add' || op === 'subtract' || op === 'divide' || op === 'compare';
  }

  setOperation(op: string) {
    this.quantityForm.patchValue({ operation: op });
    this.resultMessage = '';
    this.lastOperationPayload = null;
    
    if (op === 'convert') {
      this.quantityForm.get('value2')?.clearValidators();
    } else {
      this.quantityForm.get('value2')?.setValidators([Validators.required]);
    }
    this.quantityForm.get('value2')?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.quantityForm.invalid) {
      this.quantityForm.markAllAsTouched();
      return;
    }

    this.isProcessing = true;
    this.resultMessage = '';
    this.isSuccess = false;

    const op = this.quantityForm.value.operation;
    const payload = {
      value1: this.quantityForm.value.value1,
      unit1: this.quantityForm.value.unit1,
      value2: this.quantityForm.value.value2 || 0,
      unit2: this.quantityForm.value.unit2,
      category: this.quantityForm.value.category,
      targetUnit: this.quantityForm.value.unit2
    };

    let obs$;
    switch (op) {
      case 'compare': obs$ = this.quantityService.compare(payload); break;
      case 'add': obs$ = this.quantityService.add(payload); break;
      case 'subtract': obs$ = this.quantityService.subtract(payload); break;
      case 'divide': obs$ = this.quantityService.divide(payload); break;
      default: obs$ = this.quantityService.convert(payload); break; // convert
    }

    obs$.subscribe({
      next: (res: any) => {
        this.isProcessing = false;
        this.isSuccess = res.isSuccess;
        
        if (res.isSuccess) {
           if (op === 'compare') {
              this.resultMessage = res.isEqual
                ? 'Comparison Result: The two quantities are EQUAL.'
                : 'Comparison Result: The two quantities are NOT equal.';
           } else {
              // Backend returns Result as a formatted string e.g. "Quantity(329, YARD)"
              this.resultMessage = res.result || res.message || 'Done';
           }
           this.lastOperationPayload = { ...payload, result: res.result || 0 };
        } else {
           this.resultMessage = res.message || 'Operation failed.';
        }
      },
      error: (err: any) => {
        this.isProcessing = false;
        this.isSuccess = false;
        this.resultMessage = err.error?.message || 'A network or server error occurred.';
      }
    });
  }

  viewHistory() {
    // History is auto-saved by the backend on every operation.
    this.router.navigate(['/history']);
  }
}
