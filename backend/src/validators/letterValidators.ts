import Joi from 'joi';

export const createLetterSchema = Joi.object({
  officialId: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid official ID',
    'any.required': 'Official ID is required',
  }),
  subject: Joi.string().min(5).max(500).required().messages({
    'string.min': 'Subject must be at least 5 characters',
    'string.max': 'Subject cannot exceed 500 characters',
    'any.required': 'Subject is required',
  }),
  body: Joi.string().min(50).max(10000).required().messages({
    'string.min': 'Letter body must be at least 50 characters',
    'string.max': 'Letter body cannot exceed 10,000 characters',
    'any.required': 'Letter body is required',
  }),
  letterType: Joi.string().valid('letter', 'memo').default('letter'),
  issueCategory: Joi.string().max(100).optional(),
  sealType: Joi.string().valid('state', 'federal', 'none').default('none'),
  visibility: Joi.string()
    .valid('private', 'community', 'public')
    .default('private'),
});

export const updateLetterSchema = Joi.object({
  subject: Joi.string().min(5).max(500).optional(),
  body: Joi.string().min(50).max(10000).optional(),
  issueCategory: Joi.string().max(100).optional(),
  visibility: Joi.string().valid('private', 'community', 'public').optional(),
});
