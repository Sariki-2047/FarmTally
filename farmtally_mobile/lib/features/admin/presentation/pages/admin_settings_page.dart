import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AdminSettingsPage extends ConsumerStatefulWidget {
  const AdminSettingsPage({super.key});

  @override
  ConsumerState<AdminSettingsPage> createState() => _AdminSettingsPageState();
}

class _AdminSettingsPageState extends ConsumerState<AdminSettingsPage> {
  final _formKey = GlobalKey<FormState>();
  
  // Organization Profile
  final _orgNameController = TextEditingController(text: 'Agri Corp Ltd');
  final _orgAddressController = TextEditingController(text: '123 Farm Street, Chennai, Tamil Nadu');
  final _orgContactController = TextEditingController(text: '+91 9876543200');
  
  // Pricing Presets
  final List<Map<String, dynamic>> _pricingPresets = [
    {'moistureRange': '≤ 14%', 'pricePerKg': 75.0},
    {'moistureRange': '14.1% - 16%', 'pricePerKg': 70.0},
    {'moistureRange': '16.1% - 18%', 'pricePerKg': 65.0},
    {'moistureRange': '> 18%', 'pricePerKg': 60.0},
  ];
  
  // Quality Rules
  double _defaultDeductionKg = 5.0;
  double _maxDeductionPercent = 10.0;
  bool _roundToNearestKg = true;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Admin Settings',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 24),
              
              // Organization Profile Section
              _buildOrganizationProfile(),
              const SizedBox(height: 32),
              
              // Pricing Presets Section
              _buildPricingPresets(),
              const SizedBox(height: 32),
              
              // Quality Rules Section
              _buildQualityRules(),
              const SizedBox(height: 32),
              
              // Banking Settings Section
              _buildBankingSettings(),
              const SizedBox(height: 32),
              
              // Save Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _saveSettings,
                  icon: const Icon(Icons.save),
                  label: const Text('Save Settings'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.all(16),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOrganizationProfile() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Organization Profile',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _orgNameController,
              decoration: const InputDecoration(
                labelText: 'Organization Name',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter organization name';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _orgAddressController,
              decoration: const InputDecoration(
                labelText: 'Address',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter address';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _orgContactController,
              decoration: const InputDecoration(
                labelText: 'Contact Number',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter contact number';
                }
                return null;
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPricingPresets() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  'Pricing Presets',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const Spacer(),
                IconButton(
                  onPressed: _addPricingPreset,
                  icon: const Icon(Icons.add),
                  tooltip: 'Add Pricing Preset',
                ),
              ],
            ),
            const SizedBox(height: 16),
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _pricingPresets.length,
              separatorBuilder: (context, index) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final preset = _pricingPresets[index];
                return Row(
                  children: [
                    Expanded(
                      flex: 2,
                      child: TextFormField(
                        initialValue: preset['moistureRange'],
                        decoration: const InputDecoration(
                          labelText: 'Moisture Range',
                          border: OutlineInputBorder(),
                        ),
                        onChanged: (value) {
                          _pricingPresets[index]['moistureRange'] = value;
                        },
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextFormField(
                        initialValue: preset['pricePerKg'].toString(),
                        decoration: const InputDecoration(
                          labelText: 'Price/kg (₹)',
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.number,
                        onChanged: (value) {
                          _pricingPresets[index]['pricePerKg'] = double.tryParse(value) ?? 0.0;
                        },
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton(
                      onPressed: () => _removePricingPreset(index),
                      icon: const Icon(Icons.delete, color: Colors.red),
                      tooltip: 'Remove',
                    ),
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQualityRules() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Quality Rules',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    initialValue: _defaultDeductionKg.toString(),
                    decoration: const InputDecoration(
                      labelText: 'Default Quality Deduction (kg)',
                      border: OutlineInputBorder(),
                    ),
                    keyboardType: TextInputType.number,
                    onChanged: (value) {
                      _defaultDeductionKg = double.tryParse(value) ?? 0.0;
                    },
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: TextFormField(
                    initialValue: _maxDeductionPercent.toString(),
                    decoration: const InputDecoration(
                      labelText: 'Max Deduction (%)',
                      border: OutlineInputBorder(),
                    ),
                    keyboardType: TextInputType.number,
                    onChanged: (value) {
                      _maxDeductionPercent = double.tryParse(value) ?? 0.0;
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            SwitchListTile(
              title: const Text('Round to Nearest Kg'),
              subtitle: const Text('Round final weight calculations to nearest kilogram'),
              value: _roundToNearestKg,
              onChanged: (value) {
                setState(() {
                  _roundToNearestKg = value;
                });
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBankingSettings() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Banking & Payout Settings',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            const ListTile(
              leading: Icon(Icons.account_balance),
              title: Text('Default Bank Account'),
              subtitle: Text('XXXX-XXXX-1234 - State Bank of India'),
              trailing: Icon(Icons.edit),
              contentPadding: EdgeInsets.zero,
            ),
            const Divider(),
            const ListTile(
              leading: Icon(Icons.schedule),
              title: Text('Auto Payout Schedule'),
              subtitle: Text('Weekly on Fridays'),
              trailing: Icon(Icons.edit),
              contentPadding: EdgeInsets.zero,
            ),
            const Divider(),
            const ListTile(
              leading: Icon(Icons.security),
              title: Text('Payment Approval'),
              subtitle: Text('Require admin approval for payments > ₹50,000'),
              trailing: Switch(value: true, onChanged: null),
              contentPadding: EdgeInsets.zero,
            ),
          ],
        ),
      ),
    );
  }

  void _addPricingPreset() {
    setState(() {
      _pricingPresets.add({
        'moistureRange': '',
        'pricePerKg': 0.0,
      });
    });
  }

  void _removePricingPreset(int index) {
    if (_pricingPresets.length > 1) {
      setState(() {
        _pricingPresets.removeAt(index);
      });
    }
  }

  void _saveSettings() {
    if (_formKey.currentState!.validate()) {
      // TODO: Implement settings save functionality
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Settings saved successfully'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  @override
  void dispose() {
    _orgNameController.dispose();
    _orgAddressController.dispose();
    _orgContactController.dispose();
    super.dispose();
  }
}