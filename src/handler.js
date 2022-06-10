const users = require("./users");
const mysql = require('mysql')
const tf = require('@tensorflow/tfjs')
const tfnode = require("@tensorflow/tfjs-node")
const fs = require('fs');

async function load_model() {
    let m = await tf.loadLayersModel('file://src/model.json')
    return m;
}

let model = load_model();


const con = mysql.createConnection({
    host: "34.143.189.163",
    user: "jagain",
    password: "12345",
    database: "db_jagain"
})

// function imgTransform(img) {
//     const tes = tf.browser.fromPixels(img)
//     console.log(tes)
//     img = tf.browser.fromPixels(img).resizeBilinear(img, [224, 224]).div(tf.scalar(255))
//     console
//     img = tf.cast(img, dtype = 'float32');

//     /*mean of natural image*/
//     let meanRgb = { red: 0.485, green: 0.456, blue: 0.406 }

//     /* standard deviation of natural image*/
//     let stdRgb = { red: 0.229, green: 0.224, blue: 0.225 }

//     let indices = [
//         tf.tensor1d([0], "int32"),
//         tf.tensor1d([1], "int32"),
//         tf.tensor1d([2], "int32")
//     ];

//     /* sperating tensor channelwise and applyin normalization to each chanel seperately */
//     let centeredRgb = {
//         red: tf.gather(img, indices[0], 2)
//             .sub(tf.scalar(meanRgb.red))
//             .div(tf.scalar(stdRgb.red))
//             .reshape([224, 224]),

//         green: tf.gather(img, indices[1], 2)
//             .sub(tf.scalar(meanRgb.green))
//             .div(tf.scalar(stdRgb.green))
//             .reshape([224, 224]),

//         blue: tf.gather(img, indices[2], 2)
//             .sub(tf.scalar(meanRgb.blue))
//             .div(tf.scalar(stdRgb.blue))
//             .reshape([224, 224]),
//     }


//     /* combining seperate normalized channels*/
//     let processedImg = tf.stack([
//         centeredRgb.red, centeredRgb.green, centeredRgb.blue
//     ]).expandDims();
//     return processedImg;
// }

const tesMLHandler = async (request, h) => {
    //Get Image
    const image = fs.readFileSync('/Users/azri-m/desktop/Capstone/src/3.jpeg')
    const tensorImage = tfnode.node.decodeImage(image)
    console.log(tensorImage.shape)
    
    //Get Image - 2
    const image2 = fs.readFileSync('/Users/azri-m/desktop/Capstone/src/abas.jpg')
    const tensorImage2 = tfnode.node.decodeImage(image2)
    console.log(tensorImage2.shape)
    
    //Resize
    const resizeImage = tf.image.resizeBilinear(tensorImage, [224, 224]).div(tf.scalar(255))
    console.log(resizeImage.shape)

    //Resize - 2
    const resizeImage2 = tf.image.resizeBilinear(tensorImage2, [224, 224]).div(tf.scalar(255))
    console.log(resizeImage2.shape)

    //ExpandDims
    const expandDimsImage = resizeImage.expandDims()
    console.log(expandDimsImage.shape)

    //ExpandDims - 2
    const expandDimsImage2 = resizeImage2.expandDims()
    console.log(expandDimsImage2.shape)

    // const handler = tfnode.io.fileSystem("./model.json");
    const model = await tf.loadLayersModel('file://src/model.json').then(function(model) {
        return model.predict(expandDimsImage).dataSync()
    })

    // const handler = tfnode.io.fileSystem("./model.json") Ke - 2
    const model2 = await tf.loadLayersModel('file://src/model.json').then(function(model2) {
        return model2.predict(expandDimsImage2).dataSync()
    })

    console.log(model)
    console.log(model2)

    let i = model.indexOf(Math.max(...model));
    let j = model2.indexOf(Math.max(...model2));

    console.log(i)
    console.log(j)

    if(i === j) {
        return h.response({
            status: "success",
            message: "blogg",
            isVerified: true
        }).code(200)
    }


    return h.response({
        status: "success",
        message: "blogg",
        isVerified: false
    }).code(200)
}

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

module.exports = { registerHandler, loginHandler, getUserByIdHandler, showAllUsers, tesMLHandler };