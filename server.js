const http = require('http');
const app = require('../api/app')
const port = 3000

const server = http.createServer(app)
server.listen(3000, ()=>{
    console.log('app is running on port '+port)
})