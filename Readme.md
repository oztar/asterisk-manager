## Asterisk Manager
This is a library for conection socket to Asterisk Manager with TCP or with TLS
You need access Asterisk Manager in configuration manager.conf

## Install

...
npm install asterisk-manager
...


## Usage example with TLS

const astersik_Manager = require('asterisk-manager');

//instance
let ami = astersik_Manager();


//options, username,secret... this a configuracion manager.conf
cosnt options = {
	    'hostname' : hostname,
	    'port'     : porttls,
	    'username' : 'admin',
	    'password' : 'admin',
	    'ssl'      : 'enable',
	    'cert'     : fs.readFileSync('ssl/client.pem'),
	    'key'      : fs.readFileSync('ssl/client.key'),
	    'requestCert'        : false,
	    'rejectUnauthorized' : false,
	    'ca'       : [fs.readFileSync('ssl/ca.pem')]
      };


//create connection
ami.login(options)


## Usage example with out TLS
const astersik_Manager = require('asterisk-manager');

//instance
let ami = astersik_Manager();


//options, username,secret... this a configuracion manager.conf
const options = {
      'hostname' : hostname,
      'port'     : port,
      'username' : 'admin',
      'password' : 'admin',
      'ssl'      : 'off'
      };

//create connection
ami.login(options)


//create all events of asterisk
ami.on('EventAny', function(dataJson){
      ...
      //your code here
      ...
});

//create event especific of asterisk
//example  Asterisk Event name OriginateResponse
// *
// Event<asterisk's event name>
// *
ami.on('EventOriginateResponse', function(data){
      ...     
      //your code here
      ...
});



//sokect control error 
ami.on('error', function(err){

      ...     
      
      //your code here
      
      ...
});


//Manager Create Action to send Asterisk

//see documentation AMI actions 

//https://wiki.asterisk.org/wiki/display/AST/Asterisk+18+AMI+Actions

//https://wiki.asterisk.org/wiki/display/AST/Asterisk+16+AMI+Actions

//https://wiki.asterisk.org/wiki/display/AST/Asterisk+13+AMI+Actions

let form = {
    Action : 'Originate',
    Channel: 'sip/67890',
    Exten: '6789',
    Context: 'success',
    Async: 'no'
};
    
let ActionID = ami.action(form);




