import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import '../providers/admin_providers.dart';
import '../widgets/error_display.dart';
import '../../data/models/lorry_model.dart';
import '../../data/models/lorry_request_model.dart';

class AdminDashboardPage extends ConsumerWidget {
  const AdminDashboardPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final lorriesAsync = ref.watch(lorriesProvider);
    final requestsAsync = ref.watch(lorryRequestsProvider);

    return Padding(
      padding: const EdgeInsets.all(16),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Dashboard Overview',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 24),
            
            // KPI Cards
            lorriesAsync.when(
              data: (lorries) => requestsAsync.when(
                data: (requests) => _buildKPICards(context, lorries, requests),
                loading: () => const _KPICardsLoading(),
                error: (error, _) => ErrorDisplay(error: error.toString()),
              ),
              loading: () => const _KPICardsLoading(),
              error: (error, _) => ErrorDisplay(error: error.toString()),
            ),
            
            const SizedBox(height: 32),
            
            // Charts Section
            lorriesAsync.when(
              data: (lorries) => requestsAsync.when(
                data: (requests) => _buildChartsSection(context, lorries, requests),
                loading: () => const _ChartsLoading(),
                error: (error, _) => ErrorDisplay(error: error.toString()),
              ),
              loading: () => const _ChartsLoading(),
              error: (error, _) => ErrorDisplay(error: error.toString()),
            ),
            
            const SizedBox(height: 32),
            
            // Activity Feed
            _buildActivityFeed(context),
          ],
        ),
      ),
    );
  }

  Widget _buildKPICards(BuildContext context, List<Lorry> lorries, List<LorryRequest> requests) {
    final availableLorries = lorries.where((l) => l.status == LorryStatus.available).length;
    final assignedLorries = lorries.where((l) => l.status == LorryStatus.assigned).length;
    final loadingLorries = lorries.where((l) => l.status == LorryStatus.loading).length;
    final pendingRequests = requests.where((r) => r.status == LorryRequestStatus.pending).length;
    
    // Mock data for deliveries and revenue
    const todayDeliveries = 24;
    const todayWeight = 12500.0;
    const dailyRevenue = 875000.0;

    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth > 800;
        final crossAxisCount = isWide ? 4 : 2;
        
        return GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: crossAxisCount,
          childAspectRatio: isWide ? 2.5 : 1.8,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          children: [
            _KPICard(
              title: 'Total Lorries',
              value: '${lorries.length}',
              subtitle: '$availableLorries Available • $assignedLorries Assigned • $loadingLorries Loading',
              icon: Icons.local_shipping,
              color: Colors.blue,
            ),
            _KPICard(
              title: 'Pending Requests',
              value: '$pendingRequests',
              subtitle: 'Awaiting approval',
              icon: Icons.assignment_turned_in,
              color: Colors.orange,
            ),
            _KPICard(
              title: 'Today\'s Deliveries',
              value: '$todayDeliveries',
              subtitle: '${(todayWeight / 1000).toStringAsFixed(1)}T total weight',
              icon: Icons.agriculture,
              color: Colors.green,
            ),
            _KPICard(
              title: 'Daily Revenue',
              value: '₹${(dailyRevenue / 100000).toStringAsFixed(1)}L',
              subtitle: 'Today\'s earnings',
              icon: Icons.currency_rupee,
              color: Colors.purple,
            ),
          ],
        );
      },
    );
  }

  Widget _buildChartsSection(BuildContext context, List<Lorry> lorries, List<LorryRequest> requests) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth > 800;
        
        if (isWide) {
          return Row(
            children: [
              Expanded(child: _buildLorryUtilizationChart(context, lorries)),
              const SizedBox(width: 16),
              Expanded(child: _buildRequestStatusChart(context, requests)),
            ],
          );
        } else {
          return Column(
            children: [
              _buildLorryUtilizationChart(context, lorries),
              const SizedBox(height: 16),
              _buildRequestStatusChart(context, requests),
            ],
          );
        }
      },
    );
  }

  Widget _buildLorryUtilizationChart(BuildContext context, List<Lorry> lorries) {
    final statusCounts = <LorryStatus, int>{};
    for (final status in LorryStatus.values) {
      statusCounts[status] = lorries.where((l) => l.status == status).length;
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Lorry Utilization',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 200,
              child: BarChart(
                BarChartData(
                  alignment: BarChartAlignment.spaceAround,
                  maxY: lorries.length.toDouble() + 2,
                  barTouchData: BarTouchData(enabled: false),
                  titlesData: FlTitlesData(
                    show: true,
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (value, meta) {
                          switch (value.toInt()) {
                            case 0:
                              return const Text('Available');
                            case 1:
                              return const Text('Assigned');
                            case 2:
                              return const Text('In Transit');
                            case 3:
                              return const Text('Loading');
                            default:
                              return const Text('');
                          }
                        },
                      ),
                    ),
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 40,
                      ),
                    ),
                    topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  ),
                  borderData: FlBorderData(show: false),
                  barGroups: [
                    BarChartGroupData(x: 0, barRods: [BarChartRodData(toY: statusCounts[LorryStatus.available]!.toDouble(), color: Colors.green)]),
                    BarChartGroupData(x: 1, barRods: [BarChartRodData(toY: statusCounts[LorryStatus.assigned]!.toDouble(), color: Colors.blue)]),
                    BarChartGroupData(x: 2, barRods: [BarChartRodData(toY: statusCounts[LorryStatus.loading]!.toDouble(), color: Colors.orange)]),
                    BarChartGroupData(x: 3, barRods: [BarChartRodData(toY: statusCounts[LorryStatus.submitted]!.toDouble(), color: Colors.purple)]),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRequestStatusChart(BuildContext context, List<LorryRequest> requests) {
    final statusCounts = <LorryRequestStatus, int>{};
    for (final status in LorryRequestStatus.values) {
      statusCounts[status] = requests.where((r) => r.status == status).length;
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Request Status Distribution',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 200,
              child: PieChart(
                PieChartData(
                  sections: [
                    PieChartSectionData(
                      value: statusCounts[LorryRequestStatus.pending]!.toDouble(),
                      title: 'Pending\n${statusCounts[LorryRequestStatus.pending]}',
                      color: Colors.orange,
                      radius: 60,
                    ),
                    PieChartSectionData(
                      value: statusCounts[LorryRequestStatus.approved]!.toDouble(),
                      title: 'Approved\n${statusCounts[LorryRequestStatus.approved]}',
                      color: Colors.green,
                      radius: 60,
                    ),
                    PieChartSectionData(
                      value: statusCounts[LorryRequestStatus.rejected]!.toDouble(),
                      title: 'Rejected\n${statusCounts[LorryRequestStatus.rejected]}',
                      color: Colors.red,
                      radius: 60,
                    ),
                    PieChartSectionData(
                      value: statusCounts[LorryRequestStatus.deferred]!.toDouble(),
                      title: 'Deferred\n${statusCounts[LorryRequestStatus.deferred]}',
                      color: Colors.grey,
                      radius: 60,
                    ),
                  ],
                  centerSpaceRadius: 40,
                  sectionsSpace: 2,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityFeed(BuildContext context) {
    // Mock activity data
    final activities = [
      'Lorry TN01AB1234 assigned to Rajesh Kumar',
      'Request from Priya Devi approved',
      'New delivery completed at Village Kanchipuram',
      'Lorry TN02CD5678 submitted for processing',
      'Payment processed for Krishnan Pillai',
    ];

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Recent Activity',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: activities.length,
              separatorBuilder: (context, index) => const Divider(),
              itemBuilder: (context, index) {
                return ListTile(
                  leading: CircleAvatar(
                    backgroundColor: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                    child: Icon(
                      Icons.notifications,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                  ),
                  title: Text(activities[index]),
                  subtitle: Text('${index + 1} hour${index == 0 ? '' : 's'} ago'),
                  contentPadding: EdgeInsets.zero,
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _KPICard extends StatelessWidget {
  final String title;
  final String value;
  final String subtitle;
  final IconData icon;
  final Color color;

  const _KPICard({
    required this.title,
    required this.value,
    required this.subtitle,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: color, size: 24),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    title,
                    style: Theme.of(context).textTheme.titleSmall,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                color: color,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: Theme.of(context).textTheme.bodySmall,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

class _KPICardsLoading extends StatelessWidget {
  const _KPICardsLoading();

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      childAspectRatio: 1.8,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      children: List.generate(4, (index) => const Card(
        child: Center(child: CircularProgressIndicator()),
      )),
    );
  }
}

class _ChartsLoading extends StatelessWidget {
  const _ChartsLoading();

  @override
  Widget build(BuildContext context) {
    return const Row(
      children: [
        Expanded(child: Card(child: SizedBox(height: 250, child: Center(child: CircularProgressIndicator())))),
        SizedBox(width: 16),
        Expanded(child: Card(child: SizedBox(height: 250, child: Center(child: CircularProgressIndicator())))),
      ],
    );
  }
}