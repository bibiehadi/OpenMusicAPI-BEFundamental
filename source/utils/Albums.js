const mapDBToDetailAlbumsModel = ({ id, name, year, musics }) => ({
  id,
  name,
  year,
  musics,
});

const mapDBToAlbumsModel = ({
  id,
  name,
  year,
  musics,
  created_at,
  updated_at,
}) => ({
  id,
  name,
  year,
  musics,
  createdAt: created_at,
  updatedAt: updated_at,
});

module.exports = { mapDBToAlbumsModel, mapDBToDetailAlbumsModel };
