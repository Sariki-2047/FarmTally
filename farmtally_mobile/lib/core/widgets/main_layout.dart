import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../presentation/providers/auth_provider.dart';
import '../domain/entities/user.dart';
import '../utils/app_constants.dart';

class MainLayout extends ConsumerStatefulWidget {
  final Widget child;
  final String currentRoute;

  const MainLayout({
    super.key,
    required this.child,
    required this.currentRoute,
  });

  @override
  ConsumerState<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends ConsumerState<MainLayout> {
  bool _isCollapsed = false;

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);
    final theme = Theme.of(context);
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 768;

    if (user == null) {
      return widget.child;
    }

    return Scaffold(
      body: Row(
        children: [
          // Sidebar
          if (!isMobile)
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              width: _isCollapsed ? 80 : 280,
              child: _buildSidebar(theme, user),
            ),
          
          // Main Content Area
          Expanded(
            child: Column(
              children: [
                // Top App Bar
                _buildTopAppBar(theme, user, isMobile),
                
                // Content
                Expanded(
                  child: Container(
                    color: theme.colorScheme.surface,
                    child: widget.child,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      
      // Mobile Drawer
      drawer: isMobile ? _buildMobileDrawer(theme, user) : null,
    );
  }

  Widget _buildSidebar(ThemeData theme, UserModel user) {
    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        border: Border(
          right: BorderSide(
            color: theme.dividerColor.withOpacity(0.1),
            width: 1,
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: theme.shadowColor.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(2, 0),
          ),
        ],
      ),
      child: Column(
        children: [
          // Logo and Collapse Button
          Container(
            height: 80,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                // Logo
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        theme.colorScheme.primary,
                        theme.colorScheme.primary.withOpacity(0.8),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.eco,
                    color: Colors.white,
                    size: 24,
                  ),
                ),
                
                if (!_isCollapsed) ...[
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      AppConstants.appName,
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                  ),
                ],
                
                // Collapse Button
                SizedBox(
                  width: 40,
                  child: IconButton(
                    onPressed: () {
                      setState(() {
                        _isCollapsed = !_isCollapsed;
                      });
                    },
                    icon: Icon(
                      _isCollapsed ? Icons.menu_open : Icons.menu,
                      color: theme.colorScheme.onSurface.withOpacity(0.7),
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          const Divider(height: 1),
          
          // Navigation Items
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 8),
              children: _buildNavigationItems(theme, user),
            ),
          ),
          
          // User Profile Section
          _buildUserProfile(theme, user),
        ],
      ),
    );
  }

  Widget _buildTopAppBar(ThemeData theme, UserModel user, bool isMobile) {
    return Container(
      height: 70,
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        border: Border(
          bottom: BorderSide(
            color: theme.dividerColor.withOpacity(0.1),
            width: 1,
          ),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        child: Row(
          children: [
            // Mobile Menu Button
            if (isMobile)
              IconButton(
                onPressed: () {
                  Scaffold.of(context).openDrawer();
                },
                icon: const Icon(Icons.menu),
              ),
            
            // Page Title
            Expanded(
              child: Text(
                _getPageTitle(),
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: theme.colorScheme.onSurface,
                ),
              ),
            ),
            
            // Actions
            Row(
              children: [
                // Notifications
                IconButton(
                  onPressed: () {
                    // Show notifications
                  },
                  icon: Badge(
                    smallSize: 8,
                    child: Icon(
                      Icons.notifications_outlined,
                      color: theme.colorScheme.onSurface.withOpacity(0.7),
                    ),
                  ),
                ),
                
                const SizedBox(width: 8),
                
                // User Avatar
                PopupMenuButton<String>(
                  offset: const Offset(0, 50),
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        CircleAvatar(
                          radius: 16,
                          backgroundColor: theme.colorScheme.primary,
                          child: Text(
                            user.displayName.isNotEmpty 
                                ? user.displayName[0].toUpperCase()
                                : 'U',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        if (!isMobile) ...[
                          const SizedBox(width: 8),
                          Text(
                            user.displayName,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Icon(
                            Icons.keyboard_arrow_down,
                            size: 16,
                            color: theme.colorScheme.onSurface.withOpacity(0.7),
                          ),
                        ],
                      ],
                    ),
                  ),
                  itemBuilder: (context) => [
                    PopupMenuItem(
                      value: 'profile',
                      child: ListTile(
                        leading: const Icon(Icons.person_outline),
                        title: const Text('Profile'),
                        contentPadding: EdgeInsets.zero,
                      ),
                    ),
                    PopupMenuItem(
                      value: 'settings',
                      child: ListTile(
                        leading: const Icon(Icons.settings_outlined),
                        title: const Text('Settings'),
                        contentPadding: EdgeInsets.zero,
                      ),
                    ),
                    const PopupMenuDivider(),
                    PopupMenuItem(
                      value: 'logout',
                      child: ListTile(
                        leading: const Icon(Icons.logout, color: Colors.red),
                        title: const Text('Logout', style: TextStyle(color: Colors.red)),
                        contentPadding: EdgeInsets.zero,
                      ),
                    ),
                  ],
                  onSelected: (value) async {
                    switch (value) {
                      case 'profile':
                        // Navigate to profile
                        break;
                      case 'settings':
                        // Navigate to settings
                        break;
                      case 'logout':
                        await ref.read(authNotifierProvider.notifier).logout();
                        break;
                    }
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMobileDrawer(ThemeData theme, UserModel user) {
    return Drawer(
      child: Column(
        children: [
          // Drawer Header
          Container(
            height: 200,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  theme.colorScheme.primary,
                  theme.colorScheme.primary.withOpacity(0.8),
                ],
              ),
            ),
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    CircleAvatar(
                      radius: 30,
                      backgroundColor: Colors.white.withOpacity(0.2),
                      child: Text(
                        user.displayName.isNotEmpty 
                            ? user.displayName[0].toUpperCase()
                            : 'U',
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      user.displayName,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        user.role.replaceAll('_', ' '),
                        style: const TextStyle(
                          fontSize: 12,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          
          // Navigation Items
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 8),
              children: _buildNavigationItems(theme, user),
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildNavigationItems(ThemeData theme, UserModel user) {
    final items = <NavigationItem>[];

    // Common items
    items.addAll([
      NavigationItem(
        icon: Icons.dashboard_outlined,
        activeIcon: Icons.dashboard,
        label: 'Dashboard',
        route: '/dashboard',
      ),
      NavigationItem(
        icon: Icons.local_shipping_outlined,
        activeIcon: Icons.local_shipping,
        label: 'Lorries',
        route: '/lorries',
      ),
      NavigationItem(
        icon: Icons.people_outline,
        activeIcon: Icons.people,
        label: 'Farmers',
        route: '/farmers',
      ),
    ]);

    // Role-specific items
    switch (user.role) {
      case AppConstants.farmAdminRole:
        items.addAll([
          NavigationItem(
            icon: Icons.assignment_outlined,
            activeIcon: Icons.assignment,
            label: 'Lorry Requests',
            route: '/lorry-requests',
          ),
          NavigationItem(
            icon: Icons.analytics_outlined,
            activeIcon: Icons.analytics,
            label: 'Reports',
            route: '/reports',
          ),
          NavigationItem(
            icon: Icons.settings_outlined,
            activeIcon: Icons.settings,
            label: 'Settings',
            route: '/settings',
          ),
        ]);
        break;
        
      case AppConstants.fieldManagerRole:
        items.addAll([
          NavigationItem(
            icon: Icons.add_box_outlined,
            activeIcon: Icons.add_box,
            label: 'New Delivery',
            route: '/delivery-entry',
          ),
          NavigationItem(
            icon: Icons.assignment_outlined,
            activeIcon: Icons.assignment,
            label: 'Lorry Requests',
            route: '/lorry-requests',
          ),
          NavigationItem(
            icon: Icons.analytics_outlined,
            activeIcon: Icons.analytics,
            label: 'Reports',
            route: '/reports',
          ),
        ]);
        break;
        
      case AppConstants.farmerRole:
        items.addAll([
          NavigationItem(
            icon: Icons.history_outlined,
            activeIcon: Icons.history,
            label: 'My Deliveries',
            route: '/my-deliveries',
          ),
          NavigationItem(
            icon: Icons.account_balance_wallet_outlined,
            activeIcon: Icons.account_balance_wallet,
            label: 'Payments',
            route: '/payments',
          ),
        ]);
        break;
    }

    return items.map((item) => _buildNavigationItem(theme, item)).toList();
  }

  Widget _buildNavigationItem(ThemeData theme, NavigationItem item) {
    final isActive = widget.currentRoute == item.route;
    
    return Container(
      margin: EdgeInsets.symmetric(
        horizontal: _isCollapsed ? 8 : 12,
        vertical: 2,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            // Use GoRouter for navigation
            if (item.route.startsWith('/')) {
              context.go(item.route);
            }
          },
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: EdgeInsets.symmetric(
              horizontal: _isCollapsed ? 0 : 16,
              vertical: 12,
            ),
            decoration: BoxDecoration(
              color: isActive 
                  ? theme.colorScheme.primary.withOpacity(0.1)
                  : Colors.transparent,
              borderRadius: BorderRadius.circular(12),
              border: isActive
                  ? Border.all(
                      color: theme.colorScheme.primary.withOpacity(0.3),
                      width: 1,
                    )
                  : null,
            ),
            child: Row(
              children: [
                Container(
                  width: 40,
                  alignment: Alignment.center,
                  child: Icon(
                    isActive ? item.activeIcon : item.icon,
                    color: isActive 
                        ? theme.colorScheme.primary
                        : theme.colorScheme.onSurface.withOpacity(0.7),
                    size: 22,
                  ),
                ),
                
                if (!_isCollapsed) ...[
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      item.label,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: isActive 
                            ? theme.colorScheme.primary
                            : theme.colorScheme.onSurface.withOpacity(0.8),
                        fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildUserProfile(ThemeData theme, UserModel user) {
    if (_isCollapsed) {
      return Container(
        padding: const EdgeInsets.all(16),
        child: CircleAvatar(
          radius: 20,
          backgroundColor: theme.colorScheme.primary,
          child: Text(
            user.displayName.isNotEmpty 
                ? user.displayName[0].toUpperCase()
                : 'U',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(
            color: theme.dividerColor.withOpacity(0.1),
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 20,
            backgroundColor: theme.colorScheme.primary,
            child: Text(
              user.displayName.isNotEmpty 
                  ? user.displayName[0].toUpperCase()
                  : 'U',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  user.displayName,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  user.role.replaceAll('_', ' '),
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurface.withOpacity(0.6),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _getPageTitle() {
    switch (widget.currentRoute) {
      case '/dashboard':
        return 'Dashboard';
      case '/lorries':
        return 'Lorry Management';
      case '/farmers':
        return 'Farmer Management';
      case '/lorry-requests':
        return 'Lorry Requests';
      case '/delivery-entry':
        return 'New Delivery';
      case '/reports':
        return 'Reports & Analytics';
      case '/settings':
        return 'Settings';
      case '/my-deliveries':
        return 'My Deliveries';
      case '/payments':
        return 'Payment History';
      default:
        return 'FarmTally';
    }
  }
}

class NavigationItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final String route;

  NavigationItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.route,
  });
}