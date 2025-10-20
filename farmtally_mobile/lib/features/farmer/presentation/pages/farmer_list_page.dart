import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/providers/auth_provider.dart';
import '../../../../core/app/app_theme.dart';
import '../../data/repositories/farmer_repository.dart';
import '../../data/models/farmer_model.dart';

class FarmerListPage extends ConsumerStatefulWidget {
  const FarmerListPage({super.key});

  @override
  ConsumerState<FarmerListPage> createState() => _FarmerListPageState();
}

class _FarmerListPageState extends ConsumerState<FarmerListPage> {
  final _searchController = TextEditingController();
  String _searchQuery = '';

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

    final farmersAsync = ref.watch(farmersProvider(user!.organizationId!));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Farmers'),
        actions: [
          if (user.isFarmAdmin || user.isFieldManager)
            IconButton(
              icon: const Icon(Icons.add),
              onPressed: () => _showAddFarmerDialog(context),
            ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.refresh(farmersProvider(user.organizationId!)),
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
                hintText: 'Search farmers by name or phone...',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: (value) {
                setState(() {
                  _searchQuery = value.toLowerCase();
                });
              },
            ),
          ),
          
          // Farmers List
          Expanded(
            child: farmersAsync.when(
              data: (farmers) {
                if (farmers.isEmpty) {
                  return _buildEmptyState(context, user.isFarmAdmin || user.isFieldManager);
                }

                // Filter farmers based on search query
                final filteredFarmers = _searchQuery.isEmpty
                    ? farmers
                    : farmers.where((farmer) =>
                        farmer.name.toLowerCase().contains(_searchQuery) ||
                        farmer.phone.contains(_searchQuery) ||
                        (farmer.idNumber?.toLowerCase().contains(_searchQuery) ?? false)
                      ).toList();

                if (filteredFarmers.isEmpty) {
                  return _buildNoResultsState(context);
                }

                return RefreshIndicator(
                  onRefresh: () async {
                    ref.refresh(farmersProvider(user.organizationId!));
                  },
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: filteredFarmers.length,
                    itemBuilder: (context, index) {
                      final farmer = filteredFarmers[index];
                      return _buildFarmerCard(context, farmer, user.isFarmAdmin || user.isFieldManager, theme);
                    },
                  ),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, stack) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error, size: 64, color: Colors.red),
                    const SizedBox(height: 16),
                    Text(
                      'Error loading farmers',
                      style: theme.textTheme.titleLarge,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      error.toString(),
                      style: theme.textTheme.bodyMedium,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => ref.refresh(farmersProvider(user.organizationId!)),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFarmerCard(BuildContext context, FarmerModel farmer, bool canEdit, ThemeData theme) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => _showFarmerDetails(context, farmer),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  // Farmer Avatar
                  CircleAvatar(
                    backgroundColor: theme.colorScheme.primary.withOpacity(0.1),
                    child: Text(
                      farmer.name.isNotEmpty ? farmer.name[0].toUpperCase() : 'F',
                      style: TextStyle(
                        color: theme.colorScheme.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  
                  const SizedBox(width: 12),
                  
                  // Farmer Info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          farmer.name,
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w600,
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
                  
                  // Actions
                  if (canEdit)
                    PopupMenuButton<String>(
                      onSelected: (value) => _handleFarmerAction(context, farmer, value),
                      itemBuilder: (context) => [
                        const PopupMenuItem(
                          value: 'edit',
                          child: ListTile(
                            leading: Icon(Icons.edit),
                            title: Text('Edit'),
                            contentPadding: EdgeInsets.zero,
                          ),
                        ),
                        const PopupMenuItem(
                          value: 'view_deliveries',
                          child: ListTile(
                            leading: Icon(Icons.history),
                            title: Text('View Deliveries'),
                            contentPadding: EdgeInsets.zero,
                          ),
                        ),
                        if (canEdit)
                          const PopupMenuItem(
                            value: 'remove',
                            child: ListTile(
                              leading: Icon(Icons.remove_circle, color: Colors.red),
                              title: Text('Remove', style: TextStyle(color: Colors.red)),
                              contentPadding: EdgeInsets.zero,
                            ),
                          ),
                      ],
                    ),
                ],
              ),
              
              const SizedBox(height: 12),
              
              // Additional Info
              Row(
                children: [
                  if (farmer.idNumber != null) ...[
                    Icon(
                      Icons.badge,
                      size: 16,
                      color: theme.colorScheme.onSurface.withOpacity(0.6),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'ID: ${farmer.displayId}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.7),
                      ),
                    ),
                    const SizedBox(width: 16),
                  ],
                  
                  Icon(
                    farmer.hasBankDetails ? Icons.account_balance : Icons.account_balance_outlined,
                    size: 16,
                    color: farmer.hasBankDetails 
                        ? Colors.green 
                        : theme.colorScheme.onSurface.withOpacity(0.6),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    farmer.hasBankDetails ? 'Bank details added' : 'No bank details',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: farmer.hasBankDetails 
                          ? Colors.green 
                          : theme.colorScheme.onSurface.withOpacity(0.7),
                    ),
                  ),
                ],
              ),
              
              if (farmer.organizations != null && farmer.organizations!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(
                      Icons.analytics,
                      size: 16,
                      color: theme.colorScheme.onSurface.withOpacity(0.6),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Deliveries: ${farmer.organizations!.first.totalDeliveries}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.7),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Icon(
                      Icons.currency_rupee,
                      size: 16,
                      color: theme.colorScheme.onSurface.withOpacity(0.6),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Earnings: ${farmer.organizations!.first.formattedEarnings}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.7),
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

  Widget _buildEmptyState(BuildContext context, bool canAdd) {
    final theme = Theme.of(context);
    
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.people_outlined,
            size: 64,
            color: theme.colorScheme.onSurface.withOpacity(0.4),
          ),
          const SizedBox(height: 16),
          Text(
            'No farmers found',
            style: theme.textTheme.titleLarge?.copyWith(
              color: theme.colorScheme.onSurface.withOpacity(0.6),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            canAdd 
                ? 'Add your first farmer to get started'
                : 'No farmers available in your organization',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurface.withOpacity(0.5),
            ),
            textAlign: TextAlign.center,
          ),
          if (canAdd) ...[
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => _showAddFarmerDialog(context),
              icon: const Icon(Icons.add),
              label: const Text('Add Farmer'),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildNoResultsState(BuildContext context) {
    final theme = Theme.of(context);
    
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.search_off,
            size: 64,
            color: theme.colorScheme.onSurface.withOpacity(0.4),
          ),
          const SizedBox(height: 16),
          Text(
            'No farmers match your search',
            style: theme.textTheme.titleLarge?.copyWith(
              color: theme.colorScheme.onSurface.withOpacity(0.6),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Try adjusting your search terms',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurface.withOpacity(0.5),
            ),
          ),
        ],
      ),
    );
  }

  void _showAddFarmerDialog(BuildContext context) {
    // TODO: Implement add farmer dialog
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Add farmer functionality coming soon!'),
      ),
    );
  }

  void _showFarmerDetails(BuildContext context, FarmerModel farmer) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => _FarmerDetailsSheet(farmer: farmer),
    );
  }

  void _handleFarmerAction(BuildContext context, FarmerModel farmer, String action) {
    switch (action) {
      case 'edit':
        _showAddFarmerDialog(context); // TODO: Edit dialog
        break;
      case 'view_deliveries':
        // TODO: Navigate to farmer deliveries
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('View deliveries for ${farmer.name}')),
        );
        break;
      case 'remove':
        _showRemoveConfirmation(context, farmer);
        break;
    }
  }

  void _showRemoveConfirmation(BuildContext context, FarmerModel farmer) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Remove Farmer'),
        content: Text('Are you sure you want to remove ${farmer.name} from your organization?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              // TODO: Implement remove farmer
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('${farmer.name} removed from organization')),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Remove'),
          ),
        ],
      ),
    );
  }
}

