import Joi from "joi";

export const schemaMovement = Joi.object({
  type: Joi.string().required(),
  value: Joi.number().required(),
  desc: Joi.string().required(),
});
