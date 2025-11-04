import Joi from 'joi';

export const voterVerificationSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).required().messages({
    'string.min': 'First name must be at least 2 characters',
    'string.max': 'First name cannot exceed 100 characters',
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Last name must be at least 2 characters',
    'string.max': 'Last name cannot exceed 100 characters',
    'any.required': 'Last name is required',
  }),
  dateOfBirth: Joi.date().max('now').required().messages({
    'date.max': 'Date of birth cannot be in the future',
    'any.required': 'Date of birth is required',
  }),
  addressLine1: Joi.string().max(255).required().messages({
    'any.required': 'Address is required',
  }),
  addressLine2: Joi.string().max(255).allow('', null).optional(),
  city: Joi.string().max(100).required().messages({
    'any.required': 'City is required',
  }),
  state: Joi.string().length(2).uppercase().required().messages({
    'string.length': 'State must be a 2-letter code',
    'any.required': 'State is required',
  }),
  zipCode: Joi.string()
    .pattern(/^\d{5}(-\d{4})?$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid ZIP code',
      'any.required': 'ZIP code is required',
    }),
});

export const manualVerificationSchema = Joi.object({
  verificationId: Joi.string().uuid().required(),
  approved: Joi.boolean().required(),
  rejectionReason: Joi.string().when('approved', {
    is: false,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});
