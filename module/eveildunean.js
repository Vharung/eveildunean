import { eveilduneanActor } from"./sheets/eveilduneanactor.js";
import { eveilduneanActorSheet } from "./sheets/eveilduneanactorsheet.js";
import { eveilduneanItem } from "./sheets/eveilduneanitem.js";
import { eveilduneanItemSheet } from "./sheets/eveilduneanitemsheet.js";


Hooks.once("init", async function() {
    console.log("Eveil du néan | Initialisation du système eveildunean Chronicles");
	CONFIG.Actor.documentClass = eveilduneanActor;
    CONFIG.Item.documentClass = eveilduneanItem;

    CONFIG.Combat.initiative = {
	    formula: "30+@Perception",
	    decimals: 3
	};

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("eveildunean", eveilduneanItemSheet, { makeDefault: true });

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("eveildunean", eveilduneanActorSheet, { makeDefault: true });
});

Hooks.on('renderActorSheet', (app, html, data) => {
  html.find('.my-popup-button').click((event) => {
    event.preventDefault();
    const button = event.currentTarget;
    const name = button.dataset.name;
    const dice = button.dataset.attdice;
    const bonus =data.actor.system.malus
    const actor =data.actor
    // Votre contenu personnalisé pour la fenêtre Popup
    const content = `<p>Quel est le niveau d'étoiles ?</p>`;

    
    let dialog=new Dialog({
      title: 'Jet de : '+name+' - Choix de difficulté',
      content: content,
      buttons: {
        roll0: {
          label: "☆ ☆ ☆ ☆ ☆",
          callback: () => {
            callback: rollCallback(name,dice,actor,bonus,0)
          }
        },
        roll1: {
          label: "✬ ☆ ☆ ☆ ☆",
          callback: () => {
            callback: rollCallback(name,dice,actor,bonus,1)
          }
        },
        roll2: {
          label: "★ ☆ ☆ ☆ ☆",
          callback: () => {
            callback: rollCallback(name,dice,actor,bonus,2)
          }
        },
        roll3: {
          label: "★ ✬ ☆ ☆ ☆",
          callback: () => {
            callback: rollCallback(name,dice,actor,bonus,3)
          }
        },
        roll4: {
          label: "★ ★ ☆ ☆ ☆",
          callback: () => {
            callback: rollCallback(name,dice,actor,bonus,4)
          }
        },
        roll5: {
          label: "★ ★ ✬ ☆ ☆",
          callback: () => {
            callback: rollCallback(name,dice,actor,bonus,5)
          }
        },
        roll6: {
          label: "★ ★ ★ ☆ ☆",
          callback: () => {
            callback: rollCallback(name,dice,actor,bonus,6)
          }
        },
        roll7: {
          label: "★ ★ ★ ✬ ☆",
          callback: () => {
            callback: rollCallback(name,dice,actor,bonus,7)
          }
        },
        roll8: {
          label: "★ ★ ★ ★ ☆",
          callback: () => {
            callback: rollCallback(name,dice,actor,bonus,8)
          }
        },
        roll9: {
          label: "★ ★ ★ ★ ✬",
          callback: () => {
            callback: rollCallback(name,dice,actor,bonus,9)
          }
        },
        roll10: {
          label: "★ ★ ★ ★ ★",
          callback: () => {
            callback: rollCallback(name,dice,actor,bonus,10)
          }
        },
        ok: {
          icon: '<i class="fas fa-check"></i>',
          label: 'Fermer',
          callback: () => console.log('Fenêtre popup fermée'),
        },
      },
      default: 'ok',
    }).render(true);   
    function rollCallback(name,dice,actor,bonus,etoile) {
        let etoilemax=Math.floor(dice/5)
        let dif=parseInt(etoilemax)-parseInt(etoile);
        let malus=dif*5;
        //if(malus>0){malus=0}
        const jetdeDesFormule = "1d100";
        let inforesult=parseInt(dice)+parseInt(malus)+30+parseInt(bonus);
        let echec=95;let critique=5;
        if(inforesult>echec){
            inforesult=echec;
        }
        
        let r = new Roll("1d100");
        var roll=r.evaluate({"async": false});
        let retour=r.result; var succes="";
        if(retour>echec){
                succes="<h4 class='resultat' style='background:#ff3333;'>Echec critique</h4>";
        }else if(retour<=critique){
            succes="<h4 class='resultat' style='background:#7dff33;'>Réussite critique</h4>";
        }else if(retour<=inforesult){
            succes="<h4 class='resultat' style='background:#78be50;'>Réussite</h4>";
        }else{
            succes="<h4 class='resultat' style='background:#ff5733;'>Echec</h4>";
        }
        const texte = '<span style="flex:auto"><p style="text-align: center;font-size: medium;background: #00abab;padding: 5px;color: white;">Jet de ' + name + " : " + jetdeDesFormule +" - " + inforesult + '</p>'+ succes+'</span>';
        //roll.roll().toMessage({
        roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: actor }),
            flavor: texte
        });

    }
 
    dialog.render(true);
    });
});
