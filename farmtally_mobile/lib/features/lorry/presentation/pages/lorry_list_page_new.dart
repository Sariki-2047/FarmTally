import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/domain/entities/user.dart';
import '../../../../core/domain/entities/failure.dart';
import '../../../../core/presentation/providers/auth_provider.dart';
import '../../../../core/presentation/providers/lorry_provider.dart';
import '../../../../core/domain/entities/lorry.dart';
import '../../../../core/domain/entities/result.dart';

class LorryListPageNew extends ConsumerStatefulWidget {
  const LorryListPageNew({super.key});

  @override
  ConsumerState<LorryListPageNew> createState() => _LorryListPageNewState();
}

class _LorryListPageNewState extends ConsumerState<LorryListPageNew> {
  final _searchController = TextEditingController();
  String? _selectedStatus;
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent * 0.8) {
      final user = ref.read(currentUserProvider);
      if (user?.organizationId != null) {
        ref.read(lorryNotifierProvider(user!.organizationId).notifier).loadMoreLorries();
      }
    }
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

    final lorryState = ref.watch(lorryNotifierProvider(user!.organizationId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Lorries'),
        actions: [
          if (user.isFarmAdmin)
            IconButton(
              icon: const Icon(Icons.add),
              onPressed: () => _showAddLorryDialog(context),
            ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(lorryNotifierProvider(user.organizationId).notifier).refreshLorries(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search and Filter Bar
          Container(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                // Search Bar
                TextField(
                  controller: _searchController,
                  decoration: const InputDecoration(
                    hintText: 'Search lorries...',
                    prefixIcon: Icon(Icons.search),
                    border: OutlineInputBorder(),
                  ),
                  onChanged: (value) {
                    // TODO: Implement search functionality
                    setState(() {});
                  },
                ),
                
                const SizedBox(height: 12),
                
                // Status Filter
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildStatusChip('All', null, theme),
                      const SizedBox(width: 8),
                      _buildStatusChip('Available', 'AVAILABLE', theme),
                      const SizedBox(width: 8),
                      _buildStatusChip('Assigned', 'ASSIGNED', theme),
                      const SizedBox(width: 8),
                      _buildStatusChip('Loading', 'LOADING', theme),
                      const SizedBox(width: 8),
                      _buildStatusChip('Submitted', 'SUBMITTED', theme),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          // Error Display
          if (lorryState.error != null)
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
                      lorryState.error!,
                      style: TextStyle(color: Colors.red.shade800),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => ref.read(lorryNotifierProvider(user.organizationId).notifier).clearError(),
                  ),
                ],
              ),
            ),
          
          // Lorries List
          Expanded(
            child: _buildLorriesList(lorryState, user, theme),
          ),
        ],
      ),
    );
  }

  Widget _buildLorriesList(LorryState lorryState, User user, ThemeData theme) {
    if (lorryState.isLoading && lorryState.lorries.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (lorryState.lorries.isEmpty && !lorryState.isLoading) {
      return _buildEmptyState(context, user.isFarmAdmin);
    }

    // Filter lorries based on selected status and search
    var filteredLorries = lorryState.lorries;
    
    if (_selectedStatus != null) {
      filteredLorries = filteredLorries.where((lorry) => lorry.status == _selectedStatus).toList();
    }

    final searchQuery = _searchController.text.toLowerCase();
    if (searchQuery.isNotEmpty) {
      filteredLorries = filteredLorries.where((lorry) =>
        lorry.registrationNumber.toLowerCase().contains(searchQuery) ||
        lorry.driverName.toLowerCase().contains(searchQuery) ||
        lorry.driverPhone.contains(searchQuery)
      ).toList();
    }

    return RefreshIndicator(
      onRefresh: () async {
        await ref.read(lorryNotifierProvider(user.organizationId).notifier).refreshLorries();
      },
      child: ListView.builder(
        controller: _scrollController,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: filteredLorries.length + (lorryState.isLoading ? 1 : 0),
        itemBuilder: (context, index) {
          if (index >= filteredLorries.length) {
            return const Padding(
              padding: EdgeInsets.all(16),
              child: Center(child: CircularProgressIndicator()),
            );
          }

          final lorry = filteredLorries[index];
          return _buildLorryCard(context, lorry, user.isFarmAdmin, theme);
        },
      ),
    );
  }

  Widget _buildStatusChip(String label, String? status, ThemeData theme) {
    final isSelected = _selectedStatus == status;
    
    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        setState(() {
          _selectedStatus = selected ? status : null;
        });
      },
      selectedColor: theme.colorScheme.primary.withOpacity(0.2),
      checkmarkColor: theme.colorScheme.primary,
    );
  }

  Widget _buildLorryCard(BuildContext context, Lorry lorry, bool canEdit, ThemeData theme) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => context.push('/lorries/${lorry.id}'),
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
                          lorry.registrationNumber,
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          lorry.driverName,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.colorScheme.onSurface.withOpacity(0.7),
                          ),
                        ),
                      ],
                    ),
                  ),
                  _buildStatusBadge(lorry.status, theme),
                ],
              ),
              
              const SizedBox(height: 12),
              
              // Details Row
              Row(
                children: [
                  Expanded(
                    child: _buildInfoItem(
                      Icons.phone,
                      lorry.driverPhone,
                      theme,
                    ),
                  ),
                  Expanded(
                    child: _buildInfoItem(
                      Icons.scale,
                      '${lorry.capacity.toStringAsFixed(1)} tons',
                      theme,
                    ),
                  ),
                ],
              ),
              
              if (lorry.currentLocation != null) ...[
                const SizedBox(height: 8),
                _buildInfoItem(
                  Icons.location_on,
                  lorry.currentLocation!,
                  theme,
                ),
              ],
              
              // Actions Row
              if (canEdit) ...[
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton.icon(
                      onPressed: () => _editLorry(lorry),
                      icon: const Icon(Icons.edit, size: 16),
                      label: const Text('Edit'),
                    ),
                    const SizedBox(width: 8),
                    TextButton.icon(
                      onPressed: () => _deleteLorry(lorry),
                      icon: const Icon(Icons.delete, size: 16),
                      label: const Text('Delete'),
                      style: TextButton.styleFrom(
                        foregroundColor: Colors.red,
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status, ThemeData theme) {
    Color backgroundColor;
    Color textColor;
    
    switch (status) {
      case 'AVAILABLE':
        backgroundColor = Colors.green.shade100;
        textColor = Colors.green.shade800;
        break;
      case 'ASSIGNED':
        backgroundColor = Colors.blue.shade100;
        textColor = Colors.blue.shade800;
        break;
      case 'LOADING':
        backgroundColor = Colors.orange.shade100;
        textColor = Colors.orange.shade800;
        break;
      case 'SUBMITTED':
        backgroundColor = Colors.purple.shade100;
        textColor = Colors.purple.shade800;
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
        status,
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

  Widget _buildEmptyState(BuildContext context, bool canAdd) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.local_shipping,
            size: 64,
            color: Colors.grey.shade400,
          ),
          const SizedBox(height: 16),
          Text(
            'No lorries found',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            canAdd 
                ? 'Add your first lorry to get started'
                : 'No lorries available at the moment',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.grey.shade500,
            ),
            textAlign: TextAlign.center,
          ),
          if (canAdd) ...[
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => _showAddLorryDialog(context),
              icon: const Icon(Icons.add),
              label: const Text('Add Lorry'),
            ),
          ],
        ],
      ),
    );
  }

  void _showAddLorryDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => _AddLorryDialog(
        onLorryAdded: (lorry) {
          // Lorry is automatically added to the state by the provider
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Lorry ${lorry.registrationNumber} added successfully'),
              backgroundColor: Colors.green,
            ),
          );
        },
      ),
    );
  }

  void _editLorry(Lorry lorry) {
    // TODO: Implement edit lorry functionality
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Edit lorry functionality coming soon')),
    );
  }

  void _deleteLorry(Lorry lorry) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Lorry'),
        content: Text('Are you sure you want to delete lorry ${lorry.registrationNumber}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              // TODO: Implement delete functionality
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Delete functionality coming soon')),
              );
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}

