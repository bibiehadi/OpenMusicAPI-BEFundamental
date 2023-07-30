const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");
const {
  mapDBToSongsModel,
  mapDBToDetailSongsModel,
} = require("../utils/Songs");

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title,
    year,
    genre,
    performer,
    duration = null,
    albumId = null,
  }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const query = {
      text: "INSERT INTO songs VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id",
      values: [
        id,
        title,
        year,
        genre,
        performer,
        duration,
        albumId,
        createdAt,
        createdAt,
      ],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Gagal menambahkan lagu");
    }
    return result.rows[0].id;
  }

  async getSongs(title, performer) {
    let query = "SELECT * FROM songs";
    if (title !== undefined) {
      query = {
        text: "SELECT * FROM songs WHERE lower(title) like lower($1)",
        values: [`%${title}%`],
      };
    }

    if (performer !== undefined) {
      query = {
        text: "SELECT * FROM songs WHERE lower(performer) like lower($1)",
        values: [`%${performer}%`],
      };
    }

    if (title !== undefined && performer !== undefined) {
      query = {
        text: "SELECT * FROM songs WHERE lower(title) like lower($1) AND lower(performer) like lower($2)",
        values: [`%${title}%`, `%${performer}%`],
      };
    }
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      return [];
    }
    return result.rows.map(mapDBToSongsModel);
  }

  async getSongById(id) {
    const query = {
      text: "SELECT * FROM songs WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Song not found");
    }

    return result.rows.map(mapDBToDetailSongsModel)[0];
  }

  async editSongById(
    id,
    { title, year, genre, performer, duration = null, albumId = null },
  ) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, "albumId" = $6, updated_at = $7 where id = $8 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, updatedAt, id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Songs updated failed, id not found");
    }
  }

  async deleteSongById(id) {
    const query = {
      text: "DELETE FROM songs WHERE id = $1 RETURNING id",
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Songs deleted failed, id not found");
    }
  }
}

module.exports = SongsService;
