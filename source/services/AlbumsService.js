const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const {
  mapDBToAlbumsModel,
  mapDBToDetailAlbumsModel,
} = require('../utils/Albums');

class AlbumsService {
  constructor() {
    // eslint-disable-next-line no-underscore-dangle
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const query = {
      text: 'INSERT INTO albums VALUES ($1, $2, $3, $5, $4, $4) RETURNING id',
      values: [id, name, year, createdAt, null],
    };

    // eslint-disable-next-line no-underscore-dangle
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album added failed');
    }
    return result.rows[0].id;
  }

  async getAlbums() {
    // eslint-disable-next-line no-underscore-dangle
    const result = await this._pool.query('SELECT * FROM albums');
    return result.rows.map(mapDBToAlbumsModel);
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    // eslint-disable-next-line no-underscore-dangle
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album not found');
    }
    return result.rows[0];
  }

  async editAlbumById(id, { name, year, cover }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, cover = $3, updated_at = $4 WHERE id = $5 RETURNING id',
      values: [name, year, cover, updatedAt, id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Album update failed, id not found');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Album delete failed, Album not found');
    }
  }
}

module.exports = AlbumsService;
