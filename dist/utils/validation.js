"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.querySchemas = exports.advancePaymentSchemas = exports.deliverySchemas = exports.farmerSchemas = exports.lorryRequestSchemas = exports.lorrySchemas = exports.organizationSchemas = exports.authSchemas = exports.commonSchemas = void 0;
const joi_1 = __importDefault(require("joi"));
exports.commonSchemas = {
    uuid: joi_1.default.string().uuid().required(),
    email: joi_1.default.string().email().lowercase().trim(),
    phone: joi_1.default.string().pattern(/^\+?[1-9]\d{1,14}$/).message('Invalid phone number format'),
    password: joi_1.default.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
        .message('Password must contain at least 8 characters with uppercase, lowercase, number and special character'),
    organizationCode: joi_1.default.string().alphanum().min(2).max(10).uppercase(),
    date: joi_1.default.date().iso(),
    decimal: joi_1.default.number().precision(2).positive(),
    positiveInteger: joi_1.default.number().integer().positive(),
};
exports.authSchemas = {
    register: joi_1.default.object({
        email: exports.commonSchemas.email,
        phone: exports.commonSchemas.phone,
        password: exports.commonSchemas.password.required(),
        role: joi_1.default.string().valid('FARM_ADMIN', 'FIELD_MANAGER', 'FARMER').required(),
        organizationId: exports.commonSchemas.uuid.when('role', {
            is: joi_1.default.valid('FIELD_MANAGER', 'FARMER'),
            then: joi_1.default.required(),
            otherwise: joi_1.default.optional(),
        }),
        profile: joi_1.default.object({
            firstName: joi_1.default.string().min(2).max(50).required(),
            lastName: joi_1.default.string().min(2).max(50).required(),
            address: joi_1.default.string().max(500),
            idNumber: joi_1.default.string().max(50),
        }).required(),
    }).or('email', 'phone'),
    login: joi_1.default.object({
        email: exports.commonSchemas.email,
        phone: exports.commonSchemas.phone,
        password: joi_1.default.string().required(),
    }).or('email', 'phone'),
    refreshToken: joi_1.default.object({
        refreshToken: joi_1.default.string().required(),
    }),
    forgotPassword: joi_1.default.object({
        email: exports.commonSchemas.email,
        phone: exports.commonSchemas.phone,
    }).or('email', 'phone'),
    resetPassword: joi_1.default.object({
        token: joi_1.default.string().required(),
        newPassword: exports.commonSchemas.password.required(),
    }),
    changePassword: joi_1.default.object({
        currentPassword: joi_1.default.string().required(),
        newPassword: exports.commonSchemas.password.required(),
    }),
};
exports.organizationSchemas = {
    create: joi_1.default.object({
        name: joi_1.default.string().min(2).max(255).required(),
        code: exports.commonSchemas.organizationCode.required(),
        address: joi_1.default.string().max(500),
        phone: exports.commonSchemas.phone,
        email: exports.commonSchemas.email,
        settings: joi_1.default.object().default({}),
    }),
    update: joi_1.default.object({
        name: joi_1.default.string().min(2).max(255),
        address: joi_1.default.string().max(500),
        phone: exports.commonSchemas.phone,
        email: exports.commonSchemas.email,
        settings: joi_1.default.object(),
    }),
};
exports.lorrySchemas = {
    create: joi_1.default.object({
        name: joi_1.default.string().min(2).max(255).required(),
        licensePlate: joi_1.default.string().min(2).max(50).required(),
        capacity: exports.commonSchemas.positiveInteger.required(),
        assignedManagerId: joi_1.default.string().uuid().optional(),
        location: joi_1.default.object(),
        maintenanceSchedule: joi_1.default.object(),
    }),
    update: joi_1.default.object({
        name: joi_1.default.string().min(2).max(255),
        licensePlate: joi_1.default.string().min(2).max(50),
        capacity: exports.commonSchemas.positiveInteger,
        status: joi_1.default.string().valid('AVAILABLE', 'ASSIGNED', 'LOADING', 'IN_TRANSIT', 'SUBMITTED', 'PROCESSED', 'SENT_TO_DEALER', 'MAINTENANCE'),
        assignedManagerId: joi_1.default.string().uuid().allow(null),
        location: joi_1.default.object(),
        maintenanceSchedule: joi_1.default.object(),
    }),
};
exports.lorryRequestSchemas = {
    create: joi_1.default.object({
        requiredDate: exports.commonSchemas.date.required(),
        priority: joi_1.default.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').default('MEDIUM'),
        purpose: joi_1.default.string().min(10).max(1000).required(),
        estimatedDuration: exports.commonSchemas.positiveInteger,
        location: joi_1.default.string().max(500),
        expectedVolume: exports.commonSchemas.positiveInteger,
    }),
    update: joi_1.default.object({
        requiredDate: exports.commonSchemas.date,
        priority: joi_1.default.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
        purpose: joi_1.default.string().min(10).max(1000),
        estimatedDuration: exports.commonSchemas.positiveInteger,
        location: joi_1.default.string().max(500),
        expectedVolume: exports.commonSchemas.positiveInteger,
    }),
    approve: joi_1.default.object({
        assignedLorryId: exports.commonSchemas.uuid.required(),
    }),
    reject: joi_1.default.object({
        rejectionReason: joi_1.default.string().min(10).max(1000).required(),
    }),
};
exports.farmerSchemas = {
    create: joi_1.default.object({
        name: joi_1.default.string().min(2).max(255).required(),
        phone: exports.commonSchemas.phone.required(),
        email: exports.commonSchemas.email,
        address: joi_1.default.string().max(500),
        idNumber: joi_1.default.string().max(50),
        bankDetails: joi_1.default.object({
            bankName: joi_1.default.string().max(100),
            accountNumber: joi_1.default.string().max(50),
            accountName: joi_1.default.string().max(100),
            branchCode: joi_1.default.string().max(20),
        }),
    }),
    update: joi_1.default.object({
        name: joi_1.default.string().min(2).max(255),
        phone: exports.commonSchemas.phone,
        email: exports.commonSchemas.email,
        address: joi_1.default.string().max(500),
        idNumber: joi_1.default.string().max(50),
        bankDetails: joi_1.default.object({
            bankName: joi_1.default.string().max(100),
            accountNumber: joi_1.default.string().max(50),
            accountName: joi_1.default.string().max(100),
            branchCode: joi_1.default.string().max(20),
        }),
    }),
};
exports.deliverySchemas = {
    create: joi_1.default.object({
        deliveryDate: exports.commonSchemas.date.required(),
        bagsCount: exports.commonSchemas.positiveInteger.required(),
        individualWeights: joi_1.default.array().items(exports.commonSchemas.decimal).min(1).required(),
        moistureContent: joi_1.default.number().min(0).max(100).precision(2).required(),
        photos: joi_1.default.array().items(joi_1.default.string().uri()),
        notes: joi_1.default.string().max(1000),
    }),
    update: joi_1.default.object({
        bagsCount: exports.commonSchemas.positiveInteger,
        individualWeights: joi_1.default.array().items(exports.commonSchemas.decimal).min(1),
        moistureContent: joi_1.default.number().min(0).max(100).precision(2),
        photos: joi_1.default.array().items(joi_1.default.string().uri()),
        notes: joi_1.default.string().max(1000),
    }),
};
exports.advancePaymentSchemas = {
    create: joi_1.default.object({
        farmerId: exports.commonSchemas.uuid.required(),
        amount: exports.commonSchemas.decimal.required(),
        paymentMethod: joi_1.default.string().valid('CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CHECK').required(),
        paymentDate: exports.commonSchemas.date.required(),
        referenceNumber: joi_1.default.string().max(100),
        reason: joi_1.default.string().max(1000),
        notes: joi_1.default.string().max(1000),
        receiptPhoto: joi_1.default.string().uri(),
    }),
    update: joi_1.default.object({
        amount: exports.commonSchemas.decimal,
        paymentMethod: joi_1.default.string().valid('CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CHECK'),
        paymentDate: exports.commonSchemas.date,
        referenceNumber: joi_1.default.string().max(100),
        reason: joi_1.default.string().max(1000),
        notes: joi_1.default.string().max(1000),
        receiptPhoto: joi_1.default.string().uri(),
        status: joi_1.default.string().valid('ACTIVE', 'ADJUSTED', 'CANCELLED'),
    }),
};
exports.querySchemas = {
    pagination: joi_1.default.object({
        page: joi_1.default.number().integer().min(1).default(1),
        limit: joi_1.default.number().integer().min(1).max(100).default(20),
        sortBy: joi_1.default.string(),
        sortOrder: joi_1.default.string().valid('asc', 'desc').default('desc'),
    }),
    dateRange: joi_1.default.object({
        startDate: exports.commonSchemas.date,
        endDate: exports.commonSchemas.date,
    }),
    status: joi_1.default.object({
        status: joi_1.default.string(),
    }),
};
//# sourceMappingURL=validation.js.map