'use strict';

const EventEmitter = require('events');
const IneficeClient = require('@shieldsbetter/inefice-client-core');
const WebSocket = require('ws');

module.exports = class {
    constructor(url) {
        this.connection = new Connection(url);
        this.transport = this.connection.transport;
        this.inefice = new IneficeClient(this.transport);
        this.data = this.inefice.data;
    }
};

class Connection {
    constructor(url) {
        const ws = new WebSocket(url);
        ws.on('open', () => {
            this.timer = setInterval(() => {
                ws.ping();
            }, 2000);
        });
        ws.on('close', () => {
            clearInterval(this.timer);
            delete this.timer;
        });
        
        this.transport = new Transport(ws);
    }
}

class Transport extends EventEmitter {
    constructor(ws) {
        super();
    
        ws.on('message', rawMsg => {
            this.emit('message', JSON.parse(rawMsg));
        });
    }
}

module.exports.Connection = Connection;
module.exports.Transport = Transport;

