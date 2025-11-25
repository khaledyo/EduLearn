# 🎓 EduLearn - Plateforme de Cours Particuliers en Tunisie

<div align="center">

**Application web moderne de mise en relation entre étudiants et professeurs particuliers**  
*Développée avec Angular 16 & Laravel 10*

[![Angular](https://img.shields.io/badge/Angular-16-DD0031?logo=angular&style=for-the-badge)](https://angular.io/)
[![Laravel](https://img.shields.io/badge/Laravel-10-FF2D20?logo=laravel&style=for-the-badge)](https://laravel.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?logo=bootstrap&style=for-the-badge)](https://getbootstrap.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&style=for-the-badge)](https://mysql.com/)

</div>

## 📋 Table des Matières

- [🌟 Aperçu](#-aperçu)
- [🚀 Fonctionnalités](#-fonctionnalités)
- [🛠️ Stack Technologique](#️-stack-technologique)
- [📸 Galerie](#-galerie)
- [⚙️ Installation](#️-installation)
- [🏗️ Architecture](#️-architecture)
- [👥 Rôles Utilisateurs](#-rôles-utilisateurs)
- [🤝 Contribution](#-contribution)

## 🌟 Aperçu

EduLearn est une plateforme innovante qui connecte les étudiants tunisiens avec les meilleurs professeurs particuliers. Notre mission est de démocratiser l'accès à une éducation de qualité grâce à une expérience utilisateur moderne et intuitive.

## 🚀 Fonctionnalités

### 🔐 Authentification Sécurisée
- Inscription et connexion multi-rôles
- Validation des emails
- Sessions sécurisées avec tokens

### 🎯 Pour les Étudiants
- Recherche avancée de professeurs
- Réservation de cours en ligne
- Système de notation et avis
- Suivi de progression détaillé

### 👨‍🏫 Pour les Enseignants
- Création de profil professionnel
- Gestion des offres de cours
- Emploi du temps interactif
- Analytics de performance

### ⚙️ Administration Complète
- Dashboard analytique
- Gestion des utilisateurs et contenus
- Modération en temps réel
- Reporting détaillé

## 🛠️ Stack Technologique

| Couche | Technologies |
|--------|--------------|
| **Frontend** | Angular 16, TypeScript, Bootstrap 5, RxJS, Font Awesome |
| **Backend** | Laravel 10, PHP 8.1+, Eloquent ORM, Sanctum |
| **Base de Données** | MySQL 8.0 |
| **Outils** | Git, Composer, npm, RESTful API |

## 📸 Galerie

### 🔐 Pages d'Authentification
<div align="center">

![Login](https://via.placeholder.com/400x600/667eea/ffffff?text=Page+Login)
![Register](https://via.placeholder.com/400x600/764ba2/ffffff?text=Page+Register)

*Interfaces modernes et sécurisées pour l'authentification*

</div>

### 🏠 Page d'Accueil Visiteur
<div align="center">

![Accueil Hero](https://via.placeholder.com/600x400/4facfe/ffffff?text=Section+Hero)
![Offres de Cours](https://via.placeholder.com/600x400/43e97b/ffffff?text=Carrousel+Offres)

*Design responsive avec carrousel 3D des offres*

</div>

### ℹ️ Page À Propos
<div align="center">

![À Propos 1](https://via.placeholder.com/600x400/f093fb/ffffff?text=Notre+Mission)
![À Propos 2](https://via.placeholder.com/400x400/f5576c/ffffff?text=Notre+Équipe)

*Présentation professionnelle de notre mission et équipe*

</div>

### 📞 Page Contact
<div align="center">

![Formulaire Contact](https://via.placeholder.com/600x400/667eea/ffffff?text=Formulaire+Contact)
![Carte Interactive](https://via.placeholder.com/400x400/764ba2/ffffff?text=Carte+Interactive)

*Interface de contact avec carte interactive et formulaire*

</div>

### 🎓 Espace Étudiant
<div align="center">

![Dashboard Étudiant](https://via.placeholder.com/600x400/4facfe/ffffff?text=Dashboard+Étudiant)

*Dashboard personnalisé avec suivi des cours et progression*

</div>

### 👨‍🏫 Espace Enseignant
<div align="center">

![Dashboard Enseignant](https://via.placeholder.com/600x400/43e97b/ffffff?text=Dashboard+Enseignant)

*Interface de gestion des cours et étudiants*

</div>

### ⚙️ Administration
<div align="center">

![Admin Dashboard](https://via.placeholder.com/600x300/f093fb/ffffff?text=Admin+Dashboard)
![Gestion Utilisateurs](https://via.placeholder.com/600x400/f5576c/ffffff?text=Gestion+Utilisateurs)
![Gestion Cours](https://via.placeholder.com/600x400/667eea/ffffff?text=Gestion+Cours)

*Panel d'administration complet avec analytics et gestion*

</div>

## ⚙️ Installation

### Prérequis
- Node.js 18+ 
- PHP 8.1+
- Composer
- MySQL 8.0+

### 🚀 Démarrage Rapide

```bash
# Cloner le projet
git clone https://github.com/khaledyo/EduLearn.git
cd EduLearn

# Backend Laravel
cd backend
composer install
cp .env.example .env
php artisan key:generate

# Configurer la base de données dans .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=edulearn
DB_USERNAME=root
DB_PASSWORD=

php artisan migrate --seed
php artisan serve

# Frontend Angular (nouveau terminal)
cd ../frontend
npm install
ng serve
