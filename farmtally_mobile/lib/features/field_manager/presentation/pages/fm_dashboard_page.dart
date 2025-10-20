import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../widgets/ft_content_scaffold.dart';
import '../providers/fm_simple_providers.dart';

class FmDashboardPage extends ConsumerStatefulWidget {
  const FmDashboardPage({super.key});

  @override
  ConsumerState<FmDashboardPage> createState() => _FmDashboardPageState();
}

class _FmDashboardPageState extends ConsumerState<FmDashboardPage> {
  @override
  void initState() {
    super.initState();
    // Load dashboard data on init
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.invalidate(fmDashboardStatsProvider);
    });
  }

  @override
  Widget build(BuildContext context) {
    final statsAsync = ref.watch(fmDashboardStatsProvider);
    
    return FtContentScaffold(
      title: 'Dashboard',
      actions: [
        OutlinedButton.icon(
          onPressed: () => ref.invalidate(fmDashboardStatsProvider),
          icon: const Icon(Icons.refresh),
          label: const Text('Refresh'),
        ),
      ],
      child: statsAsync.when(
        data: (stats) => _buildDashboardContent(context, stats),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Color(0xFFD32F2F)),
              const SizedBox(height: 16),
              Text(
                'Failed to load dashboard',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              Text(
                error.toString(),
                style: const TextStyle(color: Color(0xFF9E9E9E)),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.invalidate(fmDashboardStatsProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDashboardContent(BuildContext context, Map<String, dynamic> stats) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // KPI Cards
          _buildKpiSection(context, stats),
          const SizedBox(height: 24),
          
          // Quick Actions
          _buildQuickActionsSection(context),
          const SizedBox(height: 24),
          
          // Recent Activity
          _buildRecentActivitySection(context, stats),
        ],
      ),
    );
  }

  Widget _buildKpiSection(BuildContext context, Map<String, dynamic> stats) {
    final isWide = MediaQuery.of(context).size.width >= 600;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Today\'s Overview',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
            color: const Color(0xFF424242),
          ),
        ),
        const SizedBox(height: 12),
        isWide ? _buildKpiGrid(stats) : _buildKpiColumn(stats),
      ],
    );
  }

  Widget _buildKpiGrid(Map<String, dynamic> stats) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 4,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.2,
      children: [
        _buildKpiCard(
          'Assigned Lorries',
          '${stats['assignedLorries'] ?? 0}',
          Icons.local_shipping,
          const Color(0xFF2E7D32),
        ),
        _buildKpiCard(
          'Pending Deliveries',
          '${stats['pendingDeliveries'] ?? 0}',
          Icons.pending_actions,
          const Color(0xFFFFB300),
        ),
        _buildKpiCard(
          'Total Bags Today',
          '${stats['totalBagsToday'] ?? 0}',
          Icons.inventory,
          const Color(0xFF4CAF50),
        ),
        _buildKpiCard(
          'Sync Status',
          stats['syncStatus'] ?? 'Synced',
          Icons.sync,
          const Color(0xFF2E7D32),
        ),
      ],
    );
  }

  Widget _buildKpiColumn(Map<String, dynamic> stats) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildKpiCard(
                'Assigned Lorries',
                '${stats['assignedLorries'] ?? 0}',
                Icons.local_shipping,
                const Color(0xFF2E7D32),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildKpiCard(
                'Pending Deliveries',
                '${stats['pendingDeliveries'] ?? 0}',
                Icons.pending_actions,
                const Color(0xFFFFB300),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildKpiCard(
                'Total Bags Today',
                '${stats['totalBagsToday'] ?? 0}',
                Icons.inventory,
                const Color(0xFF4CAF50),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildKpiCard(
                'Sync Status',
                stats['syncStatus'] ?? 'Synced',
                Icons.sync,
                const Color(0xFF2E7D32),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildKpiCard(String title, String value, IconData icon, Color color) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFF9E9E9E),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActionsSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Quick Actions',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
            color: const Color(0xFF424242),
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            _buildActionButton(
              'Request Lorry',
              Icons.add_circle_outline,
              const Color(0xFF2E7D32),
              () => context.go('/app/fm/lorry-requests/new'),
            ),
            _buildActionButton(
              'Record Delivery',
              Icons.edit_note,
              const Color(0xFF4CAF50),
              () => context.go('/app/fm/my-lorries'),
            ),
            _buildActionButton(
              'Add Farmer',
              Icons.person_add,
              const Color(0xFFFFB300),
              () => context.go('/app/fm/farmers/new'),
            ),
            _buildActionButton(
              'View Reports',
              Icons.insights,
              const Color(0xFF9C27B0),
              () => context.go('/app/fm/reports'),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActionButton(String label, IconData icon, Color color, VoidCallback onPressed) {
    return ElevatedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon, color: Colors.white),
      label: Text(label, style: const TextStyle(color: Colors.white)),
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  Widget _buildRecentActivitySection(BuildContext context, Map<String, dynamic> stats) {
    final activities = stats['recentActivities'] as List<dynamic>? ?? [];
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Recent Activity',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
            color: const Color(0xFF424242),
          ),
        ),
        const SizedBox(height: 12),
        Card(
          elevation: 1,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          child: activities.isEmpty
              ? const Padding(
                  padding: EdgeInsets.all(32),
                  child: Center(
                    child: Column(
                      children: [
                        Icon(Icons.history, size: 48, color: Color(0xFF9E9E9E)),
                        SizedBox(height: 8),
                        Text(
                          'No recent activity',
                          style: TextStyle(color: Color(0xFF9E9E9E)),
                        ),
                      ],
                    ),
                  ),
                )
              : ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: activities.length.clamp(0, 5),
                  separatorBuilder: (context, index) => const Divider(height: 1),
                  itemBuilder: (context, index) {
                    final activity = activities[index];
                    return ListTile(
                      leading: CircleAvatar(
                        backgroundColor: const Color(0xFFE8F5E9),
                        child: Icon(
                          _getActivityIcon(activity['type']),
                          color: const Color(0xFF2E7D32),
                          size: 20,
                        ),
                      ),
                      title: Text(activity['title'] ?? ''),
                      subtitle: Text(activity['description'] ?? ''),
                      trailing: Text(
                        _formatTime(activity['timestamp']),
                        style: const TextStyle(
                          color: Color(0xFF9E9E9E),
                          fontSize: 12,
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }

  IconData _getActivityIcon(String? type) {
    switch (type) {
      case 'delivery':
        return Icons.local_shipping;
      case 'request':
        return Icons.assignment;
      case 'farmer':
        return Icons.agriculture;
      default:
        return Icons.info_outline;
    }
  }

  String _formatTime(dynamic timestamp) {
    if (timestamp == null) return '';
    try {
      final dateTime = DateTime.parse(timestamp.toString());
      final now = DateTime.now();
      final difference = now.difference(dateTime);
      
      if (difference.inMinutes < 60) {
        return '${difference.inMinutes}m ago';
      } else if (difference.inHours < 24) {
        return '${difference.inHours}h ago';
      } else {
        return '${difference.inDays}d ago';
      }
    } catch (e) {
      return '';
    }
  }
}