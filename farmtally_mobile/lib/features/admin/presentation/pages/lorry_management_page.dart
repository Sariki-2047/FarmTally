import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:data_table_2/data_table_2.dart';
import 'package:go_router/go_router.dart';
import '../providers/admin_providers.dart';
import '../widgets/error_display.dart';
import '../../data/models/lorry_model.dart';
import '../../data/models/field_manager_model.dart';

class LorryManagementPage extends ConsumerStatefulWidget {
  const LorryManagementPage({super.key});

  @override
  ConsumerState<LorryManagementPage> createState() => _LorryManagementPageState();
}

class _LorryManagementPageState extends ConsumerState<LorryManagementPage> {
  LorryStatus? selectedStatusFilter;

  @override
  Widget build(BuildContext context) {
    final lorriesAsync = ref.watch(lorriesProvider);
    final fieldManagersAsync = ref.watch(fieldManagersProvider);

    return Padding(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _LorryToolbar(
            onStatusFilterChanged: (status) {
              setState(() {
                selectedStatusFilter = status;
              });
            },
            selectedStatus: selectedStatusFilter,
          ),
          const SizedBox(height: 16),
          Expanded(
            child: lorriesAsync.when(
              data: (lorries) {
                final fieldManagers = fieldManagersAsync.maybeWhen(
                  data: (fms) => fms,
                  orElse: () => <FieldManager>[],
                );
                
                // Apply status filter
                final filteredLorries = selectedStatusFilter == null
                    ? lorries
                    : lorries.where((l) => l.status == selectedStatusFilter).toList();
                
                return _buildDataTable(context, filteredLorries, fieldManagers);
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, stackTrace) => ErrorDisplay(
                error: error.toString(),
                onRetry: () => ref.refresh(lorriesProvider),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDataTable(BuildContext context, List<Lorry> lorries, List<FieldManager> fieldManagers) {
    if (lorries.isEmpty) {
      return EmptyDisplay(
        title: 'No Lorries',
        message: selectedStatusFilter == null 
            ? 'No lorries have been added to the fleet yet.'
            : 'No lorries found with the selected status.',
        icon: Icons.local_shipping,
      );
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(8),
        child: DataTable2(
          columnSpacing: 12,
          horizontalMargin: 12,
          minWidth: 1400,
          columns: const [
            DataColumn2(
              label: Text('Lorry Number'),
              size: ColumnSize.M,
            ),
            DataColumn2(
              label: Text('Driver'),
              size: ColumnSize.M,
            ),
            DataColumn2(
              label: Text('Phone'),
              size: ColumnSize.M,
            ),
            DataColumn2(
              label: Text('Capacity (kg)'),
              size: ColumnSize.S,
              numeric: true,
            ),
            DataColumn2(
              label: Text('Status'),
              size: ColumnSize.M,
            ),
            DataColumn2(
              label: Text('Assigned Manager'),
              size: ColumnSize.L,
            ),
            DataColumn2(
              label: Text('Load (kg)'),
              size: ColumnSize.S,
              numeric: true,
            ),
            DataColumn2(
              label: Text('Farmers'),
              size: ColumnSize.S,
              numeric: true,
            ),
            DataColumn2(
              label: Text('Updated'),
              size: ColumnSize.M,
            ),
            DataColumn2(
              label: Text('Actions'),
              size: ColumnSize.M,
            ),
          ],
          rows: lorries.map((lorry) {
            final assignedManager = fieldManagers
                .where((fm) => fm.id == lorry.assignedManagerId)
                .firstOrNull;

            return DataRow2(
              cells: [
                DataCell(
                  Text(
                    lorry.lorryNumber,
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                ),
                DataCell(Text(lorry.driverName)),
                DataCell(
                  GestureDetector(
                    onTap: () => _makePhoneCall(lorry.driverPhone),
                    child: Text(
                      lorry.driverPhone,
                      style: const TextStyle(
                        color: Colors.blue,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                ),
                DataCell(Text('${lorry.capacityKg.toInt()}')),
                DataCell(_buildStatusChip(lorry.status)),
                DataCell(
                  assignedManager != null
                      ? Text(assignedManager.name)
                      : const Text('—'),
                ),
                DataCell(Text('${lorry.currentLoadKg.toInt()}')),
                DataCell(Text('${lorry.farmersCount}')),
                DataCell(Text(_formatDateTime(lorry.lastUpdated))),
                DataCell(
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.visibility, size: 18),
                        tooltip: 'View Detail',
                        onPressed: () => context.go('/app/admin/lorry-management/${lorry.lorryNumber}'),
                      ),
                      IconButton(
                        icon: const Icon(Icons.assignment_ind, size: 18),
                        tooltip: 'Assign Manager',
                        onPressed: () => _showAssignDialog(context, lorry, fieldManagers),
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

  Widget _buildStatusChip(LorryStatus status) {
    Color color;
    String label = _getStatusDisplayName(status);
    
    switch (status) {
      case LorryStatus.available:
        color = Colors.green;
        break;
      case LorryStatus.assigned:
        color = Colors.blue;
        break;
      case LorryStatus.loading:
        color = Colors.orange;
        break;
      case LorryStatus.submitted:
        color = Colors.purple;
        break;
      case LorryStatus.sentToDealer:
        color = Colors.grey;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        label,
        style: TextStyle(color: color, fontWeight: FontWeight.w500, fontSize: 12),
      ),
    );
  }

  void _makePhoneCall(String phone) {
    // TODO: Implement phone call functionality
    debugPrint('Calling $phone');
  }

  void _showEditDialog(BuildContext context, Lorry lorry, List<FieldManager> fieldManagers) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Edit ${lorry.lorryNumber}'),
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

  void _showAssignDialog(BuildContext context, Lorry lorry, List<FieldManager> fieldManagers) {
    final availableManagers = fieldManagers.where((fm) => fm.isActive).toList();
    
    if (availableManagers.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No active field managers available')),
      );
      return;
    }

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Assign Manager to ${lorry.lorryNumber}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Select a field manager:'),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(
                labelText: 'Field Manager',
                border: OutlineInputBorder(),
              ),
              items: [
                const DropdownMenuItem(value: '', child: Text('Unassign')),
                ...availableManagers.map((fm) {
                  return DropdownMenuItem(
                    value: fm.id,
                    child: Text('${fm.name} (${fm.activeLorries} active)'),
                  );
                }),
              ],
              onChanged: (managerId) {
                Navigator.pop(context);
                if (managerId != null) {
                  if (managerId.isEmpty) {
                    // Unassign
                    ref.read(lorriesControllerProvider.notifier).updateStatus(
                      lorryNumber: lorry.lorryNumber,
                      status: 'Available',
                    );
                  } else {
                    // Assign
                    ref.read(lorriesControllerProvider.notifier).assign(
                      lorryNumber: lorry.lorryNumber,
                      fmId: managerId,
                    );
                  }
                  
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        managerId.isEmpty 
                            ? 'Lorry unassigned successfully'
                            : 'Lorry assigned successfully'
                      ),
                    ),
                  );
                }
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
  }

  String _getStatusDisplayName(LorryStatus status) {
    switch (status) {
      case LorryStatus.available:
        return 'Available';
      case LorryStatus.assigned:
        return 'Assigned';
      case LorryStatus.loading:
        return 'Loading';
      case LorryStatus.submitted:
        return 'Submitted';
      case LorryStatus.sentToDealer:
        return 'Sent to Dealer';
    }
  }

  LorryStatus _getStatusFromDisplayName(String displayName) {
    switch (displayName) {
      case 'Available':
        return LorryStatus.available;
      case 'Assigned':
        return LorryStatus.assigned;
      case 'Loading':
        return LorryStatus.loading;
      case 'Submitted':
        return LorryStatus.submitted;
      case 'Sent to Dealer':
        return LorryStatus.sentToDealer;
      default:
        return LorryStatus.available;
    }
  }

  String _formatDateTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);
    
    if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else {
      return '${difference.inDays}d ago';
    }
  }
}

class _LorryToolbar extends StatelessWidget {
  final Function(LorryStatus?) onStatusFilterChanged;
  final LorryStatus? selectedStatus;

  const _LorryToolbar({
    required this.onStatusFilterChanged,
    this.selectedStatus,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              'Lorry Management',
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
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Add lorry feature coming soon')),
                );
              },
              icon: const Icon(Icons.add),
              label: const Text('Add Lorry'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        // Status filter chips
        Wrap(
          spacing: 8,
          children: [
            FilterChip(
              label: const Text('All'),
              selected: selectedStatus == null,
              onSelected: (selected) {
                if (selected) onStatusFilterChanged(null);
              },
            ),
            ...LorryStatus.values.map((status) {
              return FilterChip(
                label: Text(_getStatusDisplayName(status)),
                selected: selectedStatus == status,
                onSelected: (selected) {
                  onStatusFilterChanged(selected ? status : null);
                },
              );
            }),
          ],
        ),
      ],
    );
  }

  String _getStatusDisplayName(LorryStatus status) {
    switch (status) {
      case LorryStatus.available:
        return 'Available';
      case LorryStatus.assigned:
        return 'Assigned';
      case LorryStatus.loading:
        return 'Loading';
      case LorryStatus.submitted:
        return 'Submitted';
      case LorryStatus.sentToDealer:
        return 'Sent to Dealer';
    }
  }
}

class EmptyDisplay extends StatelessWidget {
  final String title;
  final String message;
  final IconData icon;

  const EmptyDisplay({
    super.key,
    required this.title,
    required this.message,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 64, color: Colors.grey),
          const SizedBox(height: 16),
          Text(
            title,
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          Text(
            message,
            style: Theme.of(context).textTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}