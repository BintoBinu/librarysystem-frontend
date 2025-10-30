import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    this.loading = true;
    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.error) {
          this.error = res.error;
        } else {
          if (res.role === 'ADMIN') this.router.navigate(['/admin-dashboard']);
          else this.router.navigate(['/student-dashboard']);
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Login failed. Please try again.';
      }
    });
  }

  // ✅ Added function for Register navigation
  goToRegister() {
    this.router.navigate(['/register']);
  }
}
