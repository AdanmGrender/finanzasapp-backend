import { Router, Response } from 'express';
import pool from '../db';
import { AuthRequest, authMiddleware } from '../auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { month, year } = req.query;
    const result = await pool.query(
      'SELECT * FROM fixed_expenses WHERE user_id = $1 AND month = $2 AND year = $3 ORDER BY created_at',
      [req.userId, month, year]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get fixed expenses error:', err);
    res.status(500).json({ error: 'Error al obtener gastos fijos' });
  }
});

router.get('/annual', async (req: AuthRequest, res: Response) => {
  try {
    const { year } = req.query;
    const result = await pool.query(
      'SELECT * FROM fixed_expenses WHERE user_id = $1 AND year = $2 ORDER BY month, created_at',
      [req.userId, year]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get annual fixed expenses error:', err);
    res.status(500).json({ error: 'Error al obtener gastos fijos anuales' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { month, year, concept, amount, date, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO fixed_expenses (user_id, month, year, concept, amount, date, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.userId, month, year, concept, amount, date, notes]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Add fixed expense error:', err);
    res.status(500).json({ error: 'Error al agregar gasto fijo' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const result = await pool.query(
      `UPDATE fixed_expenses SET ${setClause} WHERE id = $${keys.length + 1} AND user_id = $${keys.length + 2} RETURNING *`,
      [...values, id, req.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update fixed expense error:', err);
    res.status(500).json({ error: 'Error al actualizar gasto fijo' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM fixed_expenses WHERE id = $1 AND user_id = $2', [id, req.userId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete fixed expense error:', err);
    res.status(500).json({ error: 'Error al eliminar gasto fijo' });
  }
});

export default router;
