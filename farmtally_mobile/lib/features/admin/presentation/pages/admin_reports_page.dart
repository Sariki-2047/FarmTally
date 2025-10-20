import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AdminReportsPage extends ConsumerStatefulWidget {
  const AdminReportsPage({super.key});

  @override
  ConsumerState<AdminReportsPage> createState() => _AdminReportsPageState();
}

class _AdminReportsPageState extends ConsumerState<AdminReportsPage> {
  DateTimeRange? selectedDateRange;
  String selectedCategory = 'deliveries';
  String selectedFormat = 'csv';

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Reports & Analytics',
            style: Theme.of(context).textTheme.headlineMedium,
          ),
          const SizedBox(height: 24),
          
          // Filters Section
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Report Filters',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 16,
                    runSpacing: 16,
                    children: [
                      // Date Range Picker
                      SizedBox(
                        width: 250,
                        child: OutlinedButton.icon(
                          onPressed: _selectDateRange,
                          icon: const Icon(Icons.date_range),
                          label: Text(
                            selectedDateRange != null
                                ? '${_formatDate(selectedDateRange!.start)} - ${_formatDate(selectedDateRange!.end)}'
                                : 'Select Date Range',
                          ),
                        ),
                      ),
                      
                      // Category Dropdown
                      SizedBox(
                        width: 200,
                        child: DropdownButtonFormField<String>(
                          value: selectedCategory,
                          decoration: const InputDecoration(
                            labelText: 'Report Category',
                            border: OutlineInputBorder(),
                          ),
                          items: const [
                            DropdownMenuItem(value: 'deliveries', child: Text('Deliveries')),
                            DropdownMenuItem(value: 'lorry_utilization', child: Text('Lorry Utilization')),
                            DropdownMenuItem(value: 'financial', child: Text('Financial Summary')),
                            DropdownMenuItem(value: 'quality', child: Text('Quality Analysis')),
                          ],
                          onChanged: (value) {
                            if (value != null) {
                              setState(() {
                                selectedCategory = value;
                              });
                            }
                          },
                        ),
                      ),
                      
                      // Export Format
                      SizedBox(
                        width: 150,
                        child: DropdownButtonFormField<String>(
                          value: selectedFormat,
                          decoration: const InputDecoration(
                            labelText: 'Format',
                            border: OutlineInputBorder(),
                          ),
                          items: const [
                            DropdownMenuItem(value: 'csv', child: Text('CSV')),
                            DropdownMenuItem(value: 'excel', child: Text('Excel')),
                            DropdownMenuItem(value: 'pdf', child: Text('PDF')),
                          ],
                          onChanged: (value) {
                            if (value != null) {
                              setState(() {
                                selectedFormat = value;
                              });
                            }
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: _generateReport,
                    icon: const Icon(Icons.download),
                    label: const Text('Generate Report'),
                  ),
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Report Categories
          Expanded(
            child: GridView.count(
              crossAxisCount: MediaQuery.of(context).size.width > 800 ? 2 : 1,
              childAspectRatio: 2.5,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              children: [
                _ReportCategoryCard(
                  title: 'Delivery Reports',
                  description: 'Daily, weekly, and monthly delivery summaries',
                  icon: Icons.agriculture,
                  color: Colors.green,
                  onTap: () => _showReportPreview('deliveries'),
                ),
                _ReportCategoryCard(
                  title: 'Lorry Utilization',
                  description: 'Fleet performance and utilization metrics',
                  icon: Icons.local_shipping,
                  color: Colors.blue,
                  onTap: () => _showReportPreview('lorry_utilization'),
                ),
                _ReportCategoryCard(
                  title: 'Financial Summary',
                  description: 'Revenue, payments, and financial analytics',
                  icon: Icons.currency_rupee,
                  color: Colors.purple,
                  onTap: () => _showReportPreview('financial'),
                ),
                _ReportCategoryCard(
                  title: 'Quality Analysis',
                  description: 'Moisture content, deductions, and quality trends',
                  icon: Icons.analytics,
                  color: Colors.orange,
                  onTap: () => _showReportPreview('quality'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _selectDateRange() async {
    final DateTimeRange? picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime.now(),
      initialDateRange: selectedDateRange,
    );
    
    if (picked != null) {
      setState(() {
        selectedDateRange = picked;
      });
    }
  }

  void _generateReport() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Generating $selectedCategory report in $selectedFormat format...'),
        action: SnackBarAction(
          label: 'View',
          onPressed: () {
            // TODO: Implement report generation
          },
        ),
      ),
    );
  }

  void _showReportPreview(String category) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('${_getCategoryTitle(category)} Preview'),
        content: SizedBox(
          width: 400,
          height: 300,
          child: Column(
            children: [
              Text('Sample data for $category reports:'),
              const SizedBox(height: 16),
              Expanded(
                child: ListView(
                  children: _getSampleData(category).map((item) {
                    return ListTile(
                      title: Text(item['title']!),
                      subtitle: Text(item['value']!),
                      dense: true,
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _generateReport();
            },
            child: const Text('Generate Full Report'),
          ),
        ],
      ),
    );
  }

  String _getCategoryTitle(String category) {
    switch (category) {
      case 'deliveries':
        return 'Delivery Reports';
      case 'lorry_utilization':
        return 'Lorry Utilization';
      case 'financial':
        return 'Financial Summary';
      case 'quality':
        return 'Quality Analysis';
      default:
        return 'Report';
    }
  }

  List<Map<String, String>> _getSampleData(String category) {
    switch (category) {
      case 'deliveries':
        return [
          {'title': 'Total Deliveries Today', 'value': '24'},
          {'title': 'Total Weight (kg)', 'value': '12,500'},
          {'title': 'Average per Delivery', 'value': '520 kg'},
          {'title': 'Top Performing FM', 'value': 'Rajesh Kumar'},
        ];
      case 'lorry_utilization':
        return [
          {'title': 'Fleet Utilization', 'value': '85%'},
          {'title': 'Average Load Factor', 'value': '78%'},
          {'title': 'Maintenance Hours', 'value': '12 hrs'},
          {'title': 'Fuel Efficiency', 'value': '8.5 km/l'},
        ];
      case 'financial':
        return [
          {'title': 'Total Revenue', 'value': '₹8,75,000'},
          {'title': 'Pending Payments', 'value': '₹1,25,000'},
          {'title': 'Average Price/kg', 'value': '₹70'},
          {'title': 'Profit Margin', 'value': '15%'},
        ];
      case 'quality':
        return [
          {'title': 'Average Moisture', 'value': '14.2%'},
          {'title': 'Quality Deductions', 'value': '₹45,000'},
          {'title': 'Rejection Rate', 'value': '2.1%'},
          {'title': 'Top Quality Farmer', 'value': 'Krishnan Pillai'},
        ];
      default:
        return [];
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}

class _ReportCategoryCard extends StatelessWidget {
  final String title;
  final String description;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _ReportCategoryCard({
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: color, size: 32),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      title,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      description,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.arrow_forward_ios,
                size: 16,
                color: Theme.of(context).colorScheme.outline,
              ),
            ],
          ),
        ),
      ),
    );
  }
}