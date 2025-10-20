import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/presentation/providers/auth_provider.dart';

// Temporary stub pages for field manager features
// These will be properly implemented after migration

class FmMyLorriesPageStub extends ConsumerWidget {
  const FmMyLorriesPageStub({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Lorries')),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.local_shipping, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('My Lorries', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            SizedBox(height: 8),
            Text('This feature is being migrated to the new architecture.'),
            SizedBox(height: 16),
            Text('Coming soon!'),
          ],
        ),
      ),
    );
  }
}

class FmTripDetailPageStub extends ConsumerWidget {
  final String tripId;
  
  const FmTripDetailPageStub({super.key, required this.tripId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Trip Details')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.trip_origin, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            Text('Trip Details: $tripId', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('This feature is being migrated to the new architecture.'),
            const SizedBox(height: 16),
            const Text('Coming soon!'),
          ],
        ),
      ),
    );
  }
}

class FmLorryRequestsPageStub extends ConsumerWidget {
  const FmLorryRequestsPageStub({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Lorry Requests')),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.request_page, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('Lorry Requests', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            SizedBox(height: 8),
            Text('This feature is being migrated to the new architecture.'),
            SizedBox(height: 16),
            Text('Coming soon!'),
          ],
        ),
      ),
    );
  }
}

class FmFarmersPageStub extends ConsumerWidget {
  const FmFarmersPageStub({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Farmers')),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.people, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('Farmers', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            SizedBox(height: 8),
            Text('This feature is being migrated to the new architecture.'),
            SizedBox(height: 16),
            Text('Coming soon!'),
          ],
        ),
      ),
    );
  }
}

class FmReportsPageStub extends ConsumerWidget {
  const FmReportsPageStub({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Reports')),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.analytics, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('Reports', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            SizedBox(height: 8),
            Text('This feature is being migrated to the new architecture.'),
            SizedBox(height: 16),
            Text('Coming soon!'),
          ],
        ),
      ),
    );
  }
}