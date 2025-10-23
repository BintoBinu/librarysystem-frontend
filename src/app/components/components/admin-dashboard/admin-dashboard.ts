import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Book, BookService } from '../../../services/book';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Admin Dashboard</h2>

    <h3>Add Book</h3>
    <form (ngSubmit)="addBook()">
      <input [(ngModel)]="newBook.title" name="title" placeholder="Title" required>
      <input [(ngModel)]="newBook.author" name="author" placeholder="Author" required>
      <input [(ngModel)]="newBook.stock" name="stock" type="number" placeholder="Stock" required>
      <button type="submit">Add</button>
    </form>

    <h3>All Books</h3>
    <ul>
      <li *ngFor="let b of books">
        {{b.title}} by {{b.author}} (Stock: {{b.stock}})
        <button (click)="editBook(b)">Edit</button>
        <button (click)="deleteBook(b.id)">Delete</button>
      </li>
    </ul>
  `
})
export class AdminDashboardComponent implements OnInit {
  books: Book[] = [];
  newBook: Book = { title: '', author: '', stock: 1 };

  constructor(private bookService: BookService) {}

  ngOnInit() {
    this.loadBooks();
  }

  loadBooks() {
    this.bookService.getAll().subscribe(b => this.books = b);
  }

  addBook() {
    this.bookService.add(this.newBook).subscribe(() => {
      this.newBook = { title: '', author: '', stock: 1 };
      this.loadBooks();
    });
  }

  editBook(book: Book) {
    const updatedTitle = prompt('New title:', book.title);
    const updatedAuthor = prompt('New author:', book.author);
    const updatedStock = prompt('New stock:', book.stock.toString());

    if (updatedTitle && updatedAuthor && updatedStock) {
      book.title = updatedTitle;
      book.author = updatedAuthor;
      book.stock = +updatedStock;
      this.bookService.edit(book.id!, book).subscribe(() => this.loadBooks());
    }
  }

  deleteBook(id?: number) {
    if (!id) return;
    this.bookService.delete(id).subscribe(() => this.loadBooks());
  }
}
