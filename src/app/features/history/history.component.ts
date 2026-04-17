import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HistoryService } from '../../core/services/history.service';
import { HistoryItemDto } from '../../core/models/history.models';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [DatePipe],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  historyService = inject(HistoryService);

  historyItems: HistoryItemDto[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.isLoading = true;
    this.errorMessage = '';
    this.historyService.getHistory().subscribe({
      next: (data) => {
        this.historyItems = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'Please log in to view your history.';
        } else if (err.status === 0) {
          this.errorMessage = 'Cannot connect to backend. Ensure services are running.';
        } else {
          this.errorMessage = `Failed to load history records (Error ${err.status}).`;
        }
      }
    });
  }

  /** Format a UTC datetime string (from the backend) as IST */
  formatIST(dateStr: string): string {
    if (!dateStr) return '';
    // Append 'Z' to force UTC interpretation if missing
    const utcStr = dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : dateStr + 'Z';
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: '2-digit',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date(utcStr));
  }

  deleteRecord(id: string) {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    this.historyService.deleteHistory(id as any).subscribe({
      next: () => {
        this.historyItems = this.historyItems.filter(item => item.id !== id);
      },
      error: (err: any) => {
        alert(err.error?.message || 'Failed to delete record.');
      }
    });
  }
}
