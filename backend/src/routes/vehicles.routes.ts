import { Router } from 'express';
import {
  getAllVehicles,
  createVehicle,
  searchVehicles,
  updateVehicle,
  deleteVehicle,
  purchaseVehicle,
  restockVehicle,
} from '../controllers/vehicles.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Apply authenticateToken to all vehicle routes
router.use(authenticateToken as any);

router.get('/', getAllVehicles);
router.get('/search', searchVehicles);
router.post('/', requireAdmin as any, createVehicle);
router.put('/:id', requireAdmin as any, updateVehicle);
router.delete('/:id', requireAdmin as any, deleteVehicle);
router.post('/:id/purchase', purchaseVehicle);
router.post('/:id/restock', requireAdmin as any, restockVehicle);

export default router;
