import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers/auth_provider.dart';
import '../../../farmer/data/models/farmer_model.dart';
import '../../../farmer/presentation/providers/farmer_provider.dart';
import '../../../lorry/data/models/lorry_model.dart';
import '../../data/models/delivery_model.dart';
import '../providers/delivery_provider.dart';
import '../widgets/bag_weight_entry_widget.dart';

class DeliveryEntryPage extends ConsumerStatefulWidget {
  final String? lorryId;
  final String? farmerId;

  const DeliveryEntryPage({
    super.key,
    this.lorryId,
    this.farmerId,
  });

  @override
  ConsumerState<DeliveryEntryPage> createState() => _DeliveryEntryPageState();
}

class _DeliveryEntryPageState extends ConsumerState<DeliveryEntryPage> {
  final _formKey = GlobalKey<FormState>();
  final _moistureController = TextEditingController();
  final _qualityController = TextEditingController();
  final _priceController = TextEditingController();
  final _notesController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.lorryId != null) {
        ref.read(deliveryFormProvider.notifier).updateLorryId(widget.lorryId!);
      }
      if (widget.farmerId != null) {
        ref.read(deliveryFormProvider.notifier).updateFarmerId(widget.farmerId!);
      }
      
      // Load farmers for selection
      ref.read(farmerListProvider.notifier).loadFarmers();
    });

    _moistureController.addListener(() {
      final value = double.tryParse(_moistureController.text) ?? 0;
      ref.read(deliveryFormProvider.notifier).updateMoistureContent(value);
    });

    _qualityController.addListener(() {
      final value = double.tryParse(_qualityController.text) ?? 5.0;
      ref.read(deliveryFormProvider.notifier).updateQualityGrade(value);
    });

    _priceController.addListener(() {
      final value = double.tryParse(_priceController.text) ?? 0;
      ref.read(deliveryFormProvider.notifier).updatePricePerKg(value);
    });

    _notesController.addListener(() {
      ref.read(deliveryFormProvider.notifier).updateNotes(_notesController.text);
    });
  }

  @override
  void dispose() {
    _moistureController.dispose();
    _qualityController.dispose();
    _priceController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final deliveryForm = ref.watch(deliveryFormProvider);
    final farmers = ref.watch(farmerListProvider);
    final user = ref.watch(currentUserProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Delivery Entry'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        actions: [
          if (deliveryForm.isLoading)
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              ),
            )
          else
            TextButton(
              onPressed: _saveDelivery,
              child: const Text(
                'SAVE',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Farmer Selection
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Farmer Selection',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      farmers.when(
                        data: (farmerList) => DropdownButtonFormField<String>(
                          value: deliveryForm.farmerId.isEmpty ? null : deliveryForm.farmerId,
                          decoration: const InputDecoration(
                            labelText: 'Select Farmer',
                            border: OutlineInputBorder(),
                          ),
                          items: farmerList.map((farmer) {
                            return DropdownMenuItem(
                              value: farmer.id,
                              child: Text('${farmer.name} - ${farmer.phoneNumber}'),
                            );
                          }).toList(),
                          onChanged: (value) {
                            if (value != null) {
                              ref.read(deliveryFormProvider.notifier).updateFarmerId(value);
                            }
                          },
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please select a farmer';
                            }
                            return null;
                          },
                        ),
                        loading: () => const Center(child: CircularProgressIndicator()),
                        error: (error, _) => Text('Error loading farmers: $error'),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Delivery Details
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Delivery Details',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              controller: _moistureController,
                              decoration: const InputDecoration(
                                labelText: 'Moisture Content (%)',
                                border: OutlineInputBorder(),
                                suffixText: '%',
                              ),
                              keyboardType: TextInputType.number,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Required';
                                }
                                final moisture = double.tryParse(value);
                                if (moisture == null || moisture < 0 || moisture > 100) {
                                  return 'Invalid moisture';
                                }
                                return null;
                              },
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: TextFormField(
                              controller: _qualityController,
                              decoration: const InputDecoration(
                                labelText: 'Quality Grade (1-5)',
                                border: OutlineInputBorder(),
                              ),
                              keyboardType: TextInputType.number,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Required';
                                }
                                final quality = double.tryParse(value);
                                if (quality == null || quality < 1 || quality > 5) {
                                  return 'Grade 1-5';
                                }
                                return null;
                              },
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _priceController,
                        decoration: const InputDecoration(
                          labelText: 'Price per Kg',
                          border: OutlineInputBorder(),
                          prefixText: '\$ ',
                        ),
                        keyboardType: TextInputType.number,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Price is required';
                          }
                          final price = double.tryParse(value);
                          if (price == null || price <= 0) {
                            return 'Invalid price';
                          }
                          return null;
                        },
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Bag Weights
              BagWeightEntryWidget(
                bagWeights: deliveryForm.bagWeights,
                onAddBag: (bagWeight) {
                  ref.read(deliveryFormProvider.notifier).addBagWeight(bagWeight);
                },
                onUpdateBag: (index, bagWeight) {
                  ref.read(deliveryFormProvider.notifier).updateBagWeight(index, bagWeight);
                },
                onRemoveBag: (index) {
                  ref.read(deliveryFormProvider.notifier).removeBagWeight(index);
                },
              ),

              const SizedBox(height: 16),

              // Calculation Summary
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Calculation Summary',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      _buildSummaryRow('Total Weight:', '${deliveryForm.totalWeight.toStringAsFixed(2)} kg'),
                      _buildSummaryRow('Price per Kg:', '\$${deliveryForm.pricePerKg.toStringAsFixed(2)}'),
                      _buildSummaryRow('Gross Amount:', '\$${deliveryForm.totalAmount.toStringAsFixed(2)}'),
                      if (deliveryForm.deductions > 0)
                        _buildSummaryRow('Deductions:', '-\$${deliveryForm.deductions.toStringAsFixed(2)}', isDeduction: true),
                      const Divider(),
                      _buildSummaryRow('Net Amount:', '\$${deliveryForm.netAmount.toStringAsFixed(2)}', isBold: true),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Notes
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Notes',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _notesController,
                        decoration: const InputDecoration(
                          labelText: 'Additional notes (optional)',
                          border: OutlineInputBorder(),
                        ),
                        maxLines: 3,
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isDeduction = false, bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
              color: isDeduction ? Colors.red : null,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _saveDelivery() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (ref.read(deliveryFormProvider).bagWeights.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please add at least one bag weight'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final success = await ref.read(deliveryFormProvider.notifier).saveDelivery();
    
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Delivery saved successfully'),
          backgroundColor: Colors.green,
        ),
      );
      Navigator.of(context).pop();
    } else {
      final error = ref.read(deliveryFormProvider).error;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to save delivery: $error'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}