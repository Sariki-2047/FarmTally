import 'package:flutter/material.dart';

class StatusFilter {
  final String label;
  final String? value;
  
  const StatusFilter(this.label, this.value);
}

class StatusFilterChips extends StatelessWidget {
  final String? selectedStatus;
  final ValueChanged<String?> onStatusChanged;
  final List<StatusFilter> statuses;

  const StatusFilterChips({
    super.key,
    required this.selectedStatus,
    required this.onStatusChanged,
    required this.statuses,
  });

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: statuses.map((status) {
        final isSelected = selectedStatus == status.value;
        
        return FilterChip(
          label: Text(status.label),
          selected: isSelected,
          onSelected: (selected) {
            onStatusChanged(selected ? status.value : null);
          },
          backgroundColor: Colors.white,
          selectedColor: const Color(0xFFE8F5E9),
          checkmarkColor: const Color(0xFF2E7D32),
          labelStyle: TextStyle(
            color: isSelected ? const Color(0xFF2E7D32) : const Color(0xFF424242),
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
          ),
          side: BorderSide(
            color: isSelected ? const Color(0xFF2E7D32) : const Color(0xFFE0E0E0),
          ),
        );
      }).toList(),
    );
  }
}