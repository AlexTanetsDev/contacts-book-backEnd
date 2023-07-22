const { Schema, model } = require("mongoose");
const Joi = require("joi");

const { handleMongooseError } = require("../helpers");

const emailPattern =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const phonePattern =
  /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;

const datePattern = /^(0?[1-9]|[12][0-9]|3[01])[/-](0?[1-9]|1[012])[/-]\d{4}$/;

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
      match: emailPattern,
    },
    phone: {
      type: String,
      match: phonePattern,
      required: [true, "Set phone for contact"],
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    birthday: {
      type: String,
      match: datePattern,
    },
    relatedInfo: {
      type: String,
      default: "",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

contactSchema.post("save", handleMongooseError);

const addSchema = Joi.object({
  name: Joi.string()
    .required()
    .messages({ "any.required": "missing field name" }),
  email: Joi.string().pattern(emailPattern).messages({
    "string.pattern.base": "It's Not a valid email! Please check your input",
  }),
  phone: Joi.string().pattern(phonePattern).required().messages({
    "string.pattern.base":
      "Phone number must be digits and can contain spaces, dashes, parentheses and can start with +",
    "any.required": "missing field phone",
  }),
  favorite: Joi.boolean(),
  birthday: Joi.string().pattern(datePattern).messages({
    "string.pattern.base": "It's Not a valid date! Please check your input",
  }),
  relatedInfo: Joi.string(),
});

const updateContactSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().pattern(emailPattern).messages({
    "string.pattern.base": "It's Not a valid email! Please check your input",
  }),
  phone: Joi.string().pattern(phonePattern).messages({
    "string.pattern.base":
      "Phone number must be digits and can contain spaces, dashes, parentheses and can start with +",
  }),
  favorite: Joi.boolean(),
  birthday: Joi.string().pattern(datePattern).messages({
    "string.pattern.base": "It's Not a valid date! Please check your input",
  }),
});

const updateFavoriteSchema = Joi.object({
  favorite: Joi.boolean()
    .required()
    .messages({ "any.required": "missing field favorite" }),
});

const updateContactInfoSchema = Joi.object({
  relatedInfo: Joi.string()
    .required()
    .messages({ "any.required": "Contact info is required" }),
});

const schemas = {
  addSchema,
  updateFavoriteSchema,
  updateContactSchema,
  updateContactInfoSchema,
};

const Contact = model("contact", contactSchema);

module.exports = {
  Contact,
  schemas,
};
