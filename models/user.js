const { Schema, model } = require("mongoose");
const Joi = require("joi");

const { handleMongooseError } = require("../helpers");

const emailPattern =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  password: {
    type: String,
    required: [true, "Set password for user"],
    minlength: 6,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    match: emailPattern,
    unique: true,
  },
  token: {
    type: String,
    default: "",
  },
  avatarURL: {
    type: String,
    required: true,
  },
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required: [true, "Verify token is required"],
  },
  verificationKey: {
    type: String,
    required: [true, "Verify key is required"],
  },
  verificationCount: {
    type: Number,
    default: 1,
  },
});

const authSchema = Joi.object({
  password: Joi.string().min(6).required(),
  email: Joi.string().pattern(emailPattern).required(),
  name: Joi.string().min(2).required(),
});
const loginSchema = Joi.object({
  password: Joi.string().min(6).required(),
  email: Joi.string().pattern(emailPattern).required(),
});

const verifySchema = Joi.object({
  verificationToken: Joi.string()
    .required()
    .messages({ "any.required": `"verificationToken" is a required field` }),
  verificationKey: Joi.string()
    .required()
    .messages({ "any.required": `"verificationKey" is a required field` }),
});

const verifyResendSchema = Joi.object({
  email: Joi.string()
    .required()
    .messages({ "any.required": `"email" is a required field` }),
});

userSchema.post("save", handleMongooseError);

const schemas = {
  authSchema,
  verifySchema,
  verifyResendSchema,
  loginSchema,
};

const User = model("user", userSchema);

module.exports = {
  User,
  schemas,
};
