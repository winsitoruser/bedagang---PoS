export class IntegratedReceiptService {
  async createReceipt(data: any) {
    return { success: true, data };
  }

  async updateReceipt(id: string, data: any) {
    return { success: true, data };
  }

  async getReceipt(id: string) {
    return { success: true, data: null };
  }

  async deleteReceipt(id: string) {
    return { success: true };
  }

  async getPendingPurchaseOrders() {
    // Return empty array as mock data
    return [];
  }

  async getReceiptById(id: string) {
    return { success: true, data: null };
  }

  async getAllReceipts() {
    return [];
  }

  async getSuppliers(filters?: { status?: string; limit?: number }) {
    // Return mock supplier data
    return [
      { id: '1', name: 'PT Supplier Utama', code: 'SUP-001', status: 'active', contact: '08123456789', email: 'supplier1@example.com' },
      { id: '2', name: 'CV Distributor Jaya', code: 'SUP-002', status: 'active', contact: '08234567890', email: 'supplier2@example.com' },
      { id: '3', name: 'PT Grosir Sejahtera', code: 'SUP-003', status: 'active', contact: '08345678901', email: 'supplier3@example.com' },
    ];
  }

  async getProducts(filters?: any) {
    // Return mock product data
    return [];
  }
}

export const integratedReceiptService = new IntegratedReceiptService();
