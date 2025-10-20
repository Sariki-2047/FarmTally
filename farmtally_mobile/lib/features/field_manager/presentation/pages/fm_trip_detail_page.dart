import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:data_table_2/data_table_2.dart';
import '../widgets/ft_content_scaffold.dart';
import '../providers/fm_simple_providers.dart';
import '../../data/models/fm_trip_model.dart';

class FmTripDetailPage extends ConsumerStatefulWidget {
  final String tripId;
  
  const FmTripDetailPage({super.key, required this.tripId});

  @override
  ConsumerState<FmTripDetailPage> createState() => _FmTripDetailPageState();
}

class _FmTripDetailPageState extends ConsumerState<FmTripDetailPage> {

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(fmDeliveriesControllerProvider.notifier).loadDeliveries(widget.tripId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final deliveriesState = ref.watch(fmDeliveriesControllerProvider);
    
    return FtContentScaffold(
      title: 'Trip Details',
      breadcrumbs: [
        TextButton(
          onPressed: () => context.go('/app/fm/my-lorries'),
          child: const Text('My Lorries'),
        ),
        const Icon(Icons.chevron_right, size: 16, color: Color(0xFF9E9E9E)),
      ],
      actions: [
        ElevatedButton.icon(
          onPressed: () => _showAddDeliveryDialog(),
          icon: const Icon(Icons.add, color: Colors.white),
          label: const Text('Add Delivery', style: TextStyle(color: Colors.white)),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF2E7D32),
          ),
        ),
        const SizedBox(width: 8),
        OutlinedButton.icon(
          onPressed: () => _submitTrip(),
          icon: const Icon(Icons.send),
          label: const Text('Submit Trip'),
        ),
        const SizedBox(width: 8),
        OutlinedButton.icon(
          onPressed: () => ref.read(fmDeliveriesControllerProvider.notifier).loadDeliveries(widget.tripId),
          icon: const Icon(Icons.refresh),
          label: const Text('Refresh'),
        ),
      ],
      child: Column(
        children: [
          // Trip info cards
          _buildTripInfoCards(),
          const SizedBox(height: 16),
          
          // Deliveries grid
          Expanded(
            child: deliveriesState.loading
                ? const Center(child: CircularProgressIndicator())
                : deliveriesState.error != null
                    ? _buildErrorWidget(deliveriesState.error!)
                    : _buildDeliveriesGrid(deliveriesState.items),
          ),
        ],
      ),
    );
  }

  Widget _buildTripInfoCards() {
    return Row(
      children: [
        Expanded(
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Lorry Information',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  Text('Lorry: TN-01-AB-1234'),
                  Text('Driver: John Doe'),
                  Text('Route: Chennai - Salem'),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Trip Summary',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  Text('Farmers: ${_getTotalFarmers()}'),
                  Text('Total Bags: ${_getTotalBags()}'),
                  Text('Gross Weight: ${_getTotalWeight().toStringAsFixed(2)} kg'),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildErrorWidget(String error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 48, color: Color(0xFFD32F2F)),
          const SizedBox(height: 16),
          Text(
            'Failed to load deliveries',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            error,
            style: const TextStyle(color: Color(0xFF9E9E9E)),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () => ref.read(fmDeliveriesControllerProvider.notifier).loadDeliveries(widget.tripId),
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _buildDeliveriesGrid(List<DeliveryEntry> deliveries) {
    if (deliveries.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.inventory_outlined, size: 48, color: Color(0xFF9E9E9E)),
            const SizedBox(height: 16),
            Text(
              'No deliveries recorded',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: const Color(0xFF9E9E9E),
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Add farmer deliveries to get started',
              style: TextStyle(color: Color(0xFF9E9E9E)),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () => _showAddDeliveryDialog(),
              icon: const Icon(Icons.add),
              label: const Text('Add Delivery'),
            ),
          ],
        ),
      );
    }

    return DataTable2(
      columnSpacing: 12,
      horizontalMargin: 12,
      minWidth: 1000,
      columns: _buildColumns(),
      rows: _buildRows(deliveries),
      headingRowColor: MaterialStateProperty.all(const Color(0xFFF5F5F5)),
      dataRowColor: MaterialStateProperty.resolveWith<Color?>(
        (Set<MaterialState> states) {
          if (states.contains(MaterialState.selected)) {
            return const Color(0xFFE8F5E9);
          }
          return null;
        },
      ),
    );
  }

  List<DataColumn2> _buildColumns() {
    return [
      const DataColumn2(
        label: Text('Farmer Name'),
        size: ColumnSize.M,
      ),
      const DataColumn2(
        label: Text('Bags'),
        size: ColumnSize.S,
        numeric: true,
      ),
      const DataColumn2(
        label: Text('Bag Weights'),
        size: ColumnSize.S,
      ),
      const DataColumn2(
        label: Text('Moisture %'),
        size: ColumnSize.S,
        numeric: true,
      ),
      const DataColumn2(
        label: Text('Quality'),
        size: ColumnSize.S,
      ),
      const DataColumn2(
        label: Text('Gross (kg)'),
        size: ColumnSize.S,
        numeric: true,
      ),
      const DataColumn2(
        label: Text('Deduction (kg)'),
        size: ColumnSize.S,
        numeric: true,
      ),
      const DataColumn2(
        label: Text('Net (kg)'),
        size: ColumnSize.S,
        numeric: true,
      ),
      const DataColumn2(
        label: Text('Actions'),
        size: ColumnSize.S,
      ),
    ];
  }

  List<DataRow2> _buildRows(List<DeliveryEntry> deliveries) {
    return deliveries.map((delivery) {
      return DataRow2(
        onTap: () => _showEditDeliveryDialog(delivery.id),
        cells: [
          DataCell(Text(delivery.farmerName)),
          DataCell(Text('${delivery.numberOfBags}')),
          DataCell(
            TextButton(
              onPressed: () => _showBagWeightsDialog(delivery.bagWeights),
              child: const Text('View Weights'),
            ),
          ),
          DataCell(Text('${delivery.moisturePercent.toStringAsFixed(2)}%')),
          DataCell(_buildQualityChip(delivery.qualityGrade)),
          DataCell(Text('${delivery.grossWeight.toStringAsFixed(2)}')),
          DataCell(Text('${delivery.deductionFixedKg.toStringAsFixed(2)}')),
          DataCell(Text('${delivery.netWeight.toStringAsFixed(2)}')),
          DataCell(_buildActionButtons(delivery)),
        ],
      );
    }).toList();
  }

  Widget _buildQualityChip(String grade) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: _getQualityColor(grade).withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        grade,
        style: TextStyle(
          color: _getQualityColor(grade),
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildActionButtons(DeliveryEntry delivery) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        IconButton(
          icon: const Icon(Icons.edit, size: 18),
          onPressed: () => _showEditDeliveryDialog(delivery.id),
          tooltip: 'Edit',
        ),
        IconButton(
          icon: const Icon(Icons.delete, size: 18, color: Color(0xFFD32F2F)),
          onPressed: () => _deleteDelivery(delivery.id),
          tooltip: 'Delete',
        ),
      ],
    );
  }

  Color _getQualityColor(String grade) {
    switch (grade.toUpperCase()) {
      case 'A':
        return const Color(0xFF4CAF50);
      case 'B':
        return const Color(0xFFFFB300);
      case 'C':
        return const Color(0xFFFF9800);
      case 'D':
        return const Color(0xFFD32F2F);
      default:
        return const Color(0xFF9E9E9E);
    }
  }

  int _getTotalFarmers() {
    final deliveries = ref.read(fmDeliveriesControllerProvider).items;
    return deliveries.length;
  }

  int _getTotalBags() {
    final deliveries = ref.read(fmDeliveriesControllerProvider).items;
    return deliveries.fold(0, (sum, delivery) => sum + delivery.numberOfBags);
  }

  double _getTotalWeight() {
    final deliveries = ref.read(fmDeliveriesControllerProvider).items;
    return deliveries.fold(0.0, (sum, delivery) => sum + delivery.netWeight);
  }

  void _showAddDeliveryDialog() {
    showDialog(
      context: context,
      builder: (context) => AddDeliveryDialog(tripId: widget.tripId),
    );
  }

  void _showEditDeliveryDialog(String deliveryId) {
    final deliveries = ref.read(fmDeliveriesControllerProvider).items;
    final delivery = deliveries.firstWhere((d) => d.id == deliveryId);
    
    showDialog(
      context: context,
      builder: (context) => AddDeliveryDialog(
        tripId: widget.tripId,
        delivery: delivery,
      ),
    );
  }

  void _showBagWeightsDialog(List<double> weights) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Bag Weights'),
        content: SizedBox(
          width: 300,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              for (int i = 0; i < weights.length; i++)
                ListTile(
                  leading: CircleAvatar(
                    child: Text('${i + 1}'),
                  ),
                  title: Text('${weights[i].toStringAsFixed(2)} kg'),
                ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _deleteDelivery(String deliveryId) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Delivery'),
        content: const Text('Are you sure you want to delete this delivery?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              ref.read(fmDeliveriesControllerProvider.notifier).deleteDelivery(deliveryId);
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFD32F2F)),
            child: const Text('Delete', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _submitTrip() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Submit Trip'),
        content: const Text('Are you sure you want to submit this trip for approval?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              // TODO: Implement submit trip logic
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Trip submitted successfully')),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2E7D32)),
            child: const Text('Submit', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
class 
AddDeliveryDialog extends ConsumerStatefulWidget {
  final String tripId;
  final DeliveryEntry? delivery;
  
  const AddDeliveryDialog({super.key, required this.tripId, this.delivery});

  @override
  ConsumerState<AddDeliveryDialog> createState() => _AddDeliveryDialogState();
}

class _AddDeliveryDialogState extends ConsumerState<AddDeliveryDialog> {
  final _formKey = GlobalKey<FormState>();
  final _farmerNameController = TextEditingController();
  final _farmerPhoneController = TextEditingController();
  final _numberOfBagsController = TextEditingController();
  final _moistureController = TextEditingController();
  final _notesController = TextEditingController();
  
  List<double> _bagWeights = [];
  String _qualityGrade = 'A';
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    if (widget.delivery != null) {
      final delivery = widget.delivery!;
      _farmerNameController.text = delivery.farmerName;
      _farmerPhoneController.text = delivery.farmerPhone ?? '';
      _numberOfBagsController.text = delivery.numberOfBags.toString();
      _moistureController.text = delivery.moisturePercent.toString();
      _notesController.text = delivery.notes ?? '';
      _bagWeights = List.from(delivery.bagWeights);
      _qualityGrade = delivery.qualityGrade;
    }
  }

  @override
  void dispose() {
    _farmerNameController.dispose();
    _farmerPhoneController.dispose();
    _numberOfBagsController.dispose();
    _moistureController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.delivery != null;
    
    return AlertDialog(
      title: Text(isEditing ? 'Edit Delivery' : 'Add Delivery'),
      content: SizedBox(
        width: 500,
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Farmer Information
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _farmerNameController,
                        decoration: const InputDecoration(
                          labelText: 'Farmer Name *',
                          border: OutlineInputBorder(),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter farmer name';
                          }
                          return null;
                        },
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextFormField(
                        controller: _farmerPhoneController,
                        decoration: const InputDecoration(
                          labelText: 'Phone Number',
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.phone,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                
                // Number of Bags and Moisture
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _numberOfBagsController,
                        decoration: const InputDecoration(
                          labelText: 'Number of Bags *',
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.number,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Required';
                          }
                          final bags = int.tryParse(value);
                          if (bags == null || bags <= 0) {
                            return 'Invalid number';
                          }
                          return null;
                        },
                        onChanged: (value) {
                          final bags = int.tryParse(value);
                          if (bags != null && bags > 0) {
                            _updateBagWeights(bags);
                          }
                        },
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextFormField(
                        controller: _moistureController,
                        decoration: const InputDecoration(
                          labelText: 'Moisture % *',
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.number,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Required';
                          }
                          final moisture = double.tryParse(value);
                          if (moisture == null || moisture < 0 || moisture > 100) {
                            return 'Invalid percentage';
                          }
                          return null;
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                
                // Quality Grade
                DropdownButtonFormField<String>(
                  value: _qualityGrade,
                  decoration: const InputDecoration(
                    labelText: 'Quality Grade',
                    border: OutlineInputBorder(),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'A', child: Text('Grade A')),
                    DropdownMenuItem(value: 'B', child: Text('Grade B')),
                    DropdownMenuItem(value: 'C', child: Text('Grade C')),
                    DropdownMenuItem(value: 'D', child: Text('Grade D')),
                  ],
                  onChanged: (value) {
                    if (value != null) {
                      setState(() {
                        _qualityGrade = value;
                      });
                    }
                  },
                ),
                const SizedBox(height: 16),
                
                // Bag Weights Section
                _buildBagWeightsSection(),
                const SizedBox(height: 16),
                
                // Notes
                TextFormField(
                  controller: _notesController,
                  decoration: const InputDecoration(
                    labelText: 'Notes (Optional)',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 2,
                ),
                const SizedBox(height: 16),
                
                // Summary
                _buildDeliverySummary(),
              ],
            ),
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: _isSubmitting ? null : () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _isSubmitting ? null : _submitDelivery,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF2E7D32),
          ),
          child: _isSubmitting
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                )
              : Text(isEditing ? 'Update' : 'Add Delivery', style: const TextStyle(color: Colors.white)),
        ),
      ],
    );
  }

  Widget _buildBagWeightsSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Text(
                  'Individual Bag Weights (kg)',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
                const Spacer(),
                TextButton.icon(
                  onPressed: _bagWeights.isNotEmpty ? _showBagWeightsDialog : null,
                  icon: const Icon(Icons.edit, size: 16),
                  label: const Text('Edit Weights'),
                ),
              ],
            ),
            const SizedBox(height: 8),
            if (_bagWeights.isEmpty)
              const Text(
                'Enter number of bags to add weights',
                style: TextStyle(color: Color(0xFF9E9E9E)),
              )
            else
              Wrap(
                spacing: 8,
                runSpacing: 4,
                children: _bagWeights.asMap().entries.map((entry) {
                  return Chip(
                    label: Text('Bag ${entry.key + 1}: ${entry.value.toStringAsFixed(2)} kg'),
                    backgroundColor: const Color(0xFFE8F5E9),
                  );
                }).toList(),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildDeliverySummary() {
    final grossWeight = _bagWeights.fold(0.0, (sum, weight) => sum + weight);
    final deductionFixed = _bagWeights.length * 2.0; // 2kg per bag
    final qualityDeduction = _calculateQualityDeduction(grossWeight);
    final netWeight = grossWeight - deductionFixed - qualityDeduction;
    
    return Card(
      color: const Color(0xFFF5F5F5),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Delivery Summary',
              style: TextStyle(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Gross Weight:'),
                Text('${grossWeight.toStringAsFixed(2)} kg'),
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Fixed Deduction:'),
                Text('${deductionFixed.toStringAsFixed(2)} kg'),
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Quality Deduction:'),
                Text('${qualityDeduction.toStringAsFixed(2)} kg'),
              ],
            ),
            const Divider(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Net Weight:',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
                Text(
                  '${netWeight.toStringAsFixed(2)} kg',
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF2E7D32),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _updateBagWeights(int numberOfBags) {
    setState(() {
      if (_bagWeights.length < numberOfBags) {
        // Add more bags with default weight
        while (_bagWeights.length < numberOfBags) {
          _bagWeights.add(50.0); // Default 50kg per bag
        }
      } else if (_bagWeights.length > numberOfBags) {
        // Remove excess bags
        _bagWeights = _bagWeights.take(numberOfBags).toList();
      }
    });
  }

  void _showBagWeightsDialog() {
    showDialog(
      context: context,
      builder: (context) => BagWeightsDialog(
        bagWeights: List.from(_bagWeights),
        onWeightsChanged: (weights) {
          setState(() {
            _bagWeights = weights;
          });
        },
      ),
    );
  }

  double _calculateQualityDeduction(double grossWeight) {
    // Simple quality deduction calculation
    switch (_qualityGrade) {
      case 'A':
        return 0.0;
      case 'B':
        return grossWeight * 0.02; // 2% deduction
      case 'C':
        return grossWeight * 0.05; // 5% deduction
      case 'D':
        return grossWeight * 0.10; // 10% deduction
      default:
        return 0.0;
    }
  }

  Future<void> _submitDelivery() async {
    if (!_formKey.currentState!.validate()) return;
    
    if (_bagWeights.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please add bag weights'),
          backgroundColor: Color(0xFFD32F2F),
        ),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final grossWeight = _bagWeights.fold(0.0, (sum, weight) => sum + weight);
      final deductionFixed = _bagWeights.length * 2.0;
      final qualityDeduction = _calculateQualityDeduction(grossWeight);
      final netWeight = grossWeight - deductionFixed - qualityDeduction;

      final delivery = DeliveryEntry(
        id: widget.delivery?.id ?? '',
        tripId: widget.tripId,
        farmerId: widget.delivery?.farmerId ?? '',
        farmerName: _farmerNameController.text,
        numberOfBags: _bagWeights.length,
        bagWeights: _bagWeights,
        moisturePercent: double.parse(_moistureController.text),
        qualityGrade: _qualityGrade,
        grossWeight: grossWeight,
        deductionFixedKg: deductionFixed,
        qualityDeductionKg: qualityDeduction,
        netWeight: netWeight,
        farmerPhone: _farmerPhoneController.text.isEmpty ? null : _farmerPhoneController.text,
        notes: _notesController.text.isEmpty ? null : _notesController.text,
        recordedAt: DateTime.now(),
      );

      if (widget.delivery != null) {
        await ref.read(fmDeliveriesControllerProvider.notifier).updateDelivery(widget.delivery!.id, delivery);
      } else {
        await ref.read(fmDeliveriesControllerProvider.notifier).addDelivery(delivery);
      }
      
      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(widget.delivery != null ? 'Delivery updated successfully' : 'Delivery added successfully'),
            backgroundColor: const Color(0xFF4CAF50),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to ${widget.delivery != null ? 'update' : 'add'} delivery: $e'),
            backgroundColor: const Color(0xFFD32F2F),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }
}

class BagWeightsDialog extends StatefulWidget {
  final List<double> bagWeights;
  final ValueChanged<List<double>> onWeightsChanged;
  
  const BagWeightsDialog({
    super.key,
    required this.bagWeights,
    required this.onWeightsChanged,
  });

  @override
  State<BagWeightsDialog> createState() => _BagWeightsDialogState();
}

class _BagWeightsDialogState extends State<BagWeightsDialog> {
  late List<TextEditingController> _controllers;
  late List<double> _weights;

  @override
  void initState() {
    super.initState();
    _weights = List.from(widget.bagWeights);
    _controllers = _weights.map((weight) => TextEditingController(text: weight.toString())).toList();
  }

  @override
  void dispose() {
    for (final controller in _controllers) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Individual Bag Weights'),
      content: SizedBox(
        width: 400,
        height: 400,
        child: Column(
          children: [
            Row(
              children: [
                Text('Total Bags: ${_weights.length}'),
                const Spacer(),
                Text('Total Weight: ${_weights.fold(0.0, (sum, w) => sum + w).toStringAsFixed(2)} kg'),
              ],
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView.builder(
                itemCount: _weights.length,
                itemBuilder: (context, index) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      children: [
                        SizedBox(
                          width: 80,
                          child: Text('Bag ${index + 1}:'),
                        ),
                        Expanded(
                          child: TextFormField(
                            controller: _controllers[index],
                            decoration: const InputDecoration(
                              suffixText: 'kg',
                              border: OutlineInputBorder(),
                              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            ),
                            keyboardType: TextInputType.number,
                            onChanged: (value) {
                              final weight = double.tryParse(value);
                              if (weight != null && weight > 0) {
                                _weights[index] = weight;
                                setState(() {});
                              }
                            },
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: () {
            widget.onWeightsChanged(_weights);
            Navigator.of(context).pop();
          },
          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2E7D32)),
          child: const Text('Save Weights', style: TextStyle(color: Colors.white)),
        ),
      ],
    );
  }
}