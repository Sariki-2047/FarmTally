import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:data_table_2/data_table_2.dart';
import '../providers/admin_providers.dart';
import '../../data/models/field_manager_model.dart';

class FieldManagersPage extends ConsumerStatefulWidget {
  const FieldManagersPage({super.key});

  @override
  ConsumerState<FieldManagersPage> createState() => _FieldManagersPageState();
}

class _FieldManagersPageState extends ConsumerState<FieldManagersPage> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedStatus = 'All';
  int _currentPage = 1;
  static const int _pageSize = 20;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final fieldManagersAsync = ref.watch(fieldManagersProvider);

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(),
          const SizedBox(height: 16),
          _buildControls(),
          const SizedBox(height: 16),
          Expanded(
            child: fieldManagersAsync.when(
              data: (fieldManagers) => _buildDataTable(context, fieldManagers),
              loading: () => _buildShimmerLoading(),
              error: (error, stackTrace) => _buildErrorState(error.toString()),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        Text(
          'Field Managers',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const Spacer(),
        _buildStatusCounts(),
      ],
    );
  }

  Widget _buildStatusCounts() {
    final fieldManagersAsync = ref.watch(fieldManagersProvider);
    
    return fieldManagersAsync.maybeWhen(
      data: (fieldManagers) {
        final activeCount = fieldManagers.where((fm) => fm.status == FieldManagerStatus.active).length;
        final invitedCount = fieldManagers.where((fm) => fm.status == FieldManagerStatus.invited).length;
        final inactiveCount = fieldManagers.where((fm) => fm.status == FieldManagerStatus.inactive).length;
        
        return Row(
          children: [
            _buildCountChip('Active', activeCount, Colors.green),
            const SizedBox(width: 8),
            _buildCountChip('Invited', invitedCount, Colors.orange),
            const SizedBox(width: 8),
            _buildCountChip('Inactive', inactiveCount, Colors.grey),
          ],
        );
      },
      orElse: () => const SizedBox.shrink(),
    );
  }

  Widget _buildCountChip(String label, int count, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        '$label: $count',
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.w500,
          fontSize: 12,
        ),
      ),
    );
  }

  Widget _buildControls() {
    return Row(
      children: [
        // Search Input
        Expanded(
          flex: 2,
          child: TextField(
            controller: _searchController,
            decoration: const InputDecoration(
              hintText: 'Search field managers...',
              prefixIcon: Icon(Icons.search),
              border: OutlineInputBorder(),
              contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            ),
            onChanged: (value) {
              // TODO: Implement search with debouncing
              setState(() {});
            },
          ),
        ),
        const SizedBox(width: 16),
        
        // Status Filter Chips
        _buildStatusFilter(),
        
        const Spacer(),
        
        // Action Buttons
        OutlinedButton.icon(
          onPressed: _exportCSV,
          icon: const Icon(Icons.download),
          label: const Text('Export CSV'),
        ),
        const SizedBox(width: 12),
        ElevatedButton.icon(
          onPressed: _showInviteDialog,
          icon: const Icon(Icons.person_add),
          label: const Text('Invite Field Manager'),
        ),
      ],
    );
  }

  Widget _buildStatusFilter() {
    const statuses = ['All', 'Active', 'Invited', 'Inactive'];
    
    return Row(
      children: statuses.map((status) {
        final isSelected = _selectedStatus == status;
        return Padding(
          padding: const EdgeInsets.only(right: 8),
          child: FilterChip(
            label: Text(status),
            selected: isSelected,
            onSelected: (selected) {
              setState(() {
                _selectedStatus = status;
                _currentPage = 1; // Reset to first page
              });
              // TODO: Implement server-side filtering
            },
            selectedColor: Theme.of(context).colorScheme.primary.withOpacity(0.2),
            checkmarkColor: Theme.of(context).colorScheme.primary,
          ),
        );
      }).toList(),
    );
  }

  Widget _buildDataTable(BuildContext context, List<FieldManager> fieldManagers) {
    // Apply filters
    var filteredManagers = fieldManagers.where((fm) {
      // Search filter
      final searchTerm = _searchController.text.toLowerCase();
      final matchesSearch = searchTerm.isEmpty ||
          fm.name.toLowerCase().contains(searchTerm) ||
          fm.email.toLowerCase().contains(searchTerm) ||
          fm.phone.contains(searchTerm);

      // Status filter
      final matchesStatus = _selectedStatus == 'All' ||
          fm.status.name.toLowerCase() == _selectedStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    }).toList();

    if (filteredManagers.isEmpty) {
      return _buildEmptyState();
    }

    return Column(
      children: [
        Expanded(
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(8),
              child: DataTable2(
                columnSpacing: 12,
                horizontalMargin: 12,
                minWidth: 1000,
                sortColumnIndex: null,
                sortAscending: true,
                columns: [
                  DataColumn2(
                    label: const Text('Name'),
                    size: ColumnSize.M,
                    fixedWidth: 200, // min 200px as specified
                  ),
                  const DataColumn2(
                    label: Text('Phone'),
                    size: ColumnSize.M,
                  ),
                  const DataColumn2(
                    label: Text('Email'),
                    size: ColumnSize.L,
                  ),
                  const DataColumn2(
                    label: Text('Aadhaar'),
                    size: ColumnSize.M,
                  ),
                  const DataColumn2(
                    label: Text('Status'),
                    size: ColumnSize.S,
                  ),
                  const DataColumn2(
                    label: Text('Active Lorries'),
                    size: ColumnSize.S,
                    numeric: true,
                  ),
                  const DataColumn2(
                    label: Text('Total Deliveries'),
                    size: ColumnSize.S,
                    numeric: true,
                  ),
                  const DataColumn2(
                    label: Text('Created'),
                    size: ColumnSize.M,
                  ),
                  const DataColumn2(
                    label: Text('Actions'),
                    size: ColumnSize.M,
                  ),
                ],
                rows: filteredManagers.map((fm) {
                  return DataRow2(
                    cells: [
                      // name
                      DataCell(
                        Text(
                          fm.name,
                          style: const TextStyle(fontWeight: FontWeight.w500),
                        ),
                      ),
                      // phone
                      DataCell(
                        GestureDetector(
                          onTap: () => _makePhoneCall(fm.phone),
                          child: Text(
                            fm.phone,
                            style: const TextStyle(
                              color: Colors.blue,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ),
                      ),
                      // email
                      DataCell(Text(fm.email)),
                      // aadhaarMasked
                      DataCell(Text(fm.maskedAadhaar)),
                      // status
                      DataCell(_buildStatusBadge(fm.status)),
                      // activeLorries
                      DataCell(
                        Container(
                          alignment: Alignment.centerRight,
                          child: Text(
                            '${fm.activeLorries}',
                            style: TextStyle(
                              fontWeight: FontWeight.w500,
                              color: fm.activeLorries > 0 ? Colors.green : Colors.grey,
                            ),
                          ),
                        ),
                      ),
                      // totalDeliveries
                      DataCell(
                        Container(
                          alignment: Alignment.centerRight,
                          child: Text(
                            '${fm.totalDeliveries}',
                            style: const TextStyle(fontWeight: FontWeight.w500),
                          ),
                        ),
                      ),
                      // createdAt
                      DataCell(Text(_formatDateDDMMMYYYY(fm.createdAt))),
                      // Actions
                      DataCell(
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (fm.status != FieldManagerStatus.invited)
                              IconButton(
                                icon: Icon(
                                  fm.status == FieldManagerStatus.active ? Icons.block : Icons.check_circle,
                                  size: 18,
                                  color: fm.status == FieldManagerStatus.active ? Colors.red : Colors.green,
                                ),
                                tooltip: fm.status == FieldManagerStatus.active ? 'Deactivate' : 'Activate',
                                onPressed: () => _toggleActiveStatus(context, fm),
                              ),
                            IconButton(
                              icon: const Icon(Icons.more_vert, size: 18),
                              tooltip: 'More actions',
                              onPressed: () => _showMoreActions(context, fm),
                            ),
                          ],
                        ),
                      ),
                    ],
                  );
                }).toList(),
              ),
            ),
          ),
        ),
        _buildPagination(filteredManagers.length),
      ],
    );
  }

  Widget _buildStatusBadge(FieldManagerStatus status) {
    Color color;
    String label;
    
    switch (status) {
      case FieldManagerStatus.active:
        color = Colors.green;
        label = 'Active';
        break;
      case FieldManagerStatus.invited:
        color = Colors.orange;
        label = 'Invited';
        break;
      case FieldManagerStatus.inactive:
        color = Colors.grey;
        label = 'Inactive';
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
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.w500,
          fontSize: 12,
        ),
      ),
    );
  }

  Widget _buildPagination(int totalItems) {
    final totalPages = (totalItems / _pageSize).ceil();
    
    if (totalPages <= 1) return const SizedBox.shrink();
    
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          IconButton(
            onPressed: _currentPage > 1 ? () => _changePage(_currentPage - 1) : null,
            icon: const Icon(Icons.chevron_left),
          ),
          Text(
            'Page $_currentPage of $totalPages',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          IconButton(
            onPressed: _currentPage < totalPages ? () => _changePage(_currentPage + 1) : null,
            icon: const Icon(Icons.chevron_right),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.badge_outlined,
            size: 64,
            color: Theme.of(context).colorScheme.outline,
          ),
          const SizedBox(height: 16),
          Text(
            'No Field Managers Found',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          Text(
            _searchController.text.isNotEmpty || _selectedStatus != 'All'
                ? 'Try adjusting your search or filters'
                : 'Get started by inviting your first field manager',
            style: Theme.of(context).textTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _showInviteDialog,
            icon: const Icon(Icons.person_add),
            label: const Text('Invite Field Manager'),
          ),
        ],
      ),
    );
  }

  Widget _buildShimmerLoading() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(8),
        child: Column(
          children: List.generate(5, (index) => 
            Container(
              height: 56,
              margin: const EdgeInsets.only(bottom: 8),
              decoration: BoxDecoration(
                color: Colors.grey.withOpacity(0.1),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildErrorState(String error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline,
            size: 64,
            color: Theme.of(context).colorScheme.error,
          ),
          const SizedBox(height: 16),
          Text(
            'Failed to load field managers',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          Text(
            error,
            style: Theme.of(context).textTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () => ref.refresh(fieldManagersProvider),
            icon: const Icon(Icons.refresh),
            label: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  void _changePage(int page) {
    setState(() {
      _currentPage = page;
    });
    // TODO: Implement server-side pagination
  }

  void _makePhoneCall(String phone) {
    // TODO: Implement phone call functionality
    debugPrint('Calling $phone');
  }

  void _exportCSV() {
    // TODO: Implement CSV export
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('CSV export functionality will be implemented soon'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  void _showInviteDialog() {
    showDialog(
      context: context,
      builder: (context) => _InviteFieldManagerDialog(
        onInvite: _handleInvite,
      ),
    );
  }

  void _showMoreActions(BuildContext context, FieldManager fm) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            leading: const Icon(Icons.edit),
            title: const Text('Edit Details'),
            onTap: () {
              Navigator.pop(context);
              _showEditDialog(context, fm);
            },
          ),
          if (fm.status == FieldManagerStatus.invited)
            ListTile(
              leading: const Icon(Icons.send),
              title: const Text('Resend Invitation'),
              onTap: () {
                Navigator.pop(context);
                _resendInvitation(fm);
              },
            ),
          ListTile(
            leading: Icon(
              fm.status == FieldManagerStatus.active ? Icons.block : Icons.check_circle,
              color: fm.status == FieldManagerStatus.active ? Colors.red : Colors.green,
            ),
            title: Text(fm.status == FieldManagerStatus.active ? 'Deactivate' : 'Activate'),
            onTap: () {
              Navigator.pop(context);
              _toggleActiveStatus(context, fm);
            },
          ),
        ],
      ),
    );
  }

  void _showEditDialog(BuildContext context, FieldManager fm) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Field Manager'),
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

  void _toggleActiveStatus(BuildContext context, FieldManager fm) {
    final isActivating = fm.status != FieldManagerStatus.active;
    final action = isActivating ? 'activate' : 'deactivate';
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('${action.toUpperCase()} Field Manager'),
        content: Text('Are you sure you want to $action ${fm.name}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              // TODO: Call API to update status
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('${fm.name} ${action}d successfully')),
              );
              // Refresh the list
              ref.refresh(fieldManagersProvider);
            },
            child: Text(action.toUpperCase()),
          ),
        ],
      ),
    );
  }

  void _resendInvitation(FieldManager fm) {
    // TODO: Call API to resend invitation
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Invitation resent to ${fm.name}')),
    );
  }

  void _handleInvite(Map<String, String> data) async {
    print('🔄 Starting invite process for: ${data['name']}');
    
    try {
      // Send invitation via repository
      final repository = ref.read(adminRepositoryProvider);
      final fieldManager = await repository.addFieldManager(
        name: data['name']!,
        email: data['email']!,
        phone: data['phone']!,
        aadhaar: data['aadhaar'] ?? '',
      );
      
      print('✅ Field manager invitation sent successfully');
      
      // Force refresh the provider
      ref.invalidate(fieldManagersProvider);
      
      print('✅ Provider invalidated, waiting for rebuild...');
      
      // Show detailed success message
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('✅ Invitation sent to ${fieldManager.name}'),
                const SizedBox(height: 4),
                Text(
                  '📧 Email: ${fieldManager.email} | 📱 SMS: ${fieldManager.phone}',
                  style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.9)),
                ),
              ],
            ),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 5),
            action: SnackBarAction(
              label: 'View Invited',
              textColor: Colors.white,
              onPressed: () {
                setState(() {
                  _selectedStatus = 'Invited';
                });
              },
            ),
          ),
        );
      }
      
    } catch (error) {
      print('❌ Error in invite process: $error');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('❌ Failed to send invitation: $error'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    }
  }

  String _formatDateDDMMMYYYY(DateTime date) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    return '${date.day.toString().padLeft(2, '0')} ${months[date.month - 1]} ${date.year}';
  }
}

