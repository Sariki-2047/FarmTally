import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:data_table_2/data_table_2.dart';
import '../widgets/ft_content_scaffold.dart';
import '../providers/fm_simple_providers.dart';
import '../widgets/status_filter_chips.dart';
import '../../data/models/fm_trip_model.dart';

class FmLorryRequestsPage extends ConsumerStatefulWidget {
  const FmLorryRequestsPage({super.key});

  @override
  ConsumerState<FmLorryRequestsPage> createState() => _FmLorryRequestsPageState();
}

class _FmLorryRequestsPageState extends ConsumerState<FmLorryRequestsPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(fmLorryRequestsControllerProvider.notifier).load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(fmLorryRequestsControllerProvider);
    
    return FtContentScaffold(
      title: 'Lorry Requests',
      actions: [
        ElevatedButton.icon(
          onPressed: () => _showNewRequestDialog(),
          icon: const Icon(Icons.add, color: Colors.white),
          label: const Text('New Request', style: TextStyle(color: Colors.white)),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF2E7D32),
          ),
        ),
        const SizedBox(width: 8),
        OutlinedButton.icon(
          onPressed: () => ref.read(fmLorryRequestsControllerProvider.notifier).refresh(),
          icon: const Icon(Icons.refresh),
          label: const Text('Refresh'),
        ),
      ],
      child: Column(
        children: [
          // Status filter chips
          StatusFilterChips(
            selectedStatus: state.statusFilter,
            onStatusChanged: (status) {
              ref.read(fmLorryRequestsControllerProvider.notifier).setStatusFilter(status);
            },
            statuses: const [
              StatusFilter('All', null),
              StatusFilter('Pending', 'pending'),
              StatusFilter('Approved', 'approved'),
              StatusFilter('Rejected', 'rejected'),
              StatusFilter('Completed', 'completed'),
            ],
          ),
          const SizedBox(height: 16),
          
          // Data grid
          Expanded(
            child: state.loading
                ? const Center(child: CircularProgressIndicator())
                : state.error != null
                    ? _buildErrorWidget(state.error!)
                    : _buildDataGrid(state.items),
          ),
        ],
      ),
      footer: state.items.isNotEmpty
          ? FtPagination(
              total: state.total,
              page: state.page,
              limit: state.limit,
              onPage: (page) => ref.read(fmLorryRequestsControllerProvider.notifier).loadPage(page),
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
            'Failed to load requests',
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
            onPressed: () => ref.read(fmLorryRequestsControllerProvider.notifier).refresh(),
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _buildDataGrid(List<LorryRequest> requests) {
    if (requests.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.assignment_outlined, size: 48, color: Color(0xFF9E9E9E)),
            const SizedBox(height: 16),
            Text(
              'No lorry requests found',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: const Color(0xFF9E9E9E),
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Create a new request to get started',
              style: TextStyle(color: Color(0xFF9E9E9E)),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () => _showNewRequestDialog(),
              icon: const Icon(Icons.add),
              label: const Text('New Request'),
            ),
          ],
        ),
      );
    }

    return DataTable2(
      columnSpacing: 12,
      horizontalMargin: 12,
      minWidth: 900,
      columns: _buildColumns(),
      rows: _buildRows(requests),
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
        label: Text('Request ID'),
        size: ColumnSize.S,
      ),
      const DataColumn2(
        label: Text('Location'),
        size: ColumnSize.M,
      ),
      const DataColumn2(
        label: Text('Purpose'),
        size: ColumnSize.M,
      ),
      const DataColumn2(
        label: Text('Requested'),
        size: ColumnSize.S,
      ),
      const DataColumn2(
        label: Text('Urgency'),
        size: ColumnSize.S,
      ),
      const DataColumn2(
        label: Text('Est. Farmers'),
        size: ColumnSize.S,
        numeric: true,
      ),
      const DataColumn2(
        label: Text('Est. Weight (kg)'),
        size: ColumnSize.S,
        numeric: true,
      ),
      const DataColumn2(
        label: Text('Status'),
        size: ColumnSize.S,
      ),
      const DataColumn2(
        label: Text('Assigned Lorry'),
        size: ColumnSize.S,
      ),
    ];
  }

  List<DataRow2> _buildRows(List<LorryRequest> requests) {
    return requests.map((request) {
      return DataRow2(
        cells: [
          DataCell(Text(request.id.substring(0, 8))),
          DataCell(Text(request.location)),
          DataCell(Text(request.purpose)),
          DataCell(Text(_formatDate(request.requestedAt))),
          DataCell(_buildUrgencyChip(request.urgency)),
          DataCell(Text('${request.estFarmers}')),
          DataCell(Text('${request.estWeightKg.toStringAsFixed(0)}')),
          DataCell(_buildStatusChip(request.status)),
          DataCell(Text(request.assignedLorryNumber ?? '-')),
        ],
      );
    }).toList();
  }

  Widget _buildStatusChip(String status) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: _getStatusColor(status).withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(
          color: _getStatusColor(status),
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildUrgencyChip(String urgency) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: _getUrgencyColor(urgency).withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        urgency.toUpperCase(),
        style: TextStyle(
          color: _getUrgencyColor(urgency),
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return const Color(0xFFFFB300);
      case 'approved':
        return const Color(0xFF4CAF50);
      case 'rejected':
        return const Color(0xFFD32F2F);
      case 'completed':
        return const Color(0xFF9E9E9E);
      default:
        return const Color(0xFF424242);
    }
  }

  Color _getUrgencyColor(String urgency) {
    switch (urgency.toLowerCase()) {
      case 'low':
        return const Color(0xFF4CAF50);
      case 'medium':
        return const Color(0xFFFFB300);
      case 'high':
        return const Color(0xFFFF9800);
      case 'urgent':
        return const Color(0xFFD32F2F);
      default:
        return const Color(0xFF424242);
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  void _showNewRequestDialog() {
    showDialog(
      context: context,
      builder: (context) => const NewLorryRequestDialog(),
    );
  }
}

class NewLorryRequestDialog extends ConsumerStatefulWidget {
  const NewLorryRequestDialog({super.key});

  @override
  ConsumerState<NewLorryRequestDialog> createState() => _NewLorryRequestDialogState();
}

class _NewLorryRequestDialogState extends ConsumerState<NewLorryRequestDialog> {
  final _formKey = GlobalKey<FormState>();
  final _locationController = TextEditingController();
  final _purposeController = TextEditingController();
  final _estFarmersController = TextEditingController();
  final _estWeightController = TextEditingController();
  
  String _urgency = 'medium';
  bool _isSubmitting = false;

  @override
  void dispose() {
    _locationController.dispose();
    _purposeController.dispose();
    _estFarmersController.dispose();
    _estWeightController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('New Lorry Request'),
      content: SizedBox(
        width: 400,
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _locationController,
                decoration: const InputDecoration(
                  labelText: 'Location',
                  hintText: 'Enter pickup location',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter location';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _purposeController,
                decoration: const InputDecoration(
                  labelText: 'Purpose',
                  hintText: 'Enter purpose of request',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter purpose';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _estFarmersController,
                      decoration: const InputDecoration(
                        labelText: 'Est. Farmers',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Required';
                        }
                        if (int.tryParse(value) == null) {
                          return 'Invalid number';
                        }
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _estWeightController,
                      decoration: const InputDecoration(
                        labelText: 'Est. Weight (kg)',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Required';
                        }
                        if (double.tryParse(value) == null) {
                          return 'Invalid number';
                        }
                        return null;
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _urgency,
                decoration: const InputDecoration(
                  labelText: 'Urgency',
                  border: OutlineInputBorder(),
                ),
                items: const [
                  DropdownMenuItem(value: 'low', child: Text('Low')),
                  DropdownMenuItem(value: 'medium', child: Text('Medium')),
                  DropdownMenuItem(value: 'high', child: Text('High')),
                  DropdownMenuItem(value: 'urgent', child: Text('Urgent')),
                ],
                onChanged: (value) {
                  if (value != null) {
                    setState(() {
                      _urgency = value;
                    });
                  }
                },
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: _isSubmitting ? null : () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _isSubmitting ? null : _submitRequest,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF2E7D32),
          ),
          child: _isSubmitting
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                )
              : const Text('Submit Request', style: TextStyle(color: Colors.white)),
        ),
      ],
    );
  }

  Future<void> _submitRequest() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isSubmitting = true;
    });

    try {
      final request = LorryRequest(
        id: '', // Will be generated by backend
        businessId: '', // Will be set by backend
        fieldManagerId: '', // Will be set by backend
        location: _locationController.text,
        requestedAt: DateTime.now(),
        purpose: _purposeController.text,
        estFarmers: int.parse(_estFarmersController.text),
        estWeightKg: double.parse(_estWeightController.text),
        urgency: _urgency,
      );

      await ref.read(fmLorryRequestsControllerProvider.notifier).createRequest(request);
      
      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Lorry request submitted successfully'),
            backgroundColor: Color(0xFF4CAF50),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to submit request: $e'),
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