export type UnitOfMeasure = string; // Using string for SQLite compatibility with enums

export interface Warehouse {
  id: string;
  name: string;
  location: string | null;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  uom: UnitOfMeasure;
  minStock: number;
  price: number;
  isFinishedGood: boolean;
}

export type MovementType = string;

export interface MovementItem {
  id?: string;
  movementId?: string;
  productId: string;
  quantity: number;
}

export interface Movement {
  id: string;
  type: MovementType;
  originWarehouseId: string | null;
  destinationWarehouseId: string | null;
  userId?: string | null;
  userName?: string;
  items: MovementItem[];
  date: string;
  reference: string | null;
}

export interface RecipeIngredient {
  id?: string;
  recipeId?: string;
  productId: string;
  quantity: number;
  product?: Product;
}

export interface Recipe {
  id: string;
  productId: string;
  product?: Product;
  ingredients: RecipeIngredient[];
}

export interface InventoryState {
  warehouses: Warehouse[];
  products: Product[];
  movements: Movement[];
  recipes: Recipe[];
}
