/**
 * Permission Patterns for Pages
 * 
 * This file contains reusable patterns for adding permission-based controls to pages
 */

// Example 1: Add Button with Permission
// <PermissionGuard permission="CREATE_X">
//   <Button onClick={() => handleOpenDialog()}>
//     <Plus className="mr-2 h-4 w-4" />
//     Add X
//   </Button>
// </PermissionGuard>

// Example 2: Edit/Delete Buttons with Permissions
// <PermissionGuard permission="EDIT_X">
//   <button
//     onClick={() => handleOpenDialog(item)}
//     className="text-blue-600 hover:text-blue-900 mr-3"
//   >
//     <Edit className="h-4 w-4" />
//   </button>
// </PermissionGuard>
// <PermissionGuard permission="DELETE_X">
//   <button
//     onClick={() => handleDelete(item.id)}
//     className="text-red-600 hover:text-red-900"
//   >
//     <Trash2 className="h-4 w-4" />
//   </button>
// </PermissionGuard>

// Example 3: Validate Button with Permission
// <PermissionGuard permission="VALIDATE_X">
//   <button
//     onClick={() => handleValidate(item.id)}
//     className="text-green-600 hover:text-green-900"
//   >
//     <Check className="h-4 w-4" />
//   </button>
// </PermissionGuard>

// Example 4: Conditional Actions Column
// <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//   {item.status === 'DRAFT' ? (
//     <>
//       <PermissionGuard permission="EDIT_X">
//         <button onClick={() => handleOpenDialog(item)}>
//           <Edit className="h-4 w-4" />
//         </button>
//       </PermissionGuard>
//       <PermissionGuard permission="DELETE_X">
//         <button onClick={() => handleDelete(item.id)}>
//           <Trash2 className="h-4 w-4" />
//         </button>
//       </PermissionGuard>
//       <PermissionGuard permission="VALIDATE_X">
//         <button onClick={() => handleValidate(item.id)}>
//           <Check className="h-4 w-4" />
//         </button>
//       </PermissionGuard>
//     </>
//   ) : (
//     <span className="text-gray-400">No actions</span>
//   )}
// </td>

export {};
