import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:data_table_2/data_table_2.dart';
import '../widgets/ft_content_scaffold.dart';
import '../providers/fm_simple_providers.dart';
import '../widgets/status_filter_chips.dart';
import '../../data/models/fm_trip_model.dart';

class FmMyLorriesPage extends ConsumerStatefulWidget {
  const FmMyLorriesPage({super.key});

  @override
  ConsumerState<FmMyLorriesPage> createState() => _FmMyLorriesPageState();
}

class _FmMyLorriesPageState extends ConsumerState<FmMyLorriesPage> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(fmTripsControllerProvider.notifier).load();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(fmTripsControllerProvider);
    
    return FtContentScaffold(
      title: 'My Lorries',
      actions: [
        ElevatedButton.icon(
          onPressed: () => context.go('/app/fm/lorry-requests/new'),
          icon: const Icon(Icons.add, color: Colors.white),
          label: const Text('Request Lorry', style: TextStyle(color: Colors.white)),
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
              hintText: 'Search by lorry # or route',
              border: OutlineInputBorder(),
              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            ),
            onSubmitted: (value) {
              ref.read(fmTripsControllerProvider.notifier).setSearchQuery(value.isEmpty ? null : value);
            },
          ),
        ),
        const SizedBox(width: 8),
        OutlinedButton.icon(
          onPressed: () => ref.read(fmTripsControllerProvider.notifier).refresh(),
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
              ref.read(fmTripsControllerProvider.notifier).setStatusFilter(status);
            },
            statuses: const [
              StatusFilter('All', null),
              StatusFilter('Active', 'active'),
              StatusFilter('Submitted', 'submitted'),
              StatusFilter('Approved', 'approved'),
              StatusFilter('Rejected', 'rejected'),
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
              onPage: (page) => ref.read(fmTripsControllerProvider.notifier).loadPage(page),
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
            'Failed to load trips',
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
            onPressed: () => ref.read(fmTripsControllerProvider.notifier).refresh(),
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _buildDataGrid(List<FmTrip> trips) {
    if (trips.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.local_shipping_outlined, size: 48, color: Color(0xFF9E9E9E)),
            const SizedBox(height: 16),
            Text(
              'No lorries found',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: const Color(0xFF9E9E9E),
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Request a lorry to get started',
              style: TextStyle(color: Color(0xFF9E9E9E)),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () => context.go('/app/fm/lorry-requests/new'),
              icon: const Icon(Icons.add),
              label: const Text('Request Lorry'),
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
      rows: _buildRows(trips),
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
        label: Text('Trip ID'),
        size: ColumnSize.S,
      ),
      const DataColumn2(
        label: Text('Lorry #'),
        size: ColumnSize.S,
      ),
      const DataColumn2(
        label: Text('Route'),
        size: ColumnSize.M,
      ),
      const DataColumn2(
        label: Text('Scheduled'),
        size: ColumnSize.S,
      ),
      const DataColumn2(
        label: Text('Status'),
        size: ColumnSize.S,
      ),
      const DataColumn2(
        label: Text('Farmers'),
        size: ColumnSize.S,
        numeric: true,
      ),
      const DataColumn2(
        label: Text('Bags'),
        size: ColumnSize.S,
        numeric: true,
      ),
      const DataColumn2(
        label: Text('Weight (kg)'),
        size: ColumnSize.S,
        numeric: true,
      ),
      const DataColumn2(
        label: Text('Actions'),
        size: ColumnSize.S,
      ),
    ];
  }

  List<DataRow2> _buildRows(List<FmTrip> trips) {
    return trips.map((trip) {
      return DataRow2(
        onTap: () => context.go('/app/fm/my-lorries/${trip.id}'),
        cells: [
          DataCell(Text(trip.id.substring(0, 8))),
          DataCell(Text(trip.lorryNumber)),
          DataCell(Text(trip.route)),
          DataCell(Text(_formatDate(trip.scheduledAt))),
          DataCell(_buildStatusChip(trip.status)),
          DataCell(Text('${trip.farmerCount}')),
          DataCell(Text('${trip.totalBags}')),
          DataCell(Text('${trip.grossKg.toStringAsFixed(2)}')),
          DataCell(_buildActionButtons(trip)),
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

  Widget _buildActionButtons(FmTrip trip) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        IconButton(
          icon: const Icon(Icons.visibility, size: 18),
          onPressed: () => context.go('/app/fm/my-lorries/${trip.id}'),
          tooltip: 'View Details',
        ),
        if (trip.status == 'active')
          IconButton(
            icon: const Icon(Icons.send, size: 18, color: Color(0xFF2E7D32)),
            onPressed: () => _submitTrip(trip.id),
            tooltip: 'Submit Trip',
          ),
      ],
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'active':
        return const Color(0xFF2E7D32);
      case 'submitted':
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

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  void _submitTrip(String tripId) {
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
              ref.read(fmTripsControllerProvider.notifier).submitTrip(tripId);
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2E7D32)),
            child: const Text('Submit', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}