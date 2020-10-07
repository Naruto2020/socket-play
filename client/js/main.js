// chargement de la page
window.addEventListener("DOMContentLoaded", () => {
  // initialisation de la connexion client/serveur
  // const socket = io("http://127.0.0.1:2000/");
  //const socket = io("https://socket-play.herokuapp.com/");
  const socket = io();

  // connexion et inscription
  // const divs = document.getElementById("div");
  const conectDiv = document.getElementById("login");
  const gameDiv = document.getElementById("game");

  //const inputs = document.getElementById("input");
  const profil = document.getElementById("pseudo");
  const secu = document.getElementById("mdp");

  //const boutons = document.getElementById("button");
  const connexion = document.getElementById("connexion");
  const inscription = document.getElementById("inscription");

  // connexion
  connexion.onclick = () => {
    console.log("wellcome");
    // envois de la requête de connexion au serveur
    socket.emit("connexion", {
      pseudo: profil.value,
      mdp: secu.value,
    });

    // reponse du serveur
    socket.on("connexionRep", (data) => {
      console.log(data);
      if (data.success) {
        console.log("okkkk");
        conectDiv.style.display = "none";
        gameDiv.style.display = "block";
      } else {
        alert("la connexion à échouée ...");
      }
    });
  };

  // inscription
  inscription.onclick = () => {
    console.log("bienvennue");
    // envois de la requête de souscription au serveur
    socket.emit("inscription", {
      pseudo: profil.value,
      mdp: secu.value,
    });

    // reponse du serveur
    socket.on("inscriptionRep", (data) => {
      if (data.success) {
        console.log("toppp");
        alert(
          "la souscription à réussie vous pouvez aprésent vous connecter  ..."
        );
      } else {
        alert("la souscription à échouée  login ou mdp incorrecte ...");
      }
    });
  };

  // jeux

  // initialisation du canvas
  var ctx = document.getElementById("canvas").getContext("2d");
  ctx.font = "17px Arial";

  // initialisation des joueurs et de leurs coordonnées a chaque connexion

  socket.on("newPositions", function (data) {
    // console.log(data);
    // on eface le canvas a chaque mise a jour
    ctx.clearRect(0, 0, 500, 500);
    // parcour de l'array des données
    for (let i = 0; i < data.player.length; i++) {
      let donnees = data.player[i];
      // on assigne la position et les informations de chaque joueurs a chaque connexion (autres joueurs )
      let hrWidth = 20;
      ctx.fillRect(donnees.x - hrWidth / 2, donnees.y - 20, hrWidth, 4);
      ctx.fillText(donnees.number, donnees.x, donnees.y);
      ctx.fillText(`s${donnees.score} `, donnees.x, donnees.y - 25);
    }
    for (let i = 0; i < data.bonus.length; i++) {
      let donnees = data.bonus[i];
      ctx.fillText("£", donnees.x, donnees.y);
      socket.on("displaying", (donnees) => {
        ctx.fillStyle = "teal";
        ctx.fillText(donnees.message, 10, 100);
      });
    }
    for (let i = 0; i < data.win.length; i++) {
      let donnees = data.win[i];
      ctx.fillText("$", donnees.x, donnees.y);
      socket.on("displaying3", (donnees) => {
        ctx.fillStyle = "green";
        ctx.fillText(donnees.message, 10, 100);
      });
    }

    for (let i = 0; i < data.ennemi1.length; i++) {
      let donnees = data.ennemi1[i];
      ctx.fillText("%", donnees.x, donnees.y);
      socket.on("displaying1", (donnees) => {
        ctx.fillStyle = "orange";
        ctx.fillText(donnees.message, 10, 100);
      });
    }
    for (let i = 0; i < data.ennemi2.length; i++) {
      let donnees = data.ennemi2[i];
      ctx.fillText("<", donnees.x, donnees.y);
      socket.on("displaying2", (donnees) => {
        ctx.fillStyle = "red";
        ctx.fillText(donnees.message, 10, 100);
      });
    }
    for (let i = 0; i < data.ennemi3.length; i++) {
      let donnees = data.ennemi3[i];
      ctx.fillText(">", donnees.x, donnees.y);
      socket.on("displaying2", (donnees) => {
        ctx.fillStyle = "red";
        ctx.fillText(donnees.message, 10, 100);
      });
    }
    for (let i = 0; i < data.ennemi4.length; i++) {
      let donnees = data.ennemi4[i];
      ctx.fillText("~", donnees.x, donnees.y);
      socket.on("displaying2", (donnees) => {
        ctx.fillStyle = "red";
        ctx.fillText(donnees.message, 10, 100);
      });
    }
    for (let i = 0; i < data.ennemi5.length; i++) {
      let donnees = data.ennemi5[i];
      ctx.fillText("*", donnees.x, donnees.y);
      socket.on("displaying2", (donnees) => {
        ctx.fillStyle = "red";
        ctx.fillText(donnees.message, 10, 100);
      });
    }
    for (let i = 0; i < data.brique.length; i++) {
      let donnees = data.brique[i];
      ctx.fillText("@", donnees.x, donnees.y);
      socket.on("displaying2", (donnees) => {
        ctx.fillStyle = "red";
        ctx.fillText(donnees.message, 10, 100);
      });
    }
    for (let i = 0; i < data.brique1.length; i++) {
      let donnees = data.brique1[i];
      ctx.fillText("§", donnees.x, donnees.y);
      socket.on("displaying2", (donnees) => {
        ctx.fillStyle = "red";
        ctx.fillText(donnees.message, 10, 100);
      });
    }
    for (let i = 0; i < data.brique2.length; i++) {
      let donnees = data.brique2[i];
      ctx.fillText("#", donnees.x, donnees.y);
      socket.on("displaying2", (donnees) => {
        ctx.fillStyle = "red";
        ctx.fillText(donnees.message, 10, 100);
      });
    }
    for (let i = 0; i < data.brique3.length; i++) {
      let donnees = data.brique3[i];
      ctx.fillText("@", donnees.x, donnees.y);
      socket.on("displaying2", (donnees) => {
        ctx.fillStyle = "red";
        ctx.fillText(donnees.message, 10, 100);
      });
    }
    for (let i = 0; i < data.brique3A.length; i++) {
      let donnees = data.brique3A[i];
      ctx.fillText("@", donnees.x, donnees.y);
      socket.on("displaying2", (donnees) => {
        ctx.fillStyle = "red";
        ctx.fillText(donnees.message, 10, 100);
      });
    }
    for (let i = 0; i < data.brique4.length; i++) {
      let donnees = data.brique4[i];
      ctx.fillText("&", donnees.x, donnees.y);
      socket.on("displaying2", (donnees) => {
        ctx.fillStyle = "red";
        ctx.fillText(donnees.message, 10, 100);
      });
    }
    for (let i = 0; i < data.brique5.length; i++) {
      let donnees = data.brique5[i];
      ctx.fillText("#", donnees.x, donnees.y);
      socket.on("displaying2", (donnees) => {
        ctx.fillStyle = "red";
        ctx.fillText(donnees.message, 10, 100);
      });
    }
    for (let i = 0; i < data.brique5A.length; i++) {
      let donnees = data.brique5A[i];
      ctx.fillText("#", donnees.x, donnees.y);
      socket.on("displaying2", (donnees) => {
        ctx.fillStyle = "red";
        ctx.fillText(donnees.message, 10, 100);
      });
    }
    for (let i = 0; i < data.brique6.length; i++) {
      let donnees = data.brique6[i];
      ctx.fillText("@", donnees.x, donnees.y);
      socket.on("displaying2", (donnees) => {
        ctx.fillStyle = "red";
        ctx.fillText(donnees.message, 10, 100);
      });
    }
    /*for (let i = 0; i < data.brique7.length; i++) {
            let donnees = data.brique7[i];
            ctx.fillText("§", donnees.x, donnees.y);
            socket.on("displaying2", (donnees) => {
              ctx.fillStyle = "red";
              ctx.fillText(donnees.message, 10, 100);
            });
          } */
    for (let i = 0; i < data.brique8.length; i++) {
      let donnees = data.brique8[i];
      ctx.fillText("#", donnees.x, donnees.y);
      socket.on("displaying2", (donnees) => {
        ctx.fillStyle = "red";
        ctx.fillText(donnees.message, 10, 100);
      });
    }
  });

  // gestion de l'interactivité avec le clavier

  document.onkeydown = function (event) {
    let code = event.keyCode;
    switch (code) {
      case 39:
        socket.emit("keyPress", { moveId: "right", status: true });
        break;
      case 40:
        socket.emit("keyPress", { moveId: "down", status: true });
        break;
      case 37:
        socket.emit("keyPress", { moveId: "left", status: true });
        break;
      case 38:
        socket.emit("keyPress", { moveId: "up", status: true });
        break;
    }
  };
  document.onkeyup = function (event) {
    let code = event.keyCode;
    switch (code) {
      case 39:
        socket.emit("keyPress", { moveId: "right", status: false });
        break;
      case 40:
        socket.emit("keyPress", { moveId: "down", status: false });
        break;
      case 37:
        socket.emit("keyPress", { moveId: "left", status: false });
        break;
      case 38:
        socket.emit("keyPress", { moveId: "up", status: false });
        break;
    }
  };
});
