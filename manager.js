/**
 * @file Acterisk-Manager
 * @author Alfredo Roman <alfredoromandominguez@gmail.com>
 * @version 0.1.1
 * @example 1  conection text
 *  //call library
 *  const libAMI = require('Asterisk-manager');
 *  let ami = libAMI();
 *
 *  ami.login({
 *              'hostname' : 'localhost', 
 *              'port'     : 5038,
 *              'username' : 'admin',
 *              'password' : 'admin',
 *              'ssl'      : 'disable'
 *           }); 
 * 
 *  //event emitted any events of asterisk manager
 *  ami.on('EventAny', function(a){
 *      console.log('Event:',a);
 *  });
 *
 *  //event emitted Event+<name event> of asterisk manager
 *  // example OriginateResponse 
 *  ami.on('EventOriginateResponse', function(a){
 *      console.log(a);
 *  });
 *  
 *  //event emitted success actions of asterisk manager
 *  ami.on('Success', function(a){
 *      console.log('Success',a);
 *  });
 *  
 *  //error socket and error actions
 *  ami.on('error', function(txt){
 *      console.log('error: ',txt);
 *  });
 * 
 *  let ActionID = ami.action({
 * 	Action: 'Originate',
 * 	Channel: 'sip/12345',
 * 	Exten: '1234',
 * 	Context: 'default',
 * 	Async: 'yes'
 *  });
 * ...
 *
 * @example 2 connection TLS 
 *  //call library
 *  const libAMI = require('Asterisk-manager');
 *  let ami = libAMI();
 *   ami.login({
 *              'hostname' : 'localhost', 
 *              'port'     : 5038,
 *              'username' : 'admin',
 *              'password' : 'admin',
 *              'ssl'      : 'enable',
 *              'cert'               : fs.readFileSync('path/cert.pem'),
 *              'key'                : fs.readFileSync('path/cert.key'),
 *              'passphrase'         : 'certificateProtectKeys',
 *              'requestCert'        : false,
 *              'rejectUnauthorized' : false,
 *              'secure'             : null,
 *              'CA'                 : fs.readFileSync('path/CA.pem')
 *           });  
*/


const inherits     = require('util').inherits;
const format       = require('util').format;
const EventEmitter = require('events').EventEmitter;
const net          = require('net');
const tls          = require('tls');

let socket,user,pass;
let actionID = 0;


/**
 * Manager Error Control
*/
const txtError = {
    UNDEFINED     : 'Undefined error.',
    EMPTY_ARGUMENT: 'Argument "%s" missing in function call.',
    CONNECT_ERROR : 'Could not connect to server. Code: %s.',
    SOCKED_ERROR  : 'Error in server. Code: %s.',
    SOCKED_CLOSE  : 'Lost connection to server.',
    AUTH_FAILED   : 'Authentication failed.',
    ACTION_ERROR  : 'Action manager failed: %s.'
};

/**
 * conection login
 *
 * @param {string} hostname - asterisk pbx server hostname or ip address
 * @param {int} port - asterisk pbx server port number, by default is 5038
 * @param {string} username - username (see /etc/asterisk/manager.conf)
 * @param {string} password - password (see /etc/asterisk/manager.conf)
 * @param {string} cert  
 * @param {string} key
 * @param {string} passphrase
 * @param {string} requestCert
 * @param {string} rejectUnauthorized
 * @param {string} secure
 * @param {string} CA
 */
