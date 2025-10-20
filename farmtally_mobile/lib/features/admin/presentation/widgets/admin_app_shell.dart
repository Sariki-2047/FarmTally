import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/presentation/providers/auth_provider.dart';

class AdminAppShell extends ConsumerWidget {
  final Widget child;
  
  const AdminAppShell({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isWide = MediaQuery.of(context).size.width >= 1024;
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('FarmTally – Admin'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: const [
          BusinessSelector(),
          SizedBox(width: 8),
          SyncStatus(),
          SizedBox(width: 8),
          ProfileMenu(),
          SizedBox(width: 16),
        ],
      ),
      drawer: isWide ? null : const AdminDrawer(),
      body: Row(
        children: [
          if (isWide) const AdminRail(),
          Expanded(child: child),
        ],
      ),
    );
  }
}

class AdminRail extends StatelessWidget {
  const AdminRail({super.key});

  @override
  Widget build(BuildContext context) {
    final tabs = _adminTabs();
    final location = GoRouterState.of(context).uri.toString();
    final selected = tabs.indexWhere((t) => location.contains(t.route));

    return NavigationRail(
      selectedIndex: selected < 0 ? 0 : selected,
      onDestinationSelected: (i) => context.go('/app/admin${tabs[i].route}'),
      labelType: NavigationRailLabelType.all,
      backgroundColor: Theme.of(context).colorScheme.surface,
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

class AdminDrawer extends StatelessWidget {
  const AdminDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final tabs = _adminTabs();
    final location = GoRouterState.of(context).uri.toString();
    
    return Drawer(
      child: ListView(
        children: [
          const DrawerHeader(
            decoration: BoxDecoration(
              color: Colors.green,
            ),
            child: Text(
              'FarmTally Admin',
              style: TextStyle(
                color: Colors.white,
                fontSize: 24,
              ),
            ),
          ),
          for (final t in tabs)
            ListTile(
              leading: Icon(t.icon),
              title: Text(t.label),
              selected: location.contains(t.route),
              onTap: () {
                Navigator.pop(context);
                context.go('/app/admin${t.route}');
              },
            )
        ],
      ),
    );
  }
}

class BusinessSelector extends ConsumerWidget {
  const BusinessSelector({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return PopupMenuButton<String>(
      icon: const Icon(Icons.business),
      tooltip: 'Select Business',
      onSelected: (value) {
        // TODO: Implement business selection
      },
      itemBuilder: (context) => [
        const PopupMenuItem(
          value: 'business1',
          child: Text('Agri Corp Ltd'),
        ),
        const PopupMenuItem(
          value: 'business2',
          child: Text('Farm Solutions Inc'),
        ),
      ],
    );
  }
}

class SyncStatus extends StatelessWidget {
  const SyncStatus({super.key});

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.sync, color: Colors.green),
      tooltip: 'Sync Status: Online',
      onPressed: () {
        // TODO: Implement sync status
      },
    );
  }
}

class ProfileMenu extends ConsumerWidget {
  const ProfileMenu({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentUser = ref.watch(currentUserProvider);
    
    return PopupMenuButton<String>(
      icon: const Icon(Icons.account_circle),
      tooltip: 'Profile Menu',
      onSelected: (value) async {
        switch (value) {
          case 'profile':
            // TODO: Navigate to profile
            break;
          case 'logout':
            await _handleLogout(context, ref);
            break;
        }
      },
      itemBuilder: (context) => [
        if (currentUser != null)
          PopupMenuItem(
            enabled: false,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  currentUser.displayName,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                Text(
                  currentUser.email ?? currentUser.phone ?? 'No contact info',
                  style: TextStyle(
                    fontSize: 12,
                    color: Theme.of(context).textTheme.bodySmall?.color,
                  ),
                ),
                const Divider(),
              ],
            ),
          ),
        const PopupMenuItem(
          value: 'profile',
          child: ListTile(
            leading: Icon(Icons.person),
            title: Text('Profile'),
            contentPadding: EdgeInsets.zero,
          ),
        ),
        const PopupMenuItem(
          value: 'logout',
          child: ListTile(
            leading: Icon(Icons.logout),
            title: Text('Logout'),
            contentPadding: EdgeInsets.zero,
          ),
        ),
      ],
    );
  }

  Future<void> _handleLogout(BuildContext context, WidgetRef ref) async {
    // Show confirmation dialog
    final shouldLogout = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Logout'),
          ),
        ],
      ),
    );

    if (shouldLogout == true) {
      try {
        // Show loading indicator
        if (context.mounted) {
          showDialog(
            context: context,
            barrierDismissible: false,
            builder: (context) => const Center(
              child: CircularProgressIndicator(),
            ),
          );
        }

        // Perform logout
        await ref.read(authNotifierProvider.notifier).logout();

        // Close loading dialog
        if (context.mounted) {
          Navigator.of(context).pop();
        }

        // Navigate to login page
        if (context.mounted) {
          context.go('/login');
        }
      } catch (e) {
        // Close loading dialog if still open
        if (context.mounted) {
          Navigator.of(context).pop();
        }

        // Show error message
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Logout failed: ${e.toString()}'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }
}

class _AdminTab {
  const _AdminTab(this.label, this.icon, this.route);
  final String label;
  final IconData icon;
  final String route;
}

List<_AdminTab> _adminTabs() => const [
  _AdminTab('Dashboard', Icons.dashboard, '/dashboard'),
  _AdminTab('Lorry Management', Icons.local_shipping, '/lorry-management'),
  _AdminTab('Field Managers', Icons.badge, '/field-managers'),
  _AdminTab('Farmers', Icons.agriculture, '/farmers'),
  _AdminTab('Reports', Icons.insights, '/reports'),
  _AdminTab('Settings', Icons.tune, '/settings'),
];