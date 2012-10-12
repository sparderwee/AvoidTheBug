/*!
 * Avoid the Bug (game) v1.0
 * http://dimitros.net/
 *
 * by Dimitrios Kourkoulis
 * Released under the Creative Commons Attribution 2.0 Generic License
 * http://creativecommons.org/licenses/by/2.0/
 *
 * Date: 12/10/2012
 */

function avoidTheBug()
{
    // This delta is used to ensure the desired frame rate
    // It measures how much time has passed on every
    // frame interval event since the last rendering of the screen
    avoidTheBug.delta = 0;

    // Previous time kept
    avoidTheBug.before = (new Date()).getTime();

    // Key state variables
    avoidTheBug.keyUp = false;
    avoidTheBug.keyDown = false;
    avoidTheBug.keyLeft = false;
    avoidTheBug.keyRight = false;
    avoidTheBug.site = location.host;

    // Get the get the URL of the site where the game is running
    // (this will be used for checking and recording high scores
    if (avoidTheBug.site.length > 0) avoidTheBug.site = "http://" + avoidTheBug.site;

    // The following helps for testing the game locally. It has to be commented out
    // when the game gets published on an actual site
    avoidTheBug.site = "http://localhost";

    console.log(avoidTheBug.site);

    // path to the images folder. It might have to be changed when the game is
    // published
    const imageFolder = "Media/Images/";

    // Game's sprite object
    function sprite(frameSeries){

        // State variables
        this.animation = new Array();
        this.animating = false;
        this.posX = 0;
        this.posY = 0;
        this.speedX = 0;
        this.speedY = 0;
        this.speed = 4;
        this.currentFrame = 0;
        this.frameDelay = 3;
        this.frameIteration = 1;
        this.flip = false;

        var idx = 0;

        // prepare animation
        for (var fr in frameSeries){
            this.animation[idx] = avoidTheBug.imageItems[frameSeries[fr]];
            idx++;
        }

        // Set the foot rectangle (used for collision detection)
        this.footRectX1 = 0;
        this.footRectX2 = 0;
        this.footRectY1 = 0;
        this.footRectY2 = 0;

        this.setFootRect = function() {
            this.footRectX1 = this.posX + 5;
            this.footRectX2 = this.posX + this.animation[0].width - 5;
            this.footRectY1 = this.posY + this.animation[0].height - 5;
            this.footRectY2 = this.posY + this.animation[0].height + 5;
        }

        // Check for collision with other sprite
        this.collisionWith = function(otherSprite) {

            this.setFootRect();
            otherSprite.setFootRect();

            if (this.footRectX2 >= otherSprite.footRectX1 && this.footRectX2 <= otherSprite.footRectX2)
            {
                if (this.footRectY2 >= otherSprite.footRectY1 && this.footRectY2 <= otherSprite.footRectY2)
                {
                    return "bottomright";
                }
                else if (this.footRectY1 >= otherSprite.footRectY1 && this.footRectY1 <= otherSprite.footRectY2)
                {
                    return "topright";
                }
            }
            else if (this.footRectX1 >= otherSprite.footRectX1 && this.footRectX1 <= otherSprite.footRectX2)
            {
                if (this.footRectY2 >= otherSprite.footRectY1 && this.footRectY2 <= otherSprite.footRectY2)
                {
                    return "bottomleft";
                }
                else if (this.footRectY1 >= otherSprite.footRectY1 && this.footRectY1 <= otherSprite.footRectY2)
                {
                    return "topleft";
                }
            }

            return "no";
        }

        this.animate = function() {
            this.animating = true;
        }

        this.stopAnimation = function() {
            this.animating = false;
            this.currentFrame = 0;
        }

        // Set speed, based on input
        this.setSpeedByKeyboard = function() {
            var noUpDown = false;
            var noLeftRight = false;

            this.speedY = 0;
            if (avoidTheBug.keyUp) {
                if (this.posY > 130)
                    this.speedY = -this.speed;
                this.animate();
            }
            else if (avoidTheBug.keyDown) {
                if (this.posY < avoidTheBug.canvasElement.height - this.animation[0].height - 5)
                    this.speedY = this.speed;
                this.animate();
            }
            else noUpDown = true;

            this.speedX = 0;
            if (avoidTheBug.keyLeft) {
                if (this.posX > 0)
                    this.speedX = -this.speed;
                this.animate();
                avoidTheBug.goat.flip = false;
            }
            else if (avoidTheBug.keyRight) {
                if (this.posX < avoidTheBug.canvasElement.width - this.animation[0].width)
                    this.speedX = this.speed;
                this.animate();
                avoidTheBug.goat.flip = true;
            }
            else noLeftRight = true;

            if (noUpDown && noLeftRight) this.stopAnimation();
        }

        // Update game
        this.update = function() {

            if (this.animating){
                if (this.frameIteration++ > this.frameDelay){
                    this.frameIteration = 1;
                    this.currentFrame ++;
                    if (this.currentFrame >= this.animation.length) this.currentFrame = 0;
                }
            }

        }

        // Render the game's screen
        this.render = function() {
            var transPosX = this.posX;
            avoidTheBug.ctx.save();
            if (this.flip)
            {
                avoidTheBug.ctx.translate(this.animation[this.currentFrame].width, 0);
                avoidTheBug.ctx.scale(-1,1);
                var transPosX = -this.posX;
            }
            
            avoidTheBug.ctx.drawImage(this.animation[this.currentFrame], transPosX, this.posY);
            avoidTheBug.ctx.restore();
            
        }

    }

    // Create canvas
    avoidTheBug.canvasElement = document.createElement('canvas');

    // Image files
    avoidTheBug.imageSrcs = new Array("BackgroundTop.png", "Bug.png", "Goat1.png", "Goat2.png", "Goat3.png", "Terrain.png",
        "Tree.png");
    avoidTheBug.imageItems = new Array();


    avoidTheBug.loadImages = function(){
        if (avoidTheBug.imageSrcs.length == 0) return;
        var src = avoidTheBug.imageSrcs.pop();
        var img = new Image();
        img.name = src;
        avoidTheBug.imageItems[img.name] = img;
        if (avoidTheBug.imageSrcs.length > 0) {
            img.onload = avoidTheBug.loadImages;
        }
        else img.onload = avoidTheBug.imagesLoaded;
        img.src = imageFolder + src;
    }

    // Initialise game
    avoidTheBug.initGame = function(){
        $('#GameDiv').append(this.canvasElement);
        avoidTheBug.canvasElement.width = 700;
        avoidTheBug.canvasElement.height = 500;
        avoidTheBug.ctx = avoidTheBug.canvasElement.getContext('2d');
        this.loadImages();
    }

    // To be executed when all the game's images have been loaded
    avoidTheBug.imagesLoaded = function() {
        // Create the sprites
        avoidTheBug.goat = new sprite(new Array("Goat1.png", "Goat2.png", "Goat3.png"));
        avoidTheBug.tree = new sprite(new Array("Tree.png"));
        avoidTheBug.bug = new sprite(new Array("Bug.png"));
        avoidTheBug.tree.posX = 500;
        avoidTheBug.tree.posY = 150;
        avoidTheBug.bug.decisionDelay = 5;
        avoidTheBug.bug.speed = 3;
        avoidTheBug.bug.decideIn = avoidTheBug.bug.decisionDelay;

        // Move the bug
        avoidTheBug.bug.move = function()
        {
            this.decideIn --;

            if (this.decideIn == 0)
			{
				this.decideIn = this.decisionDelay;

				this.speedX = 0;
				this.speedX = 0;

				// Chase goat
				if (avoidTheBug.goat.posX + 35 < this.posX) this.speedX = -this.speed;
				if (avoidTheBug.goat.posX + 35 > this.posX) this.speedX = this.speed;
				if (avoidTheBug.goat.posY + 35 < this.posY) this.speedY = -this.speed;
				if (avoidTheBug.goat.posY + 35 > this.posY) this.speedY = this.speed;
				if (this.speedY == 0) this.speedY = this.speed;

				// Act a little crazy from time to time
				if (Math.random() < 0.3)
				{
					this.speedX = -1.5 * this.speedY;
					this.speedY = -1.5 * this.speedX;
				}
			}
			this.posX += this.speedX;
			this.posY += this.speedY;

			if (this.collisionWith(avoidTheBug.tree) != "no")
			{
				this.speedX = -this.speedX;
				this.speedY = -this.speedY;
				this.decideIn = 3 * this.decisionDelay;
			}
            
        }

        $("#loading").css("visibility", "hidden");
        $("#startButton").css("visibility", "visible");
        $("#startButton").click(avoidTheBug.startGame);

    }

    // Starting a round
    avoidTheBug.startGame = function() {

        // Goat's initial position
        avoidTheBug.bug.posX = 400;
        avoidTheBug.bug.posY = 400;

        // Bug's initial position
        avoidTheBug.goat.posX = 260;
        avoidTheBug.goat.posY = 370;

        // Capture key up and key down events to keep track of which
        // arrow has been pressed by the user for moving the goat
        window.addEventListener("keydown", avoidTheBug.onKeyDown, true);
        window.addEventListener("keyup", avoidTheBug.onKeyUp, true);

        // Capture touch events (for tablets and smart phones) in order
        // to allow the goat to be moved using the touch screen
        avoidTheBug.canvasElement.addEventListener("touchstart", avoidTheBug.onTouchStart);
        avoidTheBug.canvasElement.addEventListener("touchmove", avoidTheBug.onTouchMove);
        avoidTheBug.canvasElement.addEventListener("touchend", avoidTheBug.onTouchEnd);

        // Hide game dialogs
        $("#startButton").css("visibility", "hidden");
        $("#dashboard").css("visibility", "hidden");
        $("#resultIndicator").css("visibility", "hidden");

        // Get start time
        avoidTheBug.startTime = (new Date()).getTime();

        // Set frame interval milliseconds
        avoidTheBug.frameInterval = setInterval(avoidTheBug.update, 10);
    }

    // Ending a round
    avoidTheBug.endGame = function() {

        // How many seconds has the round been running for?
        var gameSeconds = Math.round(((new Date()).getTime() - avoidTheBug.startTime) / 1000);

        // Display resulting time
        $("#resultIndicator").text("Goat not bitten for " + gameSeconds +
            (gameSeconds == 1 ? " second." : " seconds."));
        $("#resultIndicator").css("visibility", "visible");

        // Disable keyboard controls
        window.removeEventListener("keydown", avoidTheBug.onKeyDown, true);
        window.removeEventListener("keyup", avoidTheBug.onKeyUp, true);

        avoidTheBug.keyUp = false;
        avoidTheBug.keyDown = false;
        avoidTheBug.keyLeft = false;
        avoidTheBug.keyRight = false;
        avoidTheBug.goat.flip = false;

        // Disable touch screen controls
        avoidTheBug.canvasElement.removeEventListener("touchstart", avoidTheBug.onTouchStart);
        avoidTheBug.canvasElement.removeEventListener("touchmove", avoidTheBug.onTouchMove);
        avoidTheBug.canvasElement.removeEventListener("touchend", avoidTheBug.onTouchEnd);

        // Clear the frame interval
        clearInterval(avoidTheBug.frameInterval);

        // Ask host system if the seconds that the round has lasted constitute a
        // high score (you will need to code the server side logic yourself, and
        // possibly change the path
        $.get(avoidTheBug.site + "/Games/AvoidTheBug/isHighScore/?seconds=" + gameSeconds,
	        function(data) {
	            console.log(data);

                // Place your highscore submission logic somewhere around here. I
                // have not included it because it is specific to my web site.

            });

        // Display dashboard and start game link
        $("#dashboard").css("visibility", "visible");
        $("#startButton").css("visibility", "visible");
    }

    // Game frame update logic
    avoidTheBug.update = function() {
        // Make sure the desired frame rate is kept
        var now = (new Date()).getTime();
        avoidTheBug.delta += now - avoidTheBug.before;
        avoidTheBug.before = now;

        if(avoidTheBug.delta > 33){
            avoidTheBug.delta = 0;
            avoidTheBug.goat.setSpeedByKeyboard();
            avoidTheBug.goat.update();

            // Update the goat's position according to the keyboard controls
            if (avoidTheBug.goat.speedX > 0 && (avoidTheBug.goat.collisionWith(avoidTheBug.tree) == "bottomright" ||
                avoidTheBug.goat.collisionWith(avoidTheBug.tree) == "topright")) avoidTheBug.goat.speedX = 0;
            if (avoidTheBug.goat.speedX < 0 && (avoidTheBug.goat.collisionWith(avoidTheBug.tree) == "bottomleft" ||
                avoidTheBug.goat.collisionWith(avoidTheBug.tree) == "topleft")) avoidTheBug.goat.speedX = 0;
            if (avoidTheBug.goat.speedY > 0 && (avoidTheBug.goat.collisionWith(avoidTheBug.tree) == "bottomright" ||
                avoidTheBug.goat.collisionWith(avoidTheBug.tree) == "bottomleft")) avoidTheBug.goat.speedY = 0;
            if (avoidTheBug.goat.speedY < 0 && (avoidTheBug.goat.collisionWith(avoidTheBug.tree) == "topleft" ||
                avoidTheBug.goat.collisionWith(avoidTheBug.tree) == "topright")) avoidTheBug.goat.speedY = 0;

            avoidTheBug.goat.posX += avoidTheBug.goat.speedX;
            avoidTheBug.goat.posY += avoidTheBug.goat.speedY;

            avoidTheBug.bug.move();

            // If the bug is touching the goat, end the round
            if (Math.sqrt(Math.pow(avoidTheBug.goat.posX + 35 - avoidTheBug.bug.posX, 2) +
						Math.pow(avoidTheBug.goat.posY + 35 - avoidTheBug.bug.posY, 2)) < 10) {
                avoidTheBug.endGame();
            }

            // Draw everything
            avoidTheBug.draw();
        }
    }

    // Frame rendering
    avoidTheBug.draw = function() {

        // Clear the canvas and redraw the environment
        avoidTheBug.ctx.clearRect(0, 0, avoidTheBug.canvasElement.width, avoidTheBug.canvasElement.height);
        avoidTheBug.ctx.save();
        avoidTheBug.ctx.fillStyle = "#090";
        avoidTheBug.ctx.fillRect(0, 0, avoidTheBug.canvasElement.width, avoidTheBug.canvasElement.height);
        avoidTheBug.ctx.fillStyle = "rgb(18,104,245)";
        avoidTheBug.ctx.fillRect(0, 0, avoidTheBug.canvasElement.width, 162);
        avoidTheBug.ctx.restore();
        avoidTheBug.ctx.drawImage(avoidTheBug.imageItems["BackgroundTop.png"], 0, 0);

        // Render the goat, the tree and the bug
        var displayList = new Array();

        displayList.push(avoidTheBug.goat);
        displayList.push(avoidTheBug.tree);
        displayList.push(avoidTheBug.bug);
        displayList.sort(function(a, b){if (a.posY + a.animation[0].height > b.posY + b.animation[0].height) return 1; return -1;})

        for(s in displayList) displayList[s].render();
    }

    // Process key down events
    avoidTheBug.onKeyDown = function(event) {
        event.preventDefault();
        event.stopPropagation();
        switch(event.keyCode){
            case 38: //up
                avoidTheBug.keyUp = true;
            break;
            case 40: //down
                avoidTheBug.keyDown = true;
            break;
            case 37: //left
                avoidTheBug.keyLeft = true;
            break;
            case 39: //right
                avoidTheBug.keyRight = true;
            break;
        }
    }

    // Process key up events
    avoidTheBug.onKeyUp = function(event) {
        event.preventDefault();
        event.stopPropagation();
        switch(event.keyCode){
            case 38: //up
                avoidTheBug.keyUp = false;
            break;
            case 40: //down
                avoidTheBug.keyDown = false;
            break;
            case 37: //left
                avoidTheBug.keyLeft = false;
            break;
            case 39: //right
                avoidTheBug.keyRight = false;
            break;
        }

    }

    // Process touch start events
    avoidTheBug.onTouchStart = function(event) {
        event.preventDefault();
        var tc = event.targetTouches[0];

        avoidTheBug.keyUp = false;
        avoidTheBug.keyDown = false;
        avoidTheBug.keyLeft = false;
        avoidTheBug.keyRight = false;

        if (tc.clientX < avoidTheBug.goat.posX) avoidTheBug.keyLeft = true;
        else if (tc.clientX > avoidTheBug.goat.posX) avoidTheBug.keyRight = true;

        if (tc.clientY < avoidTheBug.goat.posY) avoidTheBug.keyUp = true;
        else if (tc.clientY > avoidTheBug.goat.posY) avoidTheBug.keyDown = true;

        
    }

    // Process touch move events
    avoidTheBug.onTouchMove = function(event) {
        event.preventDefault();

        avoidTheBug.keyUp = true;
        var tc = event.targetTouches[0];

        avoidTheBug.keyUp = false;
        avoidTheBug.keyDown = false;
        avoidTheBug.keyLeft = false;
        avoidTheBug.keyRight = false;

        if (tc.clientX < avoidTheBug.goat.posX) avoidTheBug.keyLeft = true;
        else if (tc.clientX > avoidTheBug.goat.posX) avoidTheBug.keyRight = true;

        if (tc.clientY < avoidTheBug.goat.posY) avoidTheBug.keyUp = true;
        else if (tc.clientY > avoidTheBug.goat.posY) avoidTheBug.keyDown = true;

    }

    // Process touch end events
    avoidTheBug.onTouchEnd = function(event) {
        event.preventDefault();
        avoidTheBug.keyUp = false;
        avoidTheBug.keyDown = false;
        avoidTheBug.keyLeft = false;
        avoidTheBug.keyRight = false;
    }

    // Initialise the game
    avoidTheBug.initGame();
}
