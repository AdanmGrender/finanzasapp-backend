import { Router, Response } from 'express';
import pool from '../db';
import { AuthRequest, authMiddleware } from '../auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM profiles WHERE id = $1', [req.userId]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Perfil no encontrado' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

router.put('/', async (req: AuthRequest, res: Response) => {
  try {
    const { salary } = req.body;
    const result = await pool.query(
      'UPDATE profiles SET salary = $1 WHERE id = $2 RETURNING *',
      [salary, req.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

export default router;
