const users = require("./users");
const mysql = require('mysql')

const con = mysql.createConnection({
    host: "34.124.138.183",
    user: "frost",
    password: "12345",
    database: "bangkit"
})

con.connect(function (err) {
    if (err) throw err;
    console.log("Database Connected")
})

const registerHandler = async (request, h) => {
    const { username, email, password } = request.payload;

    return new Promise((resolve, reject) => {
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
};

const loginHandler = async (request, h) => {
    const { username, email, password } = request.payload;

    return new Promise((resolve, reject) => {
        con.query('SELECT * FROM Users WHERE username = ? OR email = ? AND password = ?', [username, email, password], function (err, results) {
            if (err) {
                const response = h.response({
                    status: "fail",
                    message: "Terjadi kesalahan"
                })
                response.code(400)
                return resolve(response)
            }
            
            if(results.length > 0) {
                const response = h.response({
                    status: "success",
                    id : results[0].id
                })
                response.code(200)
    
                return resolve(response);
            }
            
            const response = h.response({
                status: "success",
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
            if (err) return reject(error)

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

module.exports = { registerHandler, loginHandler, showAllUsers };