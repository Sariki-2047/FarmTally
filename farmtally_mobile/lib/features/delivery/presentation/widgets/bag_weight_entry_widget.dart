import 'package:flutter/material.dart';
import '../../data/models/delivery_model.dart';

class BagWeightEntryWidget extends StatefulWidget {
  final List<BagWeightModel> bagWeights;
  final Function(BagWeightModel) onAddBag;
  final Function(int, BagWeightModel) onUpdateBag;
  final Function(int) onRemoveBag;

  const BagWeightEntryWidget({
    super.key,
    required this.bagWeights,
    required this.onAddBag,
    required this.onUpdateBag,
    required this.onRemoveBag,
  });

  @override
  State<BagWeightEntryWidget> createState() => _BagWeightEntryWidgetState();
}

class _BagWeightEntryWidgetState extends State<BagWeightEntryWidget> {
  final _weightController = TextEditingController();
  final _moistureController = TextEditingController();
  final _notesController = TextEditingController();

  @override
  void dispose() {
    _weightController.dispose();
    _moistureController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Bag Weights',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                ElevatedButton.icon(
                  onPressed: _showAddBagDialog,
                  icon: const Icon(Icons.add),
                  label: const Text('Add Bag'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).colorScheme.primary,
                    foregroundColor: Colors.white,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            
            if (widget.bagWeights.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(32.0),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade300),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  children: [
                    Icon(
                      Icons.scale,
                      size: 48,
                      color: Colors.grey.shade400,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'No bags added yet',
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Tap "Add Bag" to start recording weights',
                      style: TextStyle(
                        color: Colors.grey.shade500,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              )
            else
              Column(
                children: [
                  // Summary row
                  Container(
                    padding: const EdgeInsets.all(12.0),
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Total Bags: ${widget.bagWeights.length}',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        Text(
                          'Total Weight: ${widget.bagWeights.fold<double>(0, (sum, bag) => sum + bag.weight).toStringAsFixed(2)} kg',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  
                  // Bag list
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: widget.bagWeights.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final bag = widget.bagWeights[index];
                      return _buildBagWeightCard(bag, index);
                    },
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildBagWeightCard(BagWeightModel bag, int index) {
    return Container(
      padding: const EdgeInsets.all(12.0),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey.shade300),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          // Bag number
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Center(
              child: Text(
                '${bag.bagNumber}',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          
          // Bag details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      '${bag.weight.toStringAsFixed(2)} kg',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Text(
                      '${bag.moistureContent.toStringAsFixed(1)}% moisture',
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
                if (bag.notes != null && bag.notes!.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(
                      bag.notes!,
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 12,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ),
              ],
            ),
          ),
          
          // Actions
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                onPressed: () => _showEditBagDialog(bag, index),
                icon: const Icon(Icons.edit),
                iconSize: 20,
              ),
              IconButton(
                onPressed: () => _confirmRemoveBag(index),
                icon: const Icon(Icons.delete),
                iconSize: 20,
                color: Colors.red,
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showAddBagDialog() {
    _weightController.clear();
    _moistureController.clear();
    _notesController.clear();
    
    showDialog(
      context: context,
      builder: (context) => _buildBagDialog(
        title: 'Add Bag Weight',
        onSave: () {
          final weight = double.tryParse(_weightController.text) ?? 0;
          final moisture = double.tryParse(_moistureController.text) ?? 0;
          
          if (weight > 0) {
            final bagWeight = BagWeightModel(
              id: DateTime.now().millisecondsSinceEpoch.toString(),
              bagNumber: widget.bagWeights.length + 1,
              weight: weight,
              moistureContent: moisture,
              notes: _notesController.text.isEmpty ? null : _notesController.text,
            );
            
            widget.onAddBag(bagWeight);
            Navigator.of(context).pop();
          }
        },
      ),
    );
  }

  void _showEditBagDialog(BagWeightModel bag, int index) {
    _weightController.text = bag.weight.toString();
    _moistureController.text = bag.moistureContent.toString();
    _notesController.text = bag.notes ?? '';
    
    showDialog(
      context: context,
      builder: (context) => _buildBagDialog(
        title: 'Edit Bag ${bag.bagNumber}',
        onSave: () {
          final weight = double.tryParse(_weightController.text) ?? 0;
          final moisture = double.tryParse(_moistureController.text) ?? 0;
          
          if (weight > 0) {
            final updatedBag = BagWeightModel(
              id: bag.id,
              bagNumber: bag.bagNumber,
              weight: weight,
              moistureContent: moisture,
              notes: _notesController.text.isEmpty ? null : _notesController.text,
            );
            
            widget.onUpdateBag(index, updatedBag);
            Navigator.of(context).pop();
          }
        },
      ),
    );
  }

  Widget _buildBagDialog({required String title, required VoidCallback onSave}) {
    return AlertDialog(
      title: Text(title),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            controller: _weightController,
            decoration: const InputDecoration(
              labelText: 'Weight (kg)',
              border: OutlineInputBorder(),
            ),
            keyboardType: TextInputType.number,
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _moistureController,
            decoration: const InputDecoration(
              labelText: 'Moisture Content (%)',
              border: OutlineInputBorder(),
            ),
            keyboardType: TextInputType.number,
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _notesController,
            decoration: const InputDecoration(
              labelText: 'Notes (optional)',
              border: OutlineInputBorder(),
            ),
            maxLines: 2,
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: onSave,
          child: const Text('Save'),
        ),
      ],
    );
  }

  void _confirmRemoveBag(int index) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Remove Bag'),
        content: Text('Are you sure you want to remove bag ${widget.bagWeights[index].bagNumber}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              widget.onRemoveBag(index);
              Navigator.of(context).pop();
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Remove'),
          ),
        ],
      ),
    );
  }
}