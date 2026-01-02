'use client';

import { useState } from 'react';
import { Product, Warehouse } from '@/types';
import ProductList from '@/components/Product/ProductList';
import ProductDetail from '@/components/Product/ProductDetail';

interface Props {
  products: Product[];
  warehouses: Warehouse[];
  stock: Record<string, Record<string, number>>; // warehouseId -> { productId -> quantity }
}

export default function ProductsClient({ products, warehouses, stock }: Props) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Helper to extract stock for the selected product across all warehouses
  const getProductStockData = (productId: string) => {
    const data: Record<string, number> = {};
    warehouses.forEach(w => {
      data[w.id] = stock[w.id]?.[productId] || 0;
    });
    return data;
  };

  return (
    <>
      <ProductList 
        initialProducts={products} 
        onProductClick={(p) => setSelectedProduct(p)} 
      />

      {selectedProduct && (
        <ProductDetail 
          product={selectedProduct}
          warehouses={warehouses}
          stockData={getProductStockData(selectedProduct.id)}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}
