import 'package:freezed_annotation/freezed_annotation.dart';

part 'lorry_request.freezed.dart';
part 'lorry_request.g.dart';

@freezed
class LorryRequest with _$LorryRequest {
  const factory LorryRequest({
    required String id,
    required String fieldManagerId,
    required String organizationId,
    required String location,
    required String purpose,
    required DateTime requestedAt,
    required String urgency, // 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
    required int estFarmers,
    required double estWeightKg,
    required String status, // 'PENDING', 'APPROVED', 'REJECTED', 'ASSIGNED', 'COMPLETED'
    String? assignedLorryNumber,
    String? assignedLorryId,
    String? rejectionReason,
    String? notes,
    DateTime? approvedAt,
    String? approvedBy,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _LorryRequest;

  factory LorryRequest.fromJson(Map<String, dynamic> json) => _$LorryRequestFromJson(json);
}

extension LorryRequestExtension on LorryRequest {
  bool get isPending => status == 'PENDING';
  bool get isApproved => status == 'APPROVED';
  bool get isRejected => status == 'REJECTED';
  bool get isAssigned => status == 'ASSIGNED';
  bool get isCompleted => status == 'COMPLETED';
  
  String get statusDisplay {
    switch (status) {
      case 'PENDING':
        return 'Pending Approval';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      case 'ASSIGNED':
        return 'Lorry Assigned';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status;
    }
  }
  
  String get urgencyDisplay {
    switch (urgency) {
      case 'LOW':
        return 'Low Priority';
      case 'MEDIUM':
        return 'Medium Priority';
      case 'HIGH':
        return 'High Priority';
      case 'URGENT':
        return 'Urgent';
      default:
        return urgency;
    }
  }
}