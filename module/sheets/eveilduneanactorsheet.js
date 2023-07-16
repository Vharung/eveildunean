/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
 export class eveilduneanActorSheet extends ActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
          classes: ["eveildunean", "sheet", "actor"],
          //template: "systems/eveildunean/templates/actor/personnage-sheet.html",
          width: 1245,
          height: 820,
          tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
        });
    }

    get template() {
        if (this.actor.type == 'personnage' || this.actor.type == 'pnj' ) {
            return `systems/eveildunean/templates/sheets/personnage-sheet.html`;
        }else {
            return `systems/eveildunean/templates/sheets/${this.actor.type}-sheet.html`;
        }
        console.log(`nean | Récupération du fichier html ${this.actor.type}-sheet.`);
        
    }

    getData(){
        const data = super.getData();
        console.log(data);  
        var poidsactor='';
        data.dtypes = ["String", "Number", "Boolean"];
        console.log(data);        
        if (this.actor.type == 'personnage' || this.actor.type == 'pnj' || this.actor.type == 'monstre' | this.actor.type == 'vehicule') {
            this._prepareCharacterItems(data);this._onStatM(data);
        }
        if (this.actor.type == 'personnage' || this.actor.type == 'pnj' ) {
            this._onEncom(data);
        }
        return data;
    }
   
    _prepareCharacterItems(sheetData) {
       const actorData = sheetData.actor;

        // Initialize containers.
        const inventaire = [];
        const arme = [];
        const armure = [];
        const piece = [];
        const argent = [];
        const sort = [];
        
        // Iterate through items, allocating to containers
        // let totalWeight = 0;
        for (let i of sheetData.items) {
          let item = i.items;
          i.img = i.img || DEFAULT_TOKEN;
          if (i.type === 'arme') {
            arme.push(i);
          }
          else if (i.type === 'armure') {
            armure.push(i);
          }
          else if (i.type === 'bouclier') {
            armure.push(i);
          }
          else if (i.type === 'objet') {
            inventaire.push(i);
          }
          else if (i.type === 'piece') {
            piece.push(i);
          }
          else if (i.type === 'argent') {
            argent.push(i);
          }
          else if (i.type === 'sort') {
            sort.push(i);
          }
        }
        sort.sort((a, b) => a.system.cout - b.system.cout);
        inventaire.sort(function (a, b) {if (a.name < b.name) {return -1;} else {return 1;}});
        arme.sort(function (a, b) {if (a.name < b.name) {return -1;} else {return 1;}});
        piece.sort(function (a, b) {if (a.name < b.name) {return -1;} else {return 1;}});
        armure.sort(function (a, b) {if (a.name < b.name) {return -1;} else {return 1;}});
        // Assign and return
        actorData.inventaire = inventaire;
        actorData.arme = arme;
        actorData.piece = piece;
        actorData.armure = armure;
        actorData.argent = argent;
        actorData.sort = sort;
        console.log(arme)
    }


    activateListeners(html){
        super.activateListeners(html);

        /*Jet de des*/
        html.find('.jetdedes').click(this._onRoll.bind(this)); 

        
        /*Etat*/
        html.find('.vehichoix').click(this._onVehi.bind(this))
        /*edition items*/
        html.find('.item-edit').click(this._onItemEdit.bind(this));


        let niva=html.find('.cpt2').val();
        let rac=html.find('.raceliste').val();
        

        // Delete Inventory Item
        html.find('.item-delete').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const item = this.actor.items.get(li.data("itemId"));
            let d = Dialog.confirm({
                title: game.i18n.localize("nean.suppr"),
                content: "<p>"+game.i18n.localize("nean.conf")+ item.name + "'.</p>",
                yes: () => item.delete(),
                no: () => { },
                defaultYes: false
            });
            //item.delete();
            li.slideUp(200, () => this.render(false));
        });



        html.find('.item-create').click(ev => {
            event.preventDefault();
            const dataType=$(ev.currentTarget).data('type');
            const name = `New ${dataType.capitalize()}`;
            this.actor.createEmbeddedDocuments('Item', [{ name: name, type: dataType }], { renderSheet: true })
        });

        html.find('.item-desc').on('click',function(){
           var hauteur= $(this).parent().parent().css("height");
           if(hauteur=='30px'){
                $(this).parent().parent().css({"height":"auto"});
            }else{
                $(this).parent().parent().css({"height":"30px"});
            }
        });
        


        
            

        

        /*Poids encombrement*/
        var poids=[];
        var quantite=[];
        var total=0;
        //var exo=html.find('.armurequi').val()
        html.find( ".item-poid" ).each(function( index ) {
          poids.push($( this ).text());
        });
        html.find( ".item-qt" ).each(function( index ) {
          quantite.push($( this ).text());
        });
        console.log(poids)
        console.log(quantite)


        for (var i = 0;i < poids.length ; i++) {
           total=total+parseFloat(poids[i])*parseFloat(quantite[i]);
        }
        /*if(exo=="Exosquelette"){
            enc=enc*2;
        }*/
        var enc=html.find('.enc').val();
        var enc=parseFloat(enc);
        var pourcentage= total*100/enc;

        if(pourcentage<50){
            html.find('.barenc').css({"background":'#00abab'})
        }else if(pourcentage<75){
            html.find('.barenc').css({"background":'#c9984b'})
        }else if(pourcentage<100){
            html.find('.barenc').css({"background":'#a10001'})
        }else if(pourcentage<120){
            html.find('.barenc').css({"background":'#660000'})
        }else{
            html.find('.barenc').css({"background":'#460000'})
        }
        if(pourcentage>100){
            pourcentage=100;
        }
        html.find('.encours').val(total);
        html.find('.barenc').css({"width":pourcentage+"%"});

        

        /*Ajout Bonus*/
        $('.attribut').on('click',function(){
            var bonusactor=$(this).attr('name');
            html.find(".bonusactor").val(bonusactor);            
        });

        /*Reset Bonus*/
        $('.resetbonus').on('click',function(){
            html.find(".bonusactor").val('0');            
        });

         

        //vh_blind
        var blind=html.find(".vh_blind").val();
        var blindage=html.find(".blindagemax").val();
        var pourcent=parseInt(blind)*100/parseInt(blindage);
        html.find(".blinder .bar").css({'width':pourcent+'%'});
        var andro=html.find('.andomedes').val();
        if(andro=='oui'){
            html.find(".andromede").css({'display':'block'});
        }else{
            html.find(".andromede").css({'display':'none'});
        }
        html.find(".blindage").val(blind);
        var maxblind=0;
        var actboumax=html.find(".actboumax").val();
        for (var i=0; i<5; i++) {
            var min=html.find(".min"+i).val();
            var max=html.find(".max"+i).val();
            if(i<4){maxblind=parseInt(maxblind)+parseInt(max)};
            var pou=parseInt(min)*100/parseInt(max);
            //console.log(pou)
            if(pou<20){
                var color='red';
            }else if(pou<60){
                var color='orange';
            }else if(i==4){
                var color='green';
            }else{
                var color='blue';
            }
            html.find(".bar"+i).css({'width':pou+'%','background':color});
        }

            if(maxblind<actboumax){
                var diff=actboumax - maxblind
                html.find('.ptrestbar').html("il reste :"+diff+" d'énergie à utiliser")
            }else if(maxblind>actboumax){
                var diff=maxblind -actboumax 
                html.find('.ptrestbar').html(diff+" d'énergie est en trop")
            }else{
                html.find('.ptrestbar').html("Tous les points d'armure sont répartis sur les zones.")
            }

        html.find( ".compt input" ).each(function() {
              var valor= $( this ).val();
              if(valor==0){
                $( this ).css({"background":"transparent","color": "#000"});
              }else if(valor>0){
                $( this ).css({"background":"#00abab","color": "white"});
              }else if(valor<0){
                $( this ).css({"background":"#a10001","color": "white"});
              }
            });
        var hp= html.find('.hp').val();
        var mut= html.find('.mutation').val();
        
        if(hp<=0){
            html.find('.outer').css({"background": "linear-gradient(-45deg, transparent 12px, #ff0101 0) right,linear-gradient(135deg, transparent 12px, #ff0101 0) left","background-size":"50% 100%","background-repeat": "no-repeat"});
            html.find('.inner').css({"background": "linear-gradient(-45deg, transparent 12px, #310101 0) right,linear-gradient(135deg, transparent 12px, #310101 0) left","background-size":"50% 100%","background-repeat": "no-repeat"});
            html.find('.santes').css({"background": "none"});
        }else if(mut=="oui"){
            html.find('.outer').css({"background": "linear-gradient(-45deg, transparent 12px, #3ce47b 0) right,linear-gradient(135deg, transparent 12px, #3ce47b 0) left","background-size":"50% 100%","background-repeat": "no-repeat"});
            html.find('.inner').css({"background": "linear-gradient(-45deg, transparent 12px, #00220f  0) right,linear-gradient(135deg, transparent 12px, #00220f 0) left","background-size":"50% 100%","background-repeat": "no-repeat"});
            html.find('.santes').css({"background": "url(systems/eveildunean/css/biohazard.jpg) center center","background-size":"80% 80%","background-repeat": "no-repeat"});
        }else {
            html.find('.outer').css({"background": "linear-gradient(-45deg, transparent 12px, #00FFFF 0) right,linear-gradient(135deg, transparent 12px, #00FFFF 0) left","background-size":"50% 100%","background-repeat": "no-repeat"});
            html.find('.inner').css({"background": "linear-gradient(-45deg, transparent 12px, #004060  0) right,linear-gradient(135deg, transparent 12px, #004060 0) left","background-size":"50% 100%","background-repeat": "no-repeat"});
            html.find('.santes').css({"background": "none"});
        } 


    }


    getItemFromEvent = (ev) => {
        const parent = $(ev.currentTarget).parents(".item");
        return this.actor.items.get(parent.data("itemId"));
    }

    _onItemEdit(event){
        const item = this.getItemFromEvent(event);
        item.sheet.render(true);
    }

    _onRoll(event){
        let maxstat = event.target.dataset["attdice"];
        var name = event.target.dataset["name"];
        var type = this.actor.system.typed;
        var arme = this.actor.system.armed;
        var chargequi = this.actor.system.charged;
        var degat = this.actor.system.degatd;

        var balistique=this.actor.system.Balistique;

        const jetdeDesFormule = "1d100";
        var bonus =this.actor.system.malus;
        var critique=5;
        if(type=="C"){
            critique=10;
        }
        var echec=95;
        if(type=="P"){
            echec=90;
        }
        
        var conf="auto";
        if(bonus=='' || bonus ==undefined || bonus==null){
            bonus=0;
        }
        let inforesult=parseInt(maxstat)+parseInt(bonus)+30;
        if(inforesult>echec){
            inforesult=echec;
        }
        
        let dif=parseInt(etoilemax)-parseInt(etoile);
        if(name=="Tir" || name=="Tircouv"){
            inforesult=parseInt(inforesult)+(dif*5)
            console.log(inforesult)
            if(name=="Tir"){var conf="none;width: 200px;";}
            if(chargequi=='' || chargequi== undefined){
                 chargequi="Mun. "+arme
            }
            var chargeur=this.actor.items.filter(i=>i.name == chargequi); 
                 
            
            if(chargeur.length === 0){
                succes="<h4 class='resultat' style='background:#ff3333;'>Pas de chargeur !</h4>";
                ChatMessage.create({
                    speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                    flavor: succes
                  });
                return;
            }
            var munition=chargeur[0].system.quantite;
            if(munition<=0 || name=="Tircouv" && munition<=10 ){   
                succes="<h4 class='resultat' style='background:#ff3333;'>Plus de munition !</h4>";
                ChatMessage.create({
                    speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                    flavor: succes
                  });
                return;
            } 
        }
        let r = new Roll("1d100");
        var roll=r.evaluate({"async": false});
        var deg='';
        var perte=0;
        let retour=r.result; var succes="";
        if(name=="Visée"){
            if(retour>echec){
                succes="<h4 class='resultat' style='background:#ff3333;'>Arme Inutilisable</h4>";
                deg='<h4 class="resultdeg3"></h4>';
            }else if(retour>(inforesult+20)){
                succes="<h4 class='resultat' style='background:#ff5733;'>L'arme est enrayé pour 1 tour</h4>";
                deg='<h4 class="resultdeg2"></h4>';
            }else if(retour>inforesult){
                succes="<h4 class='resultat' style='background:#ff5733;'>Raté</h4>";
                deg='<h4 class="resultdeg4"></h4>';
            }else if(retour>(inforesult-20)){
                succes="<h4 class='resultat' style='background:#78be50;'>La cible est touché</h4>";
                deg='<h4 class="resultdeg"></h4>';
            }else if(retour>critique){
                succes="<h4 class='resultat' style='background:#78be50;'>Dégât x1.5</h4>";
                deg='<h4 class="resultdeg"></h4>';
            }else if(retour<=critique){
                succes="<h4 class='resultat' style='background:#78be50;'>Dégât x2</h4>";
                deg='<h4 class="resultdeg"></h4>';
            }
        }else if(name=="Tircouv"){
            perte=10;
            if(retour>echec){
                succes="<h4 class='resultat' style='background:#ff3333;'>Action raté</h4>";
            }else if(retour>(inforesult+20)){
                succes="<h4 class='resultat' style='background:#ff5733;'>Malus de 15 aux ennemis</h4>";
            }else if(retour>inforesult){
                succes="<h4 class='resultat' style='background:#ff5733;'>Malus de 15 aux ennemis</h4>";
            }else if(retour>(inforesult-20)){
                succes="<h4 class='resultat' style='background:#78be50;'>Malus de 30 aux ennemis</h4>";              
            }else if(retour>critique){
                succes="<h4 class='resultat' style='background:#78be50;'>Malus de 30 aux ennemis</h4>";
            }else if(retour<=critique){
                succes="<h4 class='resultat' style='background:#78be50;'>Annule le prochain tour des ennmis</h4>";;                
            }  
        }else if(name=="Tir"){
            var bles=0;
            name+=" avec "+arme;       
            if(retour>95){
                succes="<h4 class='resultat' style='background:#ff3333;'>Arme Inutilisable</h4>";
                deg='<h4 class="resultdeg3"></h4>';
            }else if(retour>(inforesult+20)){
                succes="<h4 class='resultat' style='background:#ff5733;'>L'arme est enrayé pour 1 tour</h4>";
                deg='<h4 class="resultdeg2"></h4>';
            }else if(retour>inforesult){
                succes="<h4 class='resultat' style='background:#ff5733;'>Raté</h4>";
                deg='<h4 class="resultdeg4"></h4>';
                perte=1;
            }else if(retour>(inforesult-20)){
                succes="<h4 class='resultat' style='background:#78be50;'>La cible est touché</h4>";
                deg='<h4 class="resultdeg">'+degat+'</h4>';
                perte=1;bles=1;                
            }else if(retour>critique){
                succes="<h4 class='resultat' style='background:#78be50;'>Dégât x1.5</h4>";
                degat=Math.round(parseInt(degat)*1.5);
                deg='<h4 class="resultdeg">'+degat+'</h4>';
                perte=1;bles=1;
            }else if(retour<=critique){
                succes="<h4 class='resultat' style='background:#78be50;'>Dégât x2</h4>";
                degat=parseInt(degat)*2;
                deg='<h4 class="resultdeg">'+degat+'</h4>';
                perte=1;bles=1;               
            } 
            //degat auto
            if(bles==1){
                game.user.targets.forEach(i => {
                    var nom=i.document.name;
                    var hp = i.document._actor.system.stat.hp.value;
                    var armure=i.document.actor.system.stat.armure.value
                    var boucli=i.document.actor.system.stat.protections.value;
                    if(type=="L"){
                        boucli=parseInt(boucli)-parseInt(degat)
                        degat=parseInt(degat)-parseInt(armure)
                        if(armure<0){
                            armure=0;
                            hp=hp-parseInt(degat)
                            console.log(hp+'='+degat+'-'+boucli+'-'+armure)
                        }
                    }else if(type=="F" || type=="E"){
                        boucli=parseInt(boucli)-parseInt(degat)
                        degat=parseInt(degat)-parseInt(boucli)
                        if(boucli<0){
                            boucli=0;
                            hp=hp-parseInt(degat)
                            console.log(hp+'='+degat+'-'+boucli+'-'+armure)
                        } 
                    }else if(type=="P" || type=="S"){
                        hp=hp-parseInt(degat)
                    }else{
                        boucli=parseInt(boucli)-parseInt(degat)
                        degat=parseInt(degat)-parseInt(boucli)
                        if(boucli<0){
                            boucli=0;
                            degat=parseInt(degat)-parseInt(armure)
                            armure=parseInt(armure)-parseInt(degat)
                            if(armure<0){
                                armure=0;
                                hp=hp-parseInt(degat)
                                console.log(hp+'='+degat+'-'+boucli+'-'+armure)
                            }
                        }        
                    }
                    
                    //diminier les armures et boucliers en fonction type d'arme
                    // retirer HP
                    if(bles>0){
                        hp=parseInt(hp)-degat;
                        if(hp<0){
                            console.log(i)
                            hp=0; 
                            i.actor.createEmbeddedDocuments("ActiveEffect", [
                              {label: 'Mort', icon: 'icons/svg/skull.svg', flags: { core: { statusId: 'dead' } } }
                            ]);
                            console.log(i)

                        }
                        i.actor.update({'system.stat.hp.value': hp,'system.stat.armure.value': armure,'system.stat.protections.value': boucli });
                    } 
                })
            }
           
        }else {
            if(retour>echec){
                succes="<h4 class='resultat' style='background:#ff3333;'>Echec critique</h4>";
            }else if(retour<=critique){
                succes="<h4 class='resultat' style='background:#7dff33;'>Réussite critique</h4>";
            }else if(retour<=inforesult){
                succes="<h4 class='resultat' style='background:#78be50;'>Réussite</h4>";
            }else{
                succes="<h4 class='resultat' style='background:#ff5733;'>Echec</h4>";
            }
        }
        if(perte==1 || perte==10){
            console.log('perte'+perte)
            let itemData= this.actor.items.filter(i=>i.name == chargequi);                 
            var iditem= itemData[0].id;
            var qty = itemData[0].system.quantite;
            if(perte==10){
                itemData[0].NunsMoins();
            }else{
                itemData[0].MunMoins();
            }
        } 
        
    
        if(inforesult<=0){
            succes="<h4 class='resultat' style='background:#ff3333;'>Echec critique</h4>";
        }
        const texte = '<span style="flex:'+conf+'"><p style="text-align: center;font-size: medium;background: #00abab;padding: 5px;color: white;">Jet de ' + name + " : " + jetdeDesFormule +" - " + inforesult + '</p>'+ succes+'</span>'+deg;
        //roll.roll().toMessage({
        roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: texte
        });
    }


    

    _onAleatoire(event){
        var race=["Chien","Serpent","Vermine","Ourse","Sangsue","Lézard","Oiseau","Araignée","Chimère","Grenouille"]
        var carc=["féroce","sombre","immense","redoutable","inquiétante","étrange","rouge","invisible","invinsible"]
        var lieu=["des enfers","des ombres","d'outre tombe"]
        var type=["volant","sous terrain","marin"]
        var effe=["paralyse","empoisonne","detecte sur l'infra-rouge","detecte l'odeur de","detecte la chaleur de","detecte l'énergie de","crahe","lance des épines","se camoufle de","prend l'apparence de"]
        var img='systems/eveildunean/assets/icon/monstre.jpg';
        var nom= race[Math.floor(Math.random()*race.length)];
        var o=Math.random()*100;
        if(o>50){
            nom+=' '+carc[Math.floor(Math.random()*carc.length)];
        }
        o=Math.random()*100;
        if(o>50){
            nom+=' '+lieu[Math.floor(Math.random()*lieu.length)];
        }
        var t= type[Math.floor(Math.random()*type.length)];
        var e= effe[Math.floor(Math.random()*effe.length)];
        var dgt=Math.floor((Math.random()*5)*10);
        var ar=Math.floor((Math.random()*5)*10);
        var pv=Math.floor((Math.random()*5+1)*10);
        var desc=nom+' est un animal '+t+' qui '+e+' ses ennemis. Il inflige '+dgt+' et à une armure de '+ar+' et à '+pv+'PV'
        var cpt=[]
        var valeur=[-30,-20,-10,0,10,20,30,40]
        for (var i =0; i < 26; i++) {
            var v= valeur[Math.floor(Math.random()*valeur.length)];
            cpt.push(v);
        }
        this.actor.update({'name':nom,'img':img,'system.background.histoire':desc,'system.stat.hp.value': pv,'system.stat.hp.max': pv,'system.degatd': dgt,'system.armed':'Attaque','system.stat.armure.value': ar,'system.stat.armure.max': ar,'system.ptarm': ar,'system.prog':'armure Naturel','system.Agilité':cpt[0],'system.Artisanat':cpt[1],'system.Balistique':cpt[2],'system.Combat':cpt[3],'system.ConGén':cpt=[4],'system.ConSpécif':cpt=[5],'system.Dextérité':cpt=[6],'system.Diplomatie':cpt=[7],'system.Discrétion':cpt=[8],'system.Force':cpt=[9],'system.Investigation':cpt=[10],'system.Jeu':cpt=[11],'system.Mécanique':cpt=[12],'system.Médecine':cpt=[13],'system.Natation':cpt=[14],'system.Navigation':cpt=[15],'system.Négociation':cpt=[16],'system.Perception':cpt=[17],'system.Pilotage':cpt=[18],'system.Piratage':cpt=[19],'system.Pistage':cpt=[20],'system.Religion':cpt=[21],'system.Science':cpt=[22],'system.Survie':cpt=[23],'system.Tir':cpt=[24],'system.Visée':cpt=[25]});
    }

    _onCouv(event){
        let idn=event.target.dataset["lettre"];  //recupére l'id du bouton
        let etats=['a','b','c','d','e','f','g','h','i','j','k','l','m','n'];
        var active=[this.actor.system.background.etat.a, this.actor.system.background.etat.b, this.actor.system.background.etat.c, this.actor.system.background.etat.d, this.actor.system.background.etat.e, this.actor.system.background.etat.f, this.actor.system.background.etat.g, this.actor.system.background.etat.h, this.actor.system.background.etat.i, this.actor.system.background.etat.j, this.actor.system.background.etat.k, this.actor.system.background.etat.l, this.actor.system.background.etat.m, this.actor.system.background.etat.n]
        let lists=['Endormi','Etourdi','Aveugle','Sourd','Réduit au silence','Apeuré','Brûlant','Gelé','Invisible','Béni','Empoisonné','Saignement','Inconscient','Mort']
        let icon=['sleep','daze','blind','deaf','silenced','terror','fire','frozen','invisible','angel','poison','blood','unconscious','dead']
        if(idn==13){
            var etat=this.actor.system.background.etat.n;
            if(etat==1){
                this.actor.update({"system.background.etat.n":0.5});    
            }else {
                this.actor.update({"system.background.etat.n":1});      
            }
        }else {
            let effet=this.actor.effects;
            var ids=null;
            let etat=active[idn];
            if(etat==0.5){
                this.actor.createEmbeddedDocuments("ActiveEffect", [
                  {label: lists[idn], icon: 'icons/svg/'+icon[idn]+'.svg', flags: { core: { statusId: icon[idn] } } }
                ]);
                this.actor.update({[`system.background.etat.${etats[idn]}`]:1});
            }else {
                
                effet.forEach(function(item, index, array) {
                    if(item.label==lists[idn]){
                        ids=item.id;
                    }
                });            
                this.actor.deleteEmbeddedDocuments("ActiveEffect", [ids]);
                this.actor.update({[`system.background.etat.${etats[idn]}`]:0.5});
            }
        }
    }

    _onVehi(event){
        var type=this.actor.system.type;
        var tail=this.actor.system.taille;
        var ia=this.actor.system.ia;
        var mote=this.actor.system.moteur;
        var blin=this.actor.system.blindage;
        var prix=0;var pv=350;var nbequi=2;var nbpiece=0;var types="";var tailles="";
        var tete=0;var bd=0;var bg=0;var jd=0;var nav=0;var pil=0;var vis=0;var dis=0;var per=0;var med=0;var inv=0;var mec=0;var com=0;var pir=0;
        if(type==1){
            prix=650;types=game.i18n.localize("eveildunean.type1");
        }else if(type==2){
            prix=350;types=game.i18n.localize("eveildunean.type2");
        }else if(type==3){
            prix=850;types=game.i18n.localize("eveildunean.type3");
        }else if(type==4){
            prix=5500;types=game.i18n.localize("eveildunean.type4");
        }
        if(tail==1){
            prix=prix+prix*(parseInt(ia)+parseInt(mote)+parseInt(blin));tailles=game.i18n.localize("eveildunean.taille1");
        }else if(tail==2){
            prix=prix+prix*(2+parseInt(ia)*2+parseInt(mote)*2+parseInt(blin)*2);pv=pv*2;nbequi=nbequi*2;nbpiece=nbpiece+2;tailles=game.i18n.localize("eveildunean.taille2");
        }else if(tail==3){
            prix=prix+prix*(3+parseInt(ia)*3+parseInt(mote)*3+parseInt(blin)*3);pv=pv*4;nbequi=nbequi*3;nbpiece=nbpiece+4;tailles=game.i18n.localize("eveildunean.taille3");
        }else if(tail==4){
            prix=prix+prix*(100+parseInt(ia)*5+parseInt(mote)*5+parseInt(blin)*5);pv=pv*8;nbequi=nbequi=100;nbpiece=100;tailles=game.i18n.localize("eveildunean.taille4");
        }
        var ptrestant=0;
        if(ia=="0.5"){
            ptrestant=60;
            nav=-20;pil=-20;vis=-20;
        }else if(ia=="1"){
            ptrestant=30;
            nav=-10;pil=-10;vis=-10;
        }else if(ia=="1.5"){
            //ptrestant=400;
        }else if(ia=="2"){
            ptrestant=-30;
            nav=10;pil=10;vis=10;
        }else if(ia=="2.5"){
            ptrestant=-60;
            nav=20;pil=20;vis=20;
        }else if(ia=="3"){
            ptrestant=-90;
            nav=20;pil=20;vis=20;dis=10;per=10;med=10;
        }else if(ia=="3.5"){
            ptrestant=-120;
            nav=20;pil=20;vis=20;dis=20;per=20;med=20;   
        }else if(ia=="4"){
            ptrestant=-150;
            nav=20;pil=20;vis=20;dis=20;per=20;med=20;mec=10;com=10;pir=10;
        }else if(ia=="4.5"){
            ptrestant=-180;
            nav=20;pil=20;vis=20;dis=20;per=20;med=20;mec=20;com=20;pir=20;
        }else if(ia=="5"){
            ptrestant=-210;
            nav=30;pil=30;vis=30;dis=20;per=20;med=20;mec=20;com=20;pir=20;
        }
        var bouclier=0;
        if(mote=="0.5"){
            tete=50;bd=50;bg=50;jd=50;bouclier=200
        }else if(mote=="1"){
            tete=100;bd=100;bg=100;jd=100;bouclier=400
        }else if(mote=="1.5"){
            tete=200;bd=150;bg=150;jd=100;bouclier=600
        }else if(mote=="2"){
            tete=200;bd=200;bg=200;jd=200;bouclier=800
        }else if(mote=="2.5"){
            tete=300;bd=250;bg=250;jd=200;bouclier=1000
        }else if(mote=="3"){
            tete=300;bd=300;bg=300;jd=300;bouclier=1200
        }else if(mote=="3.5"){
            tete=400;bd=350;bg=350;jd=300;bouclier=1400 
        }else if(mote=="4"){
            tete=400;bd=400;bg=400;jd=400;bouclier=1600
        }else if(mote=="4.5"){
            tete=500;bd=450;bg=450;jd=400;bouclier=1800
        }else if(mote=="5"){
            tete=500;bd=500;bg=500;jd=500;bouclier=2000
        }
        var blindage=0;
        if(blin=="0.5"){
            blindage=200
        }else if(blin=="1"){
            blindage=400
        }else if(blin=="1.5"){
            blindage=600
        }else if(blin=="2"){
            blindage=800
        }else if(blin=="2.5"){
            blindage=1000
        }else if(blin=="3"){
            blindage=1200
        }else if(blin=="3.5"){
            blindage=1400 
        }else if(blin=="4"){
            blindage=1600
        }else if(blin=="4.5"){
            blindage=1800
        }else if(blin=="5"){
            blindage=2000
        }
       
        var moyen=(ia+blin+mote)/3;var etoile="";
        if(moyen<=0.5){
            etoile="✬ ☆ ☆ ☆ ☆";
        }else if(moyen<=1){
            etoile="★ ☆ ☆ ☆ ☆";
        }else if(moyen<=1.5){
            etoile="★ ✬ ☆ ☆ ☆";
        }else if(moyen<=2){
            etoile="★ ★ ☆ ☆ ☆";
        }else if(moyen<=2.5){
            etoile="★ ★ ✬ ☆ ☆";
        }else if(moyen<=3){
            etoile="★ ★ ★ ☆ ☆";
        }else if(moyen<=3.5){
            etoile="★ ★ ★ ✬ ☆";
        }else if(moyen<=4){
            etoile="★ ★ ★ ★ ☆";
        }else if(moyen<=4.5){
            etoile="★ ★ ★ ★ ✬";
        }else{
            etoile="★ ★ ★ ★ ★";
        }
        
        
        this.actor.update({"system.attributs.Agilité":0,"system.attributs.Artisanat":0,"system.attributs.Balistique":0,"system.attributs.Combat":0,"system.attributs.ConGén":com,"system.attributs.Visée":vis,"system.attributs.ConSpécif":0,"system.attributs.Négociation":0,"system.attributs.Dextérité":0,"system.attributs.Diplomatie":0,"system.attributs.Discrétion":dis,"system.attributs.Force":0,"system.attributs.Investigation":inv,"system.attributs.Jeu":0,"system.attributs.Mécanique":mec,"system.attributs.Médecine":med,"system.attributs.Natation":0,"system.attributs.Navigation":nav,"system.attributs.Perception":per,"system.attributs.Pilotage":pil,"system.attributs.Piratage":pir,"system.attributs.Pistage":0,"system.attributs.Religion":0,"system.attributs.Science":0,"system.attributs.Survie":0,"system.attributs.Tir":0,"system.stat.tete":tete,"system.stat.tete2":tete,"system.stat.bd":bd,"system.stat.bd2":bd,"system.stat.bg":bg,"system.stat.bg2":bg,"system.stat.jd":jd,"system.stat.jd2":jd,"system.model":etoile,"system.tailles":tailles,"system.types":types,"system.prix":prix,"system.prixbase":prix,"system.equi":nbequi,"system.piece":nbpiece,"system.stat.hp.value":pv,"system.stat.hp.max":pv,"system.pointrestant2":ptrestant,"system.stat.armure.value":blindage,"system.stat.armure.max":blindage,"system.stat.protections.value":bouclier,"system.stat.protections.max":bouclier}); 
    }

    _onEncom(data){
        const adata = data.actor;
        var  exo = adata.system.prog;
        var enc=parseInt(adata.system.attributs.Force) /2 + 35; 
        if(exo=='Exosquelette'){
           enc=enc*2; 
        }
        console.log('Encombrement:'+enc)
        this.actor.update({"system.stat.encombrement.max":enc});
    }

    _onEarth(event){
        var fact=Math. round(Math.random() * 4);
        var arme=Math. round(Math.random() * 11);
        var secu=Math. round(Math.random() * 11);
        var crim=Math. round(Math.random() * 11);
        var tech=Math. round(Math.random() * 11);
        var pv=Math. round(Math.random() * 1000)*1000000;
        var pop=Math. round(Math.random() * 1000)*1000;
        let faction=['Empire','OMC','Mafia','Fédération'];
        let etoile=["☆ ☆ ☆ ☆ ☆","✬ ☆ ☆ ☆ ☆","★ ☆ ☆ ☆ ☆","★ ✬ ☆ ☆ ☆","★ ★ ☆ ☆ ☆","★ ★ ✬ ☆ ☆","★ ★ ★ ☆ ☆","★ ★ ★ ✬ ☆","★ ★ ★ ★ ☆","★ ★ ★ ★ ✬","★ ★ ★ ★ ★"]
        var nom=['Noxaqum','Terioll','Kimabas','Kepler','Luyten','Gliese','HD']
        var abc=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
        var surnom1=['Planète','Zone','Reine','Super','Naine','Nébuleuse','Perle']
        var surnom2=['émeraude','saphir','infini','morte','géante','diamant','bleue','noire','rouge','mercure','rocailleuse']
        var type=['une planète desertique','un super continent','une série d\'îles et d\'archipèle','une planète océan','une planète rocailleuse','une jungle luxuriante','une planète glacée']
        var type2=['de nombreuse villes','des animaux dangereux','un faune rare','des volcans très actifs','une techtonique des plaques très active','de violents cyclones et tempêtes','des éruptions solaires fréquentes']
        var huma=0; var drac=0;var plei=0;var elfe=0;var orqa=0;var artu=0;var mach=0;var yori=0;
        if(fact==1){
           huma=Math. round(Math.random() * 11);
           drac=Math. round(Math.random() * (11-huma));
           mach=10-huma-drac;
        }else if(fact==2){
           elfe=Math. round(Math.random() * 11);
           plei=Math. round(Math.random() * (11-huma));
           mach=10-elfe-plei;
        }else if(fact==3){
           orqa=Math. round(Math.random() * 11);
           artu=Math. round(Math.random() * (11-huma));
           mach=10-orqa-artu;
        }else if(fact==4){
           artu=Math. round(Math.random() * 11);
           yori=Math. round(Math.random() * (11-huma));
           mach=10-yori-artu;
        }
        var name=nom[Math. round(Math.random() * 7)]+'-'+Math. round(Math.random() * 1000)+abc[Math. round(Math.random() * 26)];
        var surnom=surnom1[Math. round(Math.random() * surnom1.length)]+' '+surnom2[Math. round(Math.random() * surnom2.length)];
        var histoire='C\'est '+type[Math. round(Math.random() * type.length)]+' avec '+type2[Math. round(Math.random() * type2.length)];
        var img='systems/eveildunean/assets/planete/p'+Math. round(Math.random() * 16)+'.png';
        this.actor.update({"system.description":histoire,"system.surnom":surnom,'name':name,'img':img,"system.pop_humain":etoile[huma],"system.pop_arthuriens":etoile[artu],"system.pop_draconiens":etoile[drac],"system.pop_machine":etoile[mach],"system.pop_pleiadiens":etoile[plei],"system.pop_yoribiens":etoile[yori],"system.pop_elfen":etoile[elfe],"system.pop_orquanien":etoile[orqa],"system.domination":faction[fact],"system.stat.armure.value":pv,"system.stat.armure.max":pv,"system.niveau_arme":etoile[arme],"system.niveau_crime":etoile[crim],"system.niveau_secu":etoile[secu],"system.niveau_tech":etoile[tech],"system.stat.hp.value":pv,"system.stat.hp.max":pv,"system.pouplation":pop});
    }
    async _onStatM(event){
        let level=this.actor.system.background.level;
        let metier=this.actor.system.background.metier;
        let race=this.actor.system.background.race;
        let cpt0=this.actor.system.attributs.Agilité;
        let cpt1=this.actor.system.attributs.Artisanat;
        let cpt2=this.actor.system.attributs.Balistique;
        let cpt3=this.actor.system.attributs.Combat;
        let cpt4=this.actor.system.attributs.ConGén;
        let cpt5=this.actor.system.attributs.ConSpécif;
        let cpt6=this.actor.system.attributs.Dextérité;
        let cpt7=this.actor.system.attributs.Diplomatie;
        let cpt8=this.actor.system.attributs.Discrétion;
        let cpt9=this.actor.system.attributs.Force;
        let cpt10=this.actor.system.attributs.Investigation;
        let cpt11=this.actor.system.attributs.Jeu;
        let cpt12=this.actor.system.attributs.Mécanique;
        let cpt13=this.actor.system.attributs.Médecine;
        let cpt14=this.actor.system.attributs.Natation;
        let cpt15=this.actor.system.attributs.Navigation;
        let cpt16=this.actor.system.attributs.Négociation;
        let cpt17=this.actor.system.attributs.Perception;
        let cpt18=this.actor.system.attributs.Pilotage;
        let cpt19=this.actor.system.attributs.Piratage;
        let cpt20=this.actor.system.attributs.Pistage;
        let cpt21=this.actor.system.attributs.Religion;
        let cpt22=this.actor.system.attributs.Science;
        let cpt23=this.actor.system.attributs.Survie;
        let cpt24=this.actor.system.attributs.Tir;
        let cpt25=this.actor.system.attributs.Visée;
        let cpt26=this.actor.system.attributs.magie;
        let cpt=[cpt0,cpt1,cpt2,cpt3,cpt4,cpt5,cpt6,cpt7,cpt8,cpt9,cpt10,cpt11,cpt12,cpt13,cpt14,cpt15,cpt16,cpt17,cpt18,cpt19,cpt20,cpt21,cpt22,cpt23,cpt24,cpt25,cpt26]
        if(level==1){
            for (var i = cpt.length - 1; i >= 0; i--) {
                if(metier==game.i18n.localize("eveildunean.metier1") && i==1 || 
                   metier==game.i18n.localize("eveildunean.metier2") && i==16|| 
                   metier==game.i18n.localize("eveildunean.metier3") && i==23|| 
                   metier==game.i18n.localize("eveildunean.metier4") && i==10|| 
                   metier==game.i18n.localize("eveildunean.metier5") && i==8 || 
                   metier==game.i18n.localize("eveildunean.metier6") && i==18|| 
                   metier==game.i18n.localize("eveildunean.metier7") && i==13|| 
                   metier==game.i18n.localize("eveildunean.metier8") && i==24|| 
                   metier==game.i18n.localize("eveildunean.metier9") && i==12|| 
                   metier==game.i18n.localize("eveildunean.metier10") && i==22|| 
                   metier==game.i18n.localize("eveildunean.metier11") && i==26||
                   race==game.i18n.localize("eveildunean.humain") && i==6 ||
                   race==game.i18n.localize("eveildunean.artu") && i==4 || 
                   race==game.i18n.localize("eveildunean.pleiadiens") && i==20 || 
                   race==game.i18n.localize("eveildunean.yor") && i==17 || 
                   race==game.i18n.localize("eveildunean.dragon") && i==9 || 
                   race==game.i18n.localize("eveildunean.elf") && i==0 || 
                   race==game.i18n.localize("eveildunean.machine") && i==19 || 
                   race==game.i18n.localize("eveildunean.orqu") && i==3){

                    if(cpt[i]>40){cpt[i]=40}else if(parseInt(cpt[i])<-20){cpt[i]=-20}
                }else if(cpt[i]>30){cpt[i]=30}else if(parseInt(cpt[i])<-30){cpt[i]=-30}

            }
        }
        if(parseInt(level)>1){
            for (var i = cpt.length - 1; i >= 0; i--) {
                if(race==game.i18n.localize("eveildunean.humain") && i==6 ||
                   race==game.i18n.localize("eveildunean.artu") && i==4 || 
                   race==game.i18n.localize("eveildunean.pleiadiens") && i==20 || 
                   race==game.i18n.localize("eveildunean.yor") && i==17 || 
                   race==game.i18n.localize("eveildunean.dragon") && i==9 || 
                   race==game.i18n.localize("eveildunean.elf") && i==0 || 
                   race==game.i18n.localize("eveildunean.machine") && i==19 || 
                   race==game.i18n.localize("eveildunean.orqu") && i==3){
                    if(parseInt(cpt[i])<-20){cpt[i]=-20}
                }
                if(parseInt(cpt[i])<-30){cpt[i]=-30}
            } 
        }
        
  



        //activer les effets
        let effet=this.actor.effects;
        var effets=[];
        //var etats=['a','b','c','d','e','f','g','h','i','j','k','l','m','n'];
        var active=[0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]
        var lists=['Endormi','Etourdi','Aveugle','Sourd','Réduit au silence','Apeuré','Brûlant','Gelé','Invisible','Béni','Empoisonné','Saignement','Inconscient','Mort']
        effet.forEach(function(item, index, array) {
            if(item.label!=''){
                effets.push(item.label);
            }
        });

        for(var i=0; i<lists.length; i++){
            for (var j=0; j < effets.length; j++) {
                if(lists[i]== effets[j]){
                    active[i]=1;
                    console.log(i+' : '+effets[j]) 
                }
            }
        }

        this.actor.update({"system.attributs.Agilité":cpt[0],"system.attributs.Artisanat":cpt[1],"system.attributs.Balistique":cpt[2],"system.attributs.Combat":cpt[3],"system.attributs.ConGén":cpt[4],"system.attributs.ConSpécif":cpt[5],"system.attributs.Dextérité":cpt[6],"system.attributs.Diplomatie":cpt[7],"system.attributs.Discrétion":cpt[8],"system.attributs.Force":cpt[9],"system.attributs.Investigation":cpt[10],"system.attributs.Jeu":cpt[11],"system.attributs.Mécanique":cpt[12],"system.attributs.Médecine":cpt[13],"system.attributs.Natation":cpt[14],"system.attributs.Navigation":cpt[15],"system.attributs.Négociation":cpt[16],"system.attributs.Perception":cpt[17],"system.attributs.Pilotage":cpt[18],"system.attributs.Piratage":cpt[19],"system.attributs.Pistage":cpt[20],"system.attributs.Religion":cpt[21],"system.attributs.Science":cpt[22],"system.attributs.Survie":cpt[23],"system.attributs.Tir":cpt[24],"system.attributs.Visée":cpt[25],"system.attributs.magie":cpt[26],"system.background.etat.a":active[0],"system.background.etat.b":active[1],"system.background.etat.c":active[2],"system.background.etat.d":active[3],"system.background.etat.e":active[4],"system.background.etat.f":active[5],"system.background.etat.g":active[6],"system.background.etat.h":active[7],"system.background.etat.i":active[8],"system.background.etat.j":active[9],"system.background.etat.k":active[10],"system.background.etat.l":active[11],"system.background.etat.m":active[12]});        
    }
}