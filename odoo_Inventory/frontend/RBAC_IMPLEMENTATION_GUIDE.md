# Role-Based Access Control (RBAC) Implementation Guide

## Overview
This system implements fine-grained permission controls for different user roles:
- **ADMIN**: Full access to everything
- **INVENTORY_MANAGER**: Can manage products, operations, and view reports
- **WAREHOUSE_STAFF**: Can create/edit operations but cannot delete or manage master data

## Permission System Files Created

### 1. `/utils/permissions.ts`
Core permission system with all permission definitions and helper functions.

### 2. `/components/PermissionGuard.tsx`
Reusable component that wraps UI elements and only renders them if user has permission.

## How to Use Permissions in Pages

### Step 1: Import PermissionGuard
```tsx
import { PermissionGuard } from '@/components/PermissionGuard';
```

### Step 2: Wrap Action Buttons

#### Add/Create Buttons
```tsx
<PermissionGuard permission="CREATE_PRODUCT">
  <Button onClick={() => handleOpenDialog()}>
    <Plus className="mr-2 h-4 w-4" />
    Add Product
  </Button>
</PermissionGuard>
```

#### Edit Buttons
```tsx
<PermissionGuard permission="EDIT_PRODUCT">
  <button
    onClick={() => handleOpenDialog(product)}
    className="text-blue-600 hover:text-blue-900 mr-3"
  >
    <Edit className="h-4 w-4" />
  </button>
</PermissionGuard>
```

#### Delete Buttons
```tsx
<PermissionGuard permission="DELETE_PRODUCT">
  <button
    onClick={() => handleDelete(product.id)}
    className="text-red-600 hover:text-red-900"
  >
    <Trash2 className="h-4 w-4" />
  </button>
</PermissionGuard>
```

#### Validate Buttons (for operations)
```tsx
<PermissionGuard permission="VALIDATE_RECEIPT">
  <button
    onClick={() => handleValidate(receipt.id)}
    className="text-green-600 hover:text-green-900"
  >
    <CheckCircle className="h-4 w-4" />
  </button>
</PermissionGuard>
```

## Permissions by Page

### Products Page
- `CREATE_PRODUCT` - Add Product button
- `EDIT_PRODUCT` - Edit button
- `DELETE_PRODUCT` - Delete button

### Categories Page
- `CREATE_CATEGORY` - Add Category button
- `EDIT_CATEGORY` - Edit button
- `DELETE_CATEGORY` - Delete button

### UOMs Page
- `CREATE_UOM` - Add UOM button
- `EDIT_UOM` - Edit button
- `DELETE_UOM` - Delete button

### Warehouses Page
- `CREATE_WAREHOUSE` - Add Warehouse button
- `EDIT_WAREHOUSE` - Edit button
- `DELETE_WAREHOUSE` - Delete button
- `CREATE_LOCATION` - Add Location button
- `EDIT_LOCATION` - Edit Location button
- `DELETE_LOCATION` - Delete Location button

### Receipts Page
- `CREATE_RECEIPT` - Add Receipt button
- `EDIT_RECEIPT` - Edit button (only for DRAFT)
- `DELETE_RECEIPT` - Delete button (only for DRAFT)
- `VALIDATE_RECEIPT` - Validate button

### Deliveries Page
- `CREATE_DELIVERY` - Add Delivery button
- `EDIT_DELIVERY` - Edit button (only for DRAFT)
- `DELETE_DELIVERY` - Delete button (only for DRAFT)
- `VALIDATE_DELIVERY` - Validate button

### Transfers Page
- `CREATE_TRANSFER` - Add Transfer button
- `EDIT_TRANSFER` - Edit button (only for DRAFT)
- `DELETE_TRANSFER` - Delete button (only for DRAFT)
- `VALIDATE_TRANSFER` - Validate button

### Adjustments Page
- `CREATE_ADJUSTMENT` - Add Adjustment button
- `EDIT_ADJUSTMENT` - Edit button (only for DRAFT)
- `DELETE_ADJUSTMENT` - Delete button (only for DRAFT)
- `VALIDATE_ADJUSTMENT` - Validate button

