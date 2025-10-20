import Joi from 'joi';

// Common validation schemas
export const commonSchemas = {
  uuid: Joi.string().uuid().required(),
  email: Joi.string().email().lowercase().trim(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).message('Invalid phone number format'),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
    .message('Password must contain at least 8 characters with uppercase, lowercase, number and special character'),
  organizationCode: Joi.string().alphanum().min(2).max(10).uppercase(),
  date: Joi.date().iso(),
  decimal: Joi.number().precision(2).positive(),
  positiveInteger: Joi.number().integer().positive(),
};

// Auth validation schemas
export const authSchemas = {
  register: Joi.object({
    email: commonSchemas.email,
    phone: commonSchemas.phone,
    password: commonSchemas.password.required(),
    role: Joi.string().valid('FARM_ADMIN', 'FIELD_MANAGER', 'FARMER').required(),
    organizationId: commonSchemas.uuid.when('role', {
      is: Joi.valid('FIELD_MANAGER', 'FARMER'),
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    profile: Joi.object({
      firstName: Joi.string().min(2).max(50).required(),
      lastName: Joi.string().min(2).max(50).required(),
      address: Joi.string().max(500),
      idNumber: Joi.string().max(50),
    }).required(),
  }).or('email', 'phone'),

  login: Joi.object({
    email: commonSchemas.email,
    phone: commonSchemas.phone,
    password: Joi.string().required(),
  }).or('email', 'phone'),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),

  forgotPassword: Joi.object({
    email: commonSchemas.email,
    phone: commonSchemas.phone,
  }).or('email', 'phone'),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    newPassword: commonSchemas.password.required(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: commonSchemas.password.required(),
  }),
};

// Organization validation schemas
export const organizationSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    code: commonSchemas.organizationCode.required(),
    address: Joi.string().max(500),
    phone: commonSchemas.phone,
    email: commonSchemas.email,
    settings: Joi.object().default({}),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(255),
    address: Joi.string().max(500),
    phone: commonSchemas.phone,
    email: commonSchemas.email,
    settings: Joi.object(),
  }),
};

// Lorry validation schemas
export const lorrySchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    licensePlate: Joi.string().min(2).max(50).required(),
    capacity: commonSchemas.positiveInteger.required(),
    assignedManagerId: Joi.string().uuid().optional(),
    location: Joi.object(),
    maintenanceSchedule: Joi.object(),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(255),
    licensePlate: Joi.string().min(2).max(50),
    capacity: commonSchemas.positiveInteger,
    status: Joi.string().valid('AVAILABLE', 'ASSIGNED', 'LOADING', 'IN_TRANSIT', 'SUBMITTED', 'PROCESSED', 'SENT_TO_DEALER', 'MAINTENANCE'),
    assignedManagerId: Joi.string().uuid().allow(null),
    location: Joi.object(),
    maintenanceSchedule: Joi.object(),
  }),
};

// Lorry Request validation schemas
export const lorryRequestSchemas = {
  create: Joi.object({
    requiredDate: commonSchemas.date.required(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').default('MEDIUM'),
    purpose: Joi.string().min(10).max(1000).required(),
    estimatedDuration: commonSchemas.positiveInteger,
    location: Joi.string().max(500),
    expectedVolume: commonSchemas.positiveInteger,
  }),

  update: Joi.object({
    requiredDate: commonSchemas.date,
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
    purpose: Joi.string().min(10).max(1000),
    estimatedDuration: commonSchemas.positiveInteger,
    location: Joi.string().max(500),
    expectedVolume: commonSchemas.positiveInteger,
  }),

  approve: Joi.object({
    assignedLorryId: commonSchemas.uuid.required(),
  }),

  reject: Joi.object({
    rejectionReason: Joi.string().min(10).max(1000).required(),
  }),
};

// Farmer validation schemas
export const farmerSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    phone: commonSchemas.phone.required(),
    email: commonSchemas.email,
    address: Joi.string().max(500),
    idNumber: Joi.string().max(50),
    bankDetails: Joi.object({
      bankName: Joi.string().max(100),
      accountNumber: Joi.string().max(50),
      accountName: Joi.string().max(100),
      branchCode: Joi.string().max(20),
    }),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(255),
    phone: commonSchemas.phone,
    email: commonSchemas.email,
    address: Joi.string().max(500),
    idNumber: Joi.string().max(50),
    bankDetails: Joi.object({
      bankName: Joi.string().max(100),
      accountNumber: Joi.string().max(50),
      accountName: Joi.string().max(100),
      branchCode: Joi.string().max(20),
    }),
  }),
};

// Delivery validation schemas
export const deliverySchemas = {
  create: Joi.object({
    deliveryDate: commonSchemas.date.required(),
    bagsCount: commonSchemas.positiveInteger.required(),
    individualWeights: Joi.array().items(commonSchemas.decimal).min(1).required(),
    moistureContent: Joi.number().min(0).max(100).precision(2).required(),
    photos: Joi.array().items(Joi.string().uri()),
    notes: Joi.string().max(1000),
  }),

  update: Joi.object({
    bagsCount: commonSchemas.positiveInteger,
    individualWeights: Joi.array().items(commonSchemas.decimal).min(1),
    moistureContent: Joi.number().min(0).max(100).precision(2),
    photos: Joi.array().items(Joi.string().uri()),
    notes: Joi.string().max(1000),
  }),
};

// Advance Payment validation schemas
export const advancePaymentSchemas = {
  create: Joi.object({
    farmerId: commonSchemas.uuid.required(),
    amount: commonSchemas.decimal.required(),
    paymentMethod: Joi.string().valid('CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CHECK').required(),
    paymentDate: commonSchemas.date.required(),
    referenceNumber: Joi.string().max(100),
    reason: Joi.string().max(1000),
    notes: Joi.string().max(1000),
    receiptPhoto: Joi.string().uri(),
  }),

  update: Joi.object({
    amount: commonSchemas.decimal,
    paymentMethod: Joi.string().valid('CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CHECK'),
    paymentDate: commonSchemas.date,
    referenceNumber: Joi.string().max(100),
    reason: Joi.string().max(1000),
    notes: Joi.string().max(1000),
    receiptPhoto: Joi.string().uri(),
    status: Joi.string().valid('ACTIVE', 'ADJUSTED', 'CANCELLED'),
  }),
};

// Query parameter validation
export const querySchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),

  dateRange: Joi.object({
    startDate: commonSchemas.date,
    endDate: commonSchemas.date,
  }),

  status: Joi.object({
    status: Joi.string(),
  }),
};