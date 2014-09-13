// Helper method to determine the number of keys in an object
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

// Game encapsulation
var Game = function(name, minNumPlayers, maxNumPlayers) {
	this.name = name;
	this.minNumPlayers = minNumPlayers;
	this.maxNumPlayers = maxNumPlayers;
};

Game.prototype.toString = function() {
	return this.name + '(' + this.minNumPlayers + ',' + this.maxNumPlayers + ')';
};

var gameLibrary = {
	'Agricola': new Game('Agricola', 3, 4),
	'Bora Bora': new Game('Bora Bora', 3, 4),
	'Bruges': new Game('Bruges', 3, 4),
	'Caverna': new Game('Caverna', 3, 7),
	'Concordia': new Game('Concordia', 3, 5),
	'Caylus': new Game('Caylus', 3, 5),
	'Eldrich Horror': new Game('Eldrich Horror', 3, 5),
	'Fantasy Frontier': new Game('Fantasy Frontier', 3, 4),	
	'Imperial': new Game('Imperial', 3, 6),
	'Kingdom Builder': new Game('Kingdom Builder', 3, 4),
	'Nations': new Game('Nations', 3, 5),
	'Ora & Labora': new Game('Ora & Labora', 3, 4),
	'Power Grid': new Game('Power Grid', 3, 5),
	'Russian Railroads': new Game('Russian Railroads', 3, 4),
	'Strasbourg': new Game('Strasbourg', 3, 5),
	'Suburbia': new Game('Suburbia', 3, 4),
	'Tichu': new Game('Tichu', 4, 4),
	'Tzolkin': new Game('Tzolkin', 3, 5),
	'Terra Mystica': new Game('Terra Mystica', 3, 5),
	'Vikings': new Game('Vikings', 3, 4)
};

var players = ['Maria', 'Daly', 'David', 'Zoe', 'Jonathan', 'Ben', 'Josh', 'Jen', 'Kai', 'Danny T', 'Emily', 'Danny L', 'Arthur'];


var ModalDialog = function(contents) {
	var bg = document.createElement('div');
	bg.id = 'modal-bg';
	bg.style.width = screen.width + 'px';
	bg.style.height = screen.height + 'px';
	
	var modal = document.createElement('div');
	modal.id = 'modal-content';
	modal.innerHTML = contents;
	
	document.body.appendChild(bg);
	document.body.appendChild(modal);
	
	var modalWidth = modal.offsetWidth;
	var modalHeight = modal.offsetHeight;
	
	var xPos = Math.max(0, window.innerWidth / 2 - modalWidth / 2);
	var yPos = Math.max(0, window.innerHeight / 2 - modalHeight / 2);
	
	modal.style.left = xPos;
	modal.style.top = yPos;
}

ModalDialog.prototype.remove = function() {
	document.body.removeChild(document.getElementById('modal-bg'));
	document.body.removeChild(document.getElementById('modal-content'));
}

var Generator = function() {
	// The list of all participating players
	this.playerList_ = [];
	this.gameList_ = [];
	this.gameToPlayerMap_ = {};
};

Generator.prototype.areAllPlayersPresentExactlyOnce_ = function(playerList) {
	if (Object.size(playerList) != this.playerList_.length) return false;
	var map = {};
    for (var i = 0; i < playerList.length; i++) {
      var person = playerList[i];
	  if (map[person]) {
		return false;
	  }
	  map[person] = true;
	}
	return Object.size(map) == this.playerList_.length;
};

Generator.prototype.generateSets_ = function(playerList, leftToPick, startingIndex, tempOutput, finalOutput) {
	if (leftToPick == 0) {
		finalOutput.push(tempOutput.slice());
		return;
	}
	for (var i = startingIndex; i < playerList.length; i++) {
		tempOutput.push(playerList[i]);
		this.generateSets_(playerList, leftToPick - 1, i + 1, tempOutput, finalOutput);
		tempOutput.pop();
	}
}

