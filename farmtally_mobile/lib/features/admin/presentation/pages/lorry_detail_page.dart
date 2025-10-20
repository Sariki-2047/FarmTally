import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:data_table_2/data_table_2.dart';
import 'package:go_router/go_router.dart';
import '../providers/admin_providers.dart';
import '../widgets/error_display.dart';
import '../../data/models/lorry_model.dart';
import '../../data/models/field_manager_model.dart';
import '../../data/models/farmer_delivery_model.dart';

class LorryDetailPage extends ConsumerStatefulWidget {
  final String lorryId;

  const LorryDetailPage({
    super.key,
    required this.lorryId,
  });

  @override
  ConsumerState<LorryDetailPage> createState() => _LorryDetailPageState();
}

class _LorryDetailPageState extends ConsumerState<LorryDetailPage> {

  @override
  Widget build(BuildContext context) {
    final lorriesAsync = ref.watch(lorriesProvider);
    final fieldManagersAsync = ref.watch(fieldManagersProvider);
    final deliveriesAsync = ref.watch(farmerDeliveriesProvider(widget.lorryId));

    return Scaffold(
      appBar: AppBar(
        title: Text('Lorry Detail - ${widget.lorryId}'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/app/admin/lorry-management'),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Lorry Header Card
            lorriesAsync.when(
              data: (lorries) {
                final lorry = lorries.firstWhere(
                  (l) => l.lorryNumber == widget.lorryId,
                  orElse: () => throw Exception('Lorry not found'),
                );
                final fieldManagers = fieldManagersAsync.maybeWhen(
                  data: (fms) => fms,
                  orElse: () => <FieldManager>[],
                );
                return _buildLorryHeader(lorry, fieldManagers);
              },
              loading: () => const Card(
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: Center(child: CircularProgressIndicator()),
                ),
              ),
              error: (error, stackTrace) => ErrorDisplay(
                error: error.toString(),
                onRetry: () => ref.refresh(lorriesProvider),
              ),
            ),
            const SizedBox(height: 16),
            // Farmer Deliveries Table
            Expanded(
              child: deliveriesAsync.when(
                data: (deliveries) => _buildDeliveriesGrid(deliveries),
                loading: () => const Card(
                  child: Center(child: CircularProgressIndicator()),
                ),
                error: (error, stackTrace) => ErrorDisplay(
                  error: error.toString(),
                  onRetry: () => ref.refresh(farmerDeliveriesProvider(widget.lorryId)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLorryHeader(Lorry lorry, List<FieldManager> fieldManagers) {
    final assignedManager = fieldManagers
        .where((fm) => fm.id == lorry.assignedManagerId)
        .firstOrNull;

    final isAdmin = true; // TODO: Get from auth provider
    final isEditablePhase = lorry.status == LorryStatus.assigned || lorry.status == LorryStatus.loading;
    final isSubmittedPhase = lorry.status == LorryStatus.submitted;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              children: [
                // Left: Basic info
                Expanded(
                  flex: 2,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        lorry.lorryNumber,
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text('Driver: ${lorry.driverName}'),
                      Text('Capacity: ${lorry.capacityKg.toInt()} kg'),
                      const SizedBox(height: 8),
                      _buildStatusChip(lorry.status),
                    ],
                  ),
                ),
                // Middle: Assignment info
                Expanded(
                  flex: 2,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Assigned Manager',
                        style: Theme.of(context).textTheme.labelMedium,
                      ),
                      const SizedBox(height: 4),
                      if (isAdmin && isEditablePhase)
                        DropdownButtonFormField<String>(
                          value: lorry.assignedManagerId,
                          decoration: const InputDecoration(
                            border: OutlineInputBorder(),
                            isDense: true,
                          ),
                          items: [
                            const DropdownMenuItem(value: null, child: Text('Unassigned')),
                            ...fieldManagers.map((fm) => DropdownMenuItem(
                              value: fm.id,
                              child: Text(fm.name),
                            )),
                          ],
                          onChanged: (managerId) {
                            // TODO: Update assignment
                          },
                        )
                      else
                        Text(assignedManager?.name ?? 'Unassigned'),
                      const SizedBox(height: 8),
                      Text(
                        'Last Updated: ${_formatDateTime(lorry.lastUpdated)}',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
                // Right: Actions
                Expanded(
                  flex: 1,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      if (isAdmin && isSubmittedPhase) ...[
                        ElevatedButton.icon(
                          onPressed: () => _markSentToDealer(lorry),
                          icon: const Icon(Icons.local_shipping),
                          label: const Text('Sent to Dealer'),
                        ),
                        const SizedBox(height: 8),
                        OutlinedButton.icon(
                          onPressed: () => _requestChanges(lorry),
                          icon: const Icon(Icons.edit),
                          label: const Text('Request Changes'),
                        ),
                      ] else if (!isAdmin && isEditablePhase) ...[
                        ElevatedButton.icon(
                          onPressed: () => _submitToAdmin(lorry),
                          icon: const Icon(Icons.send),
                          label: const Text('Submit to Admin'),
                        ),
                        const SizedBox(height: 8),
                        OutlinedButton.icon(
                          onPressed: () => _addFarmerDelivery(),
                          icon: const Icon(Icons.add),
                          label: const Text('Add Farmer'),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDeliveriesGrid(List<FarmerDelivery> deliveries) {
    return Card(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Text(
                  'Farmer Deliveries',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const Spacer(),
                if (deliveries.isNotEmpty) _buildTotalsFooter(deliveries),
              ],
            ),
          ),
          Expanded(
            child: deliveries.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.agriculture, size: 64, color: Colors.grey),
                        SizedBox(height: 16),
                        Text('No farmer deliveries yet'),
                        Text('Add farmers to start recording deliveries'),
                      ],
                    ),
                  )
                : Padding(
                    padding: const EdgeInsets.all(8),
                    child: DataTable2(
                      columnSpacing: 12,
                      horizontalMargin: 12,
                      minWidth: 1200,
                      columns: const [
                        DataColumn2(
                          label: Text('Farmer'),
                          size: ColumnSize.M,
                        ),
                        DataColumn2(
                          label: Text('Bags'),
                          size: ColumnSize.S,
                          numeric: true,
                        ),
                        DataColumn2(
                          label: Text('Bag Weights'),
                          size: ColumnSize.M,
                        ),
                        DataColumn2(
                          label: Text('Moisture %'),
                          size: ColumnSize.S,
                          numeric: true,
                        ),
                        DataColumn2(
                          label: Text('Gross (kg)'),
                          size: ColumnSize.S,
                          numeric: true,
                        ),
                        DataColumn2(
                          label: Text('2kg Ded.'),
                          size: ColumnSize.S,
                          numeric: true,
                        ),
                        DataColumn2(
                          label: Text('Quality Ded. (kg)'),
                          size: ColumnSize.S,
                          numeric: true,
                        ),
                        DataColumn2(
                          label: Text('Net (kg)'),
                          size: ColumnSize.S,
                          numeric: true,
                        ),
                        DataColumn2(
                          label: Text('Price / kg (₹)'),
                          size: ColumnSize.S,
                          numeric: true,
                        ),
                        DataColumn2(
                          label: Text('Advance (₹)'),
                          size: ColumnSize.S,
                          numeric: true,
                        ),
                        DataColumn2(
                          label: Text('Final (₹)'),
                          size: ColumnSize.S,
                          numeric: true,
                        ),
                      ],
                      rows: deliveries.map((delivery) {
                        return DataRow2(
                          cells: [
                            DataCell(Text(delivery.farmerName)),
                            DataCell(Text('${delivery.bags}')),
                            DataCell(
                              OutlinedButton(
                                onPressed: () => _showBagWeightsDialog(delivery),
                                child: Text('${delivery.bagWeights.length} weights'),
                              ),
                            ),
                            DataCell(Text('${delivery.moisturePercent}%')),
                            DataCell(Text('${delivery.grossWeight.toStringAsFixed(1)}')),
                            DataCell(Text('${delivery.deductionFixedKg.toStringAsFixed(1)}')),
                            DataCell(Text('${delivery.qualityDeductionKg.toStringAsFixed(1)}')),
                            DataCell(Text('${delivery.netWeight.toStringAsFixed(1)}')),
                            DataCell(Text('₹${delivery.pricePerKg.toStringAsFixed(2)}')),
                            DataCell(Text('₹${delivery.advance.toStringAsFixed(2)}')),
                            DataCell(Text('₹${delivery.finalAmount.toStringAsFixed(2)}')),
                          ],
                        );
                      }).toList(),
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildTotalsFooter(List<FarmerDelivery> deliveries) {
    final totalBags = deliveries.fold(0, (sum, d) => sum + d.bags);
    final totalGross = deliveries.fold(0.0, (sum, d) => sum + d.grossWeight);
    final totalNet = deliveries.fold(0.0, (sum, d) => sum + d.netWeight);
    final totalAmount = deliveries.fold(0.0, (sum, d) => sum + d.finalAmount);

    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceVariant,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('Total: $totalBags bags'),
          const SizedBox(width: 16),
          Text('Gross: ${totalGross.toStringAsFixed(1)} kg'),
          const SizedBox(width: 16),
          Text('Net: ${totalNet.toStringAsFixed(1)} kg'),
          const SizedBox(width: 16),
          Text('Amount: ₹${totalAmount.toStringAsFixed(2)}'),
        ],
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
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        label,
        style: TextStyle(color: color, fontWeight: FontWeight.w500),
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

  void _showBagWeightsDialog(FarmerDelivery delivery) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Bag Weights - ${delivery.farmerName}'),
        content: SizedBox(
          width: 400,
          height: 300,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Total Bags: ${delivery.bags}'),
              Text('Total Weight: ${delivery.grossWeight.toStringAsFixed(1)} kg'),
              const SizedBox(height: 16),
              const Text('Individual Bag Weights:'),
              const SizedBox(height: 8),
              Expanded(
                child: ListView.builder(
                  itemCount: delivery.bagWeights.length,
                  itemBuilder: (context, index) {
                    return ListTile(
                      dense: true,
                      title: Text('Bag ${index + 1}'),
                      trailing: Text('${delivery.bagWeights[index]} kg'),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _markSentToDealer(Lorry lorry) {
    ref.read(lorriesControllerProvider.notifier).updateStatus(
      lorryNumber: lorry.lorryNumber,
      status: 'SentToDealer',
    );
  }

  void _requestChanges(Lorry lorry) {
    ref.read(lorriesControllerProvider.notifier).updateStatus(
      lorryNumber: lorry.lorryNumber,
      status: 'Loading',
    );
  }

  void _submitToAdmin(Lorry lorry) {
    ref.read(lorriesControllerProvider.notifier).updateStatus(
      lorryNumber: lorry.lorryNumber,
      status: 'Submitted',
    );
  }

  void _addFarmerDelivery() {
    // TODO: Show add farmer delivery dialog
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Farmer Delivery'),
        content: const Text('Add farmer delivery dialog coming soon'),
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