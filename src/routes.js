const { registerHandler, loginHandler, getUserByIdHandler, showAllUsers } = require('./handler');

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
        method: 'POST',
        path: '/users/{id}',
        handler: getUserByIdHandler
    },
    {
        method: 'GET',
        path: '/users',
        handler: showAllUsers,
    },
]

module.exports =  routes;