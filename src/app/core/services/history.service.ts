import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { HistoryItemDto } from '../models/history.models';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private apiUrl = `${environment.apiUrl}/api/history`;

  constructor(private http: HttpClient) {}

  getHistory(): Observable<HistoryItemDto[]> {
    return this.http.get<HistoryItemDto[]>(this.apiUrl).pipe(
      map(results => {
        return results.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      })
    );
  }

  deleteHistory(id: any): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
