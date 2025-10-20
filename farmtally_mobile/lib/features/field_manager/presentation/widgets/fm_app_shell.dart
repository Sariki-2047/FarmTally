import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/presentation/providers/auth_provider.dart';

class FmAppShell extends ConsumerWidget {
  final Widget child;
  
  const FmAppShell({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isWide = MediaQuery.of(context).size.width >= 1024;
    
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: const Text('FarmTally – Field Manager'),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF424242),
        elevation: 1,
        actions: const [
          SyncStatus(),
          SizedBox(width: 8),
          ProfileMenu(),
          SizedBox(width: 16),
        ],
      ),
      drawer: isWide ? null : const _FmDrawer(),
      body: Row(
        children: [
          if (isWide) const _FmRail(),
          if (isWide) const VerticalDivider(width: 1),
          Expanded(child: child),
        ],
      ),
    );
  }
}

class _FmRail extends StatelessWidget {
  const _FmRail();

  @override
  Widget build(BuildContext context) {
    final tabs = _fmTabs();
    final loc = GoRouterState.of(context).uri.toString();
    final selected = tabs.indexWhere((t) => loc.contains(t.route));
    
    return NavigationRail(
      backgroundColor: Colors.white,
      selectedIndex: selected < 0 ? 0 : selected,
      onDestinationSelected: (i) => context.go('/app/fm${tabs[i].route}'),
      labelType: NavigationRailLabelType.all,
      selectedIconTheme: const IconThemeData(color: Color(0xFF2E7D32)),
      selectedLabelTextStyle: const TextStyle(
        color: Color(0xFF2E7D32),
        fontWeight: FontWeight.w600,
      ),
      unselectedIconTheme: const IconThemeData(color: Color(0xFF9E9E9E)),
      unselectedLabelTextStyle: const TextStyle(color: Color(0xFF9E9E9E)),
      destinations: [
        for (final t in tabs)
          NavigationRailDestination(
            icon: Icon(t.icon),
            label: Text(t.label),
          )
      ],
    );
  }
}

class _FmDrawer extends StatelessWidget {
  const _FmDrawer();

  @override
  Widget build(BuildContext context) {
    final tabs = _fmTabs();
    final loc = GoRouterState.of(context).uri.toString();
    
    return Drawer(
      width: 280,
      child: SafeArea(
        child: Column(
          children: [
            const ListTile(
              leading: CircleAvatar(
                backgroundColor: Color(0xFF2E7D32),
                child: Icon(Icons.person, color: Colors.white),
              ),
              title: Text(
                'Field Manager',
                style: TextStyle(fontWeight: FontWeight.w600),
              ),
              subtitle: Text('FarmTally'),
            ),
            const Divider(height: 1),
            Expanded(
              child: ListView(
                children: [
                  for (final t in tabs)
                    ListTile(
                      leading: Icon(
                        t.icon,
                        color: loc.contains(t.route) 
                          ? const Color(0xFF2E7D32) 
                          : const Color(0xFF9E9E9E),
                      ),
                      title: Text(
                        t.label,
                        style: TextStyle(
                          color: loc.contains(t.route) 
                            ? const Color(0xFF2E7D32) 
                            : const Color(0xFF424242),
                          fontWeight: loc.contains(t.route) 
                            ? FontWeight.w600 
                            : FontWeight.normal,
                        ),
                      ),
                      selected: loc.contains(t.route),
                      selectedTileColor: const Color(0xFFE8F5E9),
                      onTap: () {
                        Navigator.of(context).pop();
                        context.go('/app/fm${t.route}');
                      },
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FmTab {
  const _FmTab(this.label, this.icon, this.route);
  
  final String label;
  final IconData icon;
  final String route;
}

List<_FmTab> _fmTabs() => const [
  _FmTab('Dashboard', Icons.dashboard, '/dashboard'),
  _FmTab('My Lorries', Icons.local_shipping, '/my-lorries'),
  _FmTab('Lorry Requests', Icons.assignment, '/lorry-requests'),
  _FmTab('Farmers', Icons.agriculture, '/farmers'),
  _FmTab('Reports', Icons.insights, '/reports'),
];

class SyncStatus extends StatelessWidget {
  const SyncStatus({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFE8F5E9),
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.sync, size: 16, color: Color(0xFF2E7D32)),
          SizedBox(width: 4),
          Text(
            'Synced',
            style: TextStyle(
              fontSize: 12,
              color: Color(0xFF2E7D32),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class ProfileMenu extends ConsumerWidget {
  const ProfileMenu({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return PopupMenuButton<String>(
      icon: const CircleAvatar(
        radius: 16,
        backgroundColor: Color(0xFF2E7D32),
        child: Icon(Icons.person, size: 18, color: Colors.white),
      ),
      onSelected: (value) async {
        switch (value) {
          case 'profile':
            // Navigate to profile
            break;
          case 'settings':
            // Navigate to settings
            break;
          case 'logout':
            // Call logout method from auth provider
            await ref.read(authNotifierProvider.notifier).logout();
            // Navigate to login page
            if (context.mounted) {
              context.go('/login');
            }
            break;
        }
      },
      itemBuilder: (context) => [
        const PopupMenuItem(
          value: 'profile',
          child: ListTile(
            leading: Icon(Icons.person_outline),
            title: Text('Profile'),
            contentPadding: EdgeInsets.zero,
          ),
        ),
        const PopupMenuItem(
          value: 'settings',
          child: ListTile(
            leading: Icon(Icons.settings_outlined),
            title: Text('Settings'),
            contentPadding: EdgeInsets.zero,
          ),
        ),
        const PopupMenuDivider(),
        const PopupMenuItem(
          value: 'logout',
          child: ListTile(
            leading: Icon(Icons.logout, color: Color(0xFFD32F2F)),
            title: Text('Logout', style: TextStyle(color: Color(0xFFD32F2F))),
            contentPadding: EdgeInsets.zero,
          ),
        ),
      ],
    );
  }
}