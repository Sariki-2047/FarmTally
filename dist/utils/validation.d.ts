import Joi from 'joi';
export declare const commonSchemas: {
    uuid: Joi.StringSchema<string>;
    email: Joi.StringSchema<string>;
    phone: Joi.StringSchema<string>;
    password: Joi.StringSchema<string>;
    organizationCode: Joi.StringSchema<string>;
    date: Joi.DateSchema<Date>;
    decimal: Joi.NumberSchema<number>;
    positiveInteger: Joi.NumberSchema<number>;
};
export declare const authSchemas: {
    register: Joi.ObjectSchema<any>;
    login: Joi.ObjectSchema<any>;
    refreshToken: Joi.ObjectSchema<any>;
    forgotPassword: Joi.ObjectSchema<any>;
    resetPassword: Joi.ObjectSchema<any>;
    changePassword: Joi.ObjectSchema<any>;
};
export declare const organizationSchemas: {
    create: Joi.ObjectSchema<any>;
    update: Joi.ObjectSchema<any>;
};
export declare const lorrySchemas: {
    create: Joi.ObjectSchema<any>;
    update: Joi.ObjectSchema<any>;
};
export declare const lorryRequestSchemas: {
    create: Joi.ObjectSchema<any>;
    update: Joi.ObjectSchema<any>;
    approve: Joi.ObjectSchema<any>;
    reject: Joi.ObjectSchema<any>;
};
export declare const farmerSchemas: {
    create: Joi.ObjectSchema<any>;
    update: Joi.ObjectSchema<any>;
};
export declare const deliverySchemas: {
    create: Joi.ObjectSchema<any>;
    update: Joi.ObjectSchema<any>;
};
export declare const advancePaymentSchemas: {
    create: Joi.ObjectSchema<any>;
    update: Joi.ObjectSchema<any>;
};
export declare const querySchemas: {
    pagination: Joi.ObjectSchema<any>;
    dateRange: Joi.ObjectSchema<any>;
    status: Joi.ObjectSchema<any>;
};
//# sourceMappingURL=validation.d.ts.map