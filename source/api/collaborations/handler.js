class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, usersService, validator) {
    this._collabortionsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._usersService = usersService;
    this._validator = validator;
  }

  async postCollaborationHandler(request, h) {
    this._validator.validatePostCollaborationPayload(request.payload);
    const { playlistId, userId } = request.payload;
    await this._usersService.getUserById(userId);
    const { id: credentialId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    const collaborationId = await this._collabortionsService.addCollaboration(playlistId, userId);
    const response = h.response({
      status: 'success',
      message: 'Collaboration berhasil ditambahkan!',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request, h) {
    this._validator.validateDeleteCollaborationPayload(request.payload);
    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    await this._playlistsService.verifyDeletePlaylistOwner(playlistId, credentialId);
    await this._collabortionsService.deleteCollaboration(playlistId, userId);
    return {
      status: 'success',
      message: 'Mengahapus collaboration user berhasil',
    };
  }
}

module.exports = CollaborationsHandler;
