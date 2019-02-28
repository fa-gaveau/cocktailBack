//Import des modules
const express = require('express'); //express est le framework standard pour le développement de server en node.js
const app = express();
const bodyParser = require('body-parser'); //bodyParser pour interpreter ce qui vient du client (front) et le transformer en données. Se fait dans le MIDDLEWARE
const cors = require('cors'); //Permet de passer les sécurités cors. Se fait dans le MIDDLEWARE
const { PORT_NUMBER, mysql, connection } = require('./conf'); //Les données sensibles en conf.js

//MIDDLEWARE pour interpreter la requete
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use(cors());

//ROUTES

app.post('/cocktail_likes', (req, res) => {
  //post pour insérer les likes avec les cocktails concernés dans la bdd, on reprend route du front qui incrémente les likes
  console.log(req.body.idCocktail); //pour voir dans le terminal le nombre de likes (ce qu'on souhaite mettre dans la bdd)
  let like = req.body.nbLike; //On met ce qu'on veut dans une variable, ici pour stocker dans la BDD le nombre de like
  let id = req.body.idCocktail; //id de l'API à stocker dans la BDD (champs supplémentaire à l'ID de base de SQL) pour retrouver plus facilement les infos dont on a besoin grâce à cette id de l'API!!
  //console.log(id);
  //console.log(like);
  //console.log(typeof like); pour vérifier le type de variable au départ, ici like nombre et id string
  like = mysql.escape(like); //Ligne de sécurité pour éviter les injections SQL (méthode de sécurité qui transforme en string pour comparaison)
  id = mysql.escape(id);
  console.log(id);
  console.log(like);
  //console.log(typeof id); cela permet de vérifier le type de la variable (string, number, bolean etc), escape transforme en string
  //console.log(typeof like);
  like = parseInt(like); //fonction pour transformer string en nombre entier, on remet nos variables en chiffre
  //console.log(id);
  //console.log(like);
  //console.log(typeof id);
  id = id.replace(/'/g, ''); //  fonction qui remplace un string par un autre, dans notre cas comme guillemet début et fin à remplacer par rien mettre une regex pour selectionner toutes les guillemets de id et les remplacer par rien pour retrouver l'id comme au départ
  //console.log(id); Pour vérifier que id est bien comme à l'origine après la transformation par le sql.escape
  connection.query(
    `SELECT * FROM CocktailLike WHERE Cocktail_Id= '${id}'`, //Voir d'abord si dans la BDD il y a une ligne qui contient cette id.
    (err, results) => {
      if (err) {
        console.log(
          `Tried to access POST '/cocktail_likes' but something went wrong: ${err}\n` // le \n permet de laisser un espace entre les messages
        );
        res.status(500).send(`Error no return of BDD\n`);
      } else {
        console.log(`Accessed POST '/cocktail_likes' successful`);
        //console.log(results); //Permet de voir le résultat, si id non dans BDD pas d'erreur mais résultat vide on est en status 200!
        //res.status(200).send(`Return datas of BDD for id= ${id}\n`); Attention pas de res.send ici car cela termine le traitement de la requête.
        if (results[0] === undefined) {
          //Si l'id renvoie un tableau vide écrire cette syntaxe et on va insérer une nouvelle ligne avec les infos souhaitées
          connection.query(
            //methode pour requete sql
            `INSERT INTO CocktailLike (ID, Cocktail_Id, Number_Likes) VALUES (null, '${id}', '${like}')`, //on insère dans la BDD les valeurs des variables id, name et like pour les colonnes correspondantes. On précise aussi la colonne ID par défaut qui est null (mettre AI autoincrement quand on créée la base pour l'ID)
            (err, results) => {
              if (err) {
                console.log(
                  `Tried to access POST '/cocktail_likes' but something went wrong: ${err}\n` // le \n permet de laisser un espace entre les messages
                );
                res.status(500).send(`Error no insert datas in BDD\n`);
              } else {
                console.log(`Accessed POST '/cocktail_likes' successful`);
                res.status(200).send(`Success of insert in BDD\n`);
              }
            }
          );
        } else {
          connection.query(
            //Si il y a déjà les infos pour l'id concerné mettre à jour dans la BDD le nombre de likes
            `UPDATE CocktailLike SET Number_Likes = '${like}' WHERE Cocktail_Id = '${id}'`,
            (err, results) => {
              if (err) {
                console.log(
                  `Tried to access POST '/cocktail_likes' but something went wrong: ${err}\n` // le \n permet de laisser un espace entre les messages
                );
                res.status(500).send(`Error no update likes in BDD\n`);
              } else {
                console.log(`Accessed POST '/cocktail_likes' successful`);
                res.status(200).send(`Success of update likes in BDD\n`);
              }
            }
          );
        }
      }
    }
  );
});

app.get('/cocktail_likes', (req, res) => {
  //méthode get pour obtenir les infos de la BDD pour les likes et route qui va vers le front (le même que post pas de problème car méthode différente)
  //console.log(req.query); //met un res.status(200); à la fin si on vérifie juste ca avant de construire le reste sinon ca va aller dans erreur. C'est query qui est à utiliser ici car on voit l'id dans la console (pas avec params ou body par exemple ou on a un tableau vide)
  let id = req.query.idCocktail; //On reçoit en query ici
  //console.log(id);
  id = mysql.escape(id); //Ligne de sécurité pour éviter les injections SQL (méthode de sécurité qui transforme en string pour comparaison)
  //console.log(id);
  id = id.replace(/'/g, ''); //fonction qui remplace un string par un autre, dans notre cas comme guillemet début et fin à remplacer par rien mettre une regex pour selectionner toutes les guillemets de id et les remplacer par rien pour retrouver l'id comme au départ
  //console.log(id);
  connection.query(
    `SELECT Number_Likes FROM CocktailLike WHERE Cocktail_Id='${id}'`, //Récupérer les nombres de likes sauvés en BDD par rapport à l'id du cocktail sauvée en BDD
    (err, results) => {
      if (err) {
        console.log(
          `Tried to access GET '/cocktail_likes' but something went wrong: ${err}\n`
        );
        res
          .status(500)
          .send(
            `Error while trying to obtain information on '/cocktail_likes'`
          );
      } else {
        console.log(`Accessed GET '/cocktail_likes' successfully!`);
        //console.log(results); Pour voir la réponse et ce qui ira en front
        res.status(200).json(results); //.json pour transformer en json, équivalent à un .send qui garde les données brutes
      }
    }
  );
  //res.status(200); Pour tester le console.log au début
});

//MIDDLEWARE si erreur sur les routes demandées si avant (à placer ici)
app.use(function(req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.write('you posted:\n');
  res.end(JSON.stringify(req.body, null, 2));
});

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'text/plain');
  res.status(404).send('Not found');
});

//Lancement du serveur
app.listen(PORT_NUMBER, () => {
  console.log(`listening on port ${PORT_NUMBER}`);
});
