//Partie HTTP
/* **** **** **** **** **** */

// initialisation de l'app
const path = require("path");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 2000;

// initialisation de la base de données mongodb via la librairie mongojs
var mongojs = require("mongojs");
//var db = mongojs("localhost:27017/GameSocket", ["compte"]);
var db = mongojs("localhost:27017/GameSocket", ["compte"]);

// initialisation de la racine de l'app et creation des routes
app.use(express.static(__dirname + "/client/"));
app.get("*", (req, res, next) => {
  res.sendFile(path.normalize(`${__dirname} /index.html`), (error) => {
    if (error) {
      next(error);
    }
  });
});
app.all((error, req, res, next) => {
  res
    .status(404)
    .send(
      "<!DOCTYPE html><html><head><title>Erreur 404</title></head><body><h1>Erreur 404 : Page non trouvée</h1></body></html>"
    );
});

const server = app.listen(PORT, () => {
  console.log("server écoute sur le port" + " " + PORT);
});

//Partie WebSocket
/* **** **** **** **** **** */

// initialisation du soccket
const IOServer = require("socket.io");
const ioServer = new IOServer(server);

// creation des variables qui vont stocker toutes les connexions et les joueurs
let allConnexions = {};
let allPlayers = {};
let allMunitions = {};
let allMunitions1 = {};
let allMunitions2 = {};
let allMunitions3 = {};
let allMunitions4 = {};
let allMunitions5 = {};
let allBriques = {};
let allBriques1 = {};
let allBriques2 = {};
let allBriques3 = {};
let allBriques3A = {};
let allBriques4 = {};
let allBriques5 = {};
let allBriques5A = {};
let allBriques6 = {};
let allBriques7 = {};
let allBriques8 = {};
let allwinners = {};