// Generate all possible sets of size |numToChoose| for the given |playerList|.
Generator.prototype.generatePlayersList = function(numToChoose, playerList) {
	var output = [];
	this.generateSets_(playerList, numToChoose, 0, [], output);
	return output;
}

Generator.prototype.assignPlayersToGames = function() {
    var viable_games = [];
    for (var i = 0; i < this.gameList_.length; i++) {
	   var game = this.gameList_[i];
	   if (this.gameToPlayerMap_[game.name].length >= game.minNumPlayers) {
		  viable_games.push(game);
	   }
    }
    console.log(viable_games);

	
	var game_to_sets = {};
	 
	for (var i = 0; i < viable_games.length; i++) {
	   var game = viable_games[i];
	   var players = this.gameToPlayerMap_[game.name];
       var acc = [];
	   for (var j = game.minNumPlayers; j <= game.maxNumPlayers && j <= players.length; j++) {
	     acc = acc.concat(this.generatePlayersList(j, players));
	   }
	   game_to_sets[game.name] = acc;
	}
	
	console.log(game_to_sets);
	
	var assignments = [];
	var numPlayers = this.playerList_.length;
	var time1 = new Date();
	if (numPlayers <= 5) {
		// look for exactly one set of all players
		for (var i = 0; i < viable_games.length; i++) {
		  var sets = game_to_sets[viable_games[i].name];
		  for (var j = 0; j < sets.length; j++) {
		    if (this.areAllPlayersPresentExactlyOnce_(sets[j])) {
			  assignments.push([[viable_games[i].name, sets[j]]]);
			}
		  }
		}
	}
	var time2 = new Date();
		
	if (numPlayers > 5 && numPlayers <= 10) {
		// look for 2 sets that satify the constraints
		for (var i = 0; i < viable_games.length; i++) {
			for (var j = i + 1; j < viable_games.length; j++) {
				var game1n = viable_games[i].name;
				var game2n = viable_games[j].name;
				for (var k = 0; k < game_to_sets[game1n].length; k++) {
					for (var l = 0; l < game_to_sets[game2n].length; l++) {
						var set1 = game_to_sets[game1n][k];
						var set2 = game_to_sets[game2n][l];
						if (this.areAllPlayersPresentExactlyOnce_(set1.concat(set2))) {
							assignments.push([[game1n, set1], [game2n, set2]]);
						}
					}
				}
			}
		}
	}
	var time3 = new Date();
	
	if (numPlayers > 8 && numPlayers <= 15) {
		// look for 3 sets that satisfy the constraints
		for (var a = 0; a < viable_games.length; a++) {
			for (var b = a + 1; b < viable_games.length; b++) {
				for (var c = b + 1; c < viable_games.length; c++) {
					var game1n = viable_games[a].name;
					var game2n = viable_games[b].name;
					var game3n = viable_games[c].name;
					
					for (var d = 0; d < game_to_sets[game1n].length; d++) {
						for (var e = 0; e < game_to_sets[game2n].length; e++) {
							for (var f = 0; f < game_to_sets[game3n].length; f++) {
								var list = [];
								list = list.concat(game_to_sets[game1n][d]);
								list = list.concat(game_to_sets[game2n][e]);
								list = list.concat(game_to_sets[game3n][f]);
								if (this.areAllPlayersPresentExactlyOnce_(list)) {
									assignments.push([[game1n, game_to_sets[game1n][d]], [game2n, game_to_sets[game2n][e]], [game3n, game_to_sets[game3n][f]]]);
								}
							}
						}
					}
				}
			}
		}
	}
		
	if (numPlayers > 12 && assignments.length == 0) {
		// sent error message: "This works best with fewer than 13 players"
	}

    var str = "";
    for (var i = 0; i < assignments.length; i++) {
	  for (var j = 0; j < assignments[i].length; j++) {
		str += assignments[i][j][0] + ": " + assignments[i][j][1].join(', ') + "<br>"
	  }
	  if (i != assignments.length - 1) {
	    str += '---------------------------------------------------<br>';	
	  }
    }
    if (assignments.length == 0) {
	   str += 'No possible matches found';
    } 
    document.getElementById('results').innerHTML = "Results: <br>" + str;
 
	
};

