import { Component, OnInit } from '@angular/core';
import { AdminService } from '@services/admin.service';

@Component({
  selector: 'app-course-approvals',
  templateUrl: './course-approvals.component.html',
  styleUrls: ['./course-approvals.component.css']
})
export class CourseApprovalsComponent implements OnInit {
  // Class Requests
  classRequests: any[] = [];
  filteredClassRequests: any[] = [];
  classSearchQuery = '';
  classPage = 1;

  // Course Requests
  courseRequests: any[] = [];
  filteredCourseRequests: any[] = [];
  courseSearchQuery = '';
  coursePage = 1;

  itemsPerPage = 10;
  loading = false;

  constructor(private admin: AdminService) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    
    this.admin.getClassRequests().subscribe({ 
      next: (r:any) => { 
        console.log('Raw class requests from API:', r);
        this.classRequests = r.filter((req: any) => req.status === 'pending'); 
        console.log('Filtered class requests (pending only):', this.classRequests);
        this.applyClassFilters();
      }, 
      error: (e:any) => {
        console.error('Error loading class requests:', e);
      }
    });

    this.admin.getCourseRequests().subscribe({ 
      next: (r:any) => { 
        console.log('Raw course requests from API:', r);
        this.courseRequests = r.filter((req: any) => req.status === 'pending'); 
        console.log('Filtered course requests (pending only):', this.courseRequests);
        this.applyCourseFilters();
        this.loading = false;
      }, 
      error: (e:any) => { 
        console.error('Error loading course requests:', e); 
        this.loading = false;
      }
    });
  }

  // Class Request Methods
  applyClassFilters(): void {
    this.filteredClassRequests = this.classRequests.filter((req: any) => {
      const searchLower = this.classSearchQuery.toLowerCase();
      return (
        req.name?.toLowerCase().includes(searchLower) ||
        req.description?.toLowerCase().includes(searchLower) ||
        req.teacher?.name?.toLowerCase().includes(searchLower) ||
        req.teacher?.email?.toLowerCase().includes(searchLower)
      );
    });
    this.classPage = 1;
  }

  onClassSearchChange(query: string): void {
    this.classSearchQuery = query;
    this.applyClassFilters();
  }

  get paginatedClassRequests(): any[] {
    const startIndex = (this.classPage - 1) * this.itemsPerPage;
    return this.filteredClassRequests.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get classTotalPages(): number {
    return Math.ceil(this.filteredClassRequests.length / this.itemsPerPage);
  }

  goToClassPage(page: number): void {
    if (page >= 1 && page <= this.classTotalPages) {
      this.classPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousClassPage(): void {
    this.goToClassPage(this.classPage - 1);
  }

  nextClassPage(): void {
    this.goToClassPage(this.classPage + 1);
  }

  approveClass(req: any): void {
    if (!confirm(`Êtes-vous sûr d'approuver la classe "${req.name}"?`)) return;
    this.admin.approveClassRequest(req.id).subscribe({ 
      next: () => this.load(), 
      error: (e:any) => { 
        console.error(e); 
        alert('Erreur lors de l\'approbation'); 
      } 
    });
  }

  rejectClass(req: any): void {
    console.log('=== REJECT CLASS DEBUG ===');
    console.log('Request object:', req);
    console.log('Request ID:', req?.id);
    console.log('Request status:', req?.status);
    
    if (!req?.id) {
      alert('Erreur: ID de requête invalide');
      console.error('Cannot reject - no valid ID found');
      return;
    }
    
    if (!confirm(`Êtes-vous sûr de rejeter la classe "${req.name}"?`)) return;
    console.log('Calling reject API with ID:', req.id);
    this.admin.rejectClassRequest(req.id).subscribe({ 
      next: (response: any) => {
        console.log('Reject response:', response);
        console.log('Class request rejected successfully');
        this.load(); 
      }, 
      error: (e:any) => { 
        console.error('Error rejecting class:', e); 
        alert('Erreur lors du rejet: ' + (e?.error?.message || e?.message || 'Erreur inconnue')); 
      } 
    });
  }

  // Course Request Methods
  applyCourseFilters(): void {
    this.filteredCourseRequests = this.courseRequests.filter((req: any) => {
      const searchLower = this.courseSearchQuery.toLowerCase();
      return (
        req.name?.toLowerCase().includes(searchLower) ||
        req.description?.toLowerCase().includes(searchLower) ||
        req.teacher?.name?.toLowerCase().includes(searchLower) ||
        req.teacher?.email?.toLowerCase().includes(searchLower)
      );
    });
    this.coursePage = 1;
  }

  onCourseSearchChange(query: string): void {
    this.courseSearchQuery = query;
    this.applyCourseFilters();
  }

  get paginatedCourseRequests(): any[] {
    const startIndex = (this.coursePage - 1) * this.itemsPerPage;
    return this.filteredCourseRequests.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get courseTotalPages(): number {
    return Math.ceil(this.filteredCourseRequests.length / this.itemsPerPage);
  }

  goToCoursePage(page: number): void {
    if (page >= 1 && page <= this.courseTotalPages) {
      this.coursePage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousCoursePage(): void {
    this.goToCoursePage(this.coursePage - 1);
  }

  nextCoursePage(): void {
    this.goToCoursePage(this.coursePage + 1);
  }

  approveCourse(req: any): void {
    if (!confirm(`Êtes-vous sûr d'approuver le cours "${req.name}"?`)) return;
    this.admin.approveCourseRequest(req.id).subscribe({ 
      next: () => this.load(), 
      error: (e:any) => { 
        console.error(e); 
        alert('Erreur lors de l\'approbation'); 
      } 
    });
  }

  rejectCourse(req: any): void {
    console.log('=== REJECT COURSE DEBUG ===');
    console.log('Request object:', req);
    console.log('Request ID:', req?.id);
    console.log('Request status:', req?.status);
    
    if (!req?.id) {
      alert('Erreur: ID de requête invalide');
      console.error('Cannot reject - no valid ID found');
      return;
    }
    
    if (!confirm(`Êtes-vous sûr de rejeter le cours "${req.name}"?`)) return;
    console.log('Calling reject API with ID:', req.id);
    this.admin.rejectCourseRequest(req.id).subscribe({ 
      next: (response: any) => {
        console.log('Reject response:', response);
        console.log('Course rejected successfully');
        this.load(); 
      }, 
      error: (e:any) => { 
        console.error('Error rejecting course:', e); 
        alert('Erreur lors du rejet: ' + (e?.error?.message || e?.message || 'Erreur inconnue')); 
      } 
    });
  }
}