// initialisation de la connexion
ioServer.on("connect", (socket) => {
  console.log("connexion websocket à un client ...");

  // gestion des authentification pour se conecter et s'incrire

  // on stock tous les utilisateurs avec leurs pseudo et mdp
  /* const utilisateurs = {
    // pseudo:mdp
    steve: "mia",
    bob: "yan",
    will: "pack",
  };*/
  // on verrifie la compatibilité pseudo/mdp avec la bdd mongodb via le module mongojs

  const mdpValide = (data, cb) => {
    // parcour de la base de données pour rechercher les pseudo/mdp saisie par l'Ut
    db.compte.find({ pseudo: data.pseudo, mdp: data.mdp }, (err, res) => {
      // verrification et utilisation du call back pour confirmer que les bons pseudos/mdp ont été saisie
      if (res.length > 0) {
        cb(true);
      } else {
        cb(false);
      }
    });
  };
  // on verrifie si un pseudo est déjas pris
  const utDejasPris = (data, cb) => {
    // parcour de la base de données pour rechercher les pseudo saisie par l'Ut
    db.compte.find({ pseudo: data.pseudo }, (err, res) => {
      // verrification et utilisation du call back pour confirmer que les bons pseudos ne  sont pas déjas pris
      if (res.length > 0) {
        cb(true);
      } else {
        cb(false);
      }
    });
  };
  // on ajoute un nouveau pseudo/mdp après verrification
  const ajoutUt = (data, cb) => {
    // parcour de la base de données pour ajouter les pseudo/mdp saisie par l'Ut
    db.compte.insertOne({ pseudo: data.pseudo, mdp: data.mdp }, (err) => {
      cb();
    });
  };

  // on récupère les informations du formulaire en cas de  connexion
  socket.on("connexion", (data) => {
    // phase de verrification pseudo/mdp
    if (
      mdpValide(data, (res) => {
        if (res) {
          console.log(data);
          console.log("mia");
          allPlayers[socket.id];

          // on repond au client
          socket.emit("connexionRep", { success: true });
        } else {
          socket.emit("connexionRep", { success: false });
        }
      })
    );
  });

  // on récupère les information du formulaire en cas d'inscription
  socket.on("inscription", (data) => {
    // phase de vérrification
    if (
      utDejasPris(data, (res) => {
        if (res) {
          console.log("mia");
          // reponse au client
          socket.emit("inscriptionRep", { success: false });
        } else {
          ajoutUt(data, () => {
            socket.emit("inscriptionRep", { success: true });
          });
        }
      })
    );
  });

  // creation des id de connexions
  let calcule = Math.random();
  socket.id =
    Math.round(calcule * 1000) +
    "-" +
    Math.round(calcule * 1000) +
    "-" +
    Math.round(calcule * 1000);

  // ajout de la connexion a la liste des connexions
  allConnexions[socket.id] = socket;

  const Player = {
    x: 250,
    y: 490,
    id: socket.id,
    pressD: false,
    pressG: false,
    pressH: false,
    pressB: false,
    vitesse: 3,
    score: 0,
    hr: 10,
    color: "#" + Math.floor(calcule * 16777215).toString(16),
    updatePosition: function () {
      // incrémentation du score
      if (this.y <= 430) {
        this.score += 5;
        this.score = 5;
      }
      if (this.y <= 310) {
        this.score += 5;
        this.score = 10;
      }
      if (this.y <= 200) {
        this.score += 10;
        this.score = 20;
      }
      if (this.y <= 130) {
        this.score += 10;
        this.score = 30;
      }
      if (this.y <= 90) {
        this.score += 10;
        this.score = 40;
      }

      if (this.pressD) {
        if (this.x > 520 || this.x < -10) {
          this.vitesse = 0;
          console.log("yaaaa");
        } else {
          this.vitesse = 3;
        }
        this.x += this.vitesse;
      }
      if (this.pressG) {
        if (this.x > 520 || this.x < -10) {
          this.vitesse = 0;
        } else {
          this.vitesse = 3;
        }
        this.x -= this.vitesse;
      }

      if (this.pressH) this.y -= this.vitesse;
      if (this.pressB) this.y += this.vitesse;

      const collision = testCollision(player, allMunitions[socket.id]);
      if (collision) {
        //console.log("game over ...");
        this.vitesse += 2;
        socket.emit("displaying", {
          message: "super vitesse + 2 ",
        });
      }
      const collision1 = testCollision(player, allMunitions1[socket.id]);
      if (collision1) {
        //console.log("game over ...");
        this.vitesse -= 2;
        socket.emit("displaying1", {
          message: " zut vitesse - 2 ",
        });
      }
      const collision2 = testCollision(player, allBriques[socket.id]);
      if (collision2) {
        //console.log("game over ...");
        this.vitesse = 0;
        socket.emit("displaying2", {
          message: "Game over!...press F5 to restart ",
        });
      }
      const collision3 = testCollision(player, allBriques1[socket.id]);
      if (collision3) {
        //console.log("game over ...");
        this.vitesse = 0;
        socket.emit("displaying2", {
          message: "Game over!...press F5 to restart ",
        });
      }
      const collision4 = testCollision(player, allBriques2[socket.id]);
      if (collision4) {
        //console.log("game over ...");
        this.vitesse = 0;
        socket.emit("displaying2", {
          message: "Game over!...press F5 to restart ",
        });
      }
      const collision5 = testCollision(player, allBriques3[socket.id]);
      if (collision5) {
        //console.log("game over ...");
        this.vitesse = 0;
        socket.emit("displaying2", {
          message: "Game over!...press F5 to restart ",
        });
      }
      const collision5A = testCollision(player, allBriques3A[socket.id]);
      if (collision5A) {
        //console.log("game over ...");
        this.vitesse = 0;
        socket.emit("displaying2", {
          message: "Game over!...press F5 to restart ",
        });
      }
      const collision6 = testCollision(player, allBriques4[socket.id]);
      if (collision6) {
        //console.log("game over ...");
        this.vitesse = 0;
        socket.emit("displaying2", {
          message: "Game over!...press F5 to restart ",
        });
      }
      const collision7 = testCollision(player, allBriques5[socket.id]);
      if (collision7) {
        //console.log("game over ...");
        this.vitesse = 0;
        socket.emit("displaying2", {
          message: "Game over!...press F5 to restart ",
        });
      }
      const collision7A = testCollision(player, allBriques5A[socket.id]);
      if (collision7A) {
        //console.log("game over ...");
        this.vitesse = 0;
        socket.emit("displaying2", {
          message: "Game over!...press F5 to restart ",
        });
      }
      const collision8 = testCollision(player, allBriques6[socket.id]);
      if (collision8) {
        //console.log("game over ...");
        this.vitesse = 0;
        socket.emit("displaying2", {
          message: "Game over!...press F5 to restart ",
        });
      }
      /* const collision9 = testCollision(player, allBriques7[socket.id]);
      if (collision9) {
        //console.log("game over ...");
        this.vitesse = 0;
        socket.emit("displaying2", {
          message: "Game over!...press F5 to restart ",
        });
      }*/
      const collision10 = testCollision(player, allBriques8[socket.id]);
      if (collision10) {
        //console.log("game over ...");
        this.vitesse = 0;
        socket.emit("displaying2", {
          message: "Game over!...press F5 to restart ",
        });
      }
      const collision11 = testCollision(player, allMunitions2[socket.id]);
      if (collision11) {
        //console.log("game over ...");
        this.vitesse = 0;
        socket.emit("displaying2", {
          message: "Game over!...press F5 to restart ",
        });
      }
      const collision12 = testCollision(player, allMunitions3[socket.id]);
      if (collision12) {
        //console.log("game over ...");
        this.vitesse = 0;
        socket.emit("displaying2", {
          message: "Game over!...press F5 to restart ",
        });
      }
      const collision13 = testCollision(player, allMunitions4[socket.id]);
      if (collision13) {
        //console.log("game over ...");
        this.vitesse = 0;
        socket.emit("displaying2", {
          message: "Game over!...press F5 to restart ",
        });
      }
      const collision14 = testCollision(player, allMunitions5[socket.id]);
      if (collision14) {
        //console.log("game over ...");
        this.vitesse = 0;
        socket.emit("displaying2", {
          message: "Game over!...press F5 to restart ",
        });
      }
      const collision15 = testCollision(player, allwinners[socket.id]);
      if (collision15) {
        //console.log("game over ...");
        this.vitesse = 0;
        this.score += 20;
        this.score = 60;
        socket.emit("displaying3", {
          message: "You win!...press F5 to restart ",
        });
      }
    },
  };

  // creation du joueur a qui on associe l'id de connexion
  // const player = new Player(socket.id);
  const player = Object.create(Player);
  player.number = "" + Math.floor(10 * calcule);

  // ajout  du joueur (avec son id) dans la liste  des joueurs
  allPlayers[socket.id] = player;
  console.log(`nouveau joueur! numero : ${player.number} id : ${player.id} `);

  // creation des  ennemis
  const Bonus = {
    id: "" + Math.floor(calcule * 10),
    x: 20,
    y: 40,
    vitX: 8,
    vitY: 2,

    inimicus: function () {
      // on bloque les annimation avant l'authentification

      if (this.x > 480 || this.x < 0) {
        this.vitX = -this.vitX;
        this.x += this.vitX;
      } else {
        this.x += this.vitX;
      }
      if (this.y > 490 || this.y < 20) {
        this.vitY = -this.vitY;
        this.y += this.vitY;
      } else {
        this.y += this.vitY;
      }
      const collision = testCollision(player, allMunitions[socket.id]);
      if (collision) {
        //console.log("Boummm ...");
        this.vitX = -this.vitX;
        this.x += this.vitX;
        this.vitY = this.vitY;
        this.y += this.vitY;
        socket.emit("displaying", {
          message: "super vitesse + 2 ",
        });
      }

      const collision1 = testCollision(bonus, allBriques[socket.id]);
      if (collision1) {
        //console.log("game over ...");
        this.vitX = -this.vitX;
        this.x += this.vitX;
        this.vitY = -this.vitY;
        this.y += this.vitY;
        /* socket.emit("displaying", {
          message: "tu a perdu !...  press F5 to restart ",
        });*/
      }
      const collision2 = testCollision(bonus, allBriques1[socket.id]);
      if (collision2) {
        //console.log("game over ...");
        this.vitX = -this.vitX;
        this.x += this.vitX;
        this.vitY = -this.vitY;
        this.y += this.vitY;
        /* socket.emit("displaying", {
          message: "tu a perdu !...  press F5 to restart ",
        });*/
      }
      const collision3 = testCollision(bonus, allBriques2[socket.id]);
      if (collision3) {
        //console.log("game over ...");
        this.vitX = -this.vitX;
        this.x += this.vitX;
        this.vitY = -this.vitY;
        this.y += this.vitY;
        /* socket.emit("displaying", {
          message: "tu a perdu !...  press F5 to restart ",
        });*/
      }
      const collision4 = testCollision(bonus, allBriques3[socket.id]);
      if (collision4) {
        //console.log("game over ...");
        this.vitX = -this.vitX;
        this.x += this.vitX;
        this.vitY = -this.vitY;
        this.y += this.vitY;
        /* socket.emit("displaying", {
          message: "tu a perdu !...  press F5 to restart ",
        });*/
      }
      const collision4A = testCollision(bonus, allBriques3A[socket.id]);
      if (collision4A) {
        //console.log("game over ...");
        this.vitX = -this.vitX;
        this.x += this.vitX;
        this.vitY = -this.vitY;
        this.y += this.vitY;
        /* socket.emit("displaying", {
          message: "tu a perdu !...  press F5 to restart ",
        });*/
      }
      const collision5 = testCollision(bonus, allBriques4[socket.id]);
      if (collision5) {
        //console.log("game over ...");
        this.vitX = -this.vitX;
        this.x += this.vitX;
        this.vitY = -this.vitY;
        this.y += this.vitY;
        /* socket.emit("displaying", {
          message: "tu a perdu !...  press F5 to restart ",
        });*/
      }
      const collision6 = testCollision(bonus, allBriques5[socket.id]);
      if (collision6) {
        //console.log("game over ...");
        this.vitX = -this.vitX;
        this.x += this.vitX;
        this.vitY = -this.vitY;
        this.y += this.vitY;
        /* socket.emit("displaying", {
          message: "tu a perdu !...  press F5 to restart ",
        });*/
      }
      const collision6A = testCollision(bonus, allBriques5A[socket.id]);
      if (collision6A) {
        //console.log("game over ...");
        this.vitX = -this.vitX;
        this.x += this.vitX;
        this.vitY = -this.vitY;
        this.y += this.vitY;
        /* socket.emit("displaying", {
          message: "tu a perdu !...  press F5 to restart ",
        });*/
      }
      const collision7 = testCollision(bonus, allBriques6[socket.id]);
      if (collision7) {
        //console.log("game over ...");
        this.vitX = -this.vitX;
        this.x += this.vitX;
        this.vitY = -this.vitY;
        this.y += this.vitY;
        /* socket.emit("displaying", {
          message: "tu a perdu !...  press F5 to restart ",
        });*/
      }
      /*  const collision8 = testCollision(bonus, allBriques7[socket.id]);
      if (collision8) {
        //console.log("game over ...");
        this.vitX = -this.vitX;
        this.x += this.vitX;
        this.vitY = -this.vitY;
        this.y += this.vitY;
        /* socket.emit("displaying", {
          message: "tu a perdu !...  press F5 to restart ",
        });
      }*/
      const collision9 = testCollision(bonus, allBriques8[socket.id]);
      if (collision9) {
        //console.log("game over ...");
        this.vitX = -this.vitX;
        this.x += this.vitX;
        this.vitY = -this.vitY;
        this.y += this.vitY;
        /* socket.emit("displaying", {
          message: "tu a perdu !...  press F5 to restart ",
        });*/
      }
    },
  };

  const bonus = Object.create(Bonus);
  bonus.x = 30;
  bonus.y = 40;
  allMunitions[socket.id] = bonus;
  console.log(
    "munition numero : " + bonus.id + " " + "position" + " " + bonus.x
  );

  const Ennemi1 = {
    id: "" + Math.floor(calcule * 100),
    x: 30,
    y: 50,
    vitX: 8,
    vitY: 3,

    inimicus: function () {
      //
      if (this.x > 480 || this.x < 20) {
        this.vitX = -this.vitX;
        this.x += this.vitX;
      } else {
        this.x += this.vitX;
      }
      if (this.y > 480 || this.y < 20) {
        this.vitY = -this.vitY;
        this.y += this.vitY;
      }
      this.y += this.vitY;
      const collision = testCollision(player, allMunitions1[socket.id]);
      if (collision) {
        //console.log("game over ...");
        this.vitX = -this.vitX;
        this.x += this.vitX;
        this.vitY = -this.vitY;
        this.y += this.vitY;
        socket.emit("displaying1", {
          message: " vitesse - 2  ",
        });
      }

      const collision1 = testCollision(ennemi1, allBriques[socket.id]);
      if (collision1) {
        //console.log("game over ...");
        this.vitX = -this.vitX;
        this.x += this.vitX;
        this.vitY = -this.vitY;
        this.y += this.vitY;
        /* socket.emit("displaying", {
          message: "tu a perdu !...  press F5 to restart ",
        });*/
      }
      const collision2 = testCollision(ennemi1, allBriques1[socket.id]);
      if (collision2) {
        //console.log("game over ...");
        this.vitX = -this.vitX;
        this.x += this.vitX;
        this.vitY = -this.vitY;
        this.y += this.vitY;
        /* socket.emit("displaying", {
          message: "tu a perdu !...  press F5 to restart ",
        });*/
      }
      const collision3 = testCollision(ennemi1, allBriques2[socket.id]);
      if (collision3) {
        //console.log("game over ...");
        this.vitX = -this.vitX;
        this.x += this.vitX;
        this.vitY = -this.vitY;
        this.y += this.vitY;
        /* socket.emit("displaying", {
          message: "tu a perdu !...  press F5 to restart ",
        });*/
      }
      const collision4 = testCollision(ennemi1, allBriques3[socket.id]);
      if (collision4) {
        //console.log("game over ...");
        this.vitX = -this.vitX;
        this.x += this.vitX;
        this.vitY = -this.vitY;
        this.y += this.vitY;
        /* socket.emit("displaying", {
          message: "tu a perdu !...  press F5 to restart ",
        });*/
      }
      const collision4A = testCollision(ennemi1, allBriques3A[socket.id]);
      if (collision4A) {
        //console.log("game over ...");
        this.vitX = -this.vitX;
        this.x += this.vitX;
        this.vitY = -this.vitY;
        this.y += this.vitY;
        /* socket.emit("displaying", {
          message: "tu a perdu !...  press F5 to restart ",
        });*/
      }
      const collision5 = testCollision(ennemi1, allBriques4[socket.id]);
      if (collision5) {
        //console.log("game over ...");
        this.vitX = -this.vitX;
        this.x += this.vitX;
        this.vitY = -this.vitY;
        this.y += this.vitY;
        /* socket.emit("displaying", {
          message: "tu a perdu !...  press F5 to restart ",
        });*/
      }
      const collision6 = testCollision(ennemi1, allBriques5[socket.id]);
      if (collision6) {
        //console.log("game over ...");
        this.vitX = -this.vitX;
        this.x += this.vitX;
        this.vitY = -this.vitY;
        this.y += this.vitY;
        /* socket.emit("displaying", {
          message: "tu a perdu !...  press F5 to restart ",
        });*/
      }
      const collision6A = testCollision(ennemi1, allBriques5A[socket.id]);
      if (collision6A) {
        //console.log("game over ...");
        this.vitX = -this.vitX;
        this.x += this.vitX;
        this.vitY = -this.vitY;
        this.y += this.vitY;
        /* socket.emit("displaying", {
          message: "tu a perdu !...  press F5 to restart ",
        });*/
      }
      const collision7 = testCollision(ennemi1, allBriques6[socket.id]);
      if (collision7) {
        //console.log("game over ...");
        this.vitX = -this.vitX;
        this.x += this.vitX;
        this.vitY = -this.vitY;
        this.y += this.vitY;
        /* socket.emit("displaying", {
          message: "tu a perdu !...  press F5 to restart ",
        });*/
      }
      /* const collision8 = testCollision(ennemi1, allBriques7[socket.id]);
      if (collision8) {
        //console.log("game over ...");
        this.vitX = -this.vitX;
        this.x += this.vitX;
        this.vitY = -this.vitY;
        this.y += this.vitY;
         socket.emit("displaying", {
          message: "tu a perdu !...  press F5 to restart ",
        });
      }*/
      const collision9 = testCollision(ennemi1, allBriques8[socket.id]);
      if (collision9) {
        //console.log("game over ...");
        this.vitX = -this.vitX;
        this.x += this.vitX;
        this.vitY = -this.vitY;
        this.y += this.vitY;
        /* socket.emit("displaying", {
          message: "tu a perdu !...  press F5 to restart ",
        });*/
      }
    },
  };
  const ennemi1 = Object.create(Ennemi1);

  ennemi1.x = 50;
  //ennemi1.y = 400;

  allMunitions1[socket.id] = ennemi1;
  console.log(
    "munition numero : " + ennemi1.id + " " + "position" + " " + ennemi1.x
  );

  const Ennemi2 = {
    id: "" + Math.floor(calcule * 100),
    x: 30,
    y: 380,
    vitX: 12,
    //vitY: 3,

    inimicus: function () {
      // gestion des collisions
      if (this.x > 480 || this.x < 20) {
        this.vitX = -this.vitX;
        this.x += this.vitX;
      } else {
        this.x += this.vitX;
      }
      const collision = testCollision(player, allMunitions2[socket.id]);
      if (collision) {
        //console.log("game over ...");
        this.vitX = 0;
        socket.emit("displaying2", {
          message: "Game over!...press F5 to restart ",
        });
      }
    },
  };

  const ennemi2 = Object.create(Ennemi2);
  allMunitions2[socket.id] = ennemi2;

  const Ennemi3 = {
    id: "" + Math.floor(calcule * 100),
    x: 480,
    y: 260,
    vitX: 15,
    //vitY: 3,

    inimicus: function () {
      // gestion des collisions
      if (this.x > 480 || this.x < 20) {
        this.vitX = -this.vitX;
        this.x += this.vitX;
      } else {
        this.x += this.vitX;
      }
      const collision = testCollision(player, allMunitions3[socket.id]);
      if (collision) {
        //console.log("game over ...");
        this.vitX = 0;
        socket.emit("displaying2", {
          message: "Game over!...press F5 to restart ",
        });
      }
    },
  };

  const ennemi3 = Object.create(Ennemi3);
  allMunitions3[socket.id] = ennemi3;

  const Ennemi4 = {
    id: "" + Math.floor(calcule * 100),
    x: 480,
    y: 130,
    vitX: 18,
    //vitY: 3,

    inimicus: function () {
      // gestion des collisions
      if (this.x > 480 || this.x < 20) {
        this.vitX = -this.vitX;
        this.x += this.vitX;
      } else {
        this.x += this.vitX;
      }
      const collision = testCollision(player, allMunitions4[socket.id]);
      if (collision) {
        //console.log("game over ...");
        this.vitX = 0;
        socket.emit("displaying2", {
          message: "Game over!...press F5 to restart ",
        });
      }
    },
  };

  const ennemi4 = Object.create(Ennemi4);
  allMunitions4[socket.id] = ennemi4;

  const Ennemi5 = {
    id: "" + Math.floor(calcule * 100),
    x: 30,
    y: 90,
    vitX: 20,
    //vitY: 3,

    inimicus: function () {
      // gestion des collisions
      if (this.x > 480 || this.x < 20) {
        this.vitX = -this.vitX;
        this.x += this.vitX;
      } else {
        this.x += this.vitX;
      }
      const collision = testCollision(player, allMunitions5[socket.id]);
      if (collision) {
        //console.log("game over ...");
        this.vitX = 0;
        socket.emit("displaying2", {
          message: "Game over!...press F5 to restart ",
        });
      }
    },
  };

  const ennemi5 = Object.create(Ennemi5);
  allMunitions5[socket.id] = ennemi5;

  const Win = {
    id: "" + Math.floor(calcule * 100),
    x: 250,
    y: 30,
    vitX: 9,
    //vitY: 3,

    inimicus: function () {
      // gestion des collisions
      if (this.x > 480 || this.x < 20) {
        this.vitX = -this.vitX;
        this.x += this.vitX;
      } else {
        this.x += this.vitX;
      }
      const collision = testCollision(player, allwinners[socket.id]);
      if (collision) {
        //console.log("game over ...");
        this.vitX = 0;
        socket.emit("displaying3", {
          message: "You win!...press F5 to restart ",
        });
      }
    },
  };

  const win = Object.create(Win);
  allwinners[socket.id] = win;

  const Brique = {
    x: 170,
    y: 430,
    inimicus: () => {},
  };

  const brique = Object.create(Brique);

  allBriques[socket.id] = brique;

  const Brique1 = {
    x: 220,
    y: 430,
    inimicus: () => {},
  };

  const brique1 = Object.create(Brique1);

  allBriques1[socket.id] = brique1;

  const Brique2 = {
    x: 260,
    y: 430,
    inimicus: () => {},
  };

  const brique2 = Object.create(Brique2);

  allBriques2[socket.id] = brique2;

  const Brique3 = {
    x: 350,
    y: 310,
    inimicus: () => {},
  };

  const brique3 = Object.create(Brique3);

  allBriques3[socket.id] = brique3;

  const Brique3A = {
    x: 50,
    y: 310,
    inimicus: () => {},
  };

  const brique3A = Object.create(Brique3A);

  allBriques3A[socket.id] = brique3A;

  const Brique4 = {
    x: 450,
    y: 310,
    inimicus: () => {},
  };

  const brique4 = Object.create(Brique4);

  allBriques4[socket.id] = brique4;

  const Brique5 = {
    x: 400,
    y: 310,
    inimicus: () => {},
  };

  const brique5 = Object.create(Brique5);

  allBriques5[socket.id] = brique5;

  const Brique5A = {
    x: 100,
    y: 310,
    inimicus: () => {},
  };

  const brique5A = Object.create(Brique5A);

  allBriques5A[socket.id] = brique5A;

  const Brique6 = {
    x: 90,
    y: 200,
    inimicus: () => {},
  };

  const brique6 = Object.create(Brique6);

  allBriques6[socket.id] = brique6;

  /* const Brique7 = {
    x: 180,
    y: 200,
    inimicus: () => {},
  };

  const brique7 = Object.create(Brique7);

  allBriques7[socket.id] = brique7;*/

  const Brique8 = {
    x: 360,
    y: 200,
    inimicus: () => {},
  };

  const brique8 = Object.create(Brique8);

  allBriques8[socket.id] = brique8;

  // gestion des collisions ennemis /player
  // determination de la distance seuil de collision
  const distanceSeuil = (elt1, elt2) => {
    let difX = elt1.x - elt2.x;
    let difY = elt1.y - elt2.y;
    return Math.sqrt(difX * difX + difY * difY);
  };

  const testCollision = (elt1, elt2) => {
    let distance = distanceSeuil(elt1, elt2);
    return distance < 23;
  };

  // gestion de l'interactivité avec le clavier
  socket.on("keyPress", (data) => {
    if (data.moveId === "left") player.pressG = data.status;
    else if (data.moveId === "right") player.pressD = data.status;
    else if (data.moveId === "up") player.pressH = data.status;
    else if (data.moveId === "down") player.pressB = data.status;
  });

  // deconnexion
  socket.on("disconnect", (reason) => {
    // retrait du joueur et des autres éléments  de la partie
    delete allConnexions[socket.id];
    delete allPlayers[socket.id];
    delete allMunitions[socket.id];
    delete allMunitions1[socket.id];
    delete allMunitions2[socket.id];
    delete allMunitions3[socket.id];
    delete allMunitions4[socket.id];
    delete allMunitions5[socket.id];
    delete allBriques[socket.id];
    delete allBriques1[socket.id];
    delete allBriques2[socket.id];
    delete allBriques3[socket.id];
    delete allBriques3A[socket.id];
    delete allBriques4[socket.id];
    delete allBriques5[socket.id];
    delete allBriques5A[socket.id];
    delete allBriques6[socket.id];
    delete allBriques7[socket.id];
    delete allBriques8[socket.id];
    delete allwinners[socket.id];
  });
});

