const users = require("./users");
const mysql = require('mysql')

const con = mysql.createConnection({
    host: "34.143.189.163",
    user: "jagain",
    password: "12345",
    database: "db_jagain"
})

con.connect(function (err) {
    if (err) throw err;
    console.log("Database Connected")
})

const registerHandler = async (request, h) => {
    const { username, email, password } = request.payload;

    if (username != null && email != null && password != null) {
        return new Promise((resolve, _) => {
            con.query('SELECT * FROM Users WHERE username = ? OR email = ?', [username, email], function (err, results) {
                if (err) {
                    const response = h.response({
                        status: "fail",
                        message: "Terjadi kesalahan"
                    })
                    response.code(400)
                    return resolve(response)
                }

                if (results.length > 0) {
                    const response = h.response({
                        status: "Fail",
                        message: "Username atau Email sudah ada"
                    })
                    response.code(409)
                    return resolve(response);
                }

                con.query('INSERT INTO Users (username,email,password) VALUES ("' + username + '","' + email + '","' + password + '")', function (err, results) {
                    if (err) {
                        const response = h.response({
                            status: "fail",
                            message: "Terjadi kesalahan"
                        })
                        response.code(400)
                        return resolve(response)
                    }

                    const response = h.response({
                        status: "success",
                        data: {
                            id: results.insertId
                        }
                    })
                    response.code(201)
                    return resolve(response);
                });
            })

        })
    }
    return h.response({
        status: "fail",
        message: "Username/Email/Password tidak boleh kosong!"
    }).code(400)
};

const loginHandler = async (request, h) => {
    const { username, email, password } = request.payload;

    return new Promise((resolve, _) => {
        con.query('SELECT * FROM Users WHERE username = ? OR email = ? AND password = ?', [username, email, password], function (err, results) {
            if (err) {
                const response = h.response({
                    status: "fail",
                    message: "Terjadi kesalahan"
                })
                response.code(400)
                return resolve(response)
            }

            if (results.length > 0) {
                const response = h.response({
                    status: "success",
                    id: results[0].id
                })
                response.code(200)

                return resolve(response);
            }

            const response = h.response({
                status: "fail",
                message: "Username atau Email dan Password Tidak Ditemukan"
            })
            response.code(401)

            return resolve(response);
        });
    })
};

const showAllUsers = async (_, h) => {
    return new Promise((resolve, reject) => {
        con.query('SELECT * FROM Users', function (err, data) {
            if (err) {
                const a = err.message
                const response = h.response({
                    status: "fail",
                    message: a,
                })
                response.code(400)
                return resolve(response)
            }

            if (data.length > 0) {
                const response = h.response({
                    status: "success",
                    data
                })
                response.code(200)

                return resolve(response);
            }
            const response = h.response({
                status: "success",
                message: "Tidak ada user yang terdaftar"
            })
            response.code(200)

            return resolve(response);
        })
    })
};

const getUserByIdHandler = async (request, h) => {
    const { id } = request.payload;

    if (id != null) {
        return new Promise((resolve, _) => {
            con.query('SELECT * FROM Users WHERE id = ?', [id], (err, results) => {
                if (err) {
                    return resolve(
                        h.response({
                            status: "fail",
                            message: "Terjadi Kesalahan"
                        }).code(400)
                    )
                }

                if (results.length > 0) {
                    return resolve(
                        h.response({
                            status: "success",
                            data: {
                                id: results[0].id,
                                username: results[0].username,
                                email: results[0].email
                            }
                        }).code(200)
                    )
                }

                return resolve(
                    h.response({
                        status: "fail",
                        message: "ID Tidak Ditemukan"
                    }).code(400)
                )
            })
        })
    }
    return h.response({
        status: "fail",
        message: "ID Anda Kosong!"
    }).code(400)
}

module.exports = { registerHandler, loginHandler, getUserByIdHandler, showAllUsers };