import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

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
  // ✅ must be plural — matches backend @RequestMapping("/api/borrows")
  private baseUrl = 'http://localhost:8080/api/borrows';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders() {
    const token = this.authService.token;
    return token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
  }

  // ✅ matches: @PostMapping("/borrow") with query params
  borrowBook(userId: number, bookId: number): Observable<Borrow> {
    return this.http.post<Borrow>(
      `${this.baseUrl}/borrow?userId=${userId}&bookId=${bookId}`,
      {},
      this.getAuthHeaders()
    );
  }

  // ✅ matches: @PostMapping("/return/{borrowId}")
  returnBook(borrowId: number): Observable<Borrow> {
    return this.http.post<Borrow>(
      `${this.baseUrl}/return/${borrowId}`,
      {},
      this.getAuthHeaders()
    );
  }

  // ✅ matches: @GetMapping("/history/{userId}")
  getBorrowHistory(userId: number): Observable<Borrow[]> {
    return this.http.get<Borrow[]>(
      `${this.baseUrl}/history/${userId}`,
      this.getAuthHeaders()
    );
  }

  // ✅ matches: @GetMapping (for Admin)
  getAllBorrows(): Observable<Borrow[]> {
    return this.http.get<Borrow[]>(this.baseUrl, this.getAuthHeaders());
  }
}
