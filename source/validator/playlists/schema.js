const Joi = require('joi');

const PostPlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const PostSongPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

const DeleteSongPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

const ExportsPlaylistPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
});

module.exports = {
  PostSongPlaylistPayloadSchema,
  PostPlaylistPayloadSchema,
  DeleteSongPlaylistPayloadSchema,
  ExportsPlaylistPayloadSchema,
};