class _InviteFieldManagerDialog extends StatefulWidget {
  final Function(Map<String, String>) onInvite;

  const _InviteFieldManagerDialog({required this.onInvite});

  @override
  State<_InviteFieldManagerDialog> createState() => _InviteFieldManagerDialogState();
}

class _InviteFieldManagerDialogState extends State<_InviteFieldManagerDialog> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _aadhaarController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _aadhaarController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Invite Field Manager'),
      content: SizedBox(
        width: 400,
        child: Form(
          key: _formKey,
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
                  if (value == null || value.trim().isEmpty) {
                    return 'Name is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _emailController,
                decoration: const InputDecoration(
                  labelText: 'Email Address *',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.emailAddress,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Email is required';
                  }
                  if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
                    return 'Enter a valid email address';
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
                  prefixText: '+91 ',
                  hintText: '9876543210',
                ),
                keyboardType: TextInputType.phone,
                onChanged: (value) {
                  // Auto-format phone number
                  if (value.length == 10 && !value.contains(' ')) {
                    _phoneController.text = '${value.substring(0, 5)} ${value.substring(5)}';
                    _phoneController.selection = TextSelection.fromPosition(
                      TextPosition(offset: _phoneController.text.length),
                    );
                  }
                },
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Phone number is required';
                  }
                  final cleaned = value.replaceAll(' ', '');
                  if (!RegExp(r'^[6-9]\d{9}$').hasMatch(cleaned)) {
                    return 'Enter a valid 10-digit phone number starting with 6-9';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _aadhaarController,
                decoration: const InputDecoration(
                  labelText: 'Aadhaar Number (Optional)',
                  border: OutlineInputBorder(),
                  hintText: '1234 5678 9012',
                ),
                keyboardType: TextInputType.number,
                onChanged: (value) {
                  // Auto-format Aadhaar number
                  final cleaned = value.replaceAll(RegExp(r'[^0-9]'), '');
                  if (cleaned.length <= 12) {
                    String formatted = '';
                    for (int i = 0; i < cleaned.length; i++) {
                      if (i > 0 && i % 4 == 0) {
                        formatted += ' ';
                      }
                      formatted += cleaned[i];
                    }
                    if (formatted != value) {
                      _aadhaarController.text = formatted;
                      _aadhaarController.selection = TextSelection.fromPosition(
                        TextPosition(offset: formatted.length),
                      );
                    }
                  }
                },
                validator: (value) {
                  if (value != null && value.trim().isNotEmpty) {
                    final cleaned = value.replaceAll(RegExp(r'[^0-9]'), '');
                    if (cleaned.length != 12) {
                      return 'Aadhaar must be 12 digits';
                    }
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.blue.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.info_outline, color: Colors.blue, size: 20),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'An invitation will be sent via email and SMS with login credentials.',
                        style: TextStyle(fontSize: 12, color: Colors.blue),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: _isLoading ? null : () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _isLoading ? null : _sendInvitation,
          child: _isLoading
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Text('Send Invitation'),
        ),
      ],
    );
  }

  void _sendInvitation() async {
    print('🔄 Send invitation button clicked');
    
    if (!_formKey.currentState!.validate()) {
      print('❌ Form validation failed');
      return;
    }

    print('✅ Form validation passed');

    setState(() {
      _isLoading = true;
    });

    try {
      // Simulate API call
      await Future.delayed(const Duration(seconds: 1));

      final data = {
        'name': _nameController.text.trim(),
        'email': _emailController.text.trim(),
        'phone': _phoneController.text.trim().replaceAll(' ', ''),
        'aadhaar': _aadhaarController.text.trim().replaceAll(' ', ''),
      };

      print('📝 Form data prepared: $data');

      widget.onInvite(data);
      
      if (mounted) {
        Navigator.pop(context);
      }
    } catch (error) {
      print('❌ Error in _sendInvitation: $error');
      setState(() {
        _isLoading = false;
      });
    }
  }
}

