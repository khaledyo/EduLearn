import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '@services/admin.service';

@Component({
  selector: 'app-admin-user-detail',
  templateUrl: './admin-user-detail.component.html',
  styleUrls: ['./admin-user-detail.component.css']
})
export class AdminUserDetailComponent implements OnInit {
  user: any = null;
  loading = false;

  constructor(private route: ActivatedRoute, private admin: AdminService, private router: Router) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.loadUser(id);
  }

  loadUser(id: number) {
    this.loading = true;
    this.admin.getUser(id).subscribe({ next: u => { this.user = u; this.loading = false }, error: e => { console.error(e); this.loading = false } });
  }

  approve() {
    if (!this.user) return;
    this.admin.updateUser(this.user.id, { status: 'active' }).subscribe({ next: () => this.loadUser(this.user.id), error: (e:any) => console.error(e) });
  }

  deactivate() {
    if (!this.user) return;
    this.admin.updateUser(this.user.id, { status: 'inactive' }).subscribe({ next: () => this.loadUser(this.user.id), error: (e:any) => console.error(e) });
  }

  remove() {
    if (!this.user) return;
    if (!confirm('Supprimer cet utilisateur ?')) return;
    this.admin.deleteUser(this.user.id).subscribe({ next: () => this.router.navigate(['/admin/students']), error: (e:any) => console.error(e) });
  }

  back() {
    this.router.navigate(['/admin']);
  }
}
