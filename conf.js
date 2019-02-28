const mysql = require('mysql');
const PORT_NUMBER = `${process.env.cocktail_PORT_NUMBER}`; //Pour les données sensibles les mettres dans conf.js et directement les variables environnement

const connection = mysql.createConnection({
  host: `${process.env.cocktail_host}`,
  user: `${process.env.cocktail_user}`,
  password: `${process.env.cocktail_password}`,
  database: `${process.env.cocktail_database}`
});

module.exports = { mysql, PORT_NUMBER, connection };

/*nano .bashrc
EXAMPLE de variable d'environment       export NOM_DE_VOTRE_VARIABLE="valeur_variable";
__

IMPORT SUR UN SERVEUR NODE (fichier conf.js)

 const variableEnServeur = ${process.env.NOM_DE_VOTRE_VARIABLE};

module.exports = { variableEnServeur };
__

IMPORT SUR APP REACT (fichier conf.js)

const nomVariable= ${process.env.REACT_APP_NOM_VOTRE_VARIABLE};

module.exports = { nomVariable };
__

source .bashrc pour relancer le bashrc quand on a mit les variables enviro */