function _login(_this,settings){
    
    /* validator settings */
    settings.passphrase = settings.passphrase || null;
    settings.requestCert =  settings.requestCert || false;
    settings.rejectUnauthorized = settings.rejectUnauthorized || false;
    settings.secure = settings.secure || null;
    settings.CA = settings.CA || null;

    let arguments_not_empty = ['hostname','port','username','password','ssl'];
    let arguments_ssl_empty = ['cert','key'];

    for( let name of arguments_not_empty){
	if(settings[name] === undefined){
	    _this.error(txtError['EMPTY_ARGUMENT'],name);
            return false;
	}
	if( settings[name] == ''){
	    _this.error(txtError['EMPTY_ARGUMENT'],name);
            return false;
	}
    }

    /* basic options */
    _this.options = {
	port: settings.port,
	host: settings.hostname
    };
    user = settings.username;
    pass = settings.password;

    if( settings.ssl == 'on' || settings.ssl == 'enable' ){
	for( let name of arguments_ssl_empty){
	    if(settings[name] === undefined){
		_this.error(txtError['EMPTY_ARGUMENT'],name);
		return false;
	    }
	    if( settings[name] == ''){
		_this.error(txtError['EMPTY_ARGUMENT'],name);
		return false;
	    }
	}		
        _this.options = {
	    port: settings.port,
	    host: settings.hostname,
	    cert: settings.cert,
	    key:  settings.key,
	    passphrase : settings.passphrase,
	    requestCert:  settings.requestCert,
	    rejectUnauthorized: settings.rejectUnauthorized,
	    secureOptions: settings.secure
	};
	if(  settings.CA != null){
	    _this.options.ca = [ settings.CA ];
	}
    }
    
    process.nextTick(function(){
	if( settings.ssl == 'on' || settings.ssl == 'enable' ){
            _connect_ssl(_this);
	}else{
	    _connect(_this);
	}
    });
}    

function _connect_ssl(_this){
    socket = tls.connect(_this.options, ()=>{
	if( socket.authorized === false) {
	    _this.error(txtError['CONNECT_ERROR'] ,socket.authorizationError);
	}
    });
    _listentings(_this);
}  


function _connect(_this){    
    socket = net.connect(_this.options.port, _this.options.host);
    _listentings(_this);
}  




function _listentings(_this){
    socket.setEncoding('utf8');    
    socket.on('connect', function(){	
	_action(_this,{
	    Action   : 'Login',
	    Username : user,
	    Secret   : pass
	});
    });

    socket.on('data', function(data){	
	let ndata = {};

	//console.log('data',data.toString());
	let msg = data.split("\r\n");
	for(let i in msg){
	    let x = msg[i].split(': ');
	    ndata[x[0]] = x[1];
	    if(x[1] === undefined){
		_this.send(ndata);
		ndata={};
	    }
	}
    });


    socket.on('connecterror', function(err){
	_this.error(txtError['CONNECT_ERROR'],err);
    });
    
    socket.on('error', function(err){
        _this.error(txtError['SOCKED_ERROR'], err.code);
    });


    socket.on('close', function(){
	_this.error(txtError['SOCKED_CLOSE']);
	_this.emit('close',1);
    });
}




function _send(_this,data){
    /* error response */
    if( data['Response'] == 'Error'){
	_this.error(txtError['SOCKED_ERROR'],data);
	
	/* data Response success */
    }else if(data['Response'] == 'Success'){
	_this.emit('Success', data);
	
	
	/* Event response */
    }else if(data['Event'] !== undefined){  
        _this.emit('EventAny'   , data);
        _this.emit(data['Event'], data);
    }
}


function _action(_this,form){
    if( form.Action === undefined){ 
	_this.error(txtError['ACTION_ERROR'],'parameter action, not empty');
	return;
    }
    
    let action = '';
    for( let id in form){
	action += id+': '+form[id]+"\r\n";
    }

    //anadimos el action id
    ++actionID;
    let aid = actionID;
    action += 'ActionID: '+aid+"\r\n";

    //finalizamos
    action += "\r\n";
 
    socket.write(action);
    return aid;
}



/**
   * manager
   * 
   * pricipal constructor
   *
*/
class manager extends EventEmitter{
    options;

    constructor(){
	super();
    }
    
    /* create conection to manager */
    login(settings){
	_login(this,settings);
    }

    /* method for ee.emit response socket to internal node */
    send(data){
	_send(this,data);
    }

    /* method control errors */
    error(){
	try{
	    this.emit('error', format.apply(format,arguments));
	}catch(e){}
    }
    

    /* method for emit socket to manager */
    action(form){
	return _action(this,form);
    }

}




module.exports = function(){
    return new manager();

}
