const AlbumsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, {
    albumsService, songsService, albumLikesService, validator,
  }) => {
    const albumHandler = new AlbumsHandler(
      albumsService,
      songsService,
      albumLikesService,
      validator,
    );
    server.route(routes(albumHandler));
  },
};