class _AddLorryDialog extends ConsumerStatefulWidget {
  final Function(Lorry) onLorryAdded;

  const _AddLorryDialog({required this.onLorryAdded});

  @override
  ConsumerState<_AddLorryDialog> createState() => _AddLorryDialogState();
}

class _AddLorryDialogState extends ConsumerState<_AddLorryDialog> {
  final _formKey = GlobalKey<FormState>();
  final _registrationController = TextEditingController();
  final _driverNameController = TextEditingController();
  final _driverPhoneController = TextEditingController();
  final _capacityController = TextEditingController();
  final _locationController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _registrationController.dispose();
    _driverNameController.dispose();
    _driverPhoneController.dispose();
    _capacityController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add New Lorry'),
      content: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _registrationController,
                decoration: const InputDecoration(
                  labelText: 'Registration Number',
                  hintText: 'e.g., MH12AB1234',
                ),
                textCapitalization: TextCapitalization.characters,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Registration number is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _driverNameController,
                decoration: const InputDecoration(
                  labelText: 'Driver Name',
                ),
                textCapitalization: TextCapitalization.words,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Driver name is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _driverPhoneController,
                decoration: const InputDecoration(
                  labelText: 'Driver Phone',
                ),
                keyboardType: TextInputType.phone,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Driver phone is required';
                  }
                  if (value.length < 10) {
                    return 'Please enter a valid phone number';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _capacityController,
                decoration: const InputDecoration(
                  labelText: 'Capacity (tons)',
                ),
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Capacity is required';
                  }
                  final capacity = double.tryParse(value);
                  if (capacity == null || capacity <= 0) {
                    return 'Please enter a valid capacity';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _locationController,
                decoration: const InputDecoration(
                  labelText: 'Current Location (optional)',
                ),
                textCapitalization: TextCapitalization.words,
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
          onPressed: _isLoading ? null : _addLorry,
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

  Future<void> _addLorry() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final user = ref.read(currentUserProvider);
      if (user?.organizationId == null) {
        throw Exception('Organization ID not found');
      }

      final result = await ref.read(lorryNotifierProvider(user!.organizationId).notifier).createLorry(
        registrationNumber: _registrationController.text,
        driverName: _driverNameController.text,
        driverPhone: _driverPhoneController.text,
        capacity: double.parse(_capacityController.text),
        currentLocation: _locationController.text.trim().isEmpty ? null : _locationController.text,
      );

      if (result.isSuccess) {
        widget.onLorryAdded(result.data!);
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
            content: Text('Failed to add lorry: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
}