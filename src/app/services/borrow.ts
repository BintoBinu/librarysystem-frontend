import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from './book';

export interface Borrow {
  id?: number;
  book: Book;
  borrowDate: string;
  returnDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BorrowService {
  private baseUrl = 'http://localhost:8082/api/borrow';

  constructor(private http: HttpClient) {}

  getMyBorrows(): Observable<Borrow[]> {
    return this.http.get<Borrow[]>(`${this.baseUrl}/my`);
  }

  borrowBook(bookId: number): Observable<Borrow> {
    return this.http.post<Borrow>(`${this.baseUrl}/${bookId}`, {});
  }

  returnBook(borrowId: number): Observable<Borrow> {
    return this.http.post<Borrow>(`${this.baseUrl}/return/${borrowId}`, {});
  }
}
