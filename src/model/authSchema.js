import Joi from "joi";
export const schemaUser = Joi.object({
  user: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  confPassword: Joi.string().required(),
});
