import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Book, BookService } from '../../services/book';
import { Borrow, BorrowService } from '../../services/borrow';
import { AuthService } from '../../services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- 🌟 Navbar -->
    <nav class="navbar">
      <div class="nav-left">
        <img src="librarylogo.png" alt="Library Logo" class="logo" />
        <h2>Library Portal</h2>
      </div>

      <div class="nav-center">
        <input
          type="text"
          [(ngModel)]="searchTerm"
          placeholder="🔍 Search books..."
          class="nav-search"
        />
      </div>

      <div class="nav-right">
        <button class="nav-btn" (click)="showSection('books')">Books</button>
        <button class="nav-btn" (click)="showSection('history')">My History</button>
        <button class="nav-btn logout" (click)="logout()">Logout</button>
      </div>
    </nav>

    <div class="student-dashboard">
      <div class="dashboard-content">
        <!-- 📊 Summary -->
        <div class="summary-cards">
          <div class="summary-card total">
            <h3>{{ totalBooks }}</h3>
            <p>Total Books</p>
          </div>
          <div class="summary-card available">
            <h3>{{ availableStock }}</h3>
            <p>Available Stock</p>
          </div>
        </div>

        <!-- 📚 Available Books -->
        <section *ngIf="activeSection === 'books'" class="section">
          <h3>📚 Available Books</h3>
          <div *ngIf="filteredBooks().length; else noBooks" class="book-list">
            <div *ngFor="let book of filteredBooks()" class="book-card">
              <div class="book-info">
                <h4>{{ book.title }}</h4>
                <p>by {{ book.author }}</p>
                <p class="stock">Available: {{ book.stock }}</p>
              </div>
              <button class="btn-borrow" (click)="borrowBook(book.id)">Borrow</button>
            </div>
          </div>
          <ng-template #noBooks>
            <p class="no-data">No books found.</p>
          </ng-template>
        </section>

        <!-- 🕓 Borrow History -->
        <section *ngIf="activeSection === 'history'" class="section">
          <h3>🕓 Your Borrow History</h3>
          <div *ngIf="history.length; else noHistory" class="history-list">
            <div *ngFor="let b of history" class="history-card">
              <h4>{{ b.book.title }}</h4>
              <p>Status:
                <span [ngClass]="b.returned ? 'returned' : 'borrowed'">
                  {{ b.returned ? 'Returned' : 'Borrowed' }}
                </span>
              </p>
            </div>
          </div>
          <ng-template #noHistory>
            <p class="no-data">No borrowing history found.</p>
          </ng-template>
        </section>
      </div>
    </div>
  `,
  styles: [`
    /* 🌟 Navbar */
    .navbar {
      position: sticky;
      top: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(90deg, #1565c0, #42a5f5);
      padding: 0.8rem 1.5rem;
      color: white;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      z-index: 100;
    }

    .nav-left {
      display: flex;
      align-items: center;
      gap: 0.8rem;
    }

    .logo {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }

    .nav-center {
      flex: 1;
      text-align: center;
    }

    .nav-search {
      width: 60%;
      padding: 0.6rem 1rem;
      border-radius: 25px;
      border: none;
      outline: none;
      font-size: 0.95rem;
    }

    .nav-right {
      display: flex;
      gap: 1rem;
    }

    .nav-btn {
      background: white;
      color: #1565c0;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 25px;
      font-weight: 600;
      cursor: pointer;
      transition: 0.3s;
    }

    .nav-btn:hover {
      background: #e3f2fd;
      transform: scale(1.05);
    }

    .logout {
      background: #f44336;
      color: white;
    }

    .logout:hover {
      background: #d32f2f;
    }

    /* Dashboard Area */
    .student-dashboard {
      background: linear-gradient(135deg, #f5f7fa, #e4ecf7);
      min-height: 100vh;
      font-family: "Poppins", sans-serif;
      padding: 2rem;
    }

    .summary-cards {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .summary-card {
      background: white;
      width: 200px;
      padding: 1rem;
      border-radius: 15px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }

    .summary-card:hover {
      transform: translateY(-5px);
    }

    .summary-card.total {
      border-left: 6px solid #1565c0;
    }

    .summary-card.available {
      border-left: 6px solid #2e7d32;
    }

    .section {
      background: white;
      padding: 1.5rem 2rem;
      border-radius: 15px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
      animation: fadeIn 0.8s ease;
    }

    .book-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .book-card {
      background: #ffffff;
      padding: 1rem;
      border-radius: 15px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.3s ease;
    }

    .book-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 15px rgba(33, 150, 243, 0.2);
    }

    .btn-borrow {
      background: linear-gradient(90deg, #1565c0, #42a5f5);
      color: white;
      border: none;
      padding: 0.6rem;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 0.8rem;
      transition: 0.3s;
    }

    .btn-borrow:hover {
      transform: scale(1.03);
      background: linear-gradient(90deg, #0d47a1, #2196f3);
    }

    .history-card {
      background: #f8fafc;
      border-left: 5px solid #1565c0;
      padding: 1rem;
      border-radius: 10px;
    }

    .returned {
      color: #2e7d32;
      font-weight: 600;
    }

    .borrowed {
      color: #d32f2f;
      font-weight: 600;
    }

    .no-data {
      text-align: center;
      color: #757575;
      font-style: italic;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class StudentDashboardComponent implements OnInit {
  books: Book[] = [];
  history: Borrow[] = [];
  totalBooks = 0;
  availableStock = 0;
  searchTerm = '';
  activeSection: 'books' | 'history' = 'books';

  constructor(
    public auth: AuthService,
    private bookService: BookService,
    private borrowService: BorrowService
  ) {}

  ngOnInit() {
    this.loadBooks();
    this.loadHistory();
  }

  showSection(section: 'books' | 'history') {
    this.activeSection = section;
  }

  loadBooks() {
    this.bookService.getAllBooks().subscribe({
      next: (b) => {
        this.books = b;
        this.totalBooks = b.length;
        this.availableStock = b.reduce((sum, book) => sum + (book.stock || 0), 0);
      },
      error: () => Swal.fire('Error', 'Failed to load books', 'error')
    });
  }

  loadHistory() {
    const userId = 1; // replace with real user ID
    this.borrowService.getBorrowHistory(userId).subscribe({
      next: (h) => (this.history = h),
      error: () => Swal.fire('Error', 'Failed to load borrow history', 'error')
    });
  }

  borrowBook(bookId?: number) {
    const userId = 1; // replace with logged-in user ID
    if (!bookId) return;

    this.borrowService.borrowBook(userId, bookId).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Book Borrowed!',
          text: 'You have successfully borrowed this book.',
          timer: 2000,
          showConfirmButton: false
        });
        this.loadBooks();
        this.loadHistory();
      },
      error: () => Swal.fire('Error', 'Unable to borrow book', 'error')
    });
  }

  filteredBooks() {
    const term = this.searchTerm.toLowerCase();
    return this.books.filter(
      (b) => b.title.toLowerCase().includes(term) || b.author.toLowerCase().includes(term)
    );
  }

  logout() {
    Swal.fire({
      title: 'Logged Out',
      text: 'You have successfully logged out.',
      icon: 'info',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      // Add your logout logic here
    });
  }
}
