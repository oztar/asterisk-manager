'user strict'
const path         = __dirname;
const exp          = require('chai').expect;
const lib          = require(path+ '/manager.js');
const net          = require('net');
const tls          = require('tls');
const fs           = require('fs');
const hostname     = '127.0.0.1';
const port         = 1337;
const porttls      = 1338;

console.log(path);
let server,ami,res;

//console.log(lib());
let text = 'Action: Login'+"\r\n";
text += 'Username: admin'+"\r\n";
text += 'Secret: admin'+"\r\n";
text += 'ActionID: 1'+"\r\n";
text += "\r\n";
let Originate6789 = {
    Action : 'Originate',
    Channel: 'sip/67890',
    Exten: '6789',
    Context: 'success',
    Async: 'no'
};



describe('The tcp server', function() {
    
    it('create server', function(done){
	create_server();
	done();
    });
    it('server object', function(done){
	exp(server).to.be.an('Object');
	done();
    });
    it('server events', function(done){
	exp(server._eventsCount).to.equal(1);
	done();
    });
});

describe('Asterisk Manager', function(){
    ami = lib();

    it('Instance Asterisk Manager', function(done){
	ami.options = 'uno';
	exp(ami.options).to.equal('uno');
	done();
    });
    it('Asterisk Manager login', function(done){
	let options = {
	    'hostname' : hostname,
	    'port'     : port,
	    'username' : 'admin',
	    'password' : 'admin',
	    'ssl'      : 'off'
      };

	function test(data){
	    exp(data.Response).to.equal('Success');
	    ami.off('Success',test);
	    done();
	}
	ami.on('Success',test);
	ami.login(options);
    });
    
    it('Asterisk Manager Action', function(done){
	
	let ActionID = ami.action(Originate6789);
	exp(ActionID).to.equal(2);
	done();
    });
    it('Asterisk Manager Event', function(done){

	let ActionID = ami.action(Originate6789);
	function event(data){
	    exp(data.Event).to.equal('OriginateResponse');
	    ami.off('EventAny',event );
	    done();
	}
	ami.on('EventAny',event );	
    });  

    it('Asterisk Manager Originate', function(done){
	let ActionID = ami.action(Originate6789);
	function eventO(data){
	    exp(data.Event).to.equal('OriginateResponse');
	    ami.off('OriginateResponse',eventO);
	    done();
	}	
	ami.on('OriginateResponse',eventO);
    });
});
describe('Close tcp server', function() {
 it('Close ', function(done){
     function fclose(data){
	 exp(data).to.equal('Lost connection to server.');
	 ami.off('error',fclose);
	 done();
     }
     ami.on('error',fclose);
 });
});
describe('The TLS server', function() {
    
    it('create server', function(done){
	create_tls_server();
	done();
    });
    it('server object', function(done){
	exp(server).to.be.an('Object');
	done();
    });
    it('server events', function(done){
	exp(server._eventsCount).to.equal(2);
	done();
    });
});



describe('Asterisk Manager TLS', function(){
    ami = lib();

    it('Instance Asterisk Manager', function(done){
	ami.options = 'uno';
	exp(ami.options).to.equal('uno');
	done();
    });
    it('Asterisk Manager TLS Error login', function(done){
	let options = {
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

	function test(data){
	    //SELF_SIGNED_CERT_IN_CHAIN  its a certificate error, non a library error.
	    //this library correct works. 
	    //This not error server TLS
	    exp(data).to.equal('Could not connect to server. Code: SELF_SIGNED_CERT_IN_CHAIN.');
	    ami.off('error',test);
	    done();
	}
	ami.on('error',test);
	ami.login(options);
    });
    
    it('Asterisk Manager Action', function(done){
	
	let ActionID = ami.action(Originate6789);
	exp(ActionID).to.equal(6);
	done();
    });
    it('Asterisk Manager Event', function(done){

	let ActionID = ami.action(Originate6789);
	function event(data){
	    exp(data.Event).to.equal('OriginateResponse');
	    ami.off('EventAny',event );
	    done();
	}
	ami.on('EventAny',event );	
    });  

    it('Asterisk Manager Originate', function(done){
	let ActionID = ami.action(Originate6789);

	function eventO(data){
	    exp(data.Event).to.equal('OriginateResponse');
	    ami.off('OriginateResponse',eventO);
	    done();
	}
	ami.on('OriginateResponse',eventO);
    });
});

describe('Close tls server', function() {
 it('Close ', function(done){
     function fclose(data){
	 exp(data).to.equal('Lost connection to server.');
	 ami.off('error',fclose);
	 done();
     }
     ami.on('error',fclose);
 });

});


async function create_server(){
    server = await net.createServer(function(socket){
	socket = listenings(socket);
    });    
    server.listen(port,hostname);

}
async function create_tls_server(){
    // Private key and public certificate for access
    var options = {
	key: fs.readFileSync('ssl/server.key'),
	cert: fs.readFileSync('ssl/server.pem'),
	requestCert        : false,
	rejectUnauthorized : false,
	ca: fs.readFileSync('ssl/ca.pem')
    };
    server = tls.createServer(options, function(socket) {
	socket = listenings(socket);
    });    	
    server.listen(porttls,hostname);
    setTimeout( ()=>{
	server.close();
    },4000);
}


function listenings(socket){
    socket.setEncoding('utf8');
    try{ 
	socket.on('data', function(data){
	    let response = {
		'login' : 'Response: Success'+"\r\n"+'ActionID: 1'+"\r\n"+'Message: Authentication accepted'+"\r\n",
		'originate' : 'Response: Success'+"\r\n"+'ActionID: 2'+"\r\n"+'Message: Originate successfully queued'+"\r\n",
		'Oresponse' : 'Event: OriginateResponse'+"\r\n"+'Privilege: call,all'+"\r\n"+'ActionID: 2'+"\r\n"+'Response: Failure '+"\r\n"+'Channel: sip/12345'+"\r\n"+'Context: default'+"\r\n"+'Exten: 1234'+"\r\n"+'Reason: 0'+"\r\n"
	    }
	    let msg = data.toString().split("\r\n");
	    if( msg[0] == 'Action: Login'){
		socket.write(response.login);
	    }else if( msg[0] == 'Action: Originate'){
		socket.write(response.originate);
		setTimeout( ()=>{
		    socket.write(response.Oresponse);
		},1500);
	    }
	});
    }catch(err){
	console.log(err);
    }
    setTimeout( ()=>{
	socket.destroy();
    },4000);
    return socket;
}