Generator.prototype.createNewCb_ = function(game, player) {
	var checkbox = document.createElement('input');
	checkbox.type = 'checkbox'
	checkbox.name = game;
	checkbox.value = player;
	return checkbox;
}

Generator.prototype.generateChoicesGrid = function() {		
	for (var item in gameLibrary) {
		this.gameList_.push(gameLibrary[item]);
	}
	
	var choiceTable = document.createElement('table');
	choiceTable.id = 'choices';
	// create a header with people's names
	var headerRow = document.createElement('tr');
	for (var i = 0; i < players.length + 1; i++) {
	  var cell = document.createElement('th');
	  if (i > 0) {
		 cell.innerHTML = players[i - 1];
	  }
	  headerRow.appendChild(cell);
	}
	
	// Add a player link
	var addPlayer = document.createElement('th');
	addPlayer.innerHTML = 'Add Player';
	addPlayer.id = 'addplayer';
	headerRow.appendChild(addPlayer);
	
	choiceTable.appendChild(headerRow);
	
	// create the rest of the rows
	for (var i = 0; i < this.gameList_.length; i++) {
		var row = document.createElement('tr');
		var gameName = document.createElement('th');
		gameName.innerHTML = this.gameList_[i].name;
		row.appendChild(gameName);
		
		for (var j = 0; j < players.length; j++) {
			var cell = document.createElement('td');
			var checkbox = this.createNewCb_(this.gameList_[i].name, players[j]);
			cell.appendChild(checkbox);
			row.appendChild(cell);
		}
		
		// add an empty column for add player header
		row.appendChild(document.createElement('td'));		
		choiceTable.appendChild(row);
	}
	
	var addGameRow = document.createElement('tr');
	addGameCell = document.createElement('th');
	addGameCell.innerHTML = 'Add Game';
	addGameCell.id = 'addgame';
	emptyCell = document.createElement('td');
	emptyCell.id ='addgamecell';
	emptyCell.rowspan = this.gameList_.length;
	addGameRow.appendChild(addGameCell);
	addGameRow.appendChild(emptyCell);
	
	choiceTable.appendChild(addGameRow);
	
	document.getElementById('tableForChoosing').appendChild(choiceTable);
	
}

Generator.prototype.matchPeopleToGames = function() {
	var tableRows = document.getElementById('choices').childNodes;
	var playerMap = {};
	this.gameToPlayerMap_ = {};
	for (var i = 1; i < this.gameList_.length + 1; i++) {
		this.gameToPlayerMap_[this.gameList_[i - 1].name] = [];
		for (var j = 1; j < players.length + 1; j++) {
			if (tableRows[i].childNodes[j].firstChild.checked) {
				this.gameToPlayerMap_[this.gameList_[i - 1].name].push(players[j - 1]);
				playerMap[players[j - 1]] = true;
			}
		}
	}
	
	this.playerList_.length = 0;
	for (var person in playerMap) {
		if (playerMap[person]) {
			this.playerList_.push(person);
		}
	}
	
	console.log(this.gameToPlayerMap_);
	console.log(this.playerList_);
	
	this.assignPlayersToGames();	
}

