import 'package:flutter/material.dart';

class LeafLogo extends StatelessWidget {
  final double size;
  final Color color;
  final bool showGlow;

  const LeafLogo({
    super.key,
    this.size = 60,
    this.color = const Color(0xFF2E7D32),
    this.showGlow = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: showGlow
          ? BoxDecoration(
              borderRadius: BorderRadius.circular(size / 4),
              boxShadow: [
                BoxShadow(
                  color: color.withOpacity(0.3),
                  blurRadius: 20,
                  spreadRadius: 5,
                ),
              ],
            )
          : null,
      child: CustomPaint(
        size: Size(size, size),
        painter: LeafPainter(color: color),
      ),
    );
  }
}

class LeafPainter extends CustomPainter {
  final Color color;

  LeafPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill
      ..strokeWidth = 2;

    final path = Path();
    
    // Create a leaf shape similar to your design
    final width = size.width;
    final height = size.height;
    
    // Start from the bottom center (stem)
    path.moveTo(width * 0.5, height * 0.95);
    
    // Left side of the leaf
    path.quadraticBezierTo(
      width * 0.15, height * 0.7,  // Control point
      width * 0.1, height * 0.4,   // End point
    );
    
    path.quadraticBezierTo(
      width * 0.15, height * 0.15, // Control point
      width * 0.5, height * 0.05,  // Top point
    );
    
    // Right side of the leaf
    path.quadraticBezierTo(
      width * 0.85, height * 0.15, // Control point
      width * 0.9, height * 0.4,   // End point
    );
    
    path.quadraticBezierTo(
      width * 0.85, height * 0.7,  // Control point
      width * 0.5, height * 0.95,  // Back to stem
    );
    
    path.close();
    
    // Fill the leaf
    canvas.drawPath(path, paint);
    
    // Draw the central vein
    final veinPaint = Paint()
      ..color = color.withOpacity(0.3)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    
    final veinPath = Path();
    veinPath.moveTo(width * 0.5, height * 0.95);
    veinPath.quadraticBezierTo(
      width * 0.52, height * 0.6,
      width * 0.5, height * 0.05,
    );
    
    canvas.drawPath(veinPath, veinPaint);
    
    // Draw side veins
    final sideVeinPaint = Paint()
      ..color = color.withOpacity(0.2)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;
    
    // Left side veins
    for (int i = 1; i <= 3; i++) {
      final veinY = height * (0.3 + i * 0.15);
      final veinPath = Path();
      veinPath.moveTo(width * 0.5, veinY);
      veinPath.quadraticBezierTo(
        width * (0.4 - i * 0.05), veinY + height * 0.05,
        width * (0.25 + i * 0.05), veinY + height * 0.1,
      );
      canvas.drawPath(veinPath, sideVeinPaint);
    }
    
    // Right side veins
    for (int i = 1; i <= 3; i++) {
      final veinY = height * (0.3 + i * 0.15);
      final veinPath = Path();
      veinPath.moveTo(width * 0.5, veinY);
      veinPath.quadraticBezierTo(
        width * (0.6 + i * 0.05), veinY + height * 0.05,
        width * (0.75 - i * 0.05), veinY + height * 0.1,
      );
      canvas.drawPath(veinPath, sideVeinPaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// Animated version for splash screen
class AnimatedLeafLogo extends StatefulWidget {
  final double size;
  final Color color;
  final Duration duration;

  const AnimatedLeafLogo({
    super.key,
    this.size = 60,
    this.color = const Color(0xFF2E7D32),
    this.duration = const Duration(seconds: 2),
  });

  @override
  State<AnimatedLeafLogo> createState() => _AnimatedLeafLogoState();
}

class _AnimatedLeafLogoState extends State<AnimatedLeafLogo>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _rotationAnimation;
  late Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();
    
    _controller = AnimationController(
      duration: widget.duration,
      vsync: this,
    );

    _scaleAnimation = Tween<double>(
      begin: 0.5,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.elasticOut,
    ));

    _rotationAnimation = Tween<double>(
      begin: -0.1,
      end: 0.0,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOut,
    ));

    _glowAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeIn,
    ));

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: Transform.rotate(
            angle: _rotationAnimation.value,
            child: Container(
              width: widget.size,
              height: widget.size,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(widget.size / 4),
                boxShadow: [
                  BoxShadow(
                    color: widget.color.withOpacity(0.3 * _glowAnimation.value),
                    blurRadius: 20 * _glowAnimation.value,
                    spreadRadius: 5 * _glowAnimation.value,
                  ),
                ],
              ),
              child: LeafLogo(
                size: widget.size,
                color: widget.color,
              ),
            ),
          ),
        );
      },
    );
  }
}