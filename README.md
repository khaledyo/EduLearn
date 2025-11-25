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

<img src="https://github.com/user-attachments/assets/9565874a-8623-4cab-9254-bb15dc21e382" width="400" />
<img src="https://github.com/user-attachments/assets/0be426cb-553c-4697-81ff-eb8c5e94909c" width="400" />

*Interfaces modernes et sécurisées pour l'authentification*

</div>

### 🏠 Page d'Accueil Visiteur
<div align="center">

![Accueil Hero](https://github.com/user-attachments/assets/ec104396-c994-42ef-8d49-87fc4fb10092)
![Offres de Cours](https://github.com/user-attachments/assets/bc252100-e3b7-4c92-aef0-5ef8ef888042)

*Design responsive avec carrousel 3D des offres*

</div>

### ℹ️ Page À Propos
<div align="center">

![À Propos 1](https://github.com/user-attachments/assets/c98a7222-1609-4190-a2e4-9752d0bee0da)
![À Propos 2](https://github.com/user-attachments/assets/2fb31674-9ef6-428f-afed-ee1a2be6c638)

*Présentation professionnelle de notre mission et équipe*

</div>

### 📞 Page Contact
<div align="center">

![Formulaire Contact](https://github.com/user-attachments/assets/cb70b92a-266b-4b95-9ff5-16be6f122bfe)
![Carte Interactive](https://github.com/user-attachments/assets/01844e40-8db0-4208-aeab-b5505d8dadb3)

*Interface de contact avec carte interactive et formulaire*

</div>

### 🎓 Espace Étudiant
<div align="center">

![Dashboard Étudiant](https://github.com/user-attachments/assets/3b4d987f-cd93-4bc8-9d34-bea9e57579e8)

*Dashboard personnalisé avec suivi des cours et progression*

</div>

### 👨‍🏫 Espace Enseignant
<div align="center">

![Dashboard Enseignant](https://github.com/user-attachments/assets/8711a14a-e835-466b-ad4f-4e07d7c73e35)

*Interface de gestion des cours et étudiants*

</div>

### ⚙️ Administration
<div align="center">

![Admin Dashboard](https://github.com/user-attachments/assets/fcce41be-fe5e-4e1d-92cc-91a23831899f)
![Gestion Utilisateurs](https://github.com/user-attachments/assets/c5a52122-3be6-4c49-91d3-e181f2661fd4)
![Gestion Cours](https://github.com/user-attachments/assets/358f21b2-94f7-4b5a-8a10-1f66e9a440aa)

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
