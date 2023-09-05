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
    const id = `playlist-${nanoid(16)}`;
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
             LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id
             WHERE playlists.owner = $1 OR collaborations.user_id = $1 OR users.id = $1
             GROUP BY playlists.id, playlists.name, users.username
            `,
      values: [userId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      return [];
    }
    return result.rows;
  }

  async getPlaylistById(playlistId, userId) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username  FROM playlists
             LEFT JOIN users ON playlists.owner = users.id
             LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id
             WHERE playlists.id = $1 AND ( playlists.owner = $2 OR collaborations.user_id = $2)
             GROUP BY playlists.id, playlists.name, users.username
            `,
      values: [playlistId, userId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist not found');
    }
    return result.rows[0];
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus playlist. Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const ownerName = owner;
    const query = {
      text: `SELECT * FROM playlists 
         WHERE id = $1`,
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('playlists tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== ownerName) {
      await this.verifyPlaylistCollaborations(id, owner);
    }
  }

  async verifyDeletePlaylistOwner(id, owner) {
    const query = {
      text: `SELECT * FROM playlists 
         WHERE id = $1`,
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

  async verifyPlaylistCollaborations(id, userId) {
    const query = {
      text: `SELECT * FROM playlists 
         LEFT JOIN collaborations c on playlists.id = c.playlist_id
         WHERE playlist_id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount > 0) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== userId) {
      if (playlist.user_id !== userId) {
        throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
      }
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
    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus song. Id tidak ditemukan');
    }
  }

  async addPlaylistSongActivity(playlistId, songId, userId, action) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES ($1, $2, $3, $4, $5, $6, $6, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, createdAt],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Playlist Song Activity gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getPlaylistSongActivities(playlistId) {
    const query = {
      text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time FROM playlist_song_activities 
            LEFT JOIN users ON playlist_song_activities.user_id = users.id
            LEFT JOIN songs ON playlist_song_activities.song_id = songs.id
            WHERE playlist_song_activities.playlist_id = $1`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      return [];
    }
    return result.rows;
  }


}

module.exports = PlaylistsService;
