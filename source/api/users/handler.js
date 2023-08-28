class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postUserHandler(request, h) {
    this._validator.validateUserPayload(request.payload);
    const { username, password, fullname } = request.payload;
    const userId = await this._service.addUser({
      username,
      password,
      fullname,
    });
    const response = h.response({
      status: 'success',
      message: 'penambahan user berhasil!',
      data: {
        userId,
      },
    });

    response.code(201);
    return response;
  }

  async getUserByIdHandler(request, h) {
    const {
      id: userId,
    } = request.params;
    const user = await this._service.getUserById(userId);
    return h.response({
      status: 'success',
      data: {
        user,
      },
    });
  }
}

module.exports = UsersHandler;
