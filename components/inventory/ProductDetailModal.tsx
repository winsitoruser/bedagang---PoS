import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FaBox, FaTag, FaWarehouse, FaEdit, FaTrash } from 'react-icons/fa';

export interface ProductDetail {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  supplier: string;
  description?: string;
  status: 'active' | 'inactive';
}

interface ProductDetailModalProps {
  product: ProductDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (product: ProductDetail) => void;
  onDelete?: (productId: string) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  if (!product) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const profitMargin = ((product.price - product.cost) / product.price * 100).toFixed(1);
  const stockStatus = product.stock <= product.minStock ? 'low' : 'normal';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FaBox className="text-blue-600" />
            <span>Detail Produk</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-500">SKU: {product.sku}</p>
            </div>
            <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
              {product.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
            </Badge>
          </div>

          {/* Category & Supplier */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <FaTag className="text-purple-600" />
                <span className="text-sm text-gray-600">Kategori</span>
              </div>
              <p className="font-semibold text-purple-900">{product.category}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <FaWarehouse className="text-orange-600" />
                <span className="text-sm text-gray-600">Supplier</span>
              </div>
              <p className="font-semibold text-orange-900">{product.supplier}</p>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Harga Jual</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(product.price)}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Harga Beli</p>
              <p className="text-lg font-bold text-blue-600">
                {formatCurrency(product.cost)}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Margin</p>
              <p className="text-lg font-bold text-purple-600">{profitMargin}%</p>
            </div>
          </div>

          {/* Stock Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Status Stok</span>
              <Badge variant={stockStatus === 'low' ? 'destructive' : 'default'}>
                {stockStatus === 'low' ? 'Stok Rendah' : 'Stok Normal'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Stok Tersedia</p>
                <p className="text-2xl font-bold text-gray-900">{product.stock}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Stok Minimum</p>
                <p className="text-2xl font-bold text-gray-900">{product.minStock}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Deskripsi</p>
              <p className="text-gray-900">{product.description}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2 pt-4 border-t">
            <Button
              onClick={() => onEdit?.(product)}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <FaEdit className="mr-2" />
              Edit Produk
            </Button>
            <Button
              onClick={() => onDelete?.(product.id)}
              variant="destructive"
              className="flex-1"
            >
              <FaTrash className="mr-2" />
              Hapus Produk
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
