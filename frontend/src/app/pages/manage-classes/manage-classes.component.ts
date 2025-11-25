import { Component, OnInit } from '@angular/core';
import { AdminService } from '@services/admin.service';

@Component({
  selector: 'app-manage-classes',
  templateUrl: './manage-classes.component.html',
  styleUrls: ['./manage-classes.component.css']
})
export class ManageClassesComponent implements OnInit {
  classes: any[] = [];
  filteredClasses: any[] = [];
  loading = false;
  searchQuery = '';
  currentPage = 1;
  itemsPerPage = 10;

  constructor(private admin: AdminService) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.admin.getClasses().subscribe({ 
      next: (c:any) => { 
        this.classes = c; 
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
    this.filteredClasses = this.classes.filter((cls: any) => {
      const searchLower = this.searchQuery.toLowerCase();
      return (
        cls.name?.toLowerCase().includes(searchLower) ||
        cls.description?.toLowerCase().includes(searchLower) ||
        cls.teacher?.name?.toLowerCase().includes(searchLower) ||
        cls.teacher?.email?.toLowerCase().includes(searchLower)
      );
    });
    this.currentPage = 1;
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
  }

  get paginatedClasses(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredClasses.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredClasses.length / this.itemsPerPage);
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

  deleteClassConfirm(c: any): void {
    if (!confirm(`Êtes-vous sûr de supprimer la classe "${c.name}" ? Cela archivera la classe et tout son contenu.`)) return;
    this.admin.deleteClass(c.id).subscribe({ next: () => this.load(), error: (e:any) => console.error(e) });
  }
}
