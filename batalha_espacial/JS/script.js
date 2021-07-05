

(function(){
	//canvas
	var cnv = document.querySelector('canvas');
	//contexto de renderização 2d
	var ctx = cnv.getContext('2d');
	
	//RECURSOS DO JOGO ========================================================>
	//arrays
	var sprites = [];
	var assetsToLoad = [];
	var missiles = [];
	var aliens =[]
	var messages = []

	//var uteis
	var alienFrequency = 100;
	var alienTimer = 0;
	var shoots = 0
	var hits = 0
	var acuracy =0
	var scoreToWin =70
	
	//sprites
	//cenário
	var background = new Sprite(0,56,400,500,0,0);
	sprites.push(background);
	
	//nave
	var defender = new Sprite(0,0,30,50,185,450);
	sprites.push(defender);

	//menssagem inicial
	var startMessage = new ObjectMessage(cnv.height/2,"PRESS ENTER", "#f00" )
	messages.push(startMessage)

	//menssagem de pausa
	var pausedMessage = new ObjectMessage(cnv.height/2,"PAUSED", "#f00")
	pausedMessage.visible = false
	messages.push(pausedMessage)

	//menssagewm de game over
	var gameOverMessage = new ObjectMessage(cnv.height/2,"", "#f00")
	gameOverMessage.visible = false
	messages.push(gameOverMessage)


	//score de menssagem placar
	var scoreMessage = new ObjectMessage(10,"","#0f0")
	updateScore()
	messages.push(scoreMessage)


	
	//imagem
	var img = new Image();
	img.addEventListener('load',loadHandler,false);
	img.src = "img/img.png";
	assetsToLoad.push(img);
	//contador de recursos
	var loadedAssets = 0;
	
	
	//entradas
	var LEFT = 37, RIGHT = 39, ENTER = 13, SPACE = 32;
	
	//ações
	var mvLeft = mvRight = shoot = spaceIsDown = false;
	
	//estados do jogo
	var LOADING = 0, PLAYING = 1, PAUSED = 2, OVER = 3;
	var gameState = LOADING;
	
	//listeners
	window.addEventListener('keydown',function(e){
		var key = e.keyCode;
		switch(key){
			case LEFT:
				mvLeft = true;
				break;
			case RIGHT:
				mvRight = true;
				break;
			case SPACE:
				if(!spaceIsDown){
					shoot = true;
					spaceIsDown = true;
				}
				break;
		}
	},false);
	
	window.addEventListener('keyup',function(e){
		var key = e.keyCode;
		switch(key){
			case LEFT:
				mvLeft = false;
				break;
			case RIGHT:
				mvRight = false;
				break;
			case ENTER:
				if(gameState !== OVER){
					if(gameState !== PLAYING){
						gameState = PLAYING;
						startMessage.visible =false
						pausedMessage.visible = false
					} else {
						gameState = PAUSED;
						pausedMessage.visible = true
						
					}
				}
				
				break;
			case SPACE:
				spaceIsDown = false;
		}
	},false);
	
	
	
	//FUNÇÕES =================================================================>
	function loadHandler(){
		loadedAssets++;
		if(loadedAssets === assetsToLoad.length){
			img.removeEventListener('load',loadHandler,false);
			//inicia o jogo
			gameState = PAUSED;
		}
	}
	
	function loop(){
		requestAnimationFrame(loop, cnv);
		//define as ações com base no estado do jogo
		switch(gameState){
			case LOADING:
				console.log('LOADING...');
				break;
			case PLAYING:
				update();
				break;
			case OVER:
				endGame()
				break

		}
		render();
	}
	
	function update(){
		//move para a esquerda
		if(mvLeft && !mvRight){
			defender.vx = -5;
		}
		
		//move para a direita
		if(mvRight && !mvLeft){
			defender.vx = 5;
		}
		
		//para a nave
		if(!mvLeft && !mvRight){
			defender.vx = 0;
		}
		
		//dispara o canhão
		if(shoot){
			fireMissile();
			shoot = false;
		}
		
		//atualiza a posição
		defender.x = Math.max(0,Math.min(cnv.width - defender.width, defender.x + defender.vx));
		
		//atualiza a posição dos mísseis
		for(var i in missiles){
			var missile = missiles[i];
			missile.y += missile.vy;
			if(missile.y < -missile.height){ //missel saiu da tela
				removeObjects(missile,missiles);
				removeObjects(missile,sprites);
				updateScore() //missel fora //rendimento menor no placar
				i--;
			}
		}
		
		//encremento do alien timer
		alienTimer++;

		//criaçao do alien caso o timer se iguale a frequencia
		if(alienTimer === alienFrequency){
			makeAlien()
			alienTimer = 0
			//ajuste na frenquencia de criaçao de aliens
			if( alienFrequency > 2){
				alienFrequency--
			}
		}
		//move os aliens
		for(var i in aliens){
			var alien = aliens[i];
			if(alien.state !== alien.EXPLODED){
				alien.y += alien.vy;
				if(alien.state === alien.CRAZY){ //botando colisao de canto de tala para o alien cryze
					if(alien.x >cnv.width-alien.width || alien.x < 0){
						alien.vx *= -1
					}
					alien.x += alien.vx
				}
			}
			//se algum alien chegou na terra
		if(alien.y > cnv.height + alien.height){
			gameState = OVER
			}
			//confere se algum alien colidiu coma nave
		if(collide(alien,defender)){
			destroyAlien(alien)
			removeObjects(defender,sprites)
			gameState = OVER
		}

		//varredura de misseis para ver se houve colisao //confere se algum alien foi destruido
		for (var j in missiles){
			var missile = missiles[j]
			if(collide(missile,alien) && alien.state !== alien.EXPLODED){
				destroyAlien(alien)
				hits++ //quantas naves foram destruidas //placar
				updateScore()
				if(parseInt(hits) === scoreToWin){
					gameState = OVER
					//destroi todos os aliens
					for(var k in aliens){
						var alienk = aliens[k]
						destroyAlien(alienk)
					}
				}
				removeObjects(missile , missiles )
				removeObjects(missile , sprites)
				j--
				i--
			}
		}



		}//fim da movimenta çao dos aliens



		
	}//fim update
	
	//criação dos mísseis
	function fireMissile(){
		var missile = new Sprite(136,12,8,13,defender.centerX() - 4,defender.y - 13);
		missile.vy = -8;
		sprites.push(missile);
		missiles.push(missile);
		shoots++ //conta quantos misseis foram criadados
	}
	//criaçao de aliens
	function makeAlien(){
		//cria um valor aleatorio entre 0  e 7 => largura do canvas sobre a largura do alien 
		//,dividindo o canva em 8 colunos para o posicionamento aleatorio
		var alienPosition = (Math.floor(Math.random()* 8)) * 50
		//console.log(alienPosition)
		var alien = new Alien(30,0,50,50,alienPosition,-50)
		alien.vy =1

		//otimizaçao do alien
		if(Math.floor(Math.random()* 11)> 7){ //30 porcento de chance
			alien.state = alien.CRAZY
			alien.vx = 2
		}

		if(Math.floor(Math.random()* 11)> 5){
			alien.vy = 2
		}

		sprites.push(alien)
		aliens.push(alien)
	}
// destruir alien 
	function destroyAlien(alien){
		alien.state = alien.EXPLODED
		alien.explode()
		setTimeout(function(){ //1 seg depois ele some
			removeObjects(alien,aliens)
			removeObjects(alien , sprites)
		},500)
	}
	
	//remove os objetos do jogo
	function removeObjects(objectToRemove,array){
		var i = array.indexOf(objectToRemove);
		if(i !== -1){
			array.splice(i,1);
		}
	}

	//atualizaçao do placar
	function updateScore(){
		//calculo do aproveitamento
		if(shoots === 0){
			acuracy = 100
		}else{
			acuracy = Math.floor((hits/shoots)*100)
		}
		//ajuste no texto do aproveitamento
		if(acuracy<100){
			acuracy= acuracy.toString()//trasformou um string //o texto é um array de caracteres
			if(acuracy.length<2){//entre 9 e 0
				acuracy= "  " + acuracy
			}else{
				acuracy=" " + acuracy
			}
		}
		//ajusto no texto dos hits
	
		
		scoreMessage.font = "normal bold 10px emulogic"
		scoreMessage.text = "HITS :"+ hits + "- ACURACY = "+ acuracy +"%"

	}


	//funçao de game over
	function endGame(){
		if(hits < scoreToWin){
			gameOverMessage.text = "TERRA DESTRUIDA"
		}else{
			gameOverMessage.text = "TERRA FOI SALVA"
			gameOverMessage.color = "#00f"
		}
		gameOverMessage.visible = true
		setTimeout(function(){
			location.reload() //recarrega pagnina f5
		},3000)
	}
	
	function render(){
		ctx.clearRect(0,0,cnv.width,cnv.height);
		//exibe os sprites
		if(sprites.length !== 0){
			for(var i in sprites){
				var spr = sprites[i];
				ctx.drawImage(img,spr.sourceX,spr.sourceY,spr.width,spr.height,Math.floor(spr.x),Math.floor(spr.y),spr.width,spr.height);
			}
		}
		//exibe os textos
		if(messages.length !== 0){
			for(var i in messages){
				var msg = messages[i]
				if(msg.visible){
					ctx.font = msg.font
					ctx.fillStyle = msg.color
					ctx.textBaseline = msg.baseline
					msg.x = (cnv.width - ctx.measureText(msg.text).width)/2//measurtext pega o comprimento do texto
					ctx.fillText(msg.text,msg.x,msg.y)
				}
			}
		}
	}
	
	loop();

	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
}());