Generator.prototype.updatePlayerList = function() {
	var playerName = document.getElementById('playerName').value;
	if (!playerName) return;
	
	this.modal_.remove();
	this.modal_ = null;
	
	// Insert a column for the new player
	players.push(playerName);
	
	var choiceTable = document.getElementById('choices');
	var row = choiceTable.children[0];
	var nameCell = document.createElement('th');
	nameCell.innerHTML = playerName;
	row.insertBefore(nameCell, row.lastChild);
	
	for (var i = 0; i < this.gameList_.length; i++) {
	    row = choiceTable.children[i + 1];
		var lastElement = row.lastChild;
		var td = document.createElement('td');
		var newCb = this.createNewCb_(this.gameList_[i].name, playerName);
		td.appendChild(newCb);
		row.insertBefore(td, lastElement);
	}
	
	document.getElementById('addgamecell').rowspan += 1;
}

Generator.prototype.updateGameList = function() {
	var gameName = document.getElementById('gameName').value;
	var gameMinPlayers = parseInt(document.getElementById('gameMin').value, 10);
	var gameMaxPlayers = parseInt(document.getElementById('gameMax').value, 10);
	
	if (!gameName || !(gameMinPlayers > 0) || !(gameMaxPlayers > 0)) return;
	
	this.modal_.remove();
	this.modal_ = null;
	
	var gameObj = new Game(gameName, gameMinPlayers, gameMaxPlayers);
	gameLibrary[gameName] = gameObj;
	
	var rowToInsertBefore = this.gameList_.length;
	
	// Add new game to the game list
	for (var i = 0; i < this.gameList_.length; i++) {
		if (this.gameList_[i] > gameName) {
			this.gameList_.splice(i, 0, gameObj);
			console.log('Game list: ' + this.gameList_)
			rowToInsertBefore = i + 1;
			break;
		}
	}

	// Insert a row at 'rowToInsert'
	
	var row = document.createElement('tr');
	var nameCell = document.createElement('th');
	nameCell.innerHTML = gameName;
	row.appendChild(nameCell);
	for (var j = 0; j < players.length; j++) {
		var td = document.createElement('td');
		var cb = this.createNewCb_(gameName, players[j]);
		td.appendChild(cb);
		row.appendChild(td);
	}
	row.appendChild(document.createElement('td'));
	
	var choiceTable = document.getElementById('choices');
  	choiceTable.insertBefore(row, choiceTable.children[rowToInsertBefore]);
}

Generator.prototype.addPlayer = function() {
	var content = '<div>' +
	'<h3 align="center">Enter Player Name: </h3>' +
	'<div style="text-align: center">' +
	'<input type="text" id="playerName"></input>' +
	'<button id="playerAddButton">Add</button>' +
	'</div>'
	'</div>'
	this.modal_ = new ModalDialog(content);
	document.getElementById('playerName').focus();
	document.getElementById('playerAddButton').addEventListener('click', this.updatePlayerList.bind(this));
}

Generator.prototype.addGame = function() {
	var content = '<div>' + 
	'<h3 style="text-align:center">Add New Game: </h3>' +
	'<table class="addGameTable"><tr>' +
	'<td><label for="gameName">Game Name:</label></td>' +
	'<td><input id="gameName" type="text"></input></td></tr>' +
	'<tr><td><label for="gameMin">Min Players:</label></td>' +
	'<td><input id="gameMin" type="text" size=2></input></td></tr>' +
	'<tr><td><label for="gameMax">Max Players:</label></td>' +
	'<td><input id="gameMax" type="text" size=2></input></td></tr>' +
	'<tr><td colspan=2><button id="gameAddButton">Add</button></td></tr>' +
	'</table>' +
	'</div>';
	this.modal_ = new ModalDialog(content);
	document.getElementById('gameName').focus();
	document.getElementById('gameAddButton').addEventListener('click', this.updateGameList.bind(this));
}

function initialize() {
	var gen = new Generator();
	gen.generateChoicesGrid();
	document.getElementById('generate').addEventListener('click', gen.matchPeopleToGames.bind(gen));
	document.getElementById('addplayer').addEventListener('click', gen.addPlayer.bind(gen));
	document.getElementById('addgame').addEventListener('click', gen.addGame.bind(gen));
}

