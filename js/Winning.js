function Winning() {
	document.getElementById("renderCanvas").style.display = "inline-block";
	document.getElementById("container").style.display = "inline-block";
	document.getElementById("scoreLabel").style.display = "inline-block";
	document.getElementById("imgScore").style.display = "inline-block";
	document.getElementById("MainUI").style.display = "none";
	document.getElementById("startGameBtn").style.display = "none";
	document.getElementById("gameInstructionsbtn").style.display = "none";
	document.getElementById("youAreDead").style.display = "none";
	document.getElementById("gameInstructions").style.display = "none";


	console.log("here at Winning");
	document.getElementById("youWonContainer").style.display = "block";

	document.addEventListener("keyup", function () {

	    if (event.key === 'b' || event.key === 'B') {
	    	MainGame();
	    }
	});
}