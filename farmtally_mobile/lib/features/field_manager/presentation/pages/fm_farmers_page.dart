import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:data_table_2/data_table_2.dart';
import '../widgets/ft_content_scaffold.dart';
import '../providers/fm_simple_providers.dart';
import '../../data/models/fm_trip_model.dart';

class FmFarmersPage extends ConsumerStatefulWidget {
  const FmFarmersPage({super.key});

  @override
  ConsumerState<FmFarmersPage> createState() => _FmFarmersPageState();
}

class _FmFarmersPageState extends ConsumerState<FmFarmersPage> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(fmFarmersControllerProvider.notifier).load();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(fmFarmersControllerProvider);
    
    return FtContentScaffold(
      title: 'Farmers',
      actions: [
        ElevatedButton.icon(
          onPressed: () => _showAddFarmerDialog(),
          icon: const Icon(Icons.person_add, color: Colors.white),
          label: const Text('Add Farmer', style: TextStyle(color: Colors.white)),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF2E7D32),
          ),
        ),
        const SizedBox(width: 8),
        SizedBox(
          width: 320,
          child: TextField(
            controller: _searchController,
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.search),
              hintText: 'Search by name, phone, or Aadhaar',
              border: OutlineInputBorder(),
              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            ),
            onSubmitted: (value) {
              ref.read(fmFarmersControllerProvider.notifier).setSearchQuery(value.isEmpty ? null : value);
            },
          ),
        ),
        const SizedBox(width: 8),
        OutlinedButton.icon(
          onPressed: () => ref.read(fmFarmersControllerProvider.notifier).refresh(),
          icon: const Icon(Icons.refresh),
          label: const Text('Refresh'),
        ),
      ],
      child: state.loading
          ? const Center(child: CircularProgressIndicator())
          : state.error != null
              ? _buildErrorWidget(state.error!)
              : _buildDataGrid(state.items),
      footer: state.items.isNotEmpty
          ? FtPagination(
              total: state.total,
              page: state.page,
              limit: state.limit,
              onPage: (page) => ref.read(fmFarmersControllerProvider.notifier).loadPage(page),
            )
          : null,
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
            'Failed to load farmers',
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
            onPressed: () => ref.read(fmFarmersControllerProvider.notifier).refresh(),
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _buildDataGrid(List<FmFarmer> farmers) {
    if (farmers.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.agriculture_outlined, size: 48, color: Color(0xFF9E9E9E)),
            const SizedBox(height: 16),
            Text(
              'No farmers found',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: const Color(0xFF9E9E9E),
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Add farmers to get started',
              style: TextStyle(color: Color(0xFF9E9E9E)),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () => _showAddFarmerDialog(),
              icon: const Icon(Icons.person_add),
              label: const Text('Add Farmer'),
            ),
          ],
        ),
      );
    }

    return DataTable2(
      columnSpacing: 12,
      horizontalMargin: 12,
      minWidth: 800,
      columns: _buildColumns(),
      rows: _buildRows(farmers),
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
        label: Text('Name'),
        size: ColumnSize.M,
      ),
      const DataColumn2(
        label: Text('Phone'),
        size: ColumnSize.S,
      ),
      const DataColumn2(
        label: Text('Aadhaar'),
        size: ColumnSize.S,
      ),
      const DataColumn2(
        label: Text('Village'),
        size: ColumnSize.S,
      ),
      const DataColumn2(
        label: Text('Last Delivery'),
        size: ColumnSize.S,
      ),
      const DataColumn2(
        label: Text('Total Deliveries'),
        size: ColumnSize.S,
        numeric: true,
      ),
      const DataColumn2(
        label: Text('Total Weight (kg)'),
        size: ColumnSize.S,
        numeric: true,
      ),
      const DataColumn2(
        label: Text('Actions'),
        size: ColumnSize.S,
      ),
    ];
  }

  List<DataRow2> _buildRows(List<FmFarmer> farmers) {
    return farmers.map((farmer) {
      return DataRow2(
        onTap: () => _showFarmerDetails(farmer),
        cells: [
          DataCell(Text(farmer.name)),
          DataCell(Text(farmer.phone)),
          DataCell(Text(farmer.aadhaarMasked)),
          DataCell(Text(farmer.village ?? '-')),
          DataCell(Text(farmer.lastDelivery != null ? _formatDate(farmer.lastDelivery!) : '-')),
          DataCell(Text('${farmer.totalDeliveries}')),
          DataCell(Text('${farmer.totalWeightKg.toStringAsFixed(2)}')),
          DataCell(_buildActionButtons(farmer)),
        ],
      );
    }).toList();
  }

  Widget _buildActionButtons(FmFarmer farmer) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        IconButton(
          icon: const Icon(Icons.visibility, size: 18),
          onPressed: () => _showFarmerDetails(farmer),
          tooltip: 'View Details',
        ),
        IconButton(
          icon: const Icon(Icons.edit, size: 18),
          onPressed: () => _showEditFarmerDialog(farmer),
          tooltip: 'Edit',
        ),
      ],
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  void _showAddFarmerDialog() {
    showDialog(
      context: context,
      builder: (context) => const AddFarmerDialog(),
    );
  }

  void _showEditFarmerDialog(FmFarmer farmer) {
    showDialog(
      context: context,
      builder: (context) => AddFarmerDialog(farmer: farmer),
    );
  }

  void _showFarmerDetails(FmFarmer farmer) {
    showDialog(
      context: context,
      builder: (context) => FarmerDetailsDialog(farmer: farmer),
    );
  }
}

