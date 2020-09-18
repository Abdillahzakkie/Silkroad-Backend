const Ws = require('ws').Server;

const port = 5001;

const server = new Ws({ port }, () => console.log(`Server listening on port : ${port}`));

server.on('connection', ws => {
    ws.on('message', message => {
        // const json = JSON.parse(message);
        ws.send('Websocket connected successfully')
    })
    
    ws.on('close', () => console.log('I lost a client'))
})