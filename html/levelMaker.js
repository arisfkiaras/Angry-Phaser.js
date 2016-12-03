var backgroung_img;
var background;
var items;

window.onload = function() {
    game = new Phaser.Game(1000, 600, Phaser.AUTO, "content");
    game.state.add("PlayGame",playGame);
    game.level = readLevelS("canvas");
    backgroung_img = game.level['assets']['backgroung_img'];
    console.log(backgroung_img);
    game.state.start("PlayGame");
    items = [];
    document.getElementById('fileinput').addEventListener('change', loadMap, false);

}

var playGame = function(game) {};
var structuresGroup = [];

function fx() {
    background = game.add.tileSprite(0, 0, 1000, 600, "background");
    //game.add.sprite(0, 0, 'image-url');

}

playGame.prototype = {

	preload: function() {
        //getDataUri("http://i.imgur.com/rIT7o9g.png");

        game.load.image('ksiloTD', 'assets/image/topBot.png');
        game.load.image('ksiloLR', 'assets/image/leftRight.png');
        game.load.spritesheet('hontros', 'assets/image/pig.png', 70, 70, 6);
        game.load.image('background', 'assets/image/lm/' + backgroung_img);

	},

	create: function() {
        //game.add.sprite(0, 0, 'image-url');
        game.input.keyboard.onDownCallback = function(e) {
            switch (e.key) {
                case '3':
                    //addStructure(100, 100, "ksiloTD");
                    break;
                case '2':
                    //addStructure(100, 100, "ksiloLR");
                    break;
                case '1':
                    //addStructure(100, 100, "hontros");
                    break;
                case 'd':
                    console.log("be");
                    if (dragging) {
                        removeItem(currentItem);
                    }
                    break;
                case 'f':
                    console.log(items);
                    break;
                default:

            }

        }
        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.gravity.y = 200
        game.physics.p2.setImpactEvents(true);

        fx();
        //setTimeout(fx, 30000);
        structureCollisionGroup = game.physics.p2.createCollisionGroup();
        targetCollisionGroup = game.physics.p2.createCollisionGroup();
        bulletCollisionGroup = game.physics.p2.createCollisionGroup();

        game.physics.p2.updateBoundsCollisionGroup();

       //game.physics.p2.enable(structuresGroup[structure]);
      // structuresGroup[structure].body.setCollisionGroup(structureCollisionGroup);
      // structuresGroup[structure].body.collides([bulletCollisionGroup, targetCollisionGroup, structureCollisionGroup]);

       //addStructure(10,10, "ksiloTD");
	},

	update: function() {

	}
}

function addStructure(x, y, asset) {
	var structure = game.add.sprite(x, y, asset);
    structuresGroup.push(structure);
    structure.anchor.setTo(0.5);
    structure.inputEnabled = true;
    structure.input.enableDrag();
    structure.events.onDragStart.add(dragStart, this);
    structure.events.onDragStop.add(dragStop, this);
    //game.physics.p2.enable(structure);
    items.push(structure);
}

var dragging;
function dragStart(sprite, pointer) {
    //game.physics.p2.disable(sprite);
    dragging = true;
    currentItem = sprite;
}

function dragStop(sprite, pointer) {
    //game.physics.p2.enable(sprite);
	//sprite.body.setCollisionGroup(structureCollisionGroup);
	//sprite.body.collides([targetCollisionGroup, structureCollisionGroup]);
	//sprite.inputEnabled = false;
    dragging = false;
}

function removeItem(sprite) {

    var iloc = items.indexOf(sprite);
    if (iloc > -1) {
        items.splice(iloc, 1);
    }
    sprite.destroy();
}

function setData() {
    console.log(document.getElementById("backVal").value);
    game.level['assets']['backgroung_img'] = document.getElementById("backVal").value;
    console.log(game.level['assets']['backgroung_img']);
    game.load.image('background', 'assets/image/lm/' + game.level['assets']['backgroung_img']);
    //background.loadTexture();
    onLoaded = function() {
        console.log('everything is loaded and ready to be used');
        //background.loadTexture();
        background.destroy();
        background = game.add.tileSprite(0, 0, 1000, 600, "background");
        background.z = 11;
     }


    loader = new Phaser.Loader(game);
    loader.image('background', 'assets/image/lm/' + game.level['assets']['backgroung_img'] );
    //loader.atlasJSONHash('anotherAtlas', '//url/to/texture' , '//url/to/atlas' );
    loader.onLoadComplete.addOnce(onLoaded);
    loader.start()
    var bulletsArray = [];
    var bulletsN = document.getElementById("bulletsVal").value;
    for (i = 0; i < bulletsN; i++) {
        bulletsArray.push("normal");
    }
    game.level['bullets'] = bulletsArray;
    console.log(bulletsN);
}

function saveMap() {
    updateGameLevel();
    var json = JSON.stringify(game.level);
    var blob = new Blob([json], {type: "application/json"});
    var url  = URL.createObjectURL(blob);

    var a = document.createElement('a');
    a.download    = "backup.json";
    a.href        = url;
    a.textContent = "Download backup.json";
    a.click();
    //window.open(a.href);
    //document.getElementById('content').appendChild(a);
}

function updateGameLevel() {
    var ksiloTD = [];
    var ksiloLR = [];
    var hontros = [];

    for (var ob in items) {
        //console.log(items[ob]);
        switch (items[ob].key) {
            case 'ksiloTD':
                ksiloTD.push([items[ob].x, items[ob].y]);
                break;
            case 'ksiloLR':
                ksiloLR.push([items[ob].x, items[ob].y]);
                break;
            case 'hontros':
                hontros.push([items[ob].x, items[ob].y]);
                break;
            default:
        }
    }
    game.level['structure']['ksiloTD'] = ksiloTD;
    game.level['structure']['ksiloLR'] = ksiloLR;
    game.level['targets']['hontros'] = hontros;

}

function loadMap(evt) {
    //Retrieve all the files from the FileList object
    var files = evt.target.files;

    if (files) {
        for (var i=0, f; f=files[i]; i++) {
	          var r = new FileReader();
            r.onload = (function(f) {
                return function(e) {
                    var contents = e.target.result;
                    game.level = JSON.parse(contents);
                    refreshGameLevel();
                };
            })(f);

            r.readAsText(f);
        }
    } else {
	      alert("Failed to load files");
    }
}

function refreshGameLevel() {
    game.load.image('background', 'assets/image/lm/' + game.level['assets']['backgroung_img']);
    onLoaded = function() {
        background.destroy();
        background = game.add.tileSprite(0, 0, 1000, 600, "background");
     }

    loader = new Phaser.Loader(game);
    loader.image('background', 'assets/image/lm/' + game.level['assets']['backgroung_img'] );
    loader.onLoadComplete.addOnce(onLoaded);
    loader.start()
    document.getElementById("backVal").value = game.level['assets']['backgroung_img'];
    document.getElementById("bulletsVal").value = game.level['bullets'].length;


    for (var itttm in items) {
        items[itttm].destroy();
    }
    items = [];
    var itemsss = game.level['structure'];
    console.log(itemsss);
    for (var key in itemsss) {
        var value = itemsss[key];
        for (var ar in value) {
            addStructure(value[ar][0], value[ar][1], key);
        }
    }
    var itemsss = game.level['targets'];
    console.log(itemsss);
    for (var key in itemsss) {
        var value = itemsss[key];
        for (var ar in value) {
            addStructure(value[ar][0], value[ar][1], key);
        }
    }
}
