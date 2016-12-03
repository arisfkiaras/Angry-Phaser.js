var maps;
var currentPage;
var lastPage;
var muted = false;
var music;

window.onload = function() {
    game = new Phaser.Game(1000, 600, Phaser.AUTO, "");
    game.state.add("menu",menu);
    game.state.add("pickmap",pickmap);
    game.state.add("playGame",playGame);

    game.state.start("menu");
}

var menu = function(game){};

menu.prototype = {

	preload: function() {
        game.load.spritesheet('button', 'assets/image/menu/mps.png', 300, 80);
        game.load.image('background','assets/image/menu/mmbackground.jpg');
        game.load.audio('backgroundAudio', ['assets/audio/background.mp3', 'assets/audio/background.ogg']);
    },

	create: function() {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;

        background = game.add.tileSprite(0, 0, 1000, 600, 'background');
        button = game.add.button(350, 200, 'button', function(){game.state.start("pickmap");}, this, 2, 1, 0);
        //button.onInputOver.add(over, this);//button.onInputOut.add(out, this);//button.onInputUp.add(up, this);

        if (music == null) {
            music = game.add.audio('backgroundAudio');
            music.loopFull();
        }
        //console.log(music);
    }
};

var pickmap = function(game){};

pickmap.prototype = {

	preload: function() {
        maps = readJsonFile("assets/maps/maps.data");
        for (var inn in maps['betaMapPack']){
            var name = maps['betaMapPack'][inn].preview;
            game.load.image(name,'assets/image/previews/' + name);
        }
        game.load.image('background','assets/image/menu/mpb.png');
        game.load.image('sampleP','assets/image/previews/sample.png');
        game.load.image('next','assets/image/menu/mpn.png');
        game.load.image('previous','assets/image/menu/mpp.png');
    },

	create: function() {

        //maps = readJsonFile("assets/maps/maps.data");
        //for (var inn in maps['betaMapPack']){
                //console.log(maps['betaMapPack'][inn].preview);
        //}
        //console.log(maps['betaMapPack'].length);

        currentPage = 1;
        lastPage = maps['betaMapPack'].length;

        hacker55 = this.birdDragStart;
        hacker155 = this.birdDragStop;

        background = game.add.tileSprite(0, 0, 1000, 600, 'background');
        //preview = game.add.tileSprite(300, 180, 400, 240, 'sampleP');
        preview = game.add.button(300, 180, '', this.next, this);

        var style = { font: "32px Arial", fill: "#ffffff", align: "center", backgroundColor: "#ffff00" };
        mapNameTextBox = game.add.text(0, 0, "Map Name", { font: "32px Arial", fill: "#000000"});
        mapNameTextBox.anchor.set(0.5);
        mapNameTextBox.x = 500;
        mapNameTextBox.y = 150;
        mapNameTextBox._text = "map";

        HighScoreTextBox = game.add.text(0, 0, "High Score : 0", { font: "32px Arial", fill: "#000000"});
        HighScoreTextBox.anchor.set(0.5);
        HighScoreTextBox.x = 500;
        HighScoreTextBox.y = 470;

        currentPageTextBox = game.add.text(0, 0, "1/0", { font: "22px Arial", fill: "#000000"});
        currentPageTextBox.anchor.set(0.5);
        currentPageTextBox.x = 800;
        currentPageTextBox.y = 120;
        next = game.add.button(750, 200, 'next', this.next, this);
        previus = game.add.button(50, 200, 'previous', this.previous, this);
        this.setLevel();
    },

    next: function() {
        if (currentPage >= lastPage) {
            game.state.start("menu");
        }
        currentPage++;
        this.setLevel();
    },

    previous: function() {
        if (currentPage <= 1) {
            game.state.start("menu");
        }
        currentPage--;
        this.setLevel();
    },

    setLevel: function() {
        // Should change frame instead
        preview.destroy();
        preview = game.add.button(300, 180, maps['betaMapPack'][currentPage-1]['preview'], function(){game.state.start("playGame");}, this);

        mapNameTextBox.setText(maps['betaMapPack'][currentPage-1]['name']);
        currentPageTextBox.setText( currentPage + "/" + lastPage);
        var score = localStorage.getItem(maps['betaMapPack'][currentPage-1]['id']+'HS');
        if (score > 0) {
            HighScoreTextBox.setText( "High Score : " + score);
        } else {
            HighScoreTextBox.setText( "High Score : 0");
        }

    }

};

var playGame = function(game){};

