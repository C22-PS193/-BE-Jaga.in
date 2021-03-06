const users = require("./users");
const mysql = require('mysql')
const tf = require('@tensorflow/tfjs')
const tfnode = require("@tensorflow/tfjs-node")
const fs = require('fs');
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

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

const getBabysitterHandler = async (request, h) => {
    return new Promise((resolve, reject) => {
        con.query('SELECT * FROM babysitter', function (err, data) {
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
                message: "Tidak ada babysitter yang terdaftar"
            })
            response.code(200)

            return resolve(response);
        })
    })
}

const getBabySitterByIdHandler = async (request, h) => {
    const { id } = request.payload;

    if (id != null) {
        return new Promise((resolve, _) => {
            con.query('SELECT * FROM babysitter WHERE id = ?', [id], (err, results) => {
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

const verifyKTPHandler = async (request, h) => {
    const { filename } = request.payload.image.hapi
    const filename2 = request.payload.image2.hapi.filename
    if (filename != "" && filename2 != "") {
        const { _data } = request.payload.image
        const _data2 = request.payload.image2._data

        const bucket = storage.bucket("jagain-bucket")
        const blob = bucket.file(filename)
        const blob2 = bucket.file(filename2)

        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: 'image/jpg'
            }
        }).on("error", err => {
            return h.response({
                status: "success",
                message: err
            }).code(400)
        }).on("finish", () => {
            // The public URL can be used to directly access the file via HTTP.
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`
        })
        blobStream.end(_data);

        const blobStream2 = blob2.createWriteStream({
            metadata: {
                contentType: 'image/jpg'
            }
        }).on("error", err => {
            return h.response({
                status: "success",
                message: err
            }).code(400)
        }).on("finish", () => {
            // The public URL can be used to directly access the file via HTTP.
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`
        })

        blobStream2.end(_data2);

        const tensorImage = tfnode.node.decodeImage(_data)
        const tensorImage2 = tfnode.node.decodeImage(_data2)


        const resizeImage = tf.image.resizeBilinear(tensorImage, [224, 224]).div(tf.scalar(255))
        const resizeImage2 = tf.image.resizeBilinear(tensorImage2, [224, 224]).div(tf.scalar(255))


        const expandDimsImage = resizeImage.expandDims()
        const expandDimsImage2 = resizeImage2.expandDims()

        const model = await tf.loadLayersModel('file://model/model.json').then(function (model) {
            return model.predict(expandDimsImage).dataSync()
        })

        const model2 = await tf.loadLayersModel('file://model/model.json').then(function (model2) {
            return model2.predict(expandDimsImage2).dataSync()
        })

        if (model.indexOf(Math.max(...model)) === model2.indexOf(Math.max(...model2))) {
            return h.response({
                status: "success",
                isVerified: true
            }).code(200)
        }

        return h.response({
            status: "success",
            isVerified: false
        }).code(200)
    }
    return h.response({
        status: "success",
        message: "Harus 2 foto yang diupload"
    }).code(400)
}

const getScheduleHandler = async (request, h) => {
    const userid = request.params.userid;

    return new Promise((resolve, _) => {
        con.query('SELECT * FROM Schedules WHERE userId = ?', [userid], function (err, results) {
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
                    schedules: results
                })
                response.code(200)

                return resolve(response);
            }

            const response = h.response({
                status: "success",
                message: "Schedule masih kosong"
            })
            response.code(200)

            return resolve(response);
        });
    })
};


const getScheduleByIdHandler = async (request, h) => {
    const pk = request.params.pk.split('/');
    const date = request.query.date;
console.log(pk+","+date)
    if(date != undefined){
        if(date != ""){
            return new   Promise((resolve, _) => {
                con.query('SELECT * FROM Schedules WHERE userId = ? AND sitterId = ? AND date = ?', [pk[0], pk[1], date], function (err, results) {
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
                            schedule: results[0]
                        })
                        response.code(200)

                        return resolve(response);
                    }

                    const response = h.response({
                        status: "success",
                        message: "Schedule masih kosong"
                    })
                    response.code(200)

                    return resolve(response);
                });
            });
        }
    }
    
    return new   Promise((resolve, _) => {
        con.query('SELECT * FROM Schedules WHERE userId = ? AND sitterId = ?', [pk[0], pk[1]], function (err, results) {
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
                    schedules: results
                })
                response.code(200)

                return resolve(response);
            }

            const response = h.response({
                status: "success",
                message: "Schedule masih kosong"
            })
            response.code(200)

            return resolve(response);
        });
    });
};


const createScheduleHandler = async (request, h) => {
    const { userid, sitterid, date } = request.payload;

    if (userid != null && sitterid != null && date != null) {
        return new Promise((resolve, _) => {
            con.query('SELECT * FROM Schedules WHERE userId = ? AND sitterId = ? AND date = ?', [userid, sitterid, date], function (err, results) {
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
                        message: "Schedule sudah ada"
                    })
                    response.code(409)
                    return resolve(response);
                }

                con.query('INSERT INTO Schedules (userId,sitterId,date) VALUES ("' + userid + '","' + sitterid + '","' + date + '")', function (err, results) {
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
                        message: "Schedule berhasil dibuat"
                    })
                    response.code(201)
                    return resolve(response);
                });
            })

        })
    }
    return h.response({
        status: "fail",
        message: "Username/SitterID/Date tidak boleh kosong!"
    }).code(400)
};

const deleteScheduleHandler = async (request, h) => {
    const { userid, sitterid, date } = request.payload;

    if (userid != null && sitterid != null && date != null) {
        return new Promise((resolve, _) => {
            con.query('SELECT * FROM Schedules WHERE userId = ? AND sitterId = ? AND date = ?', [userid, sitterid, date], function (err, results) {
                if (err) {
                    const response = h.response({
                        status: "fail",
                        message: "Terjadi kesalahan"
                    })
                    response.code(400)
                    return resolve(response)
                }

                if (results.length = 0) {
                    const response = h.response({
                        status: "Fail",
                        message: "Schedule tidak ada"
                    })
                    response.code(409)
                    return resolve(response);
                }

                con.query('DELETE FROM Schedules WHERE userId = ? AND sitterId = ? AND date = ?', [userid, sitterid, date], function (err, results) {
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
                        message: "Schedule berhasil dihapus"
                    })
                    response.code(201)
                    return resolve(response);
                });
            })

        })
    }
    return h.response({
        status: "fail",
        message: "UserID/SitterID/Date tidak boleh kosong!"
    }).code(400)
};
module.exports = { registerHandler, loginHandler, getUserByIdHandler, verifyKTPHandler, getBabysitterHandler, getBabySitterByIdHandler, getScheduleHandler, getScheduleByIdHandler, createScheduleHandler, deleteScheduleHandler };