### Users Page
- `VIEW_USERS` - Access to entire page (Admin only)
- `CREATE_USER` - Add User button
- `EDIT_USER` - Edit button
- `DELETE_USER` - Delete button
- `RESET_PASSWORD` - Reset Password button

## Example: Complete Actions Column Pattern

For operation pages (Receipts, Deliveries, Transfers, Adjustments):

```tsx
<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
  {item.status === 'DRAFT' ? (
    <>
      <PermissionGuard permission="EDIT_RECEIPT">
        <button
          onClick={() => handleOpenDialog(item)}
          className="text-blue-600 hover:text-blue-900 mr-3"
          title="Edit"
        >
          <Edit className="h-4 w-4" />
        </button>
      </PermissionGuard>
      <PermissionGuard permission="DELETE_RECEIPT">
        <button
          onClick={() => handleDelete(item.id)}
          className="text-red-600 hover:text-red-900 mr-3"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </PermissionGuard>
      <PermissionGuard permission="VALIDATE_RECEIPT">
        <button
          onClick={() => handleValidate(item.id)}
          className="text-green-600 hover:text-green-900"
          title="Validate"
        >
          <CheckCircle className="h-4 w-4" />
        </button>
      </PermissionGuard>
    </>
  ) : item.status === 'VALIDATED' ? (
    <span className="text-gray-500 text-xs">Validated</span>
  ) : (
    <span className="text-gray-500 text-xs">Cancelled</span>
  )}
</td>
```

## Navigation (Layout Component)

The navigation is already updated to filter menu items based on permissions. Each navigation item has a `permission` property that controls visibility.

## Implementation Status

✅ **Completed:**
- Permission utility system (`/utils/permissions.ts`)
- PermissionGuard component (`/components/PermissionGuard.tsx`)
- Layout navigation with permission filtering
- Products page with permission guards
- Users page (Admin only access)

⏳ **To Implement:**
Apply permission guards to:
1. Categories page (Add, Edit, Delete buttons)
2. UOMs page (Add, Edit, Delete buttons)
3. Warehouses page (Add Warehouse, Add Location, Edit, Delete buttons)
4. Receipts page (Add, Edit, Delete, Validate buttons)
5. Deliveries page (Add, Edit, Delete, Validate buttons)
6. Transfers page (Add, Edit, Delete, Validate buttons)
7. Adjustments page (Add, Edit, Delete, Validate buttons)

## Testing Checklist

After implementing all permissions:

### As Admin (All permissions):
- [ ] Can see all menu items
- [ ] Can create, edit, delete all entities
- [ ] Can validate operations
- [ ] Can access Users page

### As Inventory Manager:
- [ ] Can see all menu items except Users
- [ ] Can create products, categories, UOMs, warehouses
- [ ] Can edit products, categories, UOMs, warehouses
- [ ] Can delete with restrictions (only Draft operations)
- [ ] Can validate operations
- [ ] Cannot access Users page
- [ ] Cannot delete master data (products, categories, etc.)

### As Warehouse Staff:
- [ ] Can see all menu items except Users
- [ ] Can create operations (receipts, deliveries, transfers, adjustments)
- [ ] Can edit DRAFT operations
- [ ] Cannot delete ANY records
- [ ] Cannot validate operations
- [ ] Cannot create/edit master data (products, categories, UOMs, warehouses)
- [ ] Cannot access Users page

## Quick Reference: Permission Matrix

| Feature | Admin | Inv. Manager | Warehouse Staff |
|---------|-------|--------------|-----------------|
| **Products** | | | |
| View | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ |
| Edit | ✅ | ✅ | ❌ |
| Delete | ✅ | ❌ | ❌ |
| **Operations** | | | |
| View | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ✅ |
| Edit (Draft) | ✅ | ✅ | ✅ |
| Delete (Draft) | ✅ | ✅ | ❌ |
| Validate | ✅ | ✅ | ❌ |
| **Users** | | | |
| Access Page | ✅ | ❌ | ❌ |
| Create | ✅ | ❌ | ❌ |
| Edit | ✅ | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ |

