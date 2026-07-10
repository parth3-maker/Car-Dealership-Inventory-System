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
router.post('/', createVehicle);
router.get('/search', searchVehicles);
router.put('/:id', updateVehicle);
router.delete('/:id', requireAdmin as any, deleteVehicle);
router.post('/:id/purchase', purchaseVehicle);
router.post('/:id/restock', requireAdmin as any, restockVehicle);

export default router;
