import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { QuantityInputDto, QuantityResponseDto } from '../models/quantity.models';

@Injectable({
  providedIn: 'root'
})
export class QuantityService {
  private apiUrl = `${environment.apiUrl}/api/quantity`;

  constructor(private http: HttpClient) {}

  compare(input: QuantityInputDto): Observable<QuantityResponseDto> {
    return this.http.post<QuantityResponseDto>(`${this.apiUrl}/compare`, input);
  }

  convert(input: QuantityInputDto): Observable<QuantityResponseDto> {
    return this.http.post<QuantityResponseDto>(`${this.apiUrl}/convert`, input);
  }

  add(input: QuantityInputDto): Observable<QuantityResponseDto> {
    return this.http.post<QuantityResponseDto>(`${this.apiUrl}/add`, input);
  }

  subtract(input: QuantityInputDto): Observable<QuantityResponseDto> {
    return this.http.post<QuantityResponseDto>(`${this.apiUrl}/subtract`, input);
  }

  divide(input: QuantityInputDto): Observable<QuantityResponseDto> {
    return this.http.post<QuantityResponseDto>(`${this.apiUrl}/divide`, input);
  }

  getUnitsByCategory(category: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories/${category}/units`);
  }
}
