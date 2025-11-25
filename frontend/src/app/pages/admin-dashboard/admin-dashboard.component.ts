import { Component, OnInit } from '@angular/core';
import { AdminService } from '@services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  stats: any = {};

  constructor(private admin: AdminService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.admin.getStats().subscribe({
      next: s => this.stats = s,
      error: e => console.error('Failed to load admin stats', e)
    });
  }
}
