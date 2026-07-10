import { Request, Response } from 'express';
import prisma from '../db';

export const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createVehicle = async (req: Request, res: Response) => {
  try {
    const { make, model, category, price, quantity } = req.body;

    if (!make || !model || !category || price === undefined || quantity === undefined) {
      return res.status(400).json({ error: 'make, model, category, price, and quantity are required' });
    }

    if (typeof price !== 'number' || price < 0 || typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ error: 'Invalid price or quantity' });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        make,
        model,
        category,
        price,
        quantity,
      },
    });

    return res.status(201).json(vehicle);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const searchVehicles = async (req: Request, res: Response) => {
  try {
    const { make, model, category, priceMin, priceMax } = req.query;

    const whereClause: any = {};

    if (make) {
      whereClause.make = { contains: make as string };
    }
    if (model) {
      whereClause.model = { contains: model as string };
    }
    if (category) {
      whereClause.category = { contains: category as string };
    }

    if (priceMin || priceMax) {
      whereClause.price = {};
      if (priceMin) {
        whereClause.price.gte = parseFloat(priceMin as string);
      }
      if (priceMax) {
        whereClause.price.lte = parseFloat(priceMax as string);
      }
    }

    const vehicles = await prisma.vehicle.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(vehicles);
  } catch (error) {
    console.error('Error searching vehicles:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { make, model, category, price, quantity } = req.body;

    // Check if vehicle exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!existingVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Prepare update data
    const updateData: any = {};
    if (make !== undefined) updateData.make = make;
    if (model !== undefined) updateData.model = model;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({ error: 'Invalid price' });
      }
      updateData.price = price;
    }
    if (quantity !== undefined) {
      if (typeof quantity !== 'number' || quantity < 0) {
        return res.status(400).json({ error: 'Invalid quantity' });
      }
      updateData.quantity = quantity;
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json(updatedVehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!existingVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    await prisma.vehicle.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const purchaseVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    if (vehicle.quantity <= 0) {
      return res.status(400).json({ error: 'Vehicle is out of stock' });
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        quantity: vehicle.quantity - 1,
      },
    });

    return res.status(200).json(updatedVehicle);
  } catch (error) {
    console.error('Error purchasing vehicle:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const restockVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || typeof quantity !== 'number' || quantity < 1) {
      return res.status(400).json({ error: 'Restock quantity must be a positive integer' });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        quantity: vehicle.quantity + quantity,
      },
    });

    return res.status(200).json(updatedVehicle);
  } catch (error) {
    console.error('Error restocking vehicle:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
