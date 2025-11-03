import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Book, BookService } from '../../services/book';
import { HttpClient } from '@angular/common/http';
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
  book: Book = { title: '', author: '', stock: 0, imageUrl: '' };
  editing = false;
  currentId?: number;
  loading = false;
  searchTerm = '';
  showForm = false;

  activeView: 'home' | 'edit' | 'delete' | 'history' | 'pending' | 'students' = 'home';

  totalBooks = 0;
  totalStock = 0;
  lowStockCount = 0;

  borrowHistory: any[] = [];
  filteredHistory: any[] = [];
  historySearch = '';

  constructor(
    private bookService: BookService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadBooks();
  }

  //View controller
  setView(view: 'home' | 'edit' | 'delete' | 'history' | 'pending' | 'students') {
    this.activeView = view;
    this.showForm = false;
    this.editing = false;

    if (view === 'history' || view === 'pending' || view === 'students') {
      this.loadBorrowHistory();
    }
  }

  //logout
  logout() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e01616ff',
      cancelButtonColor: 'rgba(22, 35, 223, 1)',
      confirmButtonText: 'Yes, Logout'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        Swal.fire({
          title: 'Logged Out',
          text: 'You have been successfully logged out.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        }).then(() => this.router.navigate(['/login']));
      }
    });
  }

  //Toggle Add/edit
  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetForm();
  }

  //Load Books
  loadBooks() {
    this.loading = true;
    this.bookService.getAllBooks().subscribe({
      next: (res) => {
        console.log("Result: ",res);
        
        this.books = res;
        this.updateStats();
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  //Update Book
  saveBook() {
    if (!this.book.title.trim() || !this.book.author.trim()) return;
    this.loading = true;

    const req = this.editing && this.currentId
      ? this.bookService.updateBook(this.currentId, this.book)
      : this.bookService.addBook(this.book);

    req.subscribe({
      next: () => {
        this.loadBooks();
        this.resetForm();
        this.showForm = false;
        this.loading = false;
        Swal.fire('Success', this.editing ? 'Book updated successfully.' : 'New book added successfully.', 'success');
      },
      error: () => (this.loading = false)
    });
  }

 //Edit Book
  edit(b: Book) {
    this.book = { ...b };
    this.currentId = b.id;
    this.editing = true;
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  //Delete Book
  delete(id?: number) {
    if (!id) return;
    Swal.fire({
      title: 'Are you sure?',
      text: 'This book will be deleted permanently.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#eb1919ff',
      cancelButtonColor: 'rgba(14, 62, 206, 1)',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookService.deleteBook(id).subscribe(() => {
          this.books = this.books.filter(b => b.id !== id);
          this.updateStats();
          Swal.fire('Deleted', 'Book removed successfully.', 'success');
        });
      }
    });
  }

  //Reset Form
  resetForm() {
    this.book = { title: '', author: '', stock: 0, imageUrl: '' };
    this.editing = false;
    this.currentId = undefined;
  }

  //Filter Books
  filterBooks() {
    const term = this.searchTerm.toLowerCase();
    return this.books.filter(b =>
      b.title.toLowerCase().includes(term) || b.author.toLowerCase().includes(term)
    );
  }

//Update Stats
  updateStats() {
    this.totalBooks = this.books.length;
    this.totalStock = this.books.reduce((sum, b) => sum + b.stock, 0);
    this.lowStockCount = this.books.filter(b => b.stock < 5).length;
  }

  // Load Borrow History
  loadBorrowHistory() {
    this.loading = true;
    this.http.get<any[]>('http://localhost:8080/api/admin/users/borrow-details').subscribe({
      next: (res) => {
        this.borrowHistory = res;
        this.filteredHistory = res;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  searchHistory() {
    const term = this.historySearch.toLowerCase();
    this.filteredHistory = this.borrowHistory.filter(user =>
      user.username.toLowerCase().includes(term) ||
      user.borrowedBooks.some((book: any) => book.bookTitle.toLowerCase().includes(term))
    );
  }

  getPendingBooks() {
    return this.borrowHistory
      .map(user => ({
        username: user.username,
        borrowedBooks: user.borrowedBooks.filter((b: any) => !b.isReturned)
      }))
      .filter(user => user.borrowedBooks.length > 0);
  }

  getStudentList() {
    return this.borrowHistory.filter(user => user.role === 'STUDENT');
  }
}
