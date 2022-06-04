const { registerHandler, loginHandler, showAllUsers } = require('./handler');

const routes = [
    {
        method: 'POST',
        path: '/register',
        handler: registerHandler,
    },
    {
        method: 'POST',
        path: '/login',
        handler: loginHandler
    },
    {
        method: 'GET',
        path: '/users',
        handler: showAllUsers,
    },
]

module.exports =  routes

// const registerHandler = async (request, h) => {
//     const { username, email, password } = request.payload;

//     return new Promise((resolve, reject) => {
//         con.query('INSERT INTO Users (username,email,password) VALUES ("' + username + '","' + email + '","' + password + '")', function (err, results) {
//             if (err) {
//                 const response = h.response({
//                     status: "fail",
//                     message: "Terjadi kesalahan"
//                 })
//                 response.code(400)   
//                 return resolve(response)
//             }

//             const response = h.response({
//                 status: "success",
//                 data: {
//                     id: results.insertId
//                 }
//             })
//             response.code(201)

//             return resolve(response);
//         });
//     })
// };