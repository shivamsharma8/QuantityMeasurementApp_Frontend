import { Component, inject, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  router = inject(Router);
  fb = inject(FormBuilder);
  ngZone = inject(NgZone);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  errorMessage = '';
  private googleInitInterval: any;

  ngOnInit() {
    this.initializeGoogleLogin();
  }

  ngOnDestroy() {
    if (this.googleInitInterval) {
      clearInterval(this.googleInitInterval);
    }
  }

  initializeGoogleLogin() {
    const clientId = '50282433381-o0e8ep2928v993bpck1acgdkk1a5iqq3.apps.googleusercontent.com';

    const checkAndInit = () => {
      if (typeof google !== 'undefined' && google.accounts) {
        if (this.googleInitInterval) clearInterval(this.googleInitInterval);
        
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            this.ngZone.run(() => {
              this.handleGoogleLogin(response);
            });
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });

        const btnContainer = document.getElementById('google-btn-container');
        if (btnContainer) {
          google.accounts.id.renderButton(
            btnContainer,
            { theme: 'outline', size: 'large', shape: 'rectangular', width: '350' }
          );
        }
      }
    };

    checkAndInit();
    
    if (typeof google === 'undefined' || !google.accounts) {
      this.googleInitInterval = setInterval(checkAndInit, 500);
    }
  }

  handleGoogleLogin(response: any) {
    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      idToken: response.credential
    };

    this.authService.googleLogin(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/quantity']);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Google Login failed. Please try again.';
      }
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/quantity']);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Login failed. Please check your credentials.';
      }
    });
  }
}
