"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = exports.validateParams = exports.validateQuery = exports.validate = void 0;
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true,
            convert: true,
        });
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));
            return res.status(400).json({
                error: 'Validation failed',
                message: 'The request data is invalid',
                details: errors,
            });
        }
        req[property] = value;
        next();
    };
};
exports.validate = validate;
const validateQuery = (schema) => (0, exports.validate)(schema, 'query');
exports.validateQuery = validateQuery;
const validateParams = (schema) => (0, exports.validate)(schema, 'params');
exports.validateParams = validateParams;
const validateBody = (schema) => (0, exports.validate)(schema, 'body');
exports.validateBody = validateBody;
//# sourceMappingURL=validation.middleware.js.map