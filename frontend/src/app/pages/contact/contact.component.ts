import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  contactForm: FormGroup;
  submitted = false;
  isLoading = false;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.pattern('^[0-9]{8}$')]],
      sujet: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit() {
    this.submitted = true;
    
    if (this.contactForm.valid) {
      this.isLoading = true;
      
      // Simuler l'envoi du formulaire
      setTimeout(() => {
        console.log('Formulaire envoyé:', this.contactForm.value);
        this.isLoading = false;
        this.contactForm.reset();
        this.submitted = false;
        alert('Votre message a été envoyé avec succès !');
      }, 2000);
    }
  }

  get f() {
    return this.contactForm.controls;
  }
}