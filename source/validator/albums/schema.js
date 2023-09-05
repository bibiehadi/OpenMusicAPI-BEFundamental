const Joi = require('joi');

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().required(),
});

const AlbumLikePayloadSchema = Joi.object({
  albumId: Joi.string().required(),
  userId: Joi.string().required(),
});

module.exports = { AlbumPayloadSchema, AlbumLikePayloadSchema };
