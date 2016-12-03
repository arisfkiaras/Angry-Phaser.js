function readLevel(levelName) {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                game.level = JSON.parse(xhr.responseText);
                playGame
            } else {
                alert("Asd");
            }
        }
    };
    xhr.open("GET", 'assets/maps/' + levelName + ".map", true);
    xhr.send();

}
function readLevelS(levelName) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", 'assets/maps/' + levelName + ".map", false);
    xhr.send();
    if (xhr.status === 200) {
      return JSON.parse(xhr.responseText);
    }
}
