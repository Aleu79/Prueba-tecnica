import { Component } from '@angular/core';
import { Router, NavigationEnd, Event, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/ui/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderAdminComponent } from './admin/header-admin/header-admin.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, HeaderAdminComponent, FooterComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'signal-store';
  private _isAdmin = false;

  constructor(private router: Router) {
    this.router.events
      .pipe(
        filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {
        this._isAdmin = event.urlAfterRedirects.startsWith('/admin');
      });
  }

  get isAdminRoute(): boolean {
    return this._isAdmin;
  }
}
