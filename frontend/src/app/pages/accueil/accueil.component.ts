import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';

interface Offer {
  name: string;
  description: string;
  image: string;
  badge: string;
  features: string[];
  price: string;
  gradient: string;
}

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css']
})
export class AccueilComponent implements OnInit, OnDestroy {
  currentSlide = 0;
  currentHeroPhoto = 0;
  autoRotateInterval: any;
  heroPhotoInterval: any;
  isHovering = false;
  drag = {
    active: false,
    startX: 0,
    deltaX: 0
  };
  @ViewChild('offersSection') offersSection!: ElementRef;

  // ... méthodes existantes ...

  // Méthode pour faire défiler jusqu'à la section des offres
  scrollToOffers() {
    const offersElement = document.getElementById('offres');
    if (offersElement) {
      offersElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
  // Photos pour le carrousel Hero
  heroPhotos = [
    'assets/photo3.jpg',
    'assets/photo4.jpg',
     'assets/photo.jpg',
    'assets/photo2.jpg'
  ];

  offers: Offer[] = [
    {
      name: 'Offre Basique',
      description: 'Cours particuliers individuels avec suivi personnalisé pour une progression régulière',
      image: 'assets/images/basic.jpg',
      badge: 'Essentiel',
      features: [
        '1 cours par semaine',
        'Support par email',
        'Exercices pratiques',
        'Bilan mensuel',
        'Suivi des progrès'
      ],
      price: '45 DT/séance',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      name: 'Offre Standard',
      description: 'Formule complète avec suivi renforcé et ressources supplémentaires',
      image: 'assets/images/standard.jpg',
      badge: 'Populaire',
      features: [
        '2 cours par semaine',
        'Support téléphonique',
        'Évaluations régulières',
        'Ressources supplémentaires',
        'Planning personnalisé'
      ],
      price: '50 DT/séance',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      name: 'Offre Premium',
      description: 'Accompagnement complet avec coaching personnalisé et avantages exclusifs',
      image: 'assets/images/premium.jpg',
      badge: 'Premium',
      features: [
        'Cours illimités',
        'Support 24/7',
        'Coaching personnalisé',
        'Sessions de révision',
        'Certificat de fin',
        'Accès à la plateforme'
      ],
      price: '65 DT/séance',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      name: 'Offre Intensive',
      description: 'Préparation intensive pour examens avec programme accéléré',
      image: 'assets/images/intensive.jpg',
      badge: 'Intensif',
      features: [
        '3+ cours par semaine',
        'Simulations d\'examen',
        'Corrections détaillées',
        'Ressources premium',
        'Mentor dédié'
      ],
      price: '75 DT/séance',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    }
  ];

  // configuration visuelle
  readonly visibleRange = 3;
  readonly cardSpacing = 280;
  readonly depthSpacing = 150;
  readonly sideRotateDeg = 45;
  readonly perspective = 2000;

  ngOnInit() {
    this.startAutoRotation();
    this.startHeroPhotoRotation();
  }

  ngOnDestroy() {
    this.stopAutoRotation();
    this.stopHeroPhotoRotation();
  }

  // Méthodes pour le carrousel Hero
  startHeroPhotoRotation() {
    this.stopHeroPhotoRotation();
    this.heroPhotoInterval = setInterval(() => {
      this.nextHeroPhoto();
    }, 5000); // Change toutes les 5 secondes
  }

  stopHeroPhotoRotation() {
    if (this.heroPhotoInterval) {
      clearInterval(this.heroPhotoInterval);
      this.heroPhotoInterval = null;
    }
  }

  nextHeroPhoto() {
    this.currentHeroPhoto = (this.currentHeroPhoto + 1) % this.heroPhotos.length;
  }

  prevHeroPhoto() {
    this.currentHeroPhoto = (this.currentHeroPhoto - 1 + this.heroPhotos.length) % this.heroPhotos.length;
  }

  goToHeroPhoto(index: number) {
    this.currentHeroPhoto = index % this.heroPhotos.length;
  }

  // Les méthodes existantes restent inchangées
  startAutoRotation() {
    this.stopAutoRotation();
    this.autoRotateInterval = setInterval(() => {
      if (!this.isHovering && !this.drag.active) {
        this.nextSlide();
      }
    }, 4000);
  }

  stopAutoRotation() {
    if (this.autoRotateInterval) {
      clearInterval(this.autoRotateInterval);
      this.autoRotateInterval = null;
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.offers.length;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.offers.length) % this.offers.length;
  }

  goToSlide(index: number) {
    this.currentSlide = index % this.offers.length;
  }

  // Normaliser la distance circulaire minimale entre deux indices
  private circularOffset(index: number, center: number): number {
    const n = this.offers.length;
    let diff = index - center;
    if (diff > n/2) diff -= n;
    if (diff < -n/2) diff += n;
    return diff;
  }

  // Renvoie le style CSS appliqué à la carte i selon l'offset
  getCardStyle(i: number) {
    const offset = this.circularOffset(i, this.currentSlide);
    const absOffset = Math.abs(offset);
    
    // Calculs des transformations 3D améliorées
    const tx = offset * this.cardSpacing;
    const tz = -absOffset * this.depthSpacing;
    const rotateY = offset * -this.sideRotateDeg;
    const scale = Math.max(0.75, 1 - absOffset * 0.15);
    
    // Effets visuels avancés
    const opacity = absOffset > this.visibleRange ? 0 : (1 - absOffset * 0.3);
    const zIndex = 1000 - absOffset * 10;
    const filter = absOffset > 0 ? `blur(${absOffset * 2}px)` : 'none';
    
    // Animation de levée pour la carte centrale
    const translateY = offset === 0 ? -20 : absOffset * 10;

    return {
      transform: `perspective(${this.perspective}px) translateX(${tx}px) translateZ(${tz}px) translateY(${translateY}px) rotateY(${rotateY}deg) scale(${scale})`,
      zIndex: zIndex,
      opacity: opacity,
      filter: filter,
      transition: this.drag.active ? 'none' : 'all 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    };
  }

  // Gestion des erreurs d'images
  handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    console.log('Image loading error for:', imgElement.src);
    
    // Option 1: Cacher l'image et laisser le fond gradient s'afficher
    imgElement.style.display = 'none';
  }

  // hover handlers to pause auto-rotation
  onMouseEnterCarousel() {
    this.isHovering = true;
  }
  onMouseLeaveCarousel() {
    this.isHovering = false;
  }

  // Drag support (souris / tactile)
  onPointerDown(event: PointerEvent, i?: number) {
    (event.target as Element).setPointerCapture(event.pointerId);
    this.drag.active = true;
    this.drag.startX = event.clientX;
    this.drag.deltaX = 0;
  }

  onPointerMove(event: PointerEvent) {
    if (!this.drag.active) return;
    this.drag.deltaX = event.clientX - this.drag.startX;
    // si dépasse seuil -> changer de slide
    const threshold = 80;
    if (this.drag.deltaX > threshold) {
      this.prevSlide();
      this.drag.startX = event.clientX;
    } else if (this.drag.deltaX < -threshold) {
      this.nextSlide();
      this.drag.startX = event.clientX;
    }
  }

  onPointerUp(event: PointerEvent) {
    if (!this.drag.active) return;
    this.drag.active = false;
    this.drag.deltaX = 0;
  }

  // support clavier
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(ev: KeyboardEvent) {
    if (ev.key === 'ArrowLeft') this.prevSlide();
    if (ev.key === 'ArrowRight') this.nextSlide();
  }
}