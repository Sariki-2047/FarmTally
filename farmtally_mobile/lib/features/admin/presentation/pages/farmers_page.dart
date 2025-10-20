import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:data_table_2/data_table_2.dart';
import '../providers/admin_providers.dart';
import '../widgets/error_display.dart';
import '../../data/models/farmer_model.dart';

class FarmersPage extends ConsumerWidget {
  const FarmersPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final farmersAsync = ref.watch(farmersProvider);

    return Padding(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _FarmersToolbar(),
          const SizedBox(height: 16),
          Expanded(
            child: farmersAsync.when(
              data: (farmers) => _buildDataTable(context, farmers),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, stackTrace) => ErrorDisplay(
                error: error.toString(),
                onRetry: () => ref.refresh(farmersProvider),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDataTable(BuildContext context, List<AdminFarmer> farmers) {
    if (farmers.isEmpty) {
      return const EmptyDisplay(
        title: 'No Farmers',
        message: 'No farmers have been registered yet. Add your first farmer to get started.',
        icon: Icons.agriculture,
      );
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(8),
        child: DataTable2(
          columnSpacing: 12,
          horizontalMargin: 12,
          minWidth: 1000,
          columns: const [
            DataColumn2(
              label: Text('Name'),
              size: ColumnSize.L,
            ),
            DataColumn2(
              label: Text('Phone'),
              size: ColumnSize.M,
            ),
            DataColumn2(
              label: Text('Aadhaar'),
              size: ColumnSize.M,
            ),
            DataColumn2(
              label: Text('Bank Account'),
              size: ColumnSize.L,
            ),
            DataColumn2(
              label: Text('Deliveries'),
              size: ColumnSize.S,
              numeric: true,
            ),
            DataColumn2(
              label: Text('Earnings'),
              size: ColumnSize.M,
              numeric: true,
            ),
            DataColumn2(
              label: Text('Last Delivery'),
              size: ColumnSize.M,
            ),
            DataColumn2(
              label: Text('Actions'),
              size: ColumnSize.M,
            ),
          ],
          rows: farmers.map((farmer) {
            return DataRow2(
              cells: [
                DataCell(
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        farmer.name,
                        style: const TextStyle(fontWeight: FontWeight.w500),
                      ),
                      if (!farmer.isActive)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.red.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Text(
                            'Inactive',
                            style: TextStyle(fontSize: 10, color: Colors.red),
                          ),
                        ),
                    ],
                  ),
                ),
                DataCell(
                  GestureDetector(
                    onTap: () => _makePhoneCall(farmer.phone),
                    child: Text(
                      farmer.phone,
                      style: const TextStyle(
                        color: Colors.blue,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                ),
                DataCell(Text(farmer.maskedAadhaar)),
                DataCell(
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        farmer.bank.maskedAccountNumber,
                        style: const TextStyle(fontFamily: 'monospace'),
                      ),
                      Text(
                        '${farmer.bank.ifsc} - ${farmer.bank.bankName}',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
                DataCell(
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: farmer.deliveries > 0 ? Colors.green.withOpacity(0.1) : Colors.grey.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '${farmer.deliveries}',
                      style: TextStyle(
                        color: farmer.deliveries > 0 ? Colors.green : Colors.grey,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ),
                DataCell(
                  Text(
                    '₹${_formatCurrency(farmer.earnings)}',
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                ),
                DataCell(
                  Text(
                    farmer.lastDelivery != null 
                        ? _formatDate(farmer.lastDelivery!)
                        : 'Never',
                  ),
                ),
                DataCell(
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.edit, size: 18),
                        tooltip: 'Edit',
                        onPressed: () => _showEditDialog(context, farmer),
                      ),
                      IconButton(
                        icon: const Icon(Icons.receipt, size: 18),
                        tooltip: 'View Reports',
                        onPressed: () => _showReportsDialog(context, farmer),
                      ),
                      PopupMenuButton<String>(
                        icon: const Icon(Icons.more_vert, size: 18),
                        onSelected: (value) => _handleMenuAction(context, farmer, value),
                        itemBuilder: (context) => [
                          const PopupMenuItem(
                            value: 'export_pdf',
                            child: ListTile(
                              leading: Icon(Icons.picture_as_pdf),
                              title: Text('Export PDF'),
                              contentPadding: EdgeInsets.zero,
                            ),
                          ),
                          PopupMenuItem(
                            value: farmer.isActive ? 'deactivate' : 'activate',
                            child: ListTile(
                              leading: Icon(farmer.isActive ? Icons.block : Icons.check_circle),
                              title: Text(farmer.isActive ? 'Deactivate' : 'Activate'),
                              contentPadding: EdgeInsets.zero,
                            ),
                          ),
                          if (!farmer.isActive)
                            const PopupMenuItem(
                              value: 'delete',
                              child: ListTile(
                                leading: Icon(Icons.delete, color: Colors.red),
                                title: Text('Delete', style: TextStyle(color: Colors.red)),
                                contentPadding: EdgeInsets.zero,
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }

  void _makePhoneCall(String phone) {
    // TODO: Implement phone call functionality
    debugPrint('Calling $phone');
  }

  void _showEditDialog(BuildContext context, AdminFarmer farmer) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Farmer'),
        content: const Text('Edit functionality will be implemented in the next phase.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _showReportsDialog(BuildContext context, AdminFarmer farmer) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('${farmer.name} - Reports'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ListTile(
              leading: const Icon(Icons.agriculture),
              title: Text('Total Deliveries: ${farmer.deliveries}'),
              contentPadding: EdgeInsets.zero,
            ),
            ListTile(
              leading: const Icon(Icons.currency_rupee),
              title: Text('Total Earnings: ₹${_formatCurrency(farmer.earnings)}'),
              contentPadding: EdgeInsets.zero,
            ),
            if (farmer.lastDelivery != null)
              ListTile(
                leading: const Icon(Icons.schedule),
                title: Text('Last Delivery: ${_formatDate(farmer.lastDelivery!)}'),
                contentPadding: EdgeInsets.zero,
              ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Detailed reports feature coming soon')),
              );
            },
            child: const Text('View Details'),
          ),
        ],
      ),
    );
  }

  void _handleMenuAction(BuildContext context, AdminFarmer farmer, String action) {
    switch (action) {
      case 'export_pdf':
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('PDF export feature coming soon')),
        );
        break;
      case 'activate':
      case 'deactivate':
        _toggleActiveStatus(context, farmer, action == 'activate');
        break;
      case 'delete':
        _showDeleteDialog(context, farmer);
        break;
    }
  }

  void _toggleActiveStatus(BuildContext context, AdminFarmer farmer, bool activate) {
    final action = activate ? 'activate' : 'deactivate';
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('${action.toUpperCase()} Farmer'),
        content: Text('Are you sure you want to $action ${farmer.name}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('${farmer.name} ${action}d successfully')),
              );
            },
            child: Text(action.toUpperCase()),
          ),
        ],
      ),
    );
  }

  void _showDeleteDialog(BuildContext context, AdminFarmer farmer) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Farmer'),
        content: Text('Are you sure you want to permanently delete ${farmer.name}? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('${farmer.name} deleted successfully')),
              );
            },
            child: const Text('DELETE', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  String _formatCurrency(double amount) {
    if (amount >= 100000) {
      return '${(amount / 100000).toStringAsFixed(1)}L';
    } else if (amount >= 1000) {
      return '${(amount / 1000).toStringAsFixed(1)}K';
    } else {
      return amount.toStringAsFixed(0);
    }
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);
    
    if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else if (difference.inDays < 30) {
      return '${(difference.inDays / 7).floor()}w ago';
    } else if (difference.inDays < 365) {
      return '${(difference.inDays / 30).floor()}mo ago';
    } else {
      return '${(difference.inDays / 365).floor()}y ago';
    }
  }
}

class _FarmersToolbar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          'Farmers Directory',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        const Spacer(),
        OutlinedButton.icon(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Export feature coming soon')),
            );
          },
          icon: const Icon(Icons.download),
          label: const Text('Export CSV'),
        ),
        const SizedBox(width: 8),
        ElevatedButton.icon(
          onPressed: () => _showAddDialog(context),
          icon: const Icon(Icons.add),
          label: const Text('Add Farmer'),
        ),
      ],
    );
  }

  void _showAddDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Farmer'),
        content: const Text('Add farmer functionality will be implemented in the next phase.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
}