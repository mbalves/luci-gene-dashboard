const express = require('express');
const router = express.Router();
const db = require('../db/index');
const upload = require('../middleware/upload');
const { parseDnaFile, batchInsertSnps } = require('../services/dnaParser');

// POST /api/files/upload/:patientId — upload and process DNA file
router.post('/upload/:patientId', upload.single('dnafile'), async (req, res, next) => {
  const { patientId } = req.params;
  const client = await db.getClient();

  try {
    // Verify patient exists
    const pt = await client.query('SELECT id FROM patients WHERE id = $1', [patientId]);
    if (pt.rows.length === 0) return res.status(404).json({ error: 'Paciente não encontrado' });

    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });

    const originalName = req.file.originalname;

    // Create file record as 'processing'
    const fileRec = await client.query(
      `INSERT INTO dna_files (patient_id, filename, file_format, status)
       VALUES ($1, $2, 'unknown', 'processing')
       RETURNING *`,
      [patientId, originalName]
    );
    const fileId = fileRec.rows[0].id;

    // Respond immediately so client knows upload was received
    res.status(202).json({
      message: 'Arquivo recebido, processando…',
      file_id: fileId,
      filename: originalName,
    });

    // Parse and import in background (don't block HTTP response)
    setImmediate(async () => {
      try {
        const { format, snps } = await parseDnaFile(req.file.buffer);

        await client.query('BEGIN');

        const inserted = await batchInsertSnps(client, Number(patientId), fileId, snps);

        await client.query(
          `UPDATE dna_files
           SET file_format = $1, total_snps = $2, status = 'ready'
           WHERE id = $3`,
          [format, inserted, fileId]
        );

        await client.query('COMMIT');
        console.log(`File ${fileId} processed: ${inserted} SNPs (${format})`);
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        await db.query(
          `UPDATE dna_files SET status = 'error', error_msg = $1 WHERE id = $2`,
          [err.message, fileId]
        ).catch(() => {});
        console.error(`File ${fileId} processing error:`, err.message);
      } finally {
        client.release();
      }
    });

  } catch (err) {
    client.release();
    next(err);
  }
});

// GET /api/files/:fileId/status — poll file processing status
router.get('/:fileId/status', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, filename, file_format, total_snps, status, error_msg, uploaded_at FROM dna_files WHERE id = $1',
      [req.params.fileId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Arquivo não encontrado' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/files/:fileId — delete file and its SNPs
router.delete('/:fileId', async (req, res, next) => {
  try {
    const result = await db.query(
      'DELETE FROM dna_files WHERE id = $1 RETURNING id',
      [req.params.fileId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Arquivo não encontrado' });
    res.json({ deleted: true, id: Number(req.params.fileId) });
  } catch (err) { next(err); }
});

module.exports = router;
