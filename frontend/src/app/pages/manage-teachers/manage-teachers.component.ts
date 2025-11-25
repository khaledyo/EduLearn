import { Component, OnInit } from '@angular/core';
import { AdminService } from '@services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-teachers',
  templateUrl: './manage-teachers.component.html',
  styleUrls: ['./manage-teachers.component.css']
})
export class ManageTeachersComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  loading = false;
  searchQuery = '';
  currentPage = 1;
  itemsPerPage = 10;

  constructor(private admin: AdminService, private router: Router) { }

  viewDetails(user: any): void {
    this.router.navigate(['/admin/users', user.id]);
  }

  deleteTeacherConfirm(user: any): void {
    if (!confirm(`Êtes-vous sûr de supprimer l'enseignant ${user.name}? Cette action archivera l'utilisateur et ses contenus.`)) return;
    this.admin.deleteTeacher(user.id).subscribe({ next: () => this.loadUsers(), error: (e:any) => console.error(e) });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.admin.getUsers().subscribe({
      next: (u: any) => {
        this.users = Array.isArray(u) ? u.filter((usr: any) => usr.role === 'teacher' || usr.role === 'enseignant') : [];
        this.applyFilters();
        this.loading = false;
      },
      error: (e: any) => { console.error(e); this.loading = false }
    });
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter((user: any) => {
      const searchLower = this.searchQuery.toLowerCase();
      return (
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.role?.toLowerCase().includes(searchLower) ||
        user.status?.toLowerCase().includes(searchLower)
      );
    });
    this.currentPage = 1;
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
  }

  get paginatedUsers(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  approve(user: any): void {
    this.admin.updateUser(user.id, { status: 'active' }).subscribe({ next: () => this.loadUsers(), error: (e:any) => console.error(e) });
  }

  reject(user: any): void {
    this.admin.updateUser(user.id, { status: 'pending' }).subscribe({ next: () => this.loadUsers(), error: (e:any) => console.error(e) });
  }
}
