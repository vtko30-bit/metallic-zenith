'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { MovementType, UnitOfMeasure as Uom } from '@/types';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.role === 'ADMIN';
}

async function getUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.id;
}

// Warehouse Actions
export async function getWarehouses() {
  return await prisma.warehouse.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function addWarehouse(data: { name: string; location?: string }) {
  if (!(await isAdmin())) throw new Error("Acceso denegado: Se requieren permisos de Administrador");
  
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
  if (!(await isAdmin())) throw new Error("Acceso denegado: Se requieren permisos de Administrador");

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
  if (!(await isAdmin())) throw new Error("Acceso denegado: Se requieren permisos de Administrador");

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
      items: true,
      user: {
        select: { name: true }
      }
    },
    orderBy: { date: 'desc' }
  });
  return movements.map(m => ({
    ...m,
    date: m.date.toISOString(),
    userName: m.user?.name || 'Sistema'
  }));
}

export async function addMovement(data: {
  type: MovementType;
  originWarehouseId?: string;
  destinationWarehouseId?: string;
  reference?: string;
  items: { productId: string; quantity: number }[];
}) {
  const userId = await getUserId();
  
  const movement = await prisma.movement.create({
    data: {
      type: data.type,
      originWarehouseId: data.originWarehouseId,
      destinationWarehouseId: data.destinationWarehouseId,
      userId,
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
  productName?: string;
  productId?: string;
  uom: string;
  ingredients: { productId: string; quantity: number }[];
}) {
  if (!(await isAdmin())) throw new Error("Acceso denegado: Se requieren permisos de Administrador");

  const result = await prisma.$transaction(async (tx) => {
    let finalProductId = data.productId;

    if (!finalProductId) {
      if (!data.productName) throw new Error("Se requiere nombre para nuevo producto");
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
      finalProductId = product.id;
    } else {
      // 1b. Mark existing product as finished good
      await tx.product.update({
        where: { id: finalProductId },
        data: { isFinishedGood: true }
      });
    }

    // 2. Create the recipe linked to the product
    const recipe = await tx.recipe.create({
      data: {
        productId: finalProductId,
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

export async function updateRecipe(id: string, data: {
  productName: string;
  ingredients: { productId: string; quantity: number }[];
}) {
  if (!(await isAdmin())) throw new Error("Acceso denegado: Se requieren permisos de Administrador");

  const result = await prisma.$transaction(async (tx) => {
    // 1. Get the existing recipe to find the product ID
    const existing = await tx.recipe.findUnique({
      where: { id },
      include: { product: true }
    });
    if (!existing) throw new Error("Receta no encontrada");

    // 2. Update the product name
    await tx.product.update({
      where: { id: existing.productId },
      data: { name: data.productName }
    });

    // 3. Delete existing ingredients
    await tx.recipeIngredient.deleteMany({
      where: { recipeId: id }
    });

    // 4. Create new ingredients
    const updatedRecipe = await tx.recipe.update({
      where: { id },
      data: {
        ingredients: {
          create: data.ingredients.map(ing => ({
            productId: ing.productId,
            quantity: ing.quantity
          }))
        }
      },
      include: { ingredients: true }
    });

    return updatedRecipe;
  });

  revalidatePath('/recipes');
  revalidatePath('/products');
  return result;
}

export async function deleteRecipe(id: string) {
  if (!(await isAdmin())) throw new Error("Acceso denegado: Se requieren permisos de Administrador");

  const result = await prisma.$transaction(async (tx) => {
    // 1. Get the recipe to find the product ID
    const recipe = await tx.recipe.findUnique({
      where: { id }
    });
    if (!recipe) throw new Error("Receta no encontrada");

    // 2. Delete ingredients explicitly
    await tx.recipeIngredient.deleteMany({
      where: { recipeId: id }
    });

    // 3. Delete recipe
    await tx.recipe.delete({
      where: { id }
    });

    // 4. Delete the associated product (finished good)
    await tx.product.delete({
      where: { id: recipe.productId }
    });

    return { success: true };
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

  const userId = await getUserId();

  // Create movements within a transaction
  return await prisma.$transaction(async (tx) => {
    // 1. Consumption
    await tx.movement.create({
      data: {
        type: 'PRODUCCION',
        originWarehouseId: warehouseId,
        userId,
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
        userId,
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

  const userId = await getUserId();

  await prisma.$transaction(async (tx) => {
    for (const adj of filtered) {
      const diff = adj.physicalQty - adj.currentQty;
      await tx.movement.create({
        data: {
          type: 'AJUSTE',
          originWarehouseId: diff < 0 ? warehouseId : undefined,
          destinationWarehouseId: diff > 0 ? warehouseId : undefined,
          userId,
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

// User Management Actions
export async function getUsers() {
  if (!(await isAdmin())) throw new Error("Acceso denegado");
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    },
    orderBy: { name: 'asc' }
  });
}

export async function addUser(data: { name: string; email: string; password?: string; role: string }) {
  if (!(await isAdmin())) throw new Error("Acceso denegado");

  let hashedPassword = undefined;
  if (data.password) {
    hashedPassword = await bcrypt.hash(data.password, 10);
  }

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role
    }
  });

  revalidatePath('/users');
  return user;
}

export async function deleteUser(id: string) {
  if (!(await isAdmin())) throw new Error("Acceso denegado");
  
  // Prevent deleting the last admin if possible, but for now simple delete
  await prisma.user.delete({
    where: { id }
  });
  
  revalidatePath('/users');
}
