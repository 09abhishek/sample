import { AppService } from './../../../app.serveice';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(private router: Router, private appService: AppService) { }

  ngOnInit(): void {
  }
  logout() {
    localStorage.removeItem('userDetails');
    localStorage.removeItem('tokensDetails');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshTokenDetails');
    this.appService.doLogout({}).subscribe(((item: any) => {}));
    this.router.navigate(['/login']);
  }
}
