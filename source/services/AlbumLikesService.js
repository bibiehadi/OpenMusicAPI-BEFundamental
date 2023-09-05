const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const BadRequestError = require('../exceptions/BadRequestError');

class AlbumLikesService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbumLike(usersId, albumId) {
    const id = `likes-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const query = {
      text: 'INSERT INTO user_album_likes VALUES ($1, $2, $3, $4, $4) RETURNING id',
      values: [id, usersId, albumId, createdAt],
    };

    // eslint-disable-next-line no-underscore-dangle
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album like telah tersedia');
    }
    return result.rows[0].id;
  }

  async getAlbumLike(userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };
    const result = await this._pool.query(query);

    if (result.rowCount) {
      throw new BadRequestError('Album telah anda like.');
    }
  }

  async getAlbumLikesByAlbumId(albumId){
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
      values: [albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album like belum ada');
    }
    return result.rows;
  }

  async deleteAlbumLike(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album like tidak berhasil dihapus, Album like tidak dapat ditemukan');
    }
  }
}

module.exports = AlbumLikesService;
