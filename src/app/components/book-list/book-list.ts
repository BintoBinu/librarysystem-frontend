import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Book, BookService } from '../../services/book';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="row">
      <div class="col-md-4 mb-3" *ngFor="let book of books">
        <div class="card p-3 shadow-sm">
          <h5>{{ book.title }}</h5>
          <p>Author: {{ book.author }}</p>
          <p>Stock: {{ book.stock }}</p>
          <button *ngIf="showBorrow" class="btn btn-primary" (click)="borrow(book.id)">Borrow</button>
          <button *ngIf="showDelete" class="btn btn-danger" (click)="delete(book.id)">Delete</button>
        </div>
      </div>
    </div>
  `
})
export class BookListComponent {
  @Input() books: Book[] = [];
  @Input() showBorrow = false;
  @Input() showDelete = false;

  constructor(private bookService: BookService) {}

  borrow(id?: number) {
    alert(`Borrow clicked for book ID ${id}`);
  }

  delete(id?: number) {
    if (confirm('Are you sure to delete this book?') && id)
      this.bookService.deleteBook(id).subscribe(() => alert('Book deleted!'));
  }
}
