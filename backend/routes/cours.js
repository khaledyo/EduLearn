const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware d'authentification
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token d\'accès requis' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalide' });
    }
    req.user = user;
    next();
  });
}

// Middleware pour vérifier le rôle enseignant
function requireEnseignant(req, res, next) {
  if (req.user.role !== 'enseignant' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès réservé aux enseignants' });
  }
  next();
}

// Fonction utilitaire pour récupérer un cours avec ses supports
function getCoursWithSupports(coursId, db, callback) {
  const sql = `
    SELECT c.*, 
           GROUP_CONCAT(s.supportUrl) as supports 
    FROM cours c 
    LEFT JOIN supports s ON c.id = s.coursId 
    WHERE c.id = ? 
    GROUP BY c.id
  `;

  db.query(sql, [coursId], (err, results) => {
    if (err) {
      return callback(err, null);
    }

    if (results.length === 0) {
      return callback(null, null);
    }

    const row = results[0];
    const cours = {
      id: row.id,
      titre: row.titre,
      description: row.description,
      support: row.supports ? row.supports.split(',') : [],
      dateCreation: row.dateCreation,
      enseignantId: row.enseignantId,
      enseignantNom: row.enseignantNom,
      enseignantPrenom: row.enseignantPrenom,
      duree: row.duree,
      niveau: row.niveau
    };

    callback(null, cours);
  });
}

// CREATE - Créer un nouveau cours
router.post('/enseignant/cours', authenticateToken, requireEnseignant, (req, res) => {
  const { titre, description, support, duree, niveau } = req.body;
  const db = req.db;
  
  if (!titre || !description) {
    return res.status(400).json({ message: 'Le titre et la description sont obligatoires' });
  }

  // Récupérer les informations de l'enseignant
  db.query('SELECT prenom, nom FROM users WHERE id = ?', [req.user.id], (err, results) => {
    if (err) {
      console.error('Erreur récupération enseignant:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Enseignant non trouvé' });
    }

    const enseignant = results[0];
    const coursData = {
      titre,
      description,
      enseignantId: req.user.id,
      enseignantNom: enseignant.nom,
      enseignantPrenom: enseignant.prenom,
      duree: duree || 60,
      niveau: niveau || 'Tous niveaux'
    };

    const sql = 'INSERT INTO cours SET ?';
    db.query(sql, coursData, (err, result) => {
      if (err) {
        console.error('Erreur création cours:', err);
        return res.status(500).json({ message: 'Erreur lors de la création du cours' });
      }

      const coursId = result.insertId;

      // Si des supports sont fournis, les ajouter
      if (support && support.trim() !== '') {
        const supportUrls = support.split(',').map(url => url.trim()).filter(url => url !== '');
        if (supportUrls.length > 0) {
          const supportsData = supportUrls.map(supportUrl => [
            coursId,
            supportUrl,
            supportUrl.split('/').pop() || 'fichier',
            'application/octet-stream',
            0
          ]);

          const supportSql = 'INSERT INTO supports (coursId, supportUrl, fileName, fileType, fileSize) VALUES ?';
          db.query(supportSql, [supportsData], (err) => {
            if (err) {
              console.error('Erreur ajout supports:', err);
            }
          });
        }
      }

      // Récupérer le cours créé avec ses supports
      getCoursWithSupports(coursId, db, (err, coursComplet) => {
        if (err) {
          console.error('Erreur récupération cours:', err);
          return res.status(201).json({
            id: coursId,
            ...coursData,
            support: support || ''
          });
        }
        res.status(201).json(coursComplet);
      });
    });
  });
});

// READ - Récupérer tous les cours d'un enseignant
router.get('/enseignant/cours/enseignant/:enseignantId', authenticateToken, (req, res) => {
  const enseignantId = parseInt(req.params.enseignantId);
  const db = req.db;

  const sql = `
    SELECT c.*, 
           GROUP_CONCAT(s.supportUrl) as supports 
    FROM cours c 
    LEFT JOIN supports s ON c.id = s.coursId 
    WHERE c.enseignantId = ? 
    GROUP BY c.id 
    ORDER BY c.dateCreation DESC
  `;

  db.query(sql, [enseignantId], (err, results) => {
    if (err) {
      console.error('Erreur récupération cours enseignant:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    const coursAvecSupports = results.map(row => ({
      id: row.id,
      titre: row.titre,
      description: row.description,
      support: row.supports ? row.supports.split(',') : [],
      dateCreation: row.dateCreation,
      enseignantId: row.enseignantId,
      enseignantNom: row.enseignantNom,
      enseignantPrenom: row.enseignantPrenom,
      duree: row.duree,
      niveau: row.niveau
    }));

    res.json(coursAvecSupports);
  });
});

