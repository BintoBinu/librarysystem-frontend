import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Book, BookService } from '../../services/book';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  // BOOK DATA
  books: Book[] = [];
  book: Book = { title: '', author: '', stock: 0, imageUrl: '' , category: ''};
  currentId?: number;
  editing = false;
  showForm = false;
  loading = false;
  categories: string[] = ['Fiction', 'Anime', 'Adventure', 'Fantasy', 'Novel', 'History', 'Biography' ];
selectedCategory = '';
filteredBooks: Book[] = [];



  // SEARCH & VIEW STATE
  searchTerm = '';
  activeView: 'home' | 'edit' | 'delete' | 'history' | 'pending' | 'students' = 'home';

  // STATS
  totalBooks = 0;
  totalStock = 0;
  lowStockCount = 0;

  // BORROW HISTORY DATA
  borrowHistory: any[] = [];
  filteredHistory: any[] = [];
  historySearch = '';
  pendingSearch = '';
  studentSearch = '';

constructor(
    private bookService: BookService,
    private http: HttpClient,
    private router: Router
  ) {}

  //INIT
  ngOnInit(): void {
    this.loadBooks();
  }

  // VIEW CONTROL
  setView(view: 'home' | 'edit' | 'delete' | 'history' | 'pending' | 'students'): void {
    this.activeView = view;
    this.showForm = false;
    this.editing = false;

    if (['history', 'pending', 'students'].includes(view)) {
      this.loadBorrowHistory();
    }
  }

  //AUTH
  logout(): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e01616ff',
      cancelButtonColor: '#1623dfff',
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

  //BOOK CRUD
  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetForm();
  }
 

categoryBooks(): Book[] {
  const term = this.searchTerm.toLowerCase();
  return this.books.filter(b => {
    const matchesSearch =
      b.title.toLowerCase().includes(term) || b.author.toLowerCase().includes(term);
    const matchesCategory =
      !this.selectedCategory || b.category?.toLowerCase() === this.selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });
}


  loadBooks(): void {
    this.loading = true;
    this.bookService.getAllBooks().subscribe({
      next: (res) => {
        this.books = res;
        this.updateStats();
         this.filteredBooks = res; 
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  saveBook(): void {
    if (!this.book.title.trim() || !this.book.author.trim()) return;

    this.loading = true;
    const request = this.editing && this.currentId
      ? this.bookService.updateBook(this.currentId, this.book)
      : this.bookService.addBook(this.book);

    request.subscribe({
      next: () => {
        this.loadBooks();
        this.resetForm();
        this.showForm = false;
        this.loading = false;

        Swal.fire(
          'Success',
          this.editing ? 'Book updated successfully.' : 'New book added successfully.',
          'success'
        );
      },
      error: () => (this.loading = false)
    });
  }

  edit(book: Book): void {
    this.book = { ...book };
    this.currentId = book.id;
    this.editing = true;
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  delete(id?: number): void {
    if (!id) return;

    Swal.fire({
      title: 'Are you sure?',
      text: 'This book will be deleted permanently.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#eb1919ff',
      cancelButtonColor: '#0e3ece',
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

  resetForm(): void {
    this.book = { title: '', author: '', stock: 0, imageUrl: '' };
    this.editing = false;
    this.currentId = undefined;
  }

  filterBooks(): Book[] {
    const term = this.searchTerm.toLowerCase();
    return this.books.filter(b =>
      b.title.toLowerCase().includes(term) || b.author.toLowerCase().includes(term)
    );
  }

  applyFilters(): void {
  const term = this.searchTerm.toLowerCase();
  this.filteredBooks = this.books.filter(book => {
    const matchesSearch =
      book.title.toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term);
    const matchesCategory =
      !this.selectedCategory ||
      (book.category && book.category.toLowerCase() === this.selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });
}

  //STATS 
  updateStats(): void {
    this.totalBooks = this.books.length;
    this.totalStock = this.books.reduce((sum, b) => sum + b.stock, 0);
    this.lowStockCount = this.books.filter(b => b.stock < 5).length;
  }

  //BORROW HISTORY
  loadBorrowHistory(): void {
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

  searchHistory(): void {
    const term = this.historySearch.toLowerCase();
    this.filteredHistory = this.borrowHistory.filter(user =>
      user.username.toLowerCase().includes(term) ||
      user.borrowedBooks.some((book: any) =>
        book.bookTitle.toLowerCase().includes(term)
      )
    );
  }
 getPendingBooks(): any[] {
    const pending = this.borrowHistory
      .map(user => ({
        username: user.username,
        borrowedBooks: user.borrowedBooks.filter((b: any) => !b.isReturned)
      }))
      .filter(user => user.borrowedBooks.length > 0);

    if (!this.pendingSearch.trim()) return pending;

    const term = this.pendingSearch.toLowerCase();
    return pending.filter(user =>
      user.username.toLowerCase().includes(term) ||
      user.borrowedBooks.some((book: any) =>
        book.bookTitle.toLowerCase().includes(term)
      )
    );
  }

  getStudentList(): any[] {
    const students = this.borrowHistory.filter(user => user.role === 'STUDENT');

    if (!this.studentSearch.trim()) return students;

    const term = this.studentSearch.toLowerCase();
    return students.filter(user =>
      user.username.toLowerCase().includes(term) ||
      user.userId.toString().includes(term)
    );
  }
//RESET CREDENTIALS
  resetCredentials(studentId: number): void {
    Swal.fire({
      title: 'Reset Student Credentials',
      html: `
        <input id="newUsername" class="swal2-input" placeholder="Enter new username" />
        <input id="newPassword" type="password" class="swal2-input" placeholder="Enter new password" />
      `,
      showCancelButton: true,
      confirmButtonText: 'Reset',
      cancelButtonText: 'Cancel',
      focusConfirm: false,
      preConfirm: () => {
        const newUsername = (document.getElementById('newUsername') as HTMLInputElement)?.value.trim();
        const newPassword = (document.getElementById('newPassword') as HTMLInputElement)?.value.trim();

        if (!newUsername || !newPassword) {
          Swal.showValidationMessage('Please enter both a new username and password.');
          return false;
        }
        return { newUsername, newPassword };
      }
    }).then((result) => {
      if (!result.isConfirmed || !result.value) return;

      const { newUsername, newPassword } = result.value;

      this.http.put(
        `http://localhost:8080/api/admin/reset/${studentId}?newUsername=${encodeURIComponent(newUsername)}&newPassword=${encodeURIComponent(newPassword)}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      ).subscribe({
        next: () => {
          Swal.fire('Success', 'Student credentials updated successfully.', 'success');
          this.loadBorrowHistory();
        },
        error: (err) => {
          console.error('Reset failed:', err);
          Swal.fire('Error', 'Failed to reset student credentials. Please try again.', 'error');
        }
      });
    });
  }
}
 