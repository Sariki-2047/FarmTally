import 'package:flutter/material.dart';

class FtContentScaffold extends StatelessWidget {
  final String title;
  final List<Widget> actions;
  final Widget child;
  final Widget? footer;
  final List<Widget>? breadcrumbs;
  final List<Widget>? badges;

  const FtContentScaffold({
    super.key,
    required this.title,
    required this.child,
    this.actions = const [],
    this.footer,
    this.breadcrumbs,
    this.badges,
  });

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.of(context).size.width >= 600;
    final padding = isWide ? 16.0 : 12.0;
    
    return Padding(
      padding: EdgeInsets.all(padding),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Section header
          _buildSectionHeader(context),
          const SizedBox(height: 8),
          
          // Toolbar
          if (actions.isNotEmpty) ...[
            _buildToolbar(context, isWide),
            const SizedBox(height: 8),
          ],
          
          // Content surface
          Expanded(
            child: Card(
              elevation: 2,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: EdgeInsets.all(isWide ? 16.0 : 12.0),
                child: child,
              ),
            ),
          ),
          
          // Footer
          if (footer != null) ...[
            const SizedBox(height: 8),
            Align(
              alignment: Alignment.centerRight,
              child: footer!,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context) {
    return Row(
      children: [
        // Breadcrumbs
        if (breadcrumbs != null) ...[
          ...breadcrumbs!,
          const SizedBox(width: 8),
        ],
        
        // Title
        Text(
          title,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.w700,
            color: const Color(0xFF424242),
          ),
        ),
        
        const SizedBox(width: 12),
        
        // Badges
        if (badges != null) ...badges!,
        
        const Spacer(),
      ],
    );
  }

  Widget _buildToolbar(BuildContext context, bool isWide) {
    if (isWide) {
      return Row(
        children: [
          ...actions.expand((action) => [action, const SizedBox(width: 8)]),
        ],
      );
    } else {
      return Wrap(
        spacing: 8,
        runSpacing: 8,
        children: actions,
      );
    }
  }
}

class FtStatusChip extends StatelessWidget {
  final String label;
  final Color? backgroundColor;
  final Color? textColor;
  final IconData? icon;

  const FtStatusChip({
    super.key,
    required this.label,
    this.backgroundColor,
    this.textColor,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor ?? const Color(0xFFFFECB3),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(
              icon,
              size: 14,
              color: textColor ?? const Color(0xFF5D4037),
            ),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: textColor ?? const Color(0xFF5D4037),
            ),
          ),
        ],
      ),
    );
  }
}

class FtSearchField extends StatelessWidget {
  final String hintText;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final double? width;

  const FtSearchField({
    super.key,
    required this.hintText,
    this.onChanged,
    this.onSubmitted,
    this.width,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width ?? 320,
      height: 44,
      child: TextField(
        onChanged: onChanged,
        onSubmitted: onSubmitted,
        decoration: InputDecoration(
          prefixIcon: const Icon(Icons.search, color: Color(0xFF9E9E9E)),
          hintText: hintText,
          hintStyle: const TextStyle(color: Color(0xFF9E9E9E)),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: Color(0xFFE0E0E0)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: Color(0xFFE0E0E0)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: Color(0xFF2E7D32)),
          ),
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        ),
      ),
    );
  }
}

class FtPagination extends StatelessWidget {
  final int total;
  final int page;
  final int limit;
  final ValueChanged<int> onPage;

  const FtPagination({
    super.key,
    required this.total,
    required this.page,
    required this.limit,
    required this.onPage,
  });

  @override
  Widget build(BuildContext context) {
    final pages = (total / limit).ceil().clamp(1, 9999);
    
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          'Total: $total',
          style: const TextStyle(
            color: Color(0xFF9E9E9E),
            fontSize: 14,
          ),
        ),
        const SizedBox(width: 16),
        IconButton(
          icon: const Icon(Icons.chevron_left),
          onPressed: page > 1 ? () => onPage(page - 1) : null,
          color: page > 1 ? const Color(0xFF424242) : const Color(0xFF9E9E9E),
        ),
        Text(
          '$page / $pages',
          style: const TextStyle(
            color: Color(0xFF424242),
            fontWeight: FontWeight.w500,
          ),
        ),
        IconButton(
          icon: const Icon(Icons.chevron_right),
          onPressed: page < pages ? () => onPage(page + 1) : null,
          color: page < pages ? const Color(0xFF424242) : const Color(0xFF9E9E9E),
        ),
      ],
    );
  }
}