// READ - Récupérer tous les cours (pour étudiant)
router.get('/enseignant/cours', authenticateToken, (req, res) => {
  const db = req.db;

  const sql = `
    SELECT c.*, 
           GROUP_CONCAT(s.supportUrl) as supports 
    FROM cours c 
    LEFT JOIN supports s ON c.id = s.coursId 
    GROUP BY c.id 
    ORDER BY c.dateCreation DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erreur récupération tous les cours:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    const coursAvecSupports = results.map(row => ({
      id: row.id,
      titre: row.titre,
      description: row.description,
      support: row.supports ? row.supports.split(',') : [],
      dateCreation: row.dateCreation,
      enseignantId: row.enseignantId,
      enseignantNom: row.enseignantNom,
      enseignantPrenom: row.enseignantPrenom,
      duree: row.duree,
      niveau: row.niveau
    }));

    res.json(coursAvecSupports);
  });
});

// READ - Récupérer un cours par son ID
router.get('/enseignant/cours/:id', authenticateToken, (req, res) => {
  const coursId = parseInt(req.params.id);
  const db = req.db;

  getCoursWithSupports(coursId, db, (err, cours) => {
    if (err) {
      console.error('Erreur récupération cours:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    if (!cours) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    res.json(cours);
  });
});

// UPDATE - Mettre à jour un cours
router.put('/enseignant/cours/:id', authenticateToken, requireEnseignant, (req, res) => {
  const coursId = parseInt(req.params.id);
  const { titre, description, support, duree, niveau } = req.body;
  const db = req.db;

  // Vérifier que le cours appartient à l'enseignant
  db.query('SELECT enseignantId FROM cours WHERE id = ?', [coursId], (err, results) => {
    if (err) {
      console.error('Erreur vérification propriétaire:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    if (results[0].enseignantId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier ce cours' });
    }

    const updateData = {
      titre,
      description,
      duree,
      niveau
    };

    // Supprimer les champs undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const sql = 'UPDATE cours SET ? WHERE id = ?';
    db.query(sql, [updateData, coursId], (err, result) => {
      if (err) {
        console.error('Erreur mise à jour cours:', err);
        return res.status(500).json({ message: 'Erreur lors de la mise à jour du cours' });
      }

      // Mettre à jour les supports si fournis
      if (support !== undefined) {
        // Supprimer les anciens supports
        db.query('DELETE FROM supports WHERE coursId = ?', [coursId], (err) => {
          if (err) {
            console.error('Erreur suppression anciens supports:', err);
          }

          // Ajouter les nouveaux supports
          if (support && support.trim() !== '') {
            const supportUrls = support.split(',').map(url => url.trim()).filter(url => url !== '');
            if (supportUrls.length > 0) {
              const supportsData = supportUrls.map(supportUrl => [
                coursId,
                supportUrl,
                supportUrl.split('/').pop() || 'fichier',
                'application/octet-stream',
                0
              ]);

              const supportSql = 'INSERT INTO supports (coursId, supportUrl, fileName, fileType, fileSize) VALUES ?';
              db.query(supportSql, [supportsData], (err) => {
                if (err) {
                  console.error('Erreur ajout nouveaux supports:', err);
                }
              });
            }
          }
        });
      }

      // Récupérer le cours mis à jour
      getCoursWithSupports(coursId, db, (err, coursComplet) => {
        if (err) {
          console.error('Erreur récupération cours mis à jour:', err);
          return res.status(200).json({
            id: coursId,
            ...updateData,
            support: support || ''
          });
        }
        res.json(coursComplet);
      });
    });
  });
});

// DELETE - Supprimer un cours
router.delete('/enseignant/cours/:id', authenticateToken, requireEnseignant, (req, res) => {
  const coursId = parseInt(req.params.id);
  const db = req.db;

  // Vérifier que le cours appartient à l'enseignant
  db.query('SELECT enseignantId FROM cours WHERE id = ?', [coursId], (err, results) => {
    if (err) {
      console.error('Erreur vérification propriétaire:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    if (results[0].enseignantId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à supprimer ce cours' });
    }

    const sql = 'DELETE FROM cours WHERE id = ?';
    db.query(sql, [coursId], (err, result) => {
      if (err) {
        console.error('Erreur suppression cours:', err);
        return res.status(500).json({ message: 'Erreur lors de la suppression du cours' });
      }

      res.json({ message: 'Cours supprimé avec succès' });
    });
  });
});

// RECHERCHE - Rechercher des cours
router.get('/enseignant/cours/recherche', authenticateToken, (req, res) => {
  const { enseignantId, search } = req.query;
  const db = req.db;

  if (!search) {
    return res.status(400).json({ message: 'Terme de recherche requis' });
  }

  const searchTerm = `%${search}%`;
  let sql = `
    SELECT c.*, 
           GROUP_CONCAT(s.supportUrl) as supports 
    FROM cours c 
    LEFT JOIN supports s ON c.id = s.coursId 
    WHERE (c.titre LIKE ? OR c.description LIKE ? OR c.niveau LIKE ?)
  `;
  let params = [searchTerm, searchTerm, searchTerm];

  if (enseignantId) {
    sql += ' AND c.enseignantId = ?';
    params.push(enseignantId);
  }

  sql += ' GROUP BY c.id ORDER BY c.dateCreation DESC';

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Erreur recherche cours:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    const coursAvecSupports = results.map(row => ({
      id: row.id,
      titre: row.titre,
      description: row.description,
      support: row.supports ? row.supports.split(',') : [],
      dateCreation: row.dateCreation,
      enseignantId: row.enseignantId,
      enseignantNom: row.enseignantNom,
      enseignantPrenom: row.enseignantPrenom
    }));

    res.json(coursAvecSupports);
  });
});

module.exports = router;