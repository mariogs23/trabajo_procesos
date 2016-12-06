
var player;
var platforms;
var cursors;
var cielo;

var Meteoritos;
var score = 0;
var scoreText;
var timer;
var tiempo=0;
var tiempoText;

var maxNiveles=3;
var ni;

var nivel;
var coord;
var gravedad;


inicializarCoordenadas();

function crearNivel(data){

    if(data.nivel<0)
    {
        noHayNiveles();

    }
    else{
        game = new Phaser.Game(800, 600, Phaser.AUTO, 'juegoId', { preload: preload, create: create, update: update });

        nivel= data.id;
        coord= data.coordenadas;
        gravedad=data.gravedad;
  
    }
}
 

        function preload() {
                game.load.image('sky', 'assets/sky.png');
                game.load.image('ground', 'assets/platform.png');
                game.load.image('ground2', 'assets/platform2.png');
                game.load.image('meteorito', 'assets/meteorito.png');
                //game.load.image('explosion', 'assets/explosion.png'); Esploit
                game.load.spritesheet("explosion","assets/explosion.png",34.28,36);
                game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
                game.load.spritesheet('dude2', 'assets/dude2.png', 32, 48);
                game.load.image('cielo','assets/heaven.png');
        }



        function create() {

                //  We're going to be using physics, so enable the Arcade Physics system
                game.physics.startSystem(Phaser.Physics.ARCADE);

                //  A simple background for our game
                game.add.sprite(0, 0, 'sky');

                //  The platforms group contains the ground and the 2 ledges we can jump on
                platforms = game.add.group();
                cielo = game.add.group();

                //  We will enable physics for any object that is created in this group
                platforms.enableBody = true;
                cielo.enableBody = true;

                var fin=cielo.create(0,-15,'cielo');
                fin.scale.setTo(2,1);

                // Here we create the ground.
                var ground = platforms.create(0, game.world.height - 64, 'ground');

                //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
                ground.scale.setTo(2, 2);

                //  This stops it from falling away when you jump on it
                ground.body.immovable = true;

                //  Now let's create two ledges
                var ledge;// = platforms.create(400, 400, 'ground');
                //ledge.body.immovable = true;

                for(var i=0;i<4;i++){
                        ledge = platforms.create(coord[i][0], coord[i][1], 'ground2');
                        ledge.body.immovable = true;           
                }
                /*
                ledge = platforms.create(-150, 250, 'ground');
                ledge.body.immovable = true;

                ledge =platforms.create(320,100,'ground2');
                ledge.body.immovable = true;

                */

                // The player and its settings
                player = game.add.sprite(32, game.world.height - 150, 'dude');
                player.vidas=5;

                //  We need to enable physics on the player
                game.physics.arcade.enable(player);

                //  Player physics properties. Give the little guy a slight bounce.
                player.body.bounce.y = 0.2;
                player.body.gravity.y = 500;
                player.body.collideWorldBounds = true;

                //  Our two animations, walking left and right.
                player.animations.add('left', [0, 1, 2, 3], 10, true);
                player.animations.add('right', [5, 6, 7, 8], 10, true);

                //explosion = game.add.sprite(32, game.world.height - 150,"explosion");
                //explosion.animations.add ("explode",[1,0,2],2,true);

                //  Finally some Meteoritos to collect
                meteoritos = game.add.group();

                //  We will enable physics for any Meteorito that is created in this group
                meteoritos.enableBody = true;
                meteoritos.physicsBodyType = Phaser.Physics.ARCADE;
                //  Here we'll create 12 of them evenly spaced apart
                for (var i = 0; i < 12; i++)
                {
                    //  Create a star inside of the 'stars' group
                    //var meteorito = meteoritos.create(i * 70, 0, 'meteorito');
                    lanzarMeteorito();
                    //  Let gravity do its thing
                    //meteorito.body.gravity.y = 50;

                    //  This just gives each Meteorito a slightly random bounce value
                    //star.body.bounce.y = 0.7 + Math.random() * 0.2;
                    //star.checkWorldBounds = true;
                }

                //  The score
                scoreText = game.add.text(16, game.world.height - 50, 'Vidas: 5', { fontSize: '32px', fill: '#FFF' });

                tiempoText=game.add.text(game.world.width-180, game.world.height - 50,'Tiempo:0',{ fontSize: '32px', fill: '#FFF' });
                tiempo=0;
                timer=game.time.events.loop(Phaser.Timer.SECOND,updateTiempo,this);

                explosions=game.add.group();
                explosions.createMultiple(30,'explosion');
                explosions.forEach(setupPiedra,this);
                //  Our controls.
                cursors = game.input.keyboard.createCursorKeys();
                
            }

        function update() {

                //  Collide the player and the stars with the platforms
                game.physics.arcade.collide(player, platforms);
                //game.physics.arcade.collide(stars, platforms);

                //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
                game.physics.arcade.overlap(player, meteoritos, collectMeteorito, null, this);

                game.physics.arcade.overlap(player, cielo, terminaNivel, null, this);

                game.physics.arcade.overlap(platforms,meteoritos,muereMeteorito,null,this);

                //  Reset the players velocity (movement)
                player.body.velocity.x = 0;


                if (cursors.left.isDown)
                {
                    //  Move to the left
                    player.body.velocity.x = -150;

                    player.animations.play('left');
                }
                else if (cursors.right.isDown)
                {
                    //  Move to the right
                    player.body.velocity.x = 150;

                    player.animations.play('right');
                }
                else
                {
                    //  Stand still
                    player.animations.stop();

                    player.frame = 4;
                }
                
                //  Allow the player to jump if they are touching the ground.
                if (cursors.up.isDown && player.body.touching.down)
                {
                    player.body.velocity.y = -350;
                }

        }

        function lanzarMeteorito(){
            var x=Math.floor(Math.random()*765+1);
            var meteorito = meteoritos.create(x, 0, 'meteorito');
            meteorito.body.gravity.y = gravedad;
        }


        function updateTiempo(){
            tiempo++;
            tiempoText.setText('Tiempo: '+tiempo);
        }

        function collectMeteorito (player, meteorito) {       
                // Removes the Meteorito from the screen
                
                meteorito.kill();
                var explosion=explosions.getFirstExists(false);
                explosion.reset(player.body.x+16,player.body.y);
                explosion.play('explosion',7,false,true);

                //  Add and update the score
                player.vidas=player.vidas-1;
                player.loadTexture('dude2');
                scoreText.text = 'Vidas: ' + player.vidas;
                if (player.vidas==0){
                    player.kill();
                    //explosion(player);
                    game.time.events.remove(timer);
                    noHayNiveles()
                }
        }

        function terminaNivel(player,final){
            player.kill();
            game.time.events.remove(timer);
            nivelCompletado(tiempo);
            console.log(tiempo);
        }

        function muereMeteorito(platform,meteorito){
            meteorito.loadTexture('explosion');
            meteorito.kill();
            lanzarMeteorito();
        }

        function setupPiedra(piedra){
            piedra.anchor.x=0.5;
            piedra.anchor.y=0.5;
            piedra.animations.add('explosion');
        }

