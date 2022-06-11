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
    const { _data } = request.payload.image
    const { filename } = request.payload.image.hapi
    const bucket = storage.bucket("jagain-bucket")
    const blob = bucket.file(filename)

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

    //Get Image
    const image = fs.readFileSync('/Users/azri-m/desktop/Capstone/dummy-img/' + filename + ".jpeg")
    const tensorImage = tfnode.node.decodeImage(image)
    // console.log(tensorImage.shape)

    //Get Image - 2
    const image2 = fs.readFileSync('/Users/azri-m/desktop/Capstone/dummy-img/' + filemuka + ".jpg")
    const tensorImage2 = tfnode.node.decodeImage(image2)
    // console.log(tensorImage2.shape)

    //Resize
    const resizeImage = tf.image.resizeBilinear(tensorImage, [224, 224]).div(tf.scalar(255))
    // console.log(resizeImage.shape)

    //Resize - 2
    const resizeImage2 = tf.image.resizeBilinear(tensorImage2, [224, 224]).div(tf.scalar(255))
    // console.log(resizeImage2.shape)

    //ExpandDims
    const expandDimsImage = resizeImage.expandDims()
    // console.log(expandDimsImage.shape)

    //ExpandDims - 2
    const expandDimsImage2 = resizeImage2.expandDims()
    // console.log(expandDimsImage2.shape)

    // const handler = tfnode.io.fileSystem("./model.json");
    const model = await tf.loadLayersModel('file://model/model.json').then(function (model) {
        return model.predict(expandDimsImage).dataSync()
    })

    // const handler = tfnode.io.fileSystem("./model.json") Ke - 2
    const model2 = await tf.loadLayersModel('file://model/model.json').then(function (model2) {
        return model2.predict(expandDimsImage2).dataSync()
    })

    // console.log(model)
    // console.log(model2)

    if (model.indexOf(Math.max(...model)) === model2.indexOf(Math.max(...model2))) {
        return h.response({
            status: "success",
            message: "blogg",
            isVerified: true
        }).code(200)
    }

    return h.response({
        status: "success",
        message: "Upload Success"
    }).code(200)
}

const getScheduleHandler = async (request, h) => {
    const { username } = request.params.username;

    return new Promise((resolve, _) => {
        con.query('SELECT * FROM Schedule WHERE username = ?', [username], function (err, results) {
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

    if(date == null){
        if(date != ""){
            return new   Promise((resolve, _) => {
                con.query('SELECT * FROM Schedules WHERE username = ? AND sitterid = ? AND date = ?', [pk[0], pk[1], date], function (err, results) {
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
        con.query('SELECT * FROM Schedules WHERE username = ? AND sitterid = ?', [pk[0], pk[1]], function (err, results) {
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
                status: "success",
                message: "Schedule masih kosong"
            })
            response.code(200)

            return resolve(response);
        });
    });
};


const createScheduleHandler = async (request, h) => {
    const { username, sitterid, date } = request.payload;

    if (username != null && sitterid != null && date != null) {
        return new Promise((resolve, _) => {
            con.query('SELECT * FROM Schedules WHERE username = ? AND sitterid = ? AND date = ?', [username, sitterid, date], function (err, results) {
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

                con.query('INSERT INTO Schedules (username,sitterid,date) VALUES ("' + username + '","' + sitterid + '","' + date + '")', function (err, results) {
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
    const { username, sitterid, date } = request.payload;

    if (username != null && sitterid != null && date != null) {
        return new Promise((resolve, _) => {
            con.query('SELECT * FROM Schedules WHERE username = ? AND sitterid = ? AND date = ?', [username, sitterid, date], function (err, results) {
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

                con.query('DELETE FROM Schedules WHERE username = ? AND sitterid = ? AND date = ?', [username, sitterid, date], function (err, results) {
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
        message: "Username/SitterID/Date tidak boleh kosong!"
    }).code(400)
};
module.exports = { registerHandler, loginHandler, getUserByIdHandler, verifyKTPHandler, getBabysitterHandler, getBabySitterByIdHandler, getScheduleHandler, getScheduleByIdHandler, createScheduleHandler, deleteScheduleHandler };