// envois de l'etat du jeu a tous les joueur 60 fois par seconde
setInterval(function () {
  // var infoGame = [];
  var update1 = [];
  for (var i in allPlayers) {
    var player = allPlayers[i];
    // on récupère les coordonnées de chaque joueurs
    player.updatePosition();
    // ajout des coordonnées de chaque joueurs à la variable infoJoueur
    update1.push({
      x: player.x,
      y: player.y,
      number: player.number,
      score: player.score,
      hr: player.hr,
    });
  }

  var update2 = [];
  for (var i in allMunitions) {
    var bonus = allMunitions[i];
    bonus.inimicus();
    update2.push({
      x: bonus.x,
      y: bonus.y,
    });
  }
  var update2A = [];
  for (var i in allwinners) {
    var win = allwinners[i];
    win.inimicus();
    update2A.push({
      x: win.x,
      y: win.y,
    });
  }
  var update3 = [];
  for (var i in allMunitions1) {
    var ennemi1 = allMunitions1[i];
    ennemi1.inimicus();
    update3.push({
      x: ennemi1.x,
      y: ennemi1.y,
    });
  }
  var update3A = [];
  for (var i in allMunitions2) {
    var ennemi2 = allMunitions2[i];
    ennemi2.inimicus();
    update3A.push({
      x: ennemi2.x,
      y: ennemi2.y,
    });
  }
  var update3B = [];
  for (var i in allMunitions3) {
    var ennemi3 = allMunitions3[i];
    ennemi3.inimicus();
    update3B.push({
      x: ennemi3.x,
      y: ennemi3.y,
    });
  }
  var update3C = [];
  for (var i in allMunitions4) {
    var ennemi4 = allMunitions4[i];
    ennemi4.inimicus();
    update3C.push({
      x: ennemi4.x,
      y: ennemi4.y,
    });
  }
  var update3D = [];
  for (var i in allMunitions5) {
    var ennemi5 = allMunitions5[i];
    ennemi5.inimicus();
    update3D.push({
      x: ennemi5.x,
      y: ennemi5.y,
    });
  }
  var update4 = [];
  for (var i in allBriques) {
    var brique = allBriques[i];
    brique.inimicus();
    update4.push({
      x: brique.x,
      y: brique.y,
    });
  }
  var update5 = [];
  for (var i in allBriques1) {
    var brique1 = allBriques1[i];
    brique1.inimicus();
    update5.push({
      x: brique1.x,
      y: brique1.y,
    });
  }
  var update6 = [];
  for (var i in allBriques2) {
    var brique2 = allBriques2[i];
    brique2.inimicus();
    update6.push({
      x: brique2.x,
      y: brique2.y,
    });
  }
  var update7 = [];
  for (var i in allBriques3) {
    var brique3 = allBriques3[i];
    brique3.inimicus();
    update7.push({
      x: brique3.x,
      y: brique3.y,
    });
  }
  var update7A = [];
  for (var i in allBriques3A) {
    var brique3A = allBriques3A[i];
    brique3A.inimicus();
    update7A.push({
      x: brique3A.x,
      y: brique3A.y,
    });
  }
  var update8 = [];
  for (var i in allBriques4) {
    var brique4 = allBriques4[i];
    brique4.inimicus();
    update8.push({
      x: brique4.x,
      y: brique4.y,
    });
  }
  var update9 = [];
  for (var i in allBriques5) {
    var brique5 = allBriques5[i];
    brique5.inimicus();
    update9.push({
      x: brique5.x,
      y: brique5.y,
    });
  }
  var update9A = [];
  for (var i in allBriques5A) {
    var brique5A = allBriques5A[i];
    brique5A.inimicus();
    update9A.push({
      x: brique5A.x,
      y: brique5A.y,
    });
  }
  var update10 = [];
  for (var i in allBriques6) {
    var brique6 = allBriques6[i];
    brique6.inimicus();
    update10.push({
      x: brique6.x,
      y: brique6.y,
    });
  }
  /* var update11 = [];
  for (var i in allBriques7) {
    var brique7 = allBriques7[i];
    brique7.inimicus();
    update11.push({
      x: brique7.x,
      y: brique7.y,
    });
  }*/
  var update12 = [];
  for (var i in allBriques8) {
    var brique8 = allBriques8[i];
    brique8.inimicus();
    update12.push({
      x: brique8.x,
      y: brique8.y,
    });
  }

  // variable contenant les informations de chaque joueurs
  var infoGame = {
    player: update1,
    bonus: update2,
    win: update2A,
    ennemi1: update3,
    ennemi2: update3A,
    ennemi3: update3B,
    ennemi4: update3C,
    ennemi5: update3D,
    brique: update4,
    brique1: update5,
    brique2: update6,
    brique3: update7,
    brique3A: update7A,
    brique4: update8,
    brique5: update9,
    brique5A: update9A,
    brique6: update10,
    // brique7: update11,
    brique8: update12,
  };

  for (var i in allConnexions) {
    var socket = allConnexions[i];
    // on envois la nouvelle position des joueurs et leurs informations respectives
    socket.emit("newPositions", infoGame);
  }
}, 1000 / 60);
