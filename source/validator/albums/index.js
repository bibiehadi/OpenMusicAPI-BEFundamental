const { AlbumPayloadSchema, AlbumLikePayloadSchema} = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const AlbumValidator = {
  validateAlbumPayload: (payload) => {
    const validationResult = AlbumPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateAlbumLikePayload: (payload) => {
    const validationResult = AlbumLikePayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AlbumValidator;
