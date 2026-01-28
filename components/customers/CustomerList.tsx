/**
 * Customer List Component
 * Placeholder component for customer list display
 */

import React from 'react';

interface CustomerListProps {
  customers?: any[];
  onCustomerSelect?: (customer: any) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({ 
  customers = [], 
  onCustomerSelect 
}) => {
  return (
    <div className="customer-list">
      <h3>Customer List</h3>
      {customers.length === 0 ? (
        <p>No customers found</p>
      ) : (
        <ul>
          {customers.map((customer, index) => (
            <li key={index} onClick={() => onCustomerSelect?.(customer)}>
              {customer.name || 'Unknown Customer'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomerList;
