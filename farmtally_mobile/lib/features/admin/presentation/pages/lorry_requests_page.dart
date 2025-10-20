import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:data_table_2/data_table_2.dart';
import '../providers/admin_providers.dart';
import '../widgets/error_display.dart';
import '../../data/models/lorry_request_model.dart';
import '../../data/models/lorry_model.dart';

class LorryRequestsPage extends ConsumerStatefulWidget {
  const LorryRequestsPage({super.key});

  @override
  ConsumerState<LorryRequestsPage> createState() => _LorryRequestsPageState();
}

class _LorryRequestsPageState extends ConsumerState<LorryRequestsPage> {

  @override
  Widget build(BuildContext context) {
    final requestsAsync = ref.watch(lorryRequestsProvider);
    final lorriesAsync = ref.watch(lorriesProvider);

    return Padding(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _RequestsToolbar(),
          const SizedBox(height: 16),
          Expanded(
            child: requestsAsync.when(
              data: (requests) {
                final lorries = lorriesAsync.maybeWhen(
                  data: (l) => l,
                  orElse: () => <Lorry>[],
                );
                return _buildDataTable(context, requests, lorries);
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, stackTrace) => ErrorDisplay(
                error: error.toString(),
                onRetry: () => ref.refresh(lorryRequestsProvider),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDataTable(BuildContext context, List<LorryRequest> requests, List<Lorry> lorries) {
    if (requests.isEmpty) {
      return const EmptyDisplay(
        title: 'No Lorry Requests',
        message: 'No lorry requests have been submitted yet.',
        icon: Icons.assignment_turned_in,
      );
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(8),
        child: DataTable2(
          columnSpacing: 12,
          horizontalMargin: 12,
          minWidth: 1100,
          columns: const [
            DataColumn2(
              label: Text('Request ID'),
              size: ColumnSize.S,
            ),
            DataColumn2(
              label: Text('Field Manager'),
              size: ColumnSize.M,
            ),
            DataColumn2(
              label: Text('Location'),
              size: ColumnSize.L,
            ),
            DataColumn2(
              label: Text('Est. Farmers'),
              size: ColumnSize.S,
              numeric: true,
            ),
            DataColumn2(
              label: Text('Est. Weight (kg)'),
              size: ColumnSize.S,
              numeric: true,
            ),
            DataColumn2(
              label: Text('Urgency'),
              size: ColumnSize.S,
            ),
            DataColumn2(
              label: Text('Status'),
              size: ColumnSize.S,
            ),
            DataColumn2(
              label: Text('Requested'),
              size: ColumnSize.M,
            ),
            DataColumn2(
              label: Text('Actions'),
              size: ColumnSize.M,
            ),
          ],
          rows: requests.map((request) {
            return DataRow2(
              cells: [
                DataCell(
                  Text(
                    request.id.substring(0, 8),
                    style: const TextStyle(fontFamily: 'monospace'),
                  ),
                ),
                DataCell(Text(request.fieldManagerName)),
                DataCell(Text(request.location)),
                DataCell(Text('${request.estFarmers}')),
                DataCell(Text('${request.estWeightKg.toInt()}')),
                DataCell(_buildUrgencyChip(request.urgency)),
                DataCell(_buildStatusChip(request.status)),
                DataCell(Text(_formatDateTime(request.requestedAt))),
                DataCell(
                  request.status == LorryRequestStatus.pending
                      ? Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.check, color: Colors.green, size: 18),
                              tooltip: 'Approve',
                              onPressed: () => _showApproveDialog(request.id, lorries),
                            ),
                            IconButton(
                              icon: const Icon(Icons.close, color: Colors.red, size: 18),
                              tooltip: 'Reject',
                              onPressed: () => _showRejectDialog(request.id),
                            ),
                          ],
                        )
                      : const Text('—'),
                ),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildUrgencyChip(RequestUrgency urgency) {
    Color color;
    String label = _getUrgencyDisplayName(urgency);
    
    switch (urgency) {
      case RequestUrgency.critical:
        color = Colors.red;
        break;
      case RequestUrgency.high:
        color = Colors.orange;
        break;
      case RequestUrgency.medium:
        color = Colors.blue;
        break;
      case RequestUrgency.low:
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

  Widget _buildStatusChip(LorryRequestStatus status) {
    Color color;
    String label = _getStatusDisplayName(status);
    
    switch (status) {
      case LorryRequestStatus.approved:
        color = Colors.green;
        break;
      case LorryRequestStatus.rejected:
        color = Colors.red;
        break;
      case LorryRequestStatus.deferred:
        color = Colors.orange;
        break;
      case LorryRequestStatus.pending:
        color = Colors.blue;
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

  void _showApproveDialog(String requestId, List<Lorry> lorries) {
    final availableLorries = lorries
        .where((l) => l.status == LorryStatus.available)
        .toList();

    if (availableLorries.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No available lorries to assign')),
      );
      return;
    }

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Approve Request'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Select a lorry to assign:'),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(
                labelText: 'Available Lorries',
                border: OutlineInputBorder(),
              ),
              items: availableLorries.map((lorry) {
                return DropdownMenuItem(
                  value: lorry.id,
                  child: Text('${lorry.lorryNumber} - ${lorry.driverName}'),
                );
              }).toList(),
              onChanged: (lorryId) {
                if (lorryId != null) {
                  Navigator.pop(context);
                  ref.read(lorryRequestsControllerProvider.notifier)
                      .approveRequest(requestId: requestId, lorryId: lorryId);
                  
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Request approved successfully')),
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

  void _showRejectDialog(String requestId) {
    final reasonController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Reject Request'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Please provide a reason for rejection:'),
            const SizedBox(height: 16),
            TextField(
              controller: reasonController,
              decoration: const InputDecoration(
                labelText: 'Rejection Reason',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              if (reasonController.text.trim().isNotEmpty) {
                Navigator.pop(context);
                ref.read(lorryRequestsControllerProvider.notifier)
                    .rejectRequest(requestId: requestId, reason: reasonController.text.trim());
                
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Request rejected')),
                );
              }
            },
            child: const Text('Reject'),
          ),
        ],
      ),
    );
  }

  String _getUrgencyDisplayName(RequestUrgency urgency) {
    switch (urgency) {
      case RequestUrgency.low:
        return 'Low';
      case RequestUrgency.medium:
        return 'Medium';
      case RequestUrgency.high:
        return 'High';
      case RequestUrgency.critical:
        return 'Critical';
    }
  }

  String _getStatusDisplayName(LorryRequestStatus status) {
    switch (status) {
      case LorryRequestStatus.pending:
        return 'Pending';
      case LorryRequestStatus.approved:
        return 'Approved';
      case LorryRequestStatus.rejected:
        return 'Rejected';
      case LorryRequestStatus.deferred:
        return 'Deferred';
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

class _RequestsToolbar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        ElevatedButton.icon(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Bulk approve feature coming soon')),
            );
          },
          icon: const Icon(Icons.check_circle),
          label: const Text('Bulk Approve'),
        ),
        OutlinedButton.icon(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Export feature coming soon')),
            );
          },
          icon: const Icon(Icons.download),
          label: const Text('Export'),
        ),
        const Spacer(),
        SizedBox(
          width: 280,
          child: TextField(
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.search),
              hintText: 'Search requests...',
              border: OutlineInputBorder(),
              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            ),
          ),
        ),
      ],
    );
  }
}