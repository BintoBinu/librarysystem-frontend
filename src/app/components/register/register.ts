import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import Swal from 'sweetalert2';  

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onRegister() {
    this.loading = true;
    this.error = '';

    this.auth.register({
      username: this.username,
      password: this.password,
      role: 'STUDENT'
    }).subscribe({
      next: () => {
        this.loading = false;

//  Success alert
        Swal.fire({
          title: 'Registration Successful ',
          text: 'Your account has been created successfully. Please log in.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3085d6'
        }).then(() => {
          this.router.navigate(['/']); 
        });
      },
      error: () => {
        this.loading = false;

//  Error alert
        Swal.fire({
          title: 'Error',
          text: 'Registration failed. Please try again.',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    });
  }
}