class _FarmerDetailsSheet extends StatelessWidget {
  final FarmerModel farmer;

  const _FarmerDetailsSheet({required this.farmer});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return DraggableScrollableSheet(
      initialChildSize: 0.7,
      minChildSize: 0.5,
      maxChildSize: 0.9,
      expand: false,
      builder: (context, scrollController) {
        return Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Handle
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              
              const SizedBox(height: 24),
              
              // Header
              Row(
                children: [
                  CircleAvatar(
                    radius: 30,
                    backgroundColor: theme.colorScheme.primary.withOpacity(0.1),
                    child: Text(
                      farmer.name.isNotEmpty ? farmer.name[0].toUpperCase() : 'F',
                      style: TextStyle(
                        color: theme.colorScheme.primary,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          farmer.name,
                          style: theme.textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          farmer.phone,
                          style: theme.textTheme.bodyLarge?.copyWith(
                            color: theme.colorScheme.onSurface.withOpacity(0.7),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 24),
              
              // Details
              Expanded(
                child: ListView(
                  controller: scrollController,
                  children: [
                    _buildDetailSection('Contact Information', [
                      _buildDetailRow(Icons.phone, 'Phone', farmer.phone),
                      if (farmer.email != null)
                        _buildDetailRow(Icons.email, 'Email', farmer.email!),
                      if (farmer.address != null)
                        _buildDetailRow(Icons.location_on, 'Address', farmer.address!),
                    ], theme),
                    
                    if (farmer.idNumber != null) ...[
                      const SizedBox(height: 16),
                      _buildDetailSection('Identification', [
                        _buildDetailRow(Icons.badge, 'ID Number', farmer.idNumber!),
                      ], theme),
                    ],
                    
                    if (farmer.hasBankDetails) ...[
                      const SizedBox(height: 16),
                      _buildDetailSection('Bank Details', [
                        _buildDetailRow(Icons.account_balance, 'Bank Name', farmer.bankName ?? 'N/A'),
                        _buildDetailRow(Icons.credit_card, 'Account Number', 
                            farmer.bankAccountNumber != null 
                                ? '****${farmer.bankAccountNumber!.substring(farmer.bankAccountNumber!.length - 4)}'
                                : 'N/A'),
                        if (farmer.ifscCode != null)
                          _buildDetailRow(Icons.code, 'IFSC Code', farmer.ifscCode!),
                        if (farmer.accountHolderName != null)
                          _buildDetailRow(Icons.person, 'Account Holder', farmer.accountHolderName!),
                      ], theme),
                    ],
                    
                    if (farmer.organizations != null && farmer.organizations!.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      _buildDetailSection('Performance', [
                        _buildDetailRow(Icons.delivery_dining, 'Total Deliveries', 
                            farmer.organizations!.first.totalDeliveries.toString()),
                        _buildDetailRow(Icons.currency_rupee, 'Total Earnings', 
                            farmer.organizations!.first.formattedEarnings),
                        _buildDetailRow(Icons.star, 'Quality Rating', 
                            farmer.organizations!.first.formattedRating),
                      ], theme),
                    ],
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDetailSection(String title, List<Widget> children, ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: theme.colorScheme.primary,
          ),
        ),
        const SizedBox(height: 8),
        ...children,
      ],
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 16, color: Colors.grey[600]),
          const SizedBox(width: 8),
          Text(
            '$label: ',
            style: const TextStyle(fontWeight: FontWeight.w500),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(color: Colors.grey),
            ),
          ),
        ],
      ),
    );
  }
}