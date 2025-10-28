import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Book, BookService } from '../../services/book';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  books: Book[] = [];
  book: Book = { title: '', author: '', stock: 0 };
  editing = false;
  currentId?: number;
  message = '';
  loading = false;
  searchTerm = '';
  showForm = false;

  totalBooks = 0;
  totalStock = 0;
  lowStockCount = 0;

  constructor(private bookService: BookService, private router: Router) {}

  ngOnInit() {
    this.loadBooks();
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetForm();
  }

  loadBooks() {
    this.loading = true;
    this.bookService.getAllBooks().subscribe({
      next: (res) => {
        this.books = res;
        this.updateStats();
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  saveBook() {
    if (!this.book.title.trim() || !this.book.author.trim()) return;
    this.loading = true;

    if (this.editing && this.currentId) {
      this.bookService.updateBook(this.currentId, this.book).subscribe({
        next: () => {
          this.loadBooks();
          this.resetForm();
          this.showForm = false;
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Book Updated!',
            text: 'The book details have been successfully updated.',
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: () => (this.loading = false)
      });
    } else {
      this.bookService.addBook(this.book).subscribe({
        next: () => {
          this.loadBooks();
          this.resetForm();
          this.showForm = false;
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Book Added!',
            text: 'New book has been added successfully.',
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: () => (this.loading = false)
      });
    }
  }

  edit(b: Book) {
    this.book = { ...b };
    this.currentId = b.id;
    this.editing = true;
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  delete(id?: number) {
    if (!id) return;
    Swal.fire({
      title: 'Are you sure?',
      text: 'This book will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1565c0',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookService.deleteBook(id).subscribe(() => {
          this.books = this.books.filter(b => b.id !== id);
          this.updateStats();
          Swal.fire({
            title: 'Deleted!',
            text: 'The book has been removed.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        });
      }
    });
  }

  resetForm() {
    this.book = { title: '', author: '', stock: 0 };
    this.editing = false;
    this.currentId = undefined;
    this.loading = false;
  }

  filterBooks() {
    const term = this.searchTerm.toLowerCase();
    return this.books.filter(
      (b) => b.title.toLowerCase().includes(term) || b.author.toLowerCase().includes(term)
    );
  }

  updateStats() {
    this.totalBooks = this.books.length;
    this.totalStock = this.books.reduce((sum, b) => sum + b.stock, 0);
    this.lowStockCount = this.books.filter((b) => b.stock < 5).length;
  }
}
