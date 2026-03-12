const express = require('express');
const router = express.Router();
const db = require('../db/index');

// GET /api/patients — list all patients
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT p.*,
             COUNT(f.id)::int AS file_count,
             MAX(f.uploaded_at) AS last_upload
      FROM patients p
      LEFT JOIN dna_files f ON f.patient_id = p.id
      GROUP BY p.id
      ORDER BY p.last_name, p.first_name
    `);
    res.json(result.rows);
  } catch (err) { next(err); }
});

// GET /api/patients/:id — get single patient
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const patient = await db.query('SELECT * FROM patients WHERE id = $1', [id]);
    if (patient.rows.length === 0) return res.status(404).json({ error: 'Paciente não encontrado' });

    const files = await db.query(
      'SELECT * FROM dna_files WHERE patient_id = $1 ORDER BY uploaded_at DESC',
      [id]
    );

    res.json({ ...patient.rows[0], files: files.rows });
  } catch (err) { next(err); }
});

// POST /api/patients — create patient
router.post('/', async (req, res, next) => {
  try {
    const { first_name, last_name, date_of_birth, email, phone, sex, notes } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'Nome e sobrenome são obrigatórios' });
    }

    const result = await db.query(
      `INSERT INTO patients (first_name, last_name, date_of_birth, email, phone, sex, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [first_name.trim(), last_name.trim(), date_of_birth || null,
       email || null, phone || null, sex || null, notes || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/patients/:id — update patient
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, date_of_birth, email, phone, sex, notes } = req.body;

    const result = await db.query(
      `UPDATE patients
       SET first_name    = COALESCE($1, first_name),
           last_name     = COALESCE($2, last_name),
           date_of_birth = COALESCE($3, date_of_birth),
           email         = COALESCE($4, email),
           phone         = COALESCE($5, phone),
           sex           = COALESCE($6, sex),
           notes         = COALESCE($7, notes),
           updated_at    = NOW()
       WHERE id = $8
       RETURNING *`,
      [first_name, last_name, date_of_birth, email, phone, sex, notes, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Paciente não encontrado' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/patients/:id — delete patient and all data
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM patients WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Paciente não encontrado' });
    res.json({ deleted: true, id: Number(id) });
  } catch (err) { next(err); }
});

module.exports = router;
