import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service'; 
import { SanitizationService } from '../../services/sanatizacion/sanitization.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  errorMessage = '';
  showPassword = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private sanitizer: SanitizationService) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.authService.logout();
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    const rawCredentials = this.loginForm.value;
    const credentials = this.sanitizer.sanitizeObject(rawCredentials) as { username: string; password: string };

    this.authService.login(credentials).subscribe({
      error: (err) => {
        this.errorMessage = 'Usuario o contraseña incorrectos';
        console.error(err);
      },
    });
  }
}

