const mapDBToSongsModel = ({ id, title, performer }) => ({
  id,
  title,
  performer,
});

const mapDBToDetailSongsModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
  created_at,
  updated_at,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
  createdAt: created_at,
  updatedAt: updated_at,
});

module.exports = { mapDBToSongsModel, mapDBToDetailSongsModel };
