'use strict';

const EventEmitter = require('events');

module.exports = class extends EventEmitter {
    constructor(transport) {
        super();
        
        function getEditParent(message) {
            return navigate(
                    this.data, pathToEditParent(message.key, message.path));
        }
        
        this.data = {};
        this.transport = transport;
        this.transport.on('message', message => {
            switch (message.op) {
                case 'init': {
                    this.data[message.key] = message.value;
                    break;
                }
                case 'closed':
                case 'finalize': {
                    delete this.data[message.key];
                    break;
                }
                case 'insert': {
                    const toModify = getEditParent.call(this, message);
                    
                    if (Array.isArray(toModify)) {
                        toModify.splice(message.path[message.path.length - 1],
                                0, message.value);
                    }
                    else {
                        toModify[message.path[message.path.length - 1]] =
                                message.value;
                    }
                    
                    break;
                }
                case 'update': {
                    const toModify = getEditParent.call(this, message);
                    toModify[message.path[message.path.length - 1]] =
                            message.value;
                    
                    break;
                }
                case 'delete': {
                    const toModify = getEditParent.call(this, message);
                    
                    if (Array.isArray(toModify)) {
                        toModify.splice(
                                message.path[message.path.length - 1], 1);
                    }
                    else {
                        delete toModify[message.path[message.path.length - 1]];
                    }
                    
                    break;
                }
            }
        });
    }
};

function pathToEditParent(key, path) {
    const result = fullPath(key, path);
    result.pop();
    return result;
}

function fullPath(key, path) {
    const result = path.slice();
    result.unshift(key);
    return result;
}

function navigate(root, path, i) {
    i = i || 0;
    
    let result;
    if (i < path.length) {
        result = navigate(root[path[i]], path, i + 1);
    }
    else {
        result = root;
    }
    
    return result;
}

