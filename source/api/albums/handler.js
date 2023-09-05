class AlbumsHandler {
  constructor(albumsService, songsService, albumLikesService, validator) {
    this._albumsService = albumsService;
    this._songsService = songsService;
    this._albumLikesService = albumLikesService;
    this._validator = validator;
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const albumId = await this._albumsService.addAlbum({ name, year });
    const response = h.response({
      status: 'success',
      message: 'Album added success!',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumsHandler() {
    const albums = await this._albumsService.getAlbums();
    return {
      status: 'success',
      data: {
        albums,
      },
    };
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const dataAlbum = await this._albumsService.getAlbumById(id);
    const songs = await this._songsService.getSongsByAlbumId(id);
    const album = { ...dataAlbum, songs };

    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;
    await this._albumsService.editAlbumById(id, request.payload);
    return {
      status: 'success',
      message: 'Album has been updated',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._albumsService.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Album has been deleted',
    };
  }

  async postAlbumLikeHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._albumsService.getAlbumById(albumId);
    await this._albumLikesService.getAlbumLike(credentialId, albumId);
    await this._albumLikesService.addAlbumLike(credentialId, albumId);
    const response = h.response({
      status: 'success',
      message: 'Menyukai album berhasil!',
    });
    response.code(201);
    return response;
  }

  async getAlbumLikesCountHandler(request, h){
    const { id: albumId } = request.params;
    const likes = await this._albumLikesService.getAlbumLikesByAlbumId(albumId);
    return h.response({
      status: 'success',
      data: {
        likes: likes.length,
      },
    });
  }

  async deleteAlbumLikeHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._albumLikesService.deleteAlbumLike(credentialId, albumId);
    return {
      status: 'success',
      message: 'Menyukai album berhasil dihapus',
    };
  }
}

module.exports = AlbumsHandler;
