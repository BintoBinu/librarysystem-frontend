import { Routes } from '@angular/router';
import { LoginComponent } from './components/components/login/login';
import { AdminDashboardComponent } from './components/components/admin-dashboard/admin-dashboard';
import { StudentDashboardComponent } from './components/components/student-dashboard/student-dashboard';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'student', component: StudentDashboardComponent }
];
