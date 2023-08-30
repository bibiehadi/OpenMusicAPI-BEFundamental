class PlaylistsHandler {
  constructor(service, songsService, validator) {
    this._playlistsService = service;
    this._songsService = songsService;
    this._validator = validator;
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    const playlistId = await this._playlistsService.addPlaylist(name, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Authentication berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._playlistsService.getPlaylists(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._playlistsService.verifyDeletePlaylistOwner(id, credentialId);
    await this._playlistsService.deletePlaylistById(id, credentialId);
    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongPlaylistHandler(request, h) {
    this._validator.validatePostSongPlaylistPayload(request.payload);
    const { id: playlistId } = request.params;
    const { songId: payload } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._songsService.getSongById(payload);
    const songId = await this._playlistsService.addSongPlaylist(playlistId, payload);
    await this._playlistsService.addPlaylistSongActivity(playlistId, songId, credentialId, 'add');
    const response = h.response({
      status: 'success',
      message: 'Song berhasil ditambahkan ke Playlist',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongPlaylistHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    const dataPlaylist = await this._playlistsService.getPlaylistById(playlistId, credentialId);
    const songs = await this._songsService.getSongsByPlaylistId(dataPlaylist.id);
    const playlist = { ...dataPlaylist, songs };
    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongPlaylistHandler(request, h) {
    this._validator.validateDeleteSongPlaylistPayload(request.payload);
    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._playlistsService.deleteSongPlaylist(playlistId, songId);
    await this._playlistsService.addPlaylistSongActivity(playlistId, songId, credentialId, 'delete');
    return {
      status: 'success',
      message: 'Song berhasil dihapus dari playlist',
    };
  }

  async getPlaylistSongActivities(request, h) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._playlistsService.getPlaylistById(playlistId, credentialId);
    const activities = await this._playlistsService.getPlaylistSongActivities(playlistId);
    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }
}

module.exports = PlaylistsHandler;
