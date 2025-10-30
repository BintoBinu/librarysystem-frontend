import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Book, BookService } from '../../services/book';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-list.html',
  styleUrls: ['./book-list.css']
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
    if (confirm('Are you sure to delete this book?') && id) {
      this.bookService.deleteBook(id).subscribe(() => alert('Book deleted!'));
    }
  }
}
