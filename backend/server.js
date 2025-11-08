// config
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// BD MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'edulearn_db'
});

// Import des routes cours
const coursRoutes = require('./routes/cours');

// Connexion à la base
db.connect(err => {
  if (err) {
    console.error('❌ Erreur de connexion à MySQL:', err);
  } else {
    console.log('✅ Connecté à la base de données MySQL');
    initializeDatabase();
  }
});

// Initialisation des tables
function initializeDatabase() {
  // Table users
  const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      prenom VARCHAR(50) NOT NULL,
      nom VARCHAR(50) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      telephone CHAR(8) NULL,
      role ENUM('etudiant', 'enseignant', 'admin') NOT NULL,
      niveauScolaire VARCHAR(20),
      section VARCHAR(50),
      motDePasse VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Table cours
  const createCoursTableQuery = `
    CREATE TABLE IF NOT EXISTS cours (
      id INT AUTO_INCREMENT PRIMARY KEY,
      titre VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      dateCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      enseignantId INT NOT NULL,
      enseignantNom VARCHAR(100),
      enseignantPrenom VARCHAR(100),
      duree INT DEFAULT 60,
      niveau VARCHAR(50),
      FOREIGN KEY (enseignantId) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  // Table supports
  const createSupportsTableQuery = `
    CREATE TABLE IF NOT EXISTS supports (
      id INT AUTO_INCREMENT PRIMARY KEY,
      coursId INT NOT NULL,
      supportUrl VARCHAR(500) NOT NULL,
      fileName VARCHAR(255),
      fileType VARCHAR(100),
      fileSize INT,
      uploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (coursId) REFERENCES cours(id) ON DELETE CASCADE
    )
  `;

  db.query(createUsersTableQuery, (err) => {
    if (err) console.error('❌ Erreur table users:', err);
    else console.log('✅ Table "users" prête.');
  });

  db.query(createCoursTableQuery, (err) => {
    if (err) console.error('❌ Erreur table cours:', err);
    else console.log('✅ Table "cours" prête.');
  });

  db.query(createSupportsTableQuery, (err) => {
    if (err) console.error('❌ Erreur table supports:', err);
    else console.log('✅ Table "supports" prête.');
  });
}

// Middleware pour passer la connexion DB aux routes
app.use((req, res, next) => {
  req.db = db;
  next();
});

// ------------------- Routes Auth -------------------

// Route racine
app.get('/', (req, res) => {
  res.json({ message: '🚀 Serveur backend EduLearn en marche !' });
});

// sign up
app.post('/api/register', async (req, res) => {
  const { prenom, nom, email, telephone, role, niveauScolaire, section, motDePasse } = req.body;

  if (!prenom || !nom || !email || !telephone || !role || !motDePasse) {
    return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis.' });
  }

  if (role === 'etudiant') {
    if (!niveauScolaire) {
      return res.status(400).json({ message: 'Le champ "niveau scolaire" est obligatoire pour les étudiants.' });
    }

    const niveauxAvecSection = ['2eme', '3eme', '4eme'];
    if (niveauxAvecSection.includes(niveauScolaire) && !section) {
      return res.status(400).json({ message: 'Le champ "section" est obligatoire pour ce niveau.' });
    }
  }

  db.query('SELECT email FROM users WHERE email = ?', [email], async (err, result) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur.' });
    if (result.length > 0) return res.status(400).json({ message: 'Cet email est déjà utilisé.' });

    const hashedPassword = await bcrypt.hash(motDePasse, 10);
    const sql = `
      INSERT INTO users (prenom, nom, email, telephone, role, niveauScolaire, section, motDePasse)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [prenom, nom, email, telephone, role, niveauScolaire || null, section || null, hashedPassword], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erreur lors de l\'enregistrement.' });
      }

      res.status(201).json({ message: '✅ Utilisateur créé avec succès !' });
    });
  });
});

// login
app.post('/api/login', (req, res) => {
  const { email, motDePasse } = req.body;

  if (!email || !motDePasse) {
    return res.status(400).json({ message: 'Email et mot de passe requis.' });
  }

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error('Erreur MySQL:', err);
      return res.status(500).json({ message: 'Erreur serveur.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);

    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '2h' }
    );

    res.status(200).json({
      message: 'Connexion réussie !',
      token,
      user: {
        id: user.id,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        role: user.role,
        niveauScolaire: user.niveauScolaire,
        section: user.section
      }
    });
  });
});

// Utiliser les routes cours
app.use('/api', coursRoutes);

// Lancer serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
});