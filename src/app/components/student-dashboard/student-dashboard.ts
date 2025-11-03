import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Book, BookService } from '../../services/book';
import { Borrow, BorrowService } from '../../services/borrow';
import { AuthService } from '../../services/auth';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-dashboard.html',
  styleUrls: ['./student-dashboard.css']
})
export class StudentDashboardComponent implements OnInit {
  books: Book[] = [];
  filteredBooks: Book[] = [];
  borrowed: Borrow[] = [];
  history: Borrow[] = [];
  activeSection: 'books' | 'borrowed' | 'return' | 'history' = 'books';
  loading = false;
  searchQuery = '';
  studentName = '';

  constructor(
    private bookService: BookService,
    private borrowService: BorrowService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.studentName = this.authService.getUsername() || 'Student';

    //  Restore last active section on refresh
    const savedSection = localStorage.getItem('activeSection');
    if (
      savedSection === 'books' ||
      savedSection === 'borrowed' ||
      savedSection === 'return' ||
      savedSection === 'history'
    ) {
      this.activeSection = savedSection;
    }

    this.loadBooks();
    this.loadBorrowed();
  }

  // Load all books
  loadBooks() {
    this.loading = true;
    this.bookService.getAllBooks().subscribe({
      next: (res) => {
        this.books = res;
        this.filteredBooks = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading books:', err);
        this.loading = false;
      }
    });
  }

  //  Filter books
  searchBooks() {
    const query = this.searchQuery.toLowerCase();
    this.filteredBooks = this.books.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
    );
  }

  // Load borrowed books for current user
  loadBorrowed() {
    const userId = this.authService.getUserId();
    if (!userId) {
      Swal.fire('Session Expired', 'Please log in again.', 'warning');
      return;
    }

    this.borrowService.getBorrowHistory(Number(userId)).subscribe({
      next: (res) => {
        this.history = res;
        this.borrowed = res.filter((b) => !b.returned);
      },
      error: (err) => console.error('Error loading borrow history:', err)
    });
  }

  // Borrow a book
  borrowBook(bookId: number) {
    const userId = this.authService.getUserId();
    if (!userId) {
      Swal.fire('Session Expired', 'Please log in again.', 'warning');
      return;
    }

    this.borrowService.borrowBook(Number(userId), bookId).subscribe({
      next: () => {
        Swal.fire('Success!', 'Book borrowed successfully.', 'success');
        this.loadBooks();
        this.loadBorrowed();
      },
      error: (err) => {
        console.error('Borrow error:', err);
        Swal.fire('Failed', 'Unable to borrow this book.', 'error');
      }
    });
  }

  //  Return a borrowed book
  returnBook(borrowId: number) {
    this.borrowService.returnBook(borrowId).subscribe({
      next: () => {
        Swal.fire('Returned!', 'Book returned successfully.', 'success');
        this.loadBooks();
        this.loadBorrowed();
      },
      error: (err) => {
        console.error('Return error:', err);
        Swal.fire('Failed', 'Unable to return this book.', 'error');
      }
    });
  }

  // Calculate total stock
  getTotalStock(): number {
    return this.filteredBooks.reduce((sum, book) => sum + (book.stock || 0), 0);
  }

  // Switch 
  setActive(section: 'books' | 'borrowed' | 'return' | 'history') {
    this.activeSection = section;
    localStorage.setItem('activeSection', section); 
  }

  //Logout user
  logout() {
    Swal.fire({
      title: ' Logout',
      text: 'Are you sure you want to log out?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ed0b0bff',
      cancelButtonColor: '#1531d4ff',
      confirmButtonText: 'Yes Logout'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('activeSection'); 
        this.authService.logout();
      }
    });
  }
}
