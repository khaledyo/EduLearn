import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegisterService } from '../../services/register.service';
import { LoginService } from '../../services/login.service';
import { Router } from '@angular/router';
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
    private loginService: LoginService,
    private router: Router,
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
      role: ['student', [Validators.required]],
      niveauScolaire: [''],
      section: [''],
      motDePasse: ['', [Validators.required, Validators.minLength(8)]],
      confirmationMotDePasse: ['', [Validators.required]],
      acceptConditions: [false, [Validators.requiredTrue]]
    });

    // Réinitialiser les champs spécifiques quand le rôle change
    this.inscriptionForm.get('role')?.valueChanges.subscribe(role => {
      if (role === 'teacher') {
        // Clear student-specific fields when teacher is selected
        this.inscriptionForm.patchValue({
          niveauScolaire: '',
          section: ''
        });
        // Make niveauScolaire and section not required for teachers
        this.inscriptionForm.get('niveauScolaire')?.clearValidators();
        this.inscriptionForm.get('niveauScolaire')?.updateValueAndValidity();
      } else if (role === 'student') {
        // Re-add validators for students if needed
        // (They're already in the form definition)
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
    if (!field) return false;
    
    // Show error if form was submitted and field is invalid
    // Also show if there's a server error (even if form wasn't submitted)
    return (this.formSubmitted && field.invalid) || !!field.errors?.['serverError'];
  }

  // ✅ Message d'erreur personnalisé
  getErrorMessage(fieldName: string): string {
    const field = this.inscriptionForm.get(fieldName);
    if (!field || !field.errors) return '';

    // Server-side errors take priority
    if (field.errors['serverError']) return field.errors['serverError'];

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
    if (role === 'student') {
      if (!niveau) {
        this.showMessage('Veuillez sélectionner un niveau scolaire.', 'error');
        return;
      }

      if (['2eme', '3eme', '4eme'].includes(niveau) && !section) {
        this.showMessage('Veuillez sélectionner une section pour ce niveau.', 'error');
        return;
      }
    } else if (role === 'teacher') {
      // Teachers don't need niveauScolaire or section
      // No additional validation needed
    }

    // 🔒 Validation générale du formulaire
    if (this.inscriptionForm.valid && !this.showPasswordMismatch()) {
      const formValue = { ...this.inscriptionForm.value };
      const prenom = formValue.prenom?.trim();
      const nom = formValue.nom?.trim();
      const payload = {
        name: [prenom, nom].filter(Boolean).join(' ').trim(),
        email: formValue.email?.trim(),
        password: formValue.motDePasse,
        password_confirmation: formValue.confirmationMotDePasse,
        role: role || 'student'
      };

      this.registerService.register(payload).subscribe({
        next: (response) => {
          this.showMessage(response?.message || 'Inscription réussie !', 'success');
          
          // Save user data and token
          if (response.user && response.token) {
            const userData = {
              ...response.user,
              token: response.token
            };
            this.loginService.setUserData(userData);
            
            // If status is pending, don't redirect - user needs admin approval
            if (userData.status === 'pending') {
              // Reset form but keep user logged in (they can see the pending message)
              this.inscriptionForm.reset();
              this.inscriptionForm.patchValue({ role: role || 'student' });
              this.formSubmitted = false;
              this.showGeneralError = false;
              // Don't redirect - let them see the message
              return;
            }
            
            // Redirect based on role for active accounts
            setTimeout(() => {
              if (userData.role === 'student') {
                this.router.navigate(['/mes-cours-etudiant']);
              } else if (userData.role === 'teacher') {
                this.router.navigate(['/mes-cours-enseignant']);
              } else {
                this.router.navigate(['/']);
              }
            }, 1000);
          } else {
            // If no user data, just reset form
          this.inscriptionForm.reset();
            this.inscriptionForm.patchValue({ role: role || 'student' });
          this.formSubmitted = false;
          this.showGeneralError = false;
          }
        },
        error: (err) => {
          let errorMessage = 'Erreur lors de l\'inscription.';
          
          // Handle Laravel validation errors
          if (err.error?.errors) {
            const errors = err.error.errors;
            const errorMessages: string[] = [];
            
            // Map Laravel field names to form field names
            const fieldMapping: { [key: string]: string } = {
              'name': 'nom',
              'email': 'email',
              'password': 'motDePasse'
            };
            
            // Collect all error messages
            Object.keys(errors).forEach(key => {
              const formField = fieldMapping[key] || key;
              const fieldErrors = errors[key];
              if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
                errorMessages.push(...fieldErrors);
                // Mark the form field as invalid
                const control = this.inscriptionForm.get(formField);
                if (control) {
                  control.setErrors({ serverError: fieldErrors[0] });
                }
              }
            });
            
            if (errorMessages.length > 0) {
              errorMessage = errorMessages.join('. ');
            }
          } else if (err.error?.message) {
            errorMessage = err.error.message;
          }
          
          this.showMessage(errorMessage, 'error');
          this.showGeneralError = true;
          console.error(err);
        }
      });
    } else {
      this.showGeneralError = true;
      this.showMessage('Veuillez corriger les erreurs dans le formulaire.', 'error');
    }
  }
}
