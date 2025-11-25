import { Component, OnInit } from '@angular/core';
import { AdminService } from '@services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-students',
  templateUrl: './manage-students.component.html',
  styleUrls: ['./manage-students.component.css']
})
export class ManageStudentsComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  loading = false;
  searchQuery = '';
  currentPage = 1;
  itemsPerPage = 10;

  constructor(private admin: AdminService, private router: Router) { }

  ngOnInit(): void {
    this.loadStudents();
  }

  viewDetails(user: any): void {
    this.router.navigate(['/admin/users', user.id]);
  }

  toggleTeacherStatus(user: any): void {
    if (user.role === 'teacher') {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      this.admin.updateUser(user.id, { status: newStatus }).subscribe({ 
        next: () => this.loadStudents(), 
        error: (e:any) => console.error(e) 
      });
    }
  }

  loadStudents(): void {
    this.loading = true;
    this.admin.getUsers().subscribe({ 
      next: (u:any) => { 
        this.users = u.filter((x:any)=> x.role === 'student'); 
        this.applyFilters();
        this.loading = false; 
      }, 
      error: (e:any) => { 
        console.error(e); 
        this.loading = false; 
      } 
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

  remove(user: any): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    this.admin.deleteUser(user.id).subscribe({ 
      next: () => this.loadStudents(), 
      error: (e:any) => console.error(e) 
    });
  }
}
