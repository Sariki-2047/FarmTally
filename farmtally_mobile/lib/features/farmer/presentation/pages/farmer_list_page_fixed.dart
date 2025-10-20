import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/domain/entities/user.dart';
import '../../../../core/domain/entities/result.dart';
import '../../../../core/domain/entities/failure.dart';
import '../../../../core/presentation/providers/auth_provider.dart';
import '../../../../core/presentation/providers/farmer_provider.dart';
import '../../../../core/domain/entities/farmer.dart';

class FarmerListPageFixed extends ConsumerStatefulWidget {
  const FarmerListPageFixed({super.key});

  @override
  ConsumerState<FarmerListPageFixed> createState() => _FarmerListPageFixedState();
}

class _FarmerListPageFixedState extends ConsumerState<FarmerListPageFixed> {
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);
    final theme = Theme.of(context);

    if (user?.organizationId == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final farmerState = ref.watch(farmerNotifierProvider(user!.organizationId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Farmers'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _showAddFarmerDialog(context),
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(farmerNotifierProvider(user.organizationId).notifier).refreshFarmers(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Container(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                hintText: 'Search farmers...',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: (value) {
                ref.read(farmerNotifierProvider(user.organizationId).notifier).searchFarmers(value);
              },
            ),
          ),
          
          // Error Display
          if (farmerState.error != null)
            Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                border: Border.all(color: Colors.red.shade200),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(Icons.error, color: Colors.red.shade600),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      farmerState.error!,
                      style: TextStyle(color: Colors.red.shade800),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => ref.read(farmerNotifierProvider(user.organizationId).notifier).clearError(),
                  ),
                ],
              ),
            ),
          
          // Farmers List
          Expanded(
            child: _buildFarmersList(farmerState, user, theme),
          ),
        ],
      ),
    );
  }

  Widget _buildFarmersList(FarmerState farmerState, User user, ThemeData theme) {
    if (farmerState.isLoading && farmerState.farmers.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (farmerState.farmers.isEmpty && !farmerState.isLoading) {
      return _buildEmptyState(context);
    }

    return RefreshIndicator(
      onRefresh: () async {
        await ref.read(farmerNotifierProvider(user.organizationId).notifier).refreshFarmers();
      },
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: farmerState.farmers.length + (farmerState.isLoading ? 1 : 0),
        itemBuilder: (context, index) {
          if (index >= farmerState.farmers.length) {
            return const Padding(
              padding: EdgeInsets.all(16),
              child: Center(child: CircularProgressIndicator()),
            );
          }

          final farmer = farmerState.farmers[index];
          return _buildFarmerCard(context, farmer, theme);
        },
      ),
    );
  }

  Widget _buildFarmerCard(BuildContext context, Farmer farmer, ThemeData theme) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => _showFarmerDetails(farmer),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Row
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          farmer.name,
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          farmer.phone,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.colorScheme.onSurface.withOpacity(0.7),
                          ),
                        ),
                      ],
                    ),
                  ),
                  _buildPerformanceBadge(farmer.performanceRating, theme),
                ],
              ),
              
              const SizedBox(height: 12),
              
              // Details Row
              Row(
                children: [
                  Expanded(
                    child: _buildInfoItem(
                      Icons.location_on,
                      farmer.displayLocation,
                      theme,
                    ),
                  ),
                  Expanded(
                    child: _buildInfoItem(
                      Icons.scale,
                      '${farmer.totalWeightKg.toStringAsFixed(1)} kg',
                      theme,
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 8),
              
              Row(
                children: [
                  Expanded(
                    child: _buildInfoItem(
                      Icons.delivery_dining,
                      '${farmer.totalDeliveries} deliveries',
                      theme,
                    ),
                  ),
                  if (farmer.lastDelivery != null)
                    Expanded(
                      child: _buildInfoItem(
                        Icons.schedule,
                        _formatDate(farmer.lastDelivery!),
                        theme,
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPerformanceBadge(String rating, ThemeData theme) {
    Color backgroundColor;
    Color textColor;
    
    switch (rating) {
      case 'Excellent':
        backgroundColor = Colors.green.shade100;
        textColor = Colors.green.shade800;
        break;
      case 'Good':
        backgroundColor = Colors.blue.shade100;
        textColor = Colors.blue.shade800;
        break;
      case 'Average':
        backgroundColor = Colors.orange.shade100;
        textColor = Colors.orange.shade800;
        break;
      default:
        backgroundColor = Colors.grey.shade100;
        textColor = Colors.grey.shade800;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        rating,
        style: theme.textTheme.bodySmall?.copyWith(
          color: textColor,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildInfoItem(IconData icon, String text, ThemeData theme) {
    return Row(
      children: [
        Icon(
          icon,
          size: 16,
          color: theme.colorScheme.onSurface.withOpacity(0.6),
        ),
        const SizedBox(width: 4),
        Expanded(
          child: Text(
            text,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurface.withOpacity(0.8),
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.people,
            size: 64,
            color: Colors.grey.shade400,
          ),
          const SizedBox(height: 16),
          Text(
            'No farmers found',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Add your first farmer to get started',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.grey.shade500,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () => _showAddFarmerDialog(context),
            icon: const Icon(Icons.add),
            label: const Text('Add Farmer'),
          ),
        ],
      ),
    );
  }

  void _showAddFarmerDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => _AddFarmerDialog(
        onFarmerAdded: (farmer) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Farmer ${farmer.name} added successfully'),
              backgroundColor: Colors.green,
            ),
          );
        },
      ),
    );
  }

  void _showFarmerDetails(Farmer farmer) {
    // TODO: Navigate to farmer details page
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Farmer details for ${farmer.name}')),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date).inDays;
    
    if (difference == 0) {
      return 'Today';
    } else if (difference == 1) {
      return 'Yesterday';
    } else if (difference < 7) {
      return '$difference days ago';
    } else {
      return '${date.day}/${date.month}/${date.year}';
    }
  }
}

class _AddFarmerDialog extends ConsumerStatefulWidget {
  final Function(Farmer) onFarmerAdded;

  const _AddFarmerDialog({required this.onFarmerAdded});

  @override
  ConsumerState<_AddFarmerDialog> createState() => _AddFarmerDialogState();
}

class _AddFarmerDialogState extends ConsumerState<_AddFarmerDialog> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _villageController = TextEditingController();
  final _districtController = TextEditingController();
  final _addressController = TextEditingController();
  final _idNumberController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _villageController.dispose();
    _districtController.dispose();
    _addressController.dispose();
    _idNumberController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add New Farmer'),
      content: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Farmer Name',
                ),
                textCapitalization: TextCapitalization.words,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Name is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _phoneController,
                decoration: const InputDecoration(
                  labelText: 'Phone Number',
                ),
                keyboardType: TextInputType.phone,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Phone number is required';
                  }
                  if (value.length < 10) {
                    return 'Please enter a valid phone number';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _villageController,
                decoration: const InputDecoration(
                  labelText: 'Village (optional)',
                ),
                textCapitalization: TextCapitalization.words,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _districtController,
                decoration: const InputDecoration(
                  labelText: 'District (optional)',
                ),
                textCapitalization: TextCapitalization.words,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _addressController,
                decoration: const InputDecoration(
                  labelText: 'Address (optional)',
                ),
                textCapitalization: TextCapitalization.words,
                maxLines: 2,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _idNumberController,
                decoration: const InputDecoration(
                  labelText: 'ID Number (optional)',
                ),
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: _isLoading ? null : () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _isLoading ? null : _addFarmer,
          child: _isLoading
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Text('Add'),
        ),
      ],
    );
  }

  Future<void> _addFarmer() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final user = ref.read(currentUserProvider);
      if (user?.organizationId == null) {
        throw Exception('Organization ID not found');
      }

      final result = await ref.read(farmerNotifierProvider(user!.organizationId).notifier).createFarmer(
        name: _nameController.text,
        phone: _phoneController.text,
        village: _villageController.text.trim().isEmpty ? null : _villageController.text,
        district: _districtController.text.trim().isEmpty ? null : _districtController.text,
        address: _addressController.text.trim().isEmpty ? null : _addressController.text,
        idNumber: _idNumberController.text.trim().isEmpty ? null : _idNumberController.text,
      );

      if (result.isSuccess) {
        widget.onFarmerAdded(result.data!);
        if (mounted) Navigator.of(context).pop();
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(result.failure!.userMessage),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to add farmer: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
}