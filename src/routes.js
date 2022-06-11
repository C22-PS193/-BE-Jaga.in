const { registerHandler, loginHandler, getUserByIdHandler, verifyKTPHandler, getBabysitterHandler, getBabySitterByIdHandler, getScheduleHandler, getScheduleByIdHandler} = require('./handler');

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
        method: 'POST',
        path: '/verifyKTP',
        config: {
            payload: {
                parse: true,
                allow: 'multipart/form-data',
                multipart: { output: 'stream' },
            }
        },
        handler: verifyKTPHandler,
    },
    {
        method: 'POST',
        path: '/babysitters/{id}',
        handler: getBabySitterByIdHandler
    },
    {
        method: 'GET',
        path: '/babysitters',
        handler: getBabysitterHandler,
    },
    {
        method: 'GET',
        path: '/scheduler/{username}',
        handler: getScheduleHandler,
    },
    {
        method: 'GET',
        path: '/scheduler/{pk*2}',
        handler: getScheduleByIdHandler,
    },
]

module.exports = routes;