class AddFarmerDialog extends ConsumerStatefulWidget {
  final FmFarmer? farmer;
  
  const AddFarmerDialog({super.key, this.farmer});

  @override
  ConsumerState<AddFarmerDialog> createState() => _AddFarmerDialogState();
}

class _AddFarmerDialogState extends ConsumerState<AddFarmerDialog> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _aadhaarController = TextEditingController();
  final _villageController = TextEditingController();
  final _districtController = TextEditingController();
  final _stateController = TextEditingController();
  
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    if (widget.farmer != null) {
      _nameController.text = widget.farmer!.name;
      _phoneController.text = widget.farmer!.phone;
      _villageController.text = widget.farmer!.village ?? '';
      _districtController.text = widget.farmer!.district ?? '';
      _stateController.text = widget.farmer!.state ?? '';
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _aadhaarController.dispose();
    _villageController.dispose();
    _districtController.dispose();
    _stateController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.farmer != null;
    
    return AlertDialog(
      title: Text(isEditing ? 'Edit Farmer' : 'Add New Farmer'),
      content: SizedBox(
        width: 400,
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(
                    labelText: 'Full Name *',
                    border: OutlineInputBorder(),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter farmer name';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _phoneController,
                  decoration: const InputDecoration(
                    labelText: 'Phone Number *',
                    border: OutlineInputBorder(),
                  ),
                  keyboardType: TextInputType.phone,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter phone number';
                    }
                    if (value.length != 10) {
                      return 'Phone number must be 10 digits';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                if (!isEditing)
                  TextFormField(
                    controller: _aadhaarController,
                    decoration: const InputDecoration(
                      labelText: 'Aadhaar Number *',
                      hintText: 'Enter 12-digit Aadhaar number',
                      border: OutlineInputBorder(),
                    ),
                    keyboardType: TextInputType.number,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter Aadhaar number';
                      }
                      if (value.length != 12) {
                        return 'Aadhaar number must be 12 digits';
                      }
                      return null;
                    },
                  ),
                if (!isEditing) const SizedBox(height: 16),
                TextFormField(
                  controller: _villageController,
                  decoration: const InputDecoration(
                    labelText: 'Village',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _districtController,
                  decoration: const InputDecoration(
                    labelText: 'District',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _stateController,
                  decoration: const InputDecoration(
                    labelText: 'State',
                    border: OutlineInputBorder(),
                  ),
                ),
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
          onPressed: _isSubmitting ? null : _submitFarmer,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF2E7D32),
          ),
          child: _isSubmitting
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                )
              : Text(isEditing ? 'Update' : 'Add Farmer', style: const TextStyle(color: Colors.white)),
        ),
      ],
    );
  }

  Future<void> _submitFarmer() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isSubmitting = true;
    });

    try {
      // TODO: Implement farmer creation/update API call
      await Future.delayed(const Duration(seconds: 1)); // Simulate API call
      
      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(widget.farmer != null ? 'Farmer updated successfully' : 'Farmer added successfully'),
            backgroundColor: const Color(0xFF4CAF50),
          ),
        );
        // Refresh the farmers list
        ref.read(fmFarmersControllerProvider.notifier).refresh();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to ${widget.farmer != null ? 'update' : 'add'} farmer: $e'),
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

class FarmerDetailsDialog extends StatelessWidget {
  final FmFarmer farmer;
  
  const FarmerDetailsDialog({super.key, required this.farmer});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(farmer.name),
      content: SizedBox(
        width: 400,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildDetailRow('Phone', farmer.phone),
            _buildDetailRow('Aadhaar', farmer.aadhaarMasked),
            if (farmer.village != null) _buildDetailRow('Village', farmer.village!),
            if (farmer.district != null) _buildDetailRow('District', farmer.district!),
            if (farmer.state != null) _buildDetailRow('State', farmer.state!),
            const Divider(),
            _buildDetailRow('Total Deliveries', '${farmer.totalDeliveries}'),
            _buildDetailRow('Total Weight', '${farmer.totalWeightKg.toStringAsFixed(2)} kg'),
            if (farmer.lastDelivery != null)
              _buildDetailRow('Last Delivery', _formatDate(farmer.lastDelivery!)),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Close'),
        ),
      ],
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
          Expanded(
            child: Text(value),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}