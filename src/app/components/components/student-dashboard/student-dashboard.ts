import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService, Book } from '../../../services/book';
import { BorrowService, Borrow } from '../../../services/borrow';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Student Dashboard</h2>

    <h3>Available Books</h3>
    <ul>
      <li *ngFor="let book of books">
        {{book.title}} by {{book.author}} (Stock: {{book.stock}})
        <button (click)="borrowBook(book.id)" [disabled]="book.stock===0">Borrow</button>
      </li>
    </ul>

    <h3>My Borrows</h3>
    <ul>
      <li *ngFor="let b of borrows">
        {{b.book.title}} - Borrowed: {{b.borrowDate | date:'short'}}
        | Returned: {{b.returnDate ? (b.returnDate | date:'short') : 'Not yet'}}
        <button *ngIf="!b.returnDate" (click)="returnBook(b.id)">Return</button>
      </li>
    </ul>
  `
})
export class StudentDashboardComponent implements OnInit {
  books: Book[] = [];
  borrows: Borrow[] = [];

  constructor(private bookService: BookService, private borrowService: BorrowService) {}

  ngOnInit() {
    this.loadBooks();
    this.loadBorrows();
  }

  loadBooks() { this.bookService.getAll().subscribe(b => this.books = b); }
  loadBorrows() { this.borrowService.getMyBorrows().subscribe(b => this.borrows = b); }

  borrowBook(bookId?: number) {
    if (!bookId) return;
    this.borrowService.borrowBook(bookId).subscribe(() => {
      this.loadBooks(); 
      this.loadBorrows();
    });
  }

  returnBook(borrowId?: number) {
    if (!borrowId) return;
    this.borrowService.returnBook(borrowId).subscribe(() => this.loadBorrows());
  }
}
