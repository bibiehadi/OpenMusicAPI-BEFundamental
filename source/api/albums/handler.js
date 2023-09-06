class AlbumsHandler {
  constructor(albumsService, songsService, albumLikesService, storageService, validator) {
    this._albumsService = albumsService;
    this._songsService = songsService;
    this._albumLikesService = albumLikesService;
    this._storageService = storageService;
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
    const data = {
      id: dataAlbum.id,
      name: dataAlbum.name,
      year: dataAlbum.year,
      coverUrl: dataAlbum.cover ? `http://${process.env.HOST}:${process.env.PORT}/albums/covers/${dataAlbum.cover}` : null,
    };
    const songs = await this._songsService.getSongsByAlbumId(id);
    const album = { ...data, songs };

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

  async getAlbumLikesCountHandler(request, h) {
    const { id: albumId } = request.params;
    const likes = await this._albumLikesService.getAlbumLikesByAlbumId(albumId);
    const response = h.response({
      status: 'success',
      data: {
        likes: likes.data.length,
      },
    });
    if (likes.source === 'cache') response.header('X-Data-Source', 'cache');
    return response;
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

  async postUploadCoverImageHandler(request, h) {
    const { cover } = request.payload;
    this._validator.validateCoverImageHeaders(cover.hapi.headers);
    const { id: albumId } = request.params;

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const dataAlbum = await this._albumsService.getAlbumById(albumId);

    dataAlbum.cover = filename;

    await this._albumsService.editAlbumById(albumId, dataAlbum);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }
}

module.exports = AlbumsHandler;
