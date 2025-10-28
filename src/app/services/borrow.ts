import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Borrow {
  id?: number;
  student?: any;
  book?: any;
  borrowDate?: string;
  returnDate?: string;
  returned?: boolean;
}

@Injectable({ providedIn: 'root' })
export class BorrowService {
  private baseUrl = 'http://localhost:8080/api/borrow';

  constructor(private http: HttpClient) {}

  borrowBook(userId: number, bookId: number): Observable<Borrow> {
    return this.http.post<Borrow>(`${this.baseUrl}/borrow?userId=${userId}&bookId=${bookId}`, {});
  }

  returnBook(borrowId: number): Observable<Borrow> {
    return this.http.post<Borrow>(`${this.baseUrl}/return/${borrowId}`, {});
  }

  getBorrowHistory(userId: number): Observable<Borrow[]> {
    return this.http.get<Borrow[]>(`${this.baseUrl}/history/${userId}`);
  }

  getAllBorrows(): Observable<Borrow[]> {
    return this.http.get<Borrow[]>(this.baseUrl);
  }
}
