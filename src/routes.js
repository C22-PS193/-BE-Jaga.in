const { registerHandler, loginHandler, getUserByIdHandler, verifyKTPHandler, getBabysitterHandler, getBabySitterByIdHandler, getScheduleHandler, getScheduleByIdHandler, createScheduleHandler, deleteScheduleHandler} = require('./handler');

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
        path: '/scheduler/{userid}',
        handler: getScheduleHandler,
    },
    {
        method: 'GET',
        path: '/scheduler/{pk*2}',
        handler: getScheduleByIdHandler,
    },
    {
        method: 'POST',
        path: '/scheduler',
        handler: createScheduleHandler,
    },
    {
        method: 'POST',
        path: '/scheduler/delete',
        handler: deleteScheduleHandler,
    },
]

module.exports = routes;