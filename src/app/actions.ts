'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { MovementType, UnitOfMeasure as Uom } from '@/types';

// Warehouse Actions
export async function getWarehouses() {
  return await prisma.warehouse.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function addWarehouse(data: { name: string; location?: string }) {
  const warehouse = await prisma.warehouse.create({
    data
  });
  revalidatePath('/warehouses');
  return warehouse;
}

// Product Actions
export async function getProducts() {
  return await prisma.product.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function addProduct(data: { 
  name: string; 
  description?: string; 
  uom: string; 
  minStock: number; 
  price: number;
  isFinishedGood: boolean;
}) {
  const product = await prisma.product.create({
    data: {
      ...data,
      uom: data.uom as Uom
    }
  });
  revalidatePath('/products');
  return product;
}

export async function importProducts(productsData: any[]) {
  const created = await prisma.product.createMany({
    data: productsData.map(p => ({
      name: p.name,
      description: p.description,
      uom: p.uom as Uom,
      minStock: Number(p.minStock) || 0,
      price: Number(p.price) || 0,
      isFinishedGood: Boolean(p.isFinishedGood)
    }))
  });
  revalidatePath('/products');
  return created;
}

// Movement Actions
export async function getMovements() {
  const movements = await prisma.movement.findMany({
    include: {
      items: true
    },
    orderBy: { date: 'desc' }
  });
  return movements.map(m => ({
    ...m,
    date: m.date.toISOString()
  }));
}

export async function addMovement(data: {
  type: MovementType;
  originWarehouseId?: string;
  destinationWarehouseId?: string;
  reference?: string;
  items: { productId: string; quantity: number }[];
}) {
  const movement = await prisma.movement.create({
    data: {
      type: data.type,
      originWarehouseId: data.originWarehouseId,
      destinationWarehouseId: data.destinationWarehouseId,
      reference: data.reference,
      items: {
        create: data.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      }
    },
    include: { items: true }
  });

  revalidatePath('/movements');
  revalidatePath('/inventory');
  revalidatePath('/');
  return movement;
}

// Utility to calculate current stock per warehouse
export async function getStockByWarehouse() {
  const movements = await prisma.movement.findMany({
    include: { items: true }
  });
  const warehouses = await prisma.warehouse.findMany();
  
  const stock: Record<string, Record<string, number>> = {};
  warehouses.forEach(w => stock[w.id] = {});

  movements.forEach(m => {
    m.items.forEach(item => {
      if (m.destinationWarehouseId) {
        if (!stock[m.destinationWarehouseId]) stock[m.destinationWarehouseId] = {};
        stock[m.destinationWarehouseId][item.productId] = (stock[m.destinationWarehouseId][item.productId] || 0) + item.quantity;
      }
      if (m.originWarehouseId) {
        if (!stock[m.originWarehouseId]) stock[m.originWarehouseId] = {};
        stock[m.originWarehouseId][item.productId] = (stock[m.originWarehouseId][item.productId] || 0) - item.quantity;
      }
    });
  });

  return stock;
}

// Recipe Actions
export async function getRecipes() {
  return await prisma.recipe.findMany({
    include: {
      ingredients: {
        include: { product: true }
      },
      product: true
    }
  });
}

export async function addRecipe(data: {
  productName: string;
  uom: string;
  ingredients: { productId: string; quantity: number }[];
}) {
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create the product
    const product = await tx.product.create({
      data: {
        name: data.productName,
        uom: data.uom as Uom,
        isFinishedGood: true,
        minStock: 0,
        price: 0
      }
    });

    // 2. Create the recipe linked to the product
    const recipe = await tx.recipe.create({
      data: {
        productId: product.id,
        ingredients: {
          create: data.ingredients.map(ing => ({
            productId: ing.productId,
            quantity: ing.quantity
          }))
        }
      },
      include: { ingredients: true }
    });

    return recipe;
  });

  revalidatePath('/recipes');
  revalidatePath('/products');
  return result;
}

// Production Action
export async function produceProduct(productId: string, quantity: number, warehouseId: string) {
  const recipe = await prisma.recipe.findUnique({
    where: { productId },
    include: { ingredients: true }
  });
  
  if (!recipe) throw new Error("No existe receta para este producto");

  // Create movements within a transaction
  return await prisma.$transaction(async (tx) => {
    // 1. Consumption
    await tx.movement.create({
      data: {
        type: 'PRODUCCION',
        originWarehouseId: warehouseId,
        reference: `Consumo para producción de ${quantity} uds`,
        items: {
          create: recipe.ingredients.map(ing => ({
            productId: ing.productId,
            quantity: ing.quantity * quantity
          }))
        }
      }
    });

    // 2. Production
    const finalMovement = await tx.movement.create({
      data: {
        type: 'PRODUCCION',
        destinationWarehouseId: warehouseId,
        reference: `Ingreso por producción`,
        items: {
          create: [{ productId, quantity }]
        }
      }
    });

    return finalMovement;
  }).then((res) => {
    revalidatePath('/movements');
    revalidatePath('/inventory');
    revalidatePath('/');
    return {
      ...res,
      date: res.date.toISOString()
    };
  });
}

export async function updateStockAdjustment(warehouseId: string, itemAdjustments: { productId: string, physicalQty: number, currentQty: number }[]) {
  const filtered = itemAdjustments.filter(adj => adj.physicalQty !== adj.currentQty);

  if (filtered.length === 0) return;

  await prisma.$transaction(async (tx) => {
    for (const adj of filtered) {
      const diff = adj.physicalQty - adj.currentQty;
      await tx.movement.create({
        data: {
          type: 'AJUSTE',
          originWarehouseId: diff < 0 ? warehouseId : undefined,
          destinationWarehouseId: diff > 0 ? warehouseId : undefined,
          reference: `Ajuste por toma de inventario (Físico: ${adj.physicalQty}, Sistema: ${adj.currentQty})`,
          items: {
            create: [{ productId: adj.productId, quantity: Math.abs(diff) }]
          }
        }
      });
    }
  });

  revalidatePath('/movements');
  revalidatePath('/inventory');
  revalidatePath('/');
}
