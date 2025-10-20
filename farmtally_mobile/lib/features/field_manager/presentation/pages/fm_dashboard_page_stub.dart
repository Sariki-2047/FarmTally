import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/domain/entities/user.dart';
import '../../../../core/presentation/providers/auth_provider.dart';

class FmDashboardPageStub extends ConsumerWidget {
  const FmDashboardPageStub({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Field Manager Dashboard'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Welcome, ${user?.displayName ?? 'Field Manager'}!',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 24),
            const Card(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Field Manager Dashboard',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 8),
                    Text('This page is being migrated to the new architecture.'),
                    SizedBox(height: 8),
                    Text('Features available:'),
                    SizedBox(height: 8),
                    Text('• View and manage lorry trips'),
                    Text('• Record farmer deliveries'),
                    Text('• Create lorry requests'),
                    Text('• Generate reports'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Quick Actions:',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Feature coming soon')),
                    );
                  },
                  icon: const Icon(Icons.local_shipping),
                  label: const Text('My Lorries'),
                ),
                ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Feature coming soon')),
                    );
                  },
                  icon: const Icon(Icons.request_page),
                  label: const Text('Lorry Requests'),
                ),
                ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Feature coming soon')),
                    );
                  },
                  icon: const Icon(Icons.people),
                  label: const Text('Farmers'),
                ),
                ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Feature coming soon')),
                    );
                  },
                  icon: const Icon(Icons.analytics),
                  label: const Text('Reports'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}