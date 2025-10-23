import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegisterService } from '../../services/register.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.css']
})
export class InscriptionComponent implements OnInit {
  inscriptionForm!: FormGroup;
  showGeneralError = false;
  formSubmitted = false;

  constructor(
    private fb: FormBuilder,
    private registerService: RegisterService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.inscriptionForm = this.fb.group({
      prenom: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s\-']+$/)]],
      nom: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s\-']+$/)]],
      email: ['', [Validators.required, Validators.email, this.gmailValidator]],
      telephone: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      role: ['', [Validators.required]],
      niveauScolaire: [''],
      section: [''],
      motDePasse: ['', [Validators.required, Validators.minLength(8)]],
      confirmationMotDePasse: ['', [Validators.required]],
      acceptConditions: [false, [Validators.requiredTrue]]
    });

    // Réinitialiser les champs spécifiques quand le rôle change
    this.inscriptionForm.get('role')?.valueChanges.subscribe(role => {
      if (role !== 'etudiant') {
        this.inscriptionForm.patchValue({
          niveauScolaire: '',
          section: ''
        });
      }
    });
  }

  // ✅ Valide uniquement les emails Gmail
  gmailValidator(control: any) {
    if (!control.value) return null;
    const isGmail = control.value.toLowerCase().endsWith('@gmail.com');
    return isGmail ? null : { notGmail: true };
  }

  // ✅ Vérifie si le champ doit afficher une erreur
  showError(fieldName: string): boolean {
    const field = this.inscriptionForm.get(fieldName);
    return this.formSubmitted && field ? field.invalid : false;
  }

  // ✅ Message d’erreur personnalisé
  getErrorMessage(fieldName: string): string {
    const field = this.inscriptionForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Ce champ est obligatoire';
    if (field.errors['email']) return 'Format d\'email invalide';
    if (field.errors['notGmail']) return 'Veuillez utiliser une adresse Gmail (@gmail.com)';
    if (field.errors['pattern']) {
      if (fieldName === 'telephone') return 'Le numéro doit contenir exactement 8 chiffres';
      if (['prenom', 'nom'].includes(fieldName)) return 'Ce champ ne doit contenir que des lettres';
    }
    if (field.errors['minlength']) return 'Le mot de passe doit contenir au moins 8 caractères';
    if (field.errors['requiredTrue']) return 'Vous devez accepter les conditions';
    return 'Champ invalide';
  }

  // ✅ Vérifie la correspondance des mots de passe
  showPasswordMismatch(): boolean {
    if (!this.formSubmitted) return false;
    const password = this.inscriptionForm.get('motDePasse')?.value;
    const confirmPassword = this.inscriptionForm.get('confirmationMotDePasse')?.value;
    return password && confirmPassword && password !== confirmPassword;
  }

  // ✅ Affiche la section si nécessaire
  showSection(): boolean {
    const niveau = this.inscriptionForm.get('niveauScolaire')?.value;
    return this.isNiveauSecondaireAvance(niveau);
  }

  // ✅ Vérifie si le niveau requiert une section
  isNiveauSecondaireAvance(niveau: string): boolean {
    return ['2eme', '3eme', '4eme'].includes(niveau);
  }

  // ✅ Réinitialise la section si le niveau change
  onNiveauChange(): void {
    const niveau = this.inscriptionForm.get('niveauScolaire')?.value;
    if (!this.isNiveauSecondaireAvance(niveau)) {
      this.inscriptionForm.patchValue({ section: '' });
    }
  }

  // ✅ Affiche un message via MatSnackBar
  showMessage(message: string, type: 'success' | 'error' = 'success'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  // ✅ Soumission du formulaire
  onSubmit(): void {
    this.formSubmitted = true;

    const role = this.inscriptionForm.get('role')?.value;
    const niveau = this.inscriptionForm.get('niveauScolaire')?.value;
    const section = this.inscriptionForm.get('section')?.value;

    // 🔥 Validation spécifique pour les étudiants
    if (role === 'etudiant') {
      if (!niveau) {
        this.showMessage('Veuillez sélectionner un niveau scolaire.', 'error');
        return;
      }

      if (['2eme', '3eme', '4eme'].includes(niveau) && !section) {
        this.showMessage('Veuillez sélectionner une section pour ce niveau.', 'error');
        return;
      }
    }

    // 🔒 Validation générale du formulaire
    if (this.inscriptionForm.valid && !this.showPasswordMismatch()) {
      const formData = { ...this.inscriptionForm.value };
      delete formData.confirmationMotDePasse;
      delete formData.acceptConditions;

      this.registerService.register(formData).subscribe({
        next: (response) => {
          this.showMessage(response.message || 'Inscription réussie !', 'success');
          this.inscriptionForm.reset();
          this.formSubmitted = false;
          this.showGeneralError = false;
        },
        error: (err) => {
          const errorMessage = err.error?.message || 'Erreur lors de l\'inscription.';
          this.showMessage(errorMessage, 'error');
          console.error(err);
        }
      });
    } else {
      this.showGeneralError = true;
      this.showMessage('Veuillez corriger les erreurs dans le formulaire.', 'error');
    }
  }
}
