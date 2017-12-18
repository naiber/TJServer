// var Order = require('../models/order')
exports.install = function() {
	F.cors('/api/login',['post'],false)
	F.cors('/api/orders/{name}/{menu}/{flag}',false)
	F.cors('/api/db/login',['post'],false)
	F.cors('/api/db/{name}/{menu}/{flag}',false)
	F.cors('/api/db/{iduser}/{menu}',['post'],false)
	F.cors('/api/db/delete/{id}',['delete'],false)
	F.cors('/api/db/put/{id}',['put'],false)
	F.cors('/api/db/commesse',false)
	F.cors('/api/db/fornitori',false)
	//F.cors('/api/*', ['GET', 'POST', 'PUT', 'https://www.totaljs.com'], true);
	F.route('/api/login',json_validate,['post']);
	F.route('/api/orders/{name}/{menu}/{flag}',getOrders,['get']);
	F.route('/api/db/login',nosql_validate,['post']);
	F.route('/api/db/{name}/{menu}/{flag}',getNoSql,['get']);
	F.route('/api/db/{iduser}/{menu}',saveNoSql,['post']);
	F.route('/api/db/delete/{id}',deleteNoSql,['delete']);
	F.route('/api/db/put/{id}',putNoSql,['put']);
	F.route('/api/db/commesse',getCommesse,['get']);
	F.route('/api/db/fornitori',getFornitori,['get']);
};

function nosql_validate(){
	console.log("dentor nosql_validate");
	var self = this;
	var users = NOSQL('users');
	var myBody = self.req.body;
	// Reads the user
	users.find().make(function(builder) {
		builder.and()
		builder.where('user',myBody.username);
		builder.where('password',myBody.password);
		builder.end();
		builder.callback(function(err,model){
			if(err) self.json(err);

			if(!model || model.length == 0){
				self.view401();
			}
			console.log(model);
			self.json({
							"id" : model[0].id,
							"user" : model[0].user,
							"name" : model[0].name,
							"password" : model[0].password,
							"odata" : model[0].odata
									});
		});
	});

}

function getNoSql(name,menu,flag){
	console.log("dentro getNoSql");
	var self = this;
	var users = NOSQL('users').find();
	var myJson = [];
	users.join('entries','rUsersMenu').where('iduser','id');
	users.join('appointment','record').where('iduser','id');
	users.where('name',name);
	users.where('odata',flag);

	users.callback(function(err, response) {
		if(err) {
			console.log('error--> ',err);
			self.view404();
		}

		if(!response || response.length==0){
     self.json('no result');
	 	}

		console.log('response--> ',response[0].appointment);

		for(var i=0;i<response[0].appointment.length;i++){
			if(response[0].appointment[i].idmenu == menu){
				myJson.push(response[0].appointment[i]);
			}
		}

		if(myJson.length==0){
			self.json('no result');
		}

		self.json(myJson);

	 });
}

function getCommesse(){
	var self = this;
	var dbcommesse = NOSQL('commesse').find();

	dbcommesse.callback(function(err,res){
		if(err) self.view404();

		self.json(res);
	})
}

function getFornitori(){
	var self = this;
	var dbfornitori = NOSQL('fornitori').find();

	dbfornitori.callback(function(err,res){
		if(err) self.view404();

		self.json(res);
	})
}

function saveNoSql(iduser,menu){
	var dbrecord = NOSQL('record');
	var self = this;
	var myBody = {
		'id' : Math.floor(Math.random()*1000000),
		'idOrder' : self.req.body.idOrder,
		'order' : self.req.body.order,
		'supplier' : self.req.body.supplier,
		'hours' : self.req.body.hours,
		'actions1' : 'sap-icon://edit',
		'actions2' : 'sap-icon://delete',
		'iduser' : iduser,
		'idmenu' : menu
	};
	// dbrecord.find().callback(function(err,res){
	// 	if(res.length==0){
	// 		console.log('no records');
	// 	}
	// 	console.log('res',res);
	// 	console.log('id di myBody',myBody.id);
	// 	console.log('last item id',res[res.length-1].id+1);
	// 	myBody.id = res[res.length-1].id+1;
	// 	console.log('lastID di getId',myBody.id);
	// })
	dbrecord.insert(myBody).callback(function(err,res){
		console.log('body updated->',myBody);
		if(err) self.json(err);

		self.json(res);
	});

}

function deleteNoSql(id){
	var self = this;
	var dbrecord = NOSQL('record');

	dbrecord.remove().where('id',id).callback(function(err,res){
		if (err) self.json(err);

		self.json(res);
	})
}

// function getOneRecord(id){
// 	console.log('dentro getOneRecord');
// 	var self = this;
// 	var dbrecord = NOSQL('record').find();
//
// 	dbrecord.where('id',id).callback(function(err,res){
// 		return res[0];
// 	})
// }

function putNoSql(id){
	console.log('dentro putNoSql');
	var self = this;
	self.cors('*',['put']);
	var dbrecord = NOSQL('record');
	// var oldDoc = {};


	dbrecord.modify(self.req.body).make(function(builder){
		builder.where('id',id);
		builder.callback(function(err,count){
			if(err) self.json(err);

			console.log('updated documents : ',count);
			self.json(count);
		})
	})
	// var getOldDoc = new Promise(
	// 	function (resolve , reject) {
	// 		self.dbrecord.find().where('id',id).callback(function(err,res){
	// 				if(err) reject(err);
  //
	// 				resolve(res);
	// 			})
	// 	}
	// );
  //
	// var updateDoc = function () {
	// 	getOldDoc
	// 		.then(function(data){
	// 			console.log('data-->',data);
	// 			self.dbrecord.update(data,self.req.body);
	// 		})
	// 		.catch(function(err){
	// 			console.log('error-->',err.message);
	// 		})
	// }
  //
	// updateDoc();
}

function json_validate() {
	console.log("dentro post");
	var self = this;
	var uLData = self.req.body;
	console.log("req",uLData);
	var loginData = require('../fakeData/orders.json').Users;
	console.log("loginData",loginData);
	var user = uLData.username;
	var password = uLData.password;

	var dataUser = {}
	var status = {};
	for(var i=0;i<loginData.length;i++){
		if(loginData[i].user === user && loginData[i].password === password){
			console.log("utente trovato");
			status.message = "OK"
			dataUser.name = loginData[i].name;
			dataUser.user = loginData[i].user;
			dataUser.password = loginData[i].password;
			dataUser.odata = loginData[i].odata;
			self.json(dataUser);
			break;
		}
	}

		self.view401("Unauthorided")

}


function getOrders(name,menu,flag){
	console.log("dentro getOrders");
	console.log("name--> ",name);
	console.log("menu--> ",menu);
	console.log("flag--> ",flag);
	var self = this;
	var myData = require('../fakeData/orders.json').Users;
	var findUser;
	for(var i=0;i<myData.length;i++){
		console.log("nome utente",myData[i].name);
		if(myData[i].name == name){
			console.log("dati utente--> ",myData[i].entries);
			for(var c=0;c<myData[i].entries.length;c++){
				console.log("myData["+i+"].entries",myData[i].entries[c]);
				if(myData[i].entries[c].name==menu){
					findUser = myData[i].entries[c];
					break;
				}
			}
		}
	}

	if(!findUser){
		console.log("nessun utente trovato");
		self.view404();
	}else{
		self.json(findUser);
	}
}
