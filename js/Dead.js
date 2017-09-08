function Dead(status) {
	document.getElementById("renderCanvas").style.display = "inline-block";
	document.getElementById("container").style.display = "inline-block";
	document.getElementById("scoreLabel").style.display = "inline-block";
	document.getElementById("imgScore").style.display = "inline-block";
	document.getElementById("MainUI").style.display = "none";
	document.getElementById("startGameBtn").style.display = "none";
	document.getElementById("youWonContainer").style.display = "none";

	document.getElementById("youAreDead").style.display = "inline-block";

	document.addEventListener("keyup", function () {

	    if((event.key === 'b' || event.key === 'B') && status) {
	    	status = false;
	    	MainGame();
	    }
	});
}