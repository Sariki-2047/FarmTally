import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Theme provider
final themeModeProvider = StateProvider<ThemeMode>((ref) => ThemeMode.system);

// Locale provider
final localeProvider = StateProvider<Locale>((ref) => const Locale('en', 'US'));