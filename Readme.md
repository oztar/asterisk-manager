## Asterisk Manager TLS

This is a library for conection socket to Asterisk Manager with TCP or with TLS

You need access Asterisk Manager in configuration manager.conf


## Install


...

npm install asterisk-manager-tls

...




## Usage example with TLS

const astersik_Manager = require('asterisk-manager-tls');


//instance

let ami = astersik_Manager();




//options, username,secret... this a configuracion manager.conf

const options = {

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




## connection TLS and whithout TLS

//library connect socket 

//and with socket connected send Login


//create connection

ami.login(options)


//in case de error of socket connection, library emit event error

ami.on('error', function(data){

		/*

		Lost connection to server.

		*/

});


//when in case authentication fail,  library emit event error 

ami.on('error', function(data){

		/* 

		{

		  Response: 'Error',

		  ActionID: '991',

		  Message: 'Authentication failed',

		  '': undefined

		}		  

		*/ 

});


//when library connect success socket in manager asterisk, library emit event connected, its only information.

ami.on('connect', function(){

  //where login Asterisk is success, libary emit event information 'Ready'

  ami.on('Ready', function(){

      ...      

      //your code here
      
      ...
  });

});



##Events library emit. 

//instance

let ami = astersik_Manager();


//create all events of asterisk

//not need into event Ready

ami.on('EventAny', function(dataJson){

      ...
      
      //your code here
      
      ...
      
});


//create event especific of asterisk

//example  Asterisk Event name OriginateResponse

// *

// <asterisk's event name>

// *

ami.on('OriginateResponse', function(data){

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


##Manager restart ami 

//logoff asterisk manager

ami.logoff();

//renew login

ami.login(options)


##Manager hard-restart ami

// close sokect tcp 

//the function include emit logoff 

ami.disconnect();


//renew socket and login

ami.login(options);




