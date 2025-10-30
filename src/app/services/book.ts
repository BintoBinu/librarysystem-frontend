import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Book {
  id?: number;
  title: string;
  author: string;
  stock: number;
  available?: boolean;
  imageUrl?: string; 
}

@Injectable({ providedIn: 'root' })
export class BookService {
  private baseUrl = 'http://localhost:8080/api/books';

  constructor(private http: HttpClient) {}

  
  getAllBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.baseUrl);
  }

  addBook(book: Book): Observable<Book> {
    return this.http.post<Book>(this.baseUrl, book);
  }

  
  updateBook(id: number, book: Book): Observable<Book> {
    return this.http.put<Book>(`${this.baseUrl}/${id}`, book);
  }


  deleteBook(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
  addBookWithImage(formData: FormData): Observable<Book> {
    return this.http.post<Book>(`${this.baseUrl}/upload`, formData);
  }

  updateBookWithImage(id: number, formData: FormData): Observable<Book> {
    return this.http.put<Book>(`${this.baseUrl}/upload/${id}`, formData);
  }
}
