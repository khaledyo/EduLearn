// config
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// BD MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'edulearn_db'
});

db.connect(err => {
  if (err) {
    console.error('❌ Erreur de connexion à MySQL:', err);
  } else {
    console.log('✅ Connecté à la base de données MySQL');
  }
});

// config nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

//stockage temporaire de code 
const resetCodes = new Map();

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

  // Verifie si l'email existe déja
  db.query('SELECT email FROM users WHERE email = ?', [email], async (err, result) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur.' });
    if (result.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    const hashedPassword = await bcrypt.hash(motDePasse, 10);
    const sql = `
      INSERT INTO users (prenom, nom, email, telephone, role, niveauScolaire, section, motDePasse)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      sql,
      [prenom, nom, email, telephone, role, niveauScolaire || null, section || null, hashedPassword],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Erreur lors de l\'enregistrement.' });
        }

        res.status(201).json({ message: '✅ Utilisateur créé avec succès !' });
      }
    );
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

    // Token JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '2h' }
    );

    // Afiich
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

// just pour le test or de sprint 3
app.get('/api/profile', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ message: 'Token requis.' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    res.json({ message: '✅ Token valide.', decoded });
  } catch (err) {
    res.status(403).json({ message: 'Token invalide.' });
  }
});

// mot de passe oublie
app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email requis.' });
  }

  // Verifier si l'email existe
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('Erreur MySQL:', err);
      return res.status(500).json({ message: 'Erreur serveur.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Aucun compte trouvé avec cet email.' });
    }

    const user = results[0];
    
    // genere code 6 chiffre pour le recuperation de mot de passe 
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // expert en 5 m
    resetCodes.set(email, {
      code: verificationCode,
      expires: Date.now() + 5 * 60 * 1000,
      userId: user.id
    });

    try {
      const mailOptions = {
        from: `"EduLearn Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Code de vérification - Réinitialisation de mot de passe',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .header { text-align: center; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
              .code { font-size: 32px; font-weight: bold; text-align: center; color: #3b82f6; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; letter-spacing: 5px; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
              .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>EduLearn</h1>
                <p>Réinitialisation de mot de passe</p>
              </div>
              
              <h2>Bonjour ${user.prenom} ${user.nom},</h2>
              <p>Vous avez demandé à réinitialiser votre mot de passe EduLearn.</p>
              
              <div class="code">${verificationCode}</div>
              
              <div class="warning">
                <strong>⚠️ Ce code expirera dans 5 minutes</strong>
                <p>Si vous n'avez pas fait cette demande, veuillez ignorer cet email.</p>
              </div>
              
              <p>Entrez ce code dans l'application pour continuer la réinitialisation.</p>
              
              <div class="footer">
                <p>© 2024 EduLearn. Tous droits réservés.</p>
                <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await transporter.sendMail(mailOptions);
      
      console.log(`✅ Code de vérification envoyé à ${email}`);
      
      res.status(200).json({ 
        message: 'Code de vérification envoyé à votre email.'
      });

    } catch (emailError) {
      console.error('❌ Erreur envoi email:', emailError);
      res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email.' });
    }
  });
});

// just for verif 
app.post('/api/verify-code', (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: 'Email et code requis.' });
  }

  const resetData = resetCodes.get(email);

  if (!resetData) {
    return res.status(400).json({ message: 'Code invalide ou expiré.' });
  }

  if (Date.now() > resetData.expires) {
    resetCodes.delete(email);
    return res.status(400).json({ message: 'Le code a expiré.' });
  }

  if (resetData.code !== code) {
    return res.status(400).json({ message: 'Code incorrect.' });
  }

  res.status(200).json({ 
    message: 'Code vérifié avec succès.',
    verified: true 
  });
});

// changer le mot de  passe 
app.post('/api/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères.' });
  }

  const resetData = resetCodes.get(email);

  if (!resetData || resetData.code !== code || Date.now() > resetData.expires) {
    return res.status(400).json({ message: 'Code invalide ou expiré.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    db.query('UPDATE users SET motDePasse = ? WHERE id = ?', 
      [hashedPassword, resetData.userId], 
      async (err, result) => {
        if (err) {
          console.error('Erreur MySQL:', err);
          return res.status(500).json({ message: 'Erreur serveur.' });
        }

        // Envoyer un email de confirmation
        try {
          const mailOptions = {
            from: `"EduLearn Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Mot de passe modifié - EduLearn',
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
                  .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                  .header { text-align: center; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
                  .success { text-align: center; color: #10b981; font-size: 48px; margin: 20px 0; }
                  .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
                  .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>EduLearn</h1>
                    <p>Mot de passe modifié</p>
                  </div>
                  
                  <div class="success">✓</div>
                  
                  <h2>Mot de passe réinitialisé avec succès</h2>
                  <p>Bonjour, votre mot de passe EduLearn a été modifié avec succès.</p>
                  
                  <p><strong>Date de modification:</strong> ${new Date().toLocaleString('fr-FR')}</p>
                  
                  <div class="warning">
                    <strong>⚠️ Sécurité</strong>
                    <p>Si vous n'êtes pas à l'origine de cette modification, veuillez contacter immédiatement le support.</p>
                  </div>
                  
                  <div class="footer">
                    <p>© 2024 EduLearn. Tous droits réservés.</p>
                  </div>
                </div>
              </body>
              </html>
            `
          };

          await transporter.sendMail(mailOptions);
        } catch (emailError) {
          console.error('Erreur envoi email confirmation:', emailError);
        }

        // supp le code after l'utilisation
        resetCodes.delete(email);
        
        res.status(200).json({ message: 'Mot de passe réinitialisé avec succès.' });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du hash du mot de passe.' });
  }
});

// lance le server et verif que tout le info d'env sont bien
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur le port ${PORT}`);
  console.log(`📧 Email configuré: ${process.env.EMAIL_USER}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV}`);
  console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? 'Configuré' : 'Utilisation fallback'}`);
});