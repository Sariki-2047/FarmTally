import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:data_table_2/data_table_2.dart';
import 'package:fl_chart/fl_chart.dart';
import '../widgets/ft_content_scaffold.dart';
import '../providers/fm_providers.dart';

class FmReportsPage extends ConsumerStatefulWidget {
  const FmReportsPage({super.key});

  @override
  ConsumerState<FmReportsPage> createState() => _FmReportsPageState();
}

class _FmReportsPageState extends ConsumerState<FmReportsPage> {
  DateTime _startDate = DateTime.now().subtract(const Duration(days: 30));
  DateTime _endDate = DateTime.now();
  String _reportType = 'daily_summary';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadReports();
    });
  }

  void _loadReports() {
    ref.invalidate(fmReportsProvider({
      'startDate': _startDate,
      'endDate': _endDate,
      'reportType': _reportType,
    }));
  }

  @override
  Widget build(BuildContext context) {
    final reportsAsync = ref.watch(fmReportsProvider({
      'startDate': _startDate,
      'endDate': _endDate,
      'reportType': _reportType,
    }));
    
    return FtContentScaffold(
      title: 'Reports',
      actions: [
        _buildDateRangePicker(),
        const SizedBox(width: 8),
        _buildReportTypeDropdown(),
        const SizedBox(width: 8),
        ElevatedButton.icon(
          onPressed: () => _exportReport(),
          icon: const Icon(Icons.download, color: Colors.white),
          label: const Text('Export CSV', style: TextStyle(color: Colors.white)),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF2E7D32),
          ),
        ),
        const SizedBox(width: 8),
        OutlinedButton.icon(
          onPressed: () => _loadReports(),
          icon: const Icon(Icons.refresh),
          label: const Text('Refresh'),
        ),
      ],
      child: reportsAsync.when(
        data: (data) => _buildReportsContent(data),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => _buildErrorWidget(error.toString()),
      ),
    );
  }

  Widget _buildDateRangePicker() {
    return OutlinedButton.icon(
      onPressed: () => _selectDateRange(),
      icon: const Icon(Icons.date_range),
      label: Text('${_formatDate(_startDate)} - ${_formatDate(_endDate)}'),
    );
  }

  Widget _buildReportTypeDropdown() {
    return SizedBox(
      width: 200,
      child: DropdownButtonFormField<String>(
        value: _reportType,
        decoration: const InputDecoration(
          border: OutlineInputBorder(),
          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        ),
        items: const [
          DropdownMenuItem(value: 'daily_summary', child: Text('Daily Summary')),
          DropdownMenuItem(value: 'farmer_performance', child: Text('Farmer Performance')),
          DropdownMenuItem(value: 'lorry_wise', child: Text('Lorry-wise Summary')),
          DropdownMenuItem(value: 'quality_analysis', child: Text('Quality Analysis')),
        ],
        onChanged: (value) {
          if (value != null) {
            setState(() {
              _reportType = value;
            });
            _loadReports();
          }
        },
      ),
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
            'Failed to load reports',
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
            onPressed: () => _loadReports(),
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _buildReportsContent(Map<String, dynamic> data) {
    switch (_reportType) {
      case 'daily_summary':
        return _buildDailySummaryReport(data);
      case 'farmer_performance':
        return _buildFarmerPerformanceReport(data);
      case 'lorry_wise':
        return _buildLorryWiseReport(data);
      case 'quality_analysis':
        return _buildQualityAnalysisReport(data);
      default:
        return _buildDailySummaryReport(data);
    }
  }

  Widget _buildDailySummaryReport(Map<String, dynamic> data) {
    final summaryData = data['dailySummary'] as List<dynamic>? ?? [];
    
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Summary Cards
          _buildSummaryCards(data),
          const SizedBox(height: 24),
          
          // Chart
          _buildDailyChart(summaryData),
          const SizedBox(height: 24),
          
          // Data Table
          _buildDailySummaryTable(summaryData),
        ],
      ),
    );
  }

  Widget _buildSummaryCards(Map<String, dynamic> data) {
    final summary = data['summary'] as Map<String, dynamic>? ?? {};
    
    return Row(
      children: [
        Expanded(
          child: _buildSummaryCard(
            'Total Deliveries',
            '${summary['totalDeliveries'] ?? 0}',
            Icons.local_shipping,
            const Color(0xFF2E7D32),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildSummaryCard(
            'Total Bags',
            '${summary['totalBags'] ?? 0}',
            Icons.inventory,
            const Color(0xFF4CAF50),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildSummaryCard(
            'Total Weight (kg)',
            '${(summary['totalWeight'] ?? 0.0).toStringAsFixed(2)}',
            Icons.scale,
            const Color(0xFFFFB300),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildSummaryCard(
            'Avg Quality',
            '${summary['avgQuality'] ?? 'N/A'}',
            Icons.star,
            const Color(0xFF9C27B0),
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryCard(String title, String value, IconData icon, Color color) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: color, size: 24),
                const Spacer(),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: const TextStyle(
                color: Color(0xFF9E9E9E),
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDailyChart(List<dynamic> data) {
    if (data.isEmpty) {
      return const Card(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: Center(
            child: Text('No data available for chart'),
          ),
        ),
      );
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Daily Weight Trend',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 300,
              child: LineChart(
                LineChartData(
                  gridData: const FlGridData(show: true),
                  titlesData: FlTitlesData(
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 60,
                        getTitlesWidget: (value, meta) {
                          return Text('${value.toInt()}kg');
                        },
                      ),
                    ),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 30,
                        getTitlesWidget: (value, meta) {
                          final index = value.toInt();
                          if (index >= 0 && index < data.length) {
                            final date = DateTime.parse(data[index]['date']);
                            return Text('${date.day}/${date.month}');
                          }
                          return const Text('');
                        },
                      ),
                    ),
                    rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  ),
                  borderData: FlBorderData(show: true),
                  lineBarsData: [
                    LineChartBarData(
                      spots: data.asMap().entries.map((entry) {
                        return FlSpot(
                          entry.key.toDouble(),
                          (entry.value['totalWeight'] ?? 0.0).toDouble(),
                        );
                      }).toList(),
                      isCurved: true,
                      color: const Color(0xFF2E7D32),
                      barWidth: 3,
                      dotData: const FlDotData(show: true),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDailySummaryTable(List<dynamic> data) {
    if (data.isEmpty) {
      return const Card(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: Center(
            child: Text('No data available'),
          ),
        ),
      );
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Daily Summary Data',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 400,
              child: DataTable2(
                columnSpacing: 12,
                horizontalMargin: 12,
                columns: const [
                  DataColumn2(label: Text('Date'), size: ColumnSize.S),
                  DataColumn2(label: Text('Deliveries'), size: ColumnSize.S, numeric: true),
                  DataColumn2(label: Text('Bags'), size: ColumnSize.S, numeric: true),
                  DataColumn2(label: Text('Weight (kg)'), size: ColumnSize.S, numeric: true),
                  DataColumn2(label: Text('Avg Quality'), size: ColumnSize.S),
                ],
                rows: data.map<DataRow>((item) {
                  return DataRow(
                    cells: [
                      DataCell(Text(_formatDate(DateTime.parse(item['date'])))),
                      DataCell(Text('${item['deliveries'] ?? 0}')),
                      DataCell(Text('${item['bags'] ?? 0}')),
                      DataCell(Text('${(item['totalWeight'] ?? 0.0).toStringAsFixed(2)}')),
                      DataCell(Text('${item['avgQuality'] ?? 'N/A'}')),
                    ],
                  );
                }).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFarmerPerformanceReport(Map<String, dynamic> data) {
    final farmers = data['farmers'] as List<dynamic>? ?? [];
    
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Farmer Performance Report',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: farmers.isEmpty
                  ? const Center(child: Text('No farmer data available'))
                  : DataTable2(
                      columnSpacing: 12,
                      horizontalMargin: 12,
                      columns: const [
                        DataColumn2(label: Text('Farmer Name'), size: ColumnSize.M),
                        DataColumn2(label: Text('Deliveries'), size: ColumnSize.S, numeric: true),
                        DataColumn2(label: Text('Total Bags'), size: ColumnSize.S, numeric: true),
                        DataColumn2(label: Text('Total Weight (kg)'), size: ColumnSize.S, numeric: true),
                        DataColumn2(label: Text('Avg Quality'), size: ColumnSize.S),
                        DataColumn2(label: Text('Performance'), size: ColumnSize.S),
                      ],
                      rows: farmers.map<DataRow>((farmer) {
                        return DataRow(
                          cells: [
                            DataCell(Text(farmer['name'] ?? '')),
                            DataCell(Text('${farmer['deliveries'] ?? 0}')),
                            DataCell(Text('${farmer['totalBags'] ?? 0}')),
                            DataCell(Text('${(farmer['totalWeight'] ?? 0.0).toStringAsFixed(2)}')),
                            DataCell(Text('${farmer['avgQuality'] ?? 'N/A'}')),
                            DataCell(_buildPerformanceChip(farmer['performance'] ?? 'average')),
                          ],
                        );
                      }).toList(),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLorryWiseReport(Map<String, dynamic> data) {
    final lorries = data['lorries'] as List<dynamic>? ?? [];
    
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Lorry-wise Summary Report',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: lorries.isEmpty
                  ? const Center(child: Text('No lorry data available'))
                  : DataTable2(
                      columnSpacing: 12,
                      horizontalMargin: 12,
                      columns: const [
                        DataColumn2(label: Text('Lorry Number'), size: ColumnSize.S),
                        DataColumn2(label: Text('Trips'), size: ColumnSize.S, numeric: true),
                        DataColumn2(label: Text('Total Farmers'), size: ColumnSize.S, numeric: true),
                        DataColumn2(label: Text('Total Bags'), size: ColumnSize.S, numeric: true),
                        DataColumn2(label: Text('Total Weight (kg)'), size: ColumnSize.S, numeric: true),
                        DataColumn2(label: Text('Efficiency'), size: ColumnSize.S),
                      ],
                      rows: lorries.map<DataRow>((lorry) {
                        return DataRow(
                          cells: [
                            DataCell(Text(lorry['lorryNumber'] ?? '')),
                            DataCell(Text('${lorry['trips'] ?? 0}')),
                            DataCell(Text('${lorry['totalFarmers'] ?? 0}')),
                            DataCell(Text('${lorry['totalBags'] ?? 0}')),
                            DataCell(Text('${(lorry['totalWeight'] ?? 0.0).toStringAsFixed(2)}')),
                            DataCell(_buildEfficiencyChip(lorry['efficiency'] ?? 'average')),
                          ],
                        );
                      }).toList(),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQualityAnalysisReport(Map<String, dynamic> data) {
    final qualityData = data['qualityAnalysis'] as Map<String, dynamic>? ?? {};
    
    return SingleChildScrollView(
      child: Column(
        children: [
          // Quality Distribution Chart
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Quality Grade Distribution',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    height: 300,
                    child: PieChart(
                      PieChartData(
                        sections: _buildQualityPieChartSections(qualityData),
                        centerSpaceRadius: 60,
                        sectionsSpace: 2,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          
          // Quality Statistics
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Quality Statistics',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(child: _buildQualityStatCard('Grade A', '${qualityData['gradeA'] ?? 0}%', const Color(0xFF4CAF50))),
                      const SizedBox(width: 12),
                      Expanded(child: _buildQualityStatCard('Grade B', '${qualityData['gradeB'] ?? 0}%', const Color(0xFFFFB300))),
                      const SizedBox(width: 12),
                      Expanded(child: _buildQualityStatCard('Grade C', '${qualityData['gradeC'] ?? 0}%', const Color(0xFFFF9800))),
                      const SizedBox(width: 12),
                      Expanded(child: _buildQualityStatCard('Grade D', '${qualityData['gradeD'] ?? 0}%', const Color(0xFFD32F2F))),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  List<PieChartSectionData> _buildQualityPieChartSections(Map<String, dynamic> data) {
    return [
      PieChartSectionData(
        color: const Color(0xFF4CAF50),
        value: (data['gradeA'] ?? 0).toDouble(),
        title: 'A',
        radius: 80,
        titleStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
      ),
      PieChartSectionData(
        color: const Color(0xFFFFB300),
        value: (data['gradeB'] ?? 0).toDouble(),
        title: 'B',
        radius: 80,
        titleStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
      ),
      PieChartSectionData(
        color: const Color(0xFFFF9800),
        value: (data['gradeC'] ?? 0).toDouble(),
        title: 'C',
        radius: 80,
        titleStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
      ),
      PieChartSectionData(
        color: const Color(0xFFD32F2F),
        value: (data['gradeD'] ?? 0).toDouble(),
        title: 'D',
        radius: 80,
        titleStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
      ),
    ];
  }

  Widget _buildQualityStatCard(String title, String value, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
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
              style: const TextStyle(color: Color(0xFF9E9E9E)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPerformanceChip(String performance) {
    Color color;
    switch (performance.toLowerCase()) {
      case 'excellent':
        color = const Color(0xFF4CAF50);
        break;
      case 'good':
        color = const Color(0xFFFFB300);
        break;
      case 'average':
        color = const Color(0xFF9E9E9E);
        break;
      case 'poor':
        color = const Color(0xFFD32F2F);
        break;
      default:
        color = const Color(0xFF9E9E9E);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        performance.toUpperCase(),
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildEfficiencyChip(String efficiency) {
    return _buildPerformanceChip(efficiency); // Same styling
  }

  Future<void> _selectDateRange() async {
    final DateTimeRange? picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime.now(),
      initialDateRange: DateTimeRange(start: _startDate, end: _endDate),
    );

    if (picked != null) {
      setState(() {
        _startDate = picked.start;
        _endDate = picked.end;
      });
      _loadReports();
    }
  }

  void _exportReport() {
    // TODO: Implement CSV export functionality
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('CSV export functionality - Coming Soon'),
        backgroundColor: Color(0xFF4CAF50),
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}