playGame.prototype = {

	preload: function(){
        game.levelData = maps['betaMapPack'][currentPage-1];
        game.level = readJsonFile('assets/maps/' + game.levelData.file);

        // Should only load images used by level.
        game.load.image('ksiloTD', 'assets/image/topBot.png');
        game.load.image('ksiloLR', 'assets/image/leftRight.png');
        game.load.spritesheet('hontros', 'assets/image/pig.png', 70, 70, 6);
        game.load.image("bullet", "assets/image/bb.png");
        game.load.image("reload", "assets/image/icons/reload.png");
        game.load.image("home", "assets/image/icons/home.png");
        game.load.image("next", "assets/image/icons/next.png");


        game.load.audio('pigDeath', ['assets/audio/pigDeath.mp3', 'assets/audio/pigDeath.ogg']);
		game.load.audio('cykaAudio', ['assets/audio/laugh.mp3', 'assets/audio/laugh.ogg']);

        game.load.image('background', 'assets/image/backgrounds/' + game.level['assets']['backgroung_img']);


        // Level specific values
        point = {};
        point.x = 160;
        point.y = 500;
        bulletsLeft = game.level['bullets'].length;
        targetHealth = 4;
	},

	create: function(){

        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.gravity.y = 200
        game.physics.p2.setImpactEvents(true);

        drawSfentona = false;
        erase = false;
        cooldown = 500;
        finished = false;
        score = 0;

        this.fx();
        reloadB = game.add.button(70,0, 'reload', function(){game.state.start("playGame");}, this);
        homeB = game.add.button(0,0, 'home', function(){game.state.start("pickmap");}, this);

        structureCollisionGroup = game.physics.p2.createCollisionGroup();
        targetCollisionGroup = game.physics.p2.createCollisionGroup();
        bulletCollisionGroup = game.physics.p2.createCollisionGroup();
        game.physics.p2.updateBoundsCollisionGroup();

        this.addStructures(game.level['structure']);
        for (var structure in structuresGroup) {
            game.physics.p2.enable(structuresGroup[structure]);
            structuresGroup[structure].body.setCollisionGroup(structureCollisionGroup);
            structuresGroup[structure].body.collides([bulletCollisionGroup, targetCollisionGroup, structureCollisionGroup]);
        }

        this.addTargets(game.level['targets']);
        for (var target in targetsGroup) {
            game.physics.p2.enable(targetsGroup[target]);
            targetsGroup[target].body.setCollisionGroup(targetCollisionGroup);
            targetsGroup[target].body.collides([bulletCollisionGroup, targetCollisionGroup, structureCollisionGroup], this.targetHit, this);
        }

        this.arm();
    },

    update: function() {
        if (finished) {
            return;
        }
        if (erase) {
            bmd.clear();
            erase = false;
        }
        if (drawSfentona) {
            erase = true;
            bmd.clear();
            bmd.ctx.beginPath();
            bmd.ctx.moveTo(160, 500);
            bmd.ctx.lineTo(currentBird.x , currentBird.y);

            //bmd.ctx.lineTo(game.input.x , game.input.y);
            bmd.ctx.lineWidth = 4;
            bmd.ctx.stroke();
            bmd.ctx.closePath();
            bmd.render();
             //bmd.refreshBuffer();
        }
        if (targetsGroup.length < 1) {
            this.finish(true);
        }
        if (bulletsLeft < 1) {
            if (currentBird.body != null){
                if ( (Math.abs(currentBird.body.velocity.x) < 0.01)  && (Math.abs(currentBird.body.velocity.x) < 0.01) ){
                    this.finish(false);
                }
            }
            //youLose();
        }
    },

    fx: function() {
        background = game.add.tileSprite(0, 0, 1000, 600, "background");
        graphics = game.add.graphics(0, 0);
        bmd = game.add.bitmapData(1000,600);

        graphics.beginFill(0xFF0000, 1);
        graphics.drawCircle(point.x, point.y, 10);

        bmd.ctx.beginPath();
        bmd.ctx.lineWidth = "4";
        bmd.ctx.strokeStyle = 'brown';
        bmd.ctx.stroke();
        sprite = game.add.sprite(0, 0, bmd);

        scoreboard = game.add.text(800, 10, "Score: 0", { font: "28px Arial", fill: "#000000"});

        pigDeathSoundEffect = game.add.audio('pigDeath');
        cykaAudio = game.add.audio('cykaAudio');
    },

    addStructures: function(stuctures) {
        structuresGroup = [];
        for (var key in stuctures){
            var value = stuctures[key];
            for (var ar in value){
                this.addStructure(value[ar][0], value[ar][1], key);
            }
        }
    },

    addStructure: function(x, y, asset) {
        var structure = game.add.sprite(x, y, asset);
        structuresGroup.push(structure);
    },

    addTargets: function(targets) {
        targetsGroup = [];
        for (var key in targets){
            var value = targets[key];
            for (var ar in value){
                this.addTarget(value[ar][0], value[ar][1], key);
            }
        }
    },

    addTarget: function(x, y, asset) {
        target = game.add.sprite(x, y, asset, 0);
        anim = target.animations.add('die');
        target.yolo = anim;
        targetsGroup.push(target);
    },

    targetHit: function(body1, body2) {
        var damageTaken = Math.abs(body1.velocity.x) + Math.abs(body1.velocity.y);
    	//console.log("Damage: " + damageTaken);

    	if (damageTaken > targetHealth && !body1.hit){
    		body1.hit = true
    		body1.sprite.yolo.onComplete.add(this.kill, this);
    		body1.sprite.yolo.play(7, 1,false);
            score += 500;
            scoreboard.setText("Score: " + score);
            pigDeathSoundEffect.play();

    		//pigDeathSoundEffect.play();
    	}
    },

    kill: function(sprite, animation) {
        sprite.kill();
        targetsGroup.pop(sprite);
    },

    arm: function() {
        if (bulletsLeft < 1) {
            return;
        }
        var bird = game.add.sprite(point.x, point.y, "bullet");
        bird.anchor.setTo(0.5);
        bird.inputEnabled = true;
        bird.input.enableDrag();
        bird.events.onDragStart.add(playGame.prototype.birdDragStart, this);
        bird.events.onDragStop.add(playGame.prototype.birdDragStop, this);
        var limitBox = 250;
        bounds = new Phaser.Rectangle(point.x-(limitBox/2), point.y-(limitBox/2), limitBox, limitBox);
        bounds.anchor = 0.5;
        bird.input.boundsRect = bounds;
    },

    birdDragStart: function(sprite, pointer) {
        currentBird = sprite;
        drawSfentona = true;
    },

    birdDragStop: function(sprite, pointer) {
        drawSfentona = false;
    	var angle = Phaser.Math.angleBetween(sprite.x,sprite.y,point.x,point.y);
    	var speed = 15;
        var dx = sprite.x - point.x;
        var dy = sprite.y - point.y;
        var distanced = Math.sqrt(dx * dx + dy * dy);

        //console.log(distanced);
    	game.physics.p2.enable(sprite);
    	sprite.body.setCollisionGroup(bulletCollisionGroup);
        sprite.body.collides([bulletCollisionGroup, targetCollisionGroup, structureCollisionGroup]);

    	sprite.inputEnabled = false;

    	sprite.body.velocity.x += distanced * speed * Math.cos(angle);
    	sprite.body.velocity.y += distanced * speed * Math.sin(angle);
        currentBird = sprite;
        bulletsLeft--;
        cykaAudio.play();
        setTimeout(this.arm, cooldown);
    },

    finish: function(doWeWin) {
        finished = true;
        score += bulletsLeft * 1000;
        scoreboard.setText("Score: " + score);

        graphics.beginFill(0xffffff, 1);
        game.world.bringToTop(graphics);
        graphics.drawRect(225, 125, 550, 350);
        message = game.add.text(500, 175, "", { font: "38px Arial", fill: "#000000"});
        message.anchor.set(0.5);

        yourScore = game.add.text(380, 250, "Your Score: " + score, { font: "25px Arial", fill: "#000000"});


        highScore = localStorage.getItem(game.level['info']['id'] + 'HS');
        if (highScore < 0) {
            highScore = 0;
        }
        if (highScore < score) {
            highScore = score;
            localStorage.setItem(game.level['info']['id'] + 'HS', score);
        }

        if (doWeWin) {
            message.setText("You Win!");

        } else {
            message.setText("You Suck!");
        }

        highScoreM = game.add.text(380, 305, "High Score: " +highScore , { font: "25px Arial", fill: "#000000"});

        reloadB = game.add.button(450,375, 'reload', function(){game.state.start("playGame");}, this);
        homeB = game.add.button(300,375, 'home', function(){game.state.start("pickmap");}, this);
        nextB = game.add.button(600,375, 'next', this.nextLevel, this);

    },

    nextLevel: function() {
        if (currentPage >= lastPage) {
            game.state.start("menu");
        } else {
            currentPage++;
            game.state.start("playGame");
        }
    }

};

function readJsonFile(filePath) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", filePath, false);
    xhr.send();
    if (xhr.status === 200) {
      return JSON.parse(xhr.responseText);
    }
}
