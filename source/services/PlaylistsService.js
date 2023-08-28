const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../exceptions/NotFoundError');
const InvariantError = require('../exceptions/InvariantError');
const AuthorizationError = require('../exceptions/AuthorizationError');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist(name, userId) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const query = {
      text: 'INSERT INTO playlists VALUES ($1, $2, $3, $4, $4) RETURNING id',
      values: [id, name, userId, createdAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getPlaylists(userId) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username  FROM playlists
             LEFT JOIN users ON playlists.owner = users.id
             LEFT JOIN collaborations ON playlists.owner = collaborations.id
             WHERE playlists.owner = $1 OR collaborations.id = $1 OR users.id = $1
             GROUP BY playlists.id, playlists.name, users.username
            `,
      values: [userId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      return [];
    }
    return result.rows;
  }

  async getPlaylistById(playlistId, userId) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username  FROM playlists
             LEFT JOIN users ON playlists.owner = users.id
             LEFT JOIN collaborations ON playlists.owner = collaborations.id
             WHERE playlists.id = $1 AND playlists.owner = $2
             GROUP BY playlists.id, playlists.name, users.username
            `,
      values: [playlistId, userId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Song not found');
    }
    return result.rows[0];
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus playlist. Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('playlists tidak ditemukan');
    }

    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async addSongPlaylist(playlistId, songId) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const query = {
      text: 'INSERT INTO playlist_songs VALUES ($1, $2, $3, $4, $4) RETURNING song_id',
      values: [id, playlistId, songId, createdAt],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Menambahkan song ke playlist gagal');
    }
    return result.rows[0].song_id;
  }

  async deleteSongPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus song. Id tidak ditemukan');
    }
  }
}

module.exports = PlaylistsService;
