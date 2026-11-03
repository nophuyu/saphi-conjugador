var PERSONS = [
  {q:"ñuqa",es:"yo"},{q:"qam",es:"tú"},{q:"pay",es:"él, ella"},
  {q:"ñuqanchik",es:"nosotros (incl.)"},{q:"ñuqayku",es:"nosotros (excl.)"},
  {q:"qamkuna",es:"ustedes"},{q:"paykuna",es:"ellos, ellas"}
];
var PRES_END = ["ni","nki","n","nchik","yku","nkichik","nku"];
var RQA_END  = ["ni","nki","","nchik","yku","nkichik","nku"];
var FUT = [{f:"saq"},{f:"nki"},{f:"nqa"},{f:"sun",alt:"sunchik"},{f:"sayku",alt:"saqku"},{f:"nkichik"},{f:"nqanku"}];
/* Terminaciones de persona del subjuntivo (-pti) y obligativo (-na),
   según el documento de Quiroz y Batto (2012), pág. 15. */
var PTI_END = ["y","yki","n","nchik","yku","ykichik","nku"];   // subjuntivo: -pti + persona
var NA_END  = ["y","yki","n","nchik","yku","ykichik","nku"];   // obligativo: -na + persona

/* Sufijos verbales derivativos.
   Nombre técnico (name) y ORDEN (ord) según el documento de Alfredo Quiroz
   y Amos Batto «La combinación y orden de sufijos» (2012), que fija el orden
   de los sufijos verbales del quechua boliviano sureño. El número 'ord' es la
   posición en que el sufijo debe ir respecto a la raíz (menor = más cerca de
   la raíz). Se usa para colocar los sufijos en el orden correcto al combinarlos. */
var SUFFIXES = [
  {cat:"Frecuencia y deseo", items:[
    {f:"paya",name:"imitativo / frecuentativo",ord:2,es:"acción repetida o frecuente",ex:"takiy → takipayay \"cantar con frecuencia\""},
    {f:"raya",name:"durativo",ord:3,es:"acción de larga duración",ex:"puñuy → puñurayay \"dormir mucho\""},
    {f:"naya",name:"desiderativo",ord:4,es:"deseo o ganas de hacer la acción",ex:"takiy → takinayay \"tener ganas de cantar\""},
    {f:"chka",name:"progresivo",ord:18,es:"estar ejecutando la acción",ex:"puriy → purichkay \"estar caminando\""}]},
  {cat:"Dirección del movimiento", items:[
    {f:"ykacha",name:"oscilativo",ord:8,es:"acción en varias direcciones",ex:"puriy → puriykachay \"caminar de un lado a otro\""},
    {f:"mu",name:"translocativo",ord:16,es:"hacia el hablante; traer o ir a hacer",ex:"apay → apamuy \"traer aquí\""}]},
  {cat:"Rapidez e inicio", items:[
    {f:"yku",name:"inductivo",ord:9,es:"acción realizada con cierto énfasis o prontitud",ex:"mikhuy → mikhuykuy"},
    {f:"rqu",name:"eductivo",ord:10,es:"acción con rapidez",ex:"willay → willarquy \"avisar rápidamente\""},
    {f:"ri",name:"incoativo",ord:11,es:"empezar la acción; cortesía o afecto",ex:"qhaway → qhawariy \"mirar (con cariño)\""},
    {f:"rpari",name:"disistivo",ord:13,es:"realizar la acción con prontitud",ex:"pallay → pallarpariy \"recoger (pronto)\""}]},
  {cat:"Participación y causa", items:[
    {f:"naku",name:"recíproco",ord:7,es:"la acción se da entre varios sujetos",ex:"much'ay → much'anakuy \"besarse\""},
    {f:"ysi",name:"asistivo",ord:12,es:"ayudar a hacer la acción",ex:"mikhuy → mikhuysiy \"ayudar a comer\""},
    {f:"chi",name:"causativo",ord:14,es:"hacer que otro ejecute la acción",ex:"jap'iy → jap'ichiy \"hacer agarrar\""}]},
  {cat:"Reflexivo y beneficio", items:[
    {f:"ku",name:"reflexivo",ord:15,es:"la acción vuelve sobre el sujeto",ex:"takiy → takikuy \"cantarse uno mismo\""},
    {f:"pu",name:"benefactivo",ord:17,es:"acción en beneficio de otro",ex:"willay → willapuy \"avisar para otro\""}]}
];
var SUF_BY_F = {};
SUFFIXES.forEach(function(g){g.items.forEach(function(s){SUF_BY_F[s.f]=s;});});

/* Ordena una lista de sufijos (por su clave f) según el orden de Quiroz. */
function sortSuffixes(list){
  return list.slice().sort(function(a,b){
    var oa=SUF_BY_F[a]?SUF_BY_F[a].ord:99, ob=SUF_BY_F[b]?SUF_BY_F[b].ord:99;
    return oa-ob;
  });
}

var VERBS = [
  ["takiy","cantar"],["tusuy","bailar"],["mikhuy","comer"],["puñuy","dormir"],["upyay","beber"],
  ["lluqsiy","salir"],["llamk'ay","trabajar"],["pukllay","jugar"],["puriy","caminar"],["waqay","llorar"],
  ["parlay","hablar"],["ruway","hacer"],["willay","avisar"],["mask'ay","buscar"],["apay","llevar"],
  ["rantiy","comprar"],["kutay","moler"],["wayk'uy","cocinar"],["akllay","escoger"],["allay","cavar"],
  ["armay","bañar"],["asiy","reír"],["atiy","poder"],["awqay","guerrear"],["ayqiy","huir"],
  ["aysay","jalar, tirar, levantar"],["jampiy","curar"],["jamuy","venir"],["jap'iy","agarrar"],["jark'ay","atajar"],
  ["jatariy","levantarse"],["kawsay","vivir"],["kichay","abrir"],["kuchuy","cortar"],["kuyuy","moverse"],
  ["ñiy","decir"],["riy","ir"],["qhaway","mirar"],["sayay","pararse"],["siray","coser"],
  ["suyay","esperar"],["tarpuy","sembrar"],["mayllay","lavar"],["munay","querer"],["t'aqsay","lavar ropa"],
  ["ch'ipay","embalar"],["kanay","hacer fogata"],["kay","ser, estar"],
  ["marq'ay","cargar"],["saruy","pisar"],["qunqay","olvidar"],["waqyay","llamar"],
  ["pichay","limpiar, barrer"],["yuyay","recordar, pensar"],["chayay","llegar"],
  ["uyariy","escuchar"],["yaykuy","entrar"],["ranqhay","vender"],["urqhuy","sacar"],
  ["llullakuy","mentir"]
];
/* Verbos pensados para la VOZ PASIVA (reciben la acción).
   Significados: qunqay, munay y chinkay están respaldados por la gramática
   de Quiroz; llakiy y llimphuchay no aparecen en ella, así que su glosa es
   aproximada y conviene revisarla con un hablante. */
var PASSIVE_VERBS = [
  ["qunqay","olvidar"],
  ["munay","querer, amar"],
  ["llakiy","entristecer"],
  ["chinkay","perder"],
  ["llimphuchay","limpiar"]
];

var VMEAN = {};
VERBS.forEach(function(v){VMEAN[v[0]]=v[1];});
PASSIVE_VERBS.forEach(function(v){ if(!VMEAN[v[0]]) VMEAN[v[0]]=v[1]; });

/* La pestaña "Participio + kay" usa su propia lista de verbos. */
function isPkay(){ return state.mood==="pkay"; }
function verbList(){ return isPkay() ? PASSIVE_VERBS : VERBS; }

var state = {derivs:[], view:"conj", sel:null, split:true, multi:false, lastActive:"takiy", mood:"ind"};

/* ---------- UTILIDADES ---------- */
function S(t,c,l){return {t:t,c:c,l:l};}
function pl(i){return "persona: "+PERSONS[i].es;}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function normalize(v){return v.trim().toLowerCase().replace(/[’ʼ`´‘]/g,"'");}
function $(id){return document.getElementById(id);}

/* Glosa del imperativo: la forma principal es la quechua (takiy, takiychik…).
   Esta etiqueta solo indica a QUIÉN va dirigida la orden, sin conjugar el
   verbo en español (evita formas incorrectas en los verbos irregulares). */
function impGloss(kind){
  var labels = {
    tu:    "orden a ti (tú)",
    uds:   "orden a ustedes",
    el:    "que él, ella lo haga",
    ellos: "que ellos, ellas lo hagan"
  };
  return labels[kind];
}

/* ---------- MOTOR ---------- */
var TENSES = {
  pres:{name:"Presente",sub:"raíz + persona",
    hint:"Acción no terminada, habitual o recién ocurrida.",
    cell:function(i){return {segs:[S(PRES_END[i],"p",pl(i))]};}},
  rqa:{name:"Pretérito perfecto",sub:"raíz + -rqa + persona",
    hint:"Pasado definido: la acción se realizó con certeza. La marca -rqa no cambia en ninguna persona.",
    cell:function(i){var s=[S("rqa","t","pretérito perfecto (pasado definido)")];
      if(RQA_END[i]) s.push(S(RQA_END[i],"p",pl(i)));
      return {segs:s,note:i===2?"En la 3.ª persona singular se omite la terminación del presente.":""};}},
  sqa:{name:"Pretérito pluscuamperfecto",sub:"raíz + -sqa + persona",
    hint:"Pasado indefinido: expresa duda sobre la realización; muy usado para relatar cuentos.",
    cell:function(i){var s=[S("sqa","t","pretérito pluscuamperfecto (pasado indefinido)")];
      if(RQA_END[i]) s.push(S(RQA_END[i],"p",pl(i)));
      return {segs:s,note:i===2?"En la 3.ª persona singular se omite la terminación del presente.":""};}},
  fut:{name:"Futuro",sub:"raíz + terminación de futuro",
    hint:"Lo que se hará. Tiene terminaciones propias que fusionan tiempo y persona.",
    cell:function(i){var f=FUT[i];
      return {segs:[S(f.f,"tp","futuro + "+PERSONS[i].es)],
        alt:f.alt?[S(f.alt,"tp","futuro + "+PERSONS[i].es+" (variante)")]:null};}},
  pot:{name:"Potencial presente",sub:"presente + -man (1.ª persona: raíz + -yman)",
    hint:"La acción como posible, dudosa o deseable. En la 1.ª persona singular la forma se arma sobre el infinitivo (raíz + -yman), no sobre el presente.",
    cell:function(i){var a=i===0?S("y","p","persona: yo (mantiene la forma del infinitivo)"):S(PRES_END[i],"p",pl(i));
      return {segs:[a,S("man","t","modo potencial")]};}},
  potp:{name:"Potencial pasado",sub:"potencial + karqa",
    hint:"Potencial más la 3.ª persona del pretérito perfecto de kay: karqa.",
    cell:function(i){var c=TENSES.pot.cell(i);
      c.after="karqa";c.afterLabel="karqa: pretérito perfecto de kay; marca el pasado del potencial";return c;}},
  subj:{name:"Subjuntivo",sub:"raíz + -pti + persona",
    hint:"Expresa una acción supeditada a otra: \"cuando/si yo canto…\". Acompaña a la oración principal.",
    cell:function(i){return {segs:[S("pti","t","modo subjuntivo"),S(PTI_END[i],"p",pl(i))]};}},
  oblig:{name:"Obligativo",sub:"raíz + -na + persona + tiyan",
    hint:"Indica obligación o necesidad: \"tengo que cantar\". En presente lleva el auxiliar tiyan; en futuro, kanqa.",
    cell:function(i){var c={segs:[S("na","t","modo obligativo"),S(NA_END[i],"p",pl(i))]};
      c.after="tiyan";c.afterLabel="tiyan: forma de kay en presente; marca la obligación (\"tengo que…\")";return c;}}
};
var IMP=[
  {i:1,seg:S("y","tp","imperativo + 2.ª persona singular"),g:"tu"},
  {i:5,seg:S("ychik","tp","imperativo + 2.ª persona plural"),g:"uds"},
  {i:2,seg:S("chun","tp","imperativo + 3.ª persona singular"),g:"el"},
  {i:6,seg:S("chunku","tp","imperativo + 3.ª persona plural"),g:"ellos"}
];
var NOPERS=[
  {n:"Infinitivo",seg:S("y","t","infinitivo: acción general e indeterminada")},
  {n:"Part. activo",seg:S("q","t","participio activo: agente o productor de la acción (\"el que…\")")},
  {n:"Part. pasivo",seg:S("sqa","t","participio pasivo: quien recibe o sufre la acción (\"lo …do\")")},
  {n:"Gerundio",seg:S("spa","t","gerundio: acción ya realizada para emprender otra (\"…ndo\")")}
];
var PAS_TENSES=["pres","rqa","sqa","fut"];

function passCell(tk,i){
  var b=TENSES[tk].cell(i);
  return {pas:true,segs:b.segs,alt:b.alt,note:b.note};
}

var P=null;
function parseVerb(raw){
  var v=normalize(raw);
  if(!v) return {ok:false,msg:"Escribe un verbo."};
  if(/[^a-zñáéíóú'\-]/.test(v)) return {ok:false,msg:"Usa solo letras del alfabeto quechua."};
  if(v.charAt(v.length-1)!=="y"||v.length<3) return {ok:false,msg:"Todo verbo quechua en infinitivo termina en -y (por ejemplo: takiy)."};
  if(v==="jaku") return {ok:false,msg:"jaku (\"vamos\") es una excepción y no se conjuga."};
  return {ok:true,inf:v,root:v.slice(0,-1)};
}
function mk(root,derivs,segs){
  var h='<span class="m r">'+esc(root)+'</span>';
  derivs.forEach(function(d){h+='<span class="m d">'+esc(d)+'</span>';});
  segs.forEach(function(s){h+='<span class="m '+s.c+'">'+esc(s.t)+'</span>';});
  return h;
}

/* ---------- RENDER ---------- */
var REG={};
function cellHTML(key,cell){
  REG[key]=cell;
  var d=state.derivs, main;
  if(cell.pas){
    main=mk(P.root,d,[S("sqa","t","")])+' <span class="aux">'+mk("ka",[],cell.segs)+'</span>';
  } else {
    main=mk(P.root,d,cell.segs);
    if(cell.after) main+=' <span class="aux">'+esc(cell.after)+'</span>';
  }
  var h='<button type="button" class="cell" data-key="'+key+'" aria-pressed="'+(state.sel===key?"true":"false")+'">'+main+'</button>';
  if(cell.alt){
    h+='<span class="alt">o: '+(cell.pas?mk(P.root,d,[S("sqa","t","")])+' '+mk("ka",[],cell.alt):mk(P.root,d,cell.alt))+'</span>';
  }
  return h;
}
function rowHTML(pn,es,key,cell){
  return '<div class="row"><span class="pn" title="'+esc(es)+'">'+esc(pn)+'</span><span class="fw">'+cellHTML(key,cell)+'</span></div>';
}
function cardHTML(title,sub,hint,rows){
  return '<article class="tcard"><div class="ct"><h3>'+esc(title)+(hint?'<button type="button" class="i" data-tip="'+esc(hint)+'" aria-label="'+esc(hint)+'">i</button>':'')+'</h3><small>'+esc(sub)+'</small></div>'+rows+'</article>';
}
function tenseCard(tk,pas){
  var rows=PERSONS.map(function(p,i){
    var cell=pas?passCell(tk,i):TENSES[tk].cell(i);
    return rowHTML(p.q,p.es,(pas?"pas-":"")+tk+":"+i,cell);
  }).join("");
  var t=TENSES[tk];
  return cardHTML(t.name,pas?"participio en -sqa + kay":t.sub,t.hint,rows);
}
function section(id,cards){
  return '<section class="mood" id="mood-'+id+'"><div class="grid">'+cards+'</div></section>';
}

/* Construye el contenido de un modo (devuelve el HTML de sus tarjetas). */
function moodCards(id){
  if(id==="ind") return ["pres","rqa","sqa","fut"].map(function(k){return tenseCard(k,false);}).join("");
  if(id==="pot") return ["pot","potp"].map(function(k){return tenseCard(k,false);}).join("");
  if(id==="subj") return tenseCard("subj",false);
  if(id==="oblig") return tenseCard("oblig",false);
  if(id==="imp"){
    var ir=IMP.map(function(x){var c={segs:[x.seg]};
      return '<div class="row"><span class="pn" title="'+esc(PERSONS[x.i].es)+'">'+esc(PERSONS[x.i].q)+'</span><span class="fw">'+cellHTML("imp:"+x.i,c)+'<span class="alt">'+esc(impGloss(x.g))+'</span></span></div>';}).join("");
    return cardHTML("Imperativo","raíz + terminación","Orden, invitación, consejo, súplica o pedido. Solo existe para la 2.ª y la 3.ª persona.",ir);
  }
  if(id==="nop"){
    var nr=NOPERS.map(function(x,i){return '<div class="row"><span class="pn">'+esc(x.n)+'</span><span class="fw">'+cellHTML("nop:"+i,{segs:[x.seg]})+'</span></div>';}).join("");
    return cardHTML("Sobre la raíz","raíz + sufijo","Formas sin persona: infinitivo, participios y gerundio.",nr);
  }
  return "";
}

function renderSections(){
  REG={};
  var nav=[
    ["ind","Indicativo"],["pot","Potencial"],["subj","Subjuntivo"],
    ["oblig","Obligativo"],["imp","Imperativo"],["nop","No personales"],
    ["pkay","Participio + kay"]
  ];
  // si el modo activo no existe, volver al primero
  if(!nav.some(function(n){return n[0]===state.mood;})) state.mood=nav[0][0];
  // construir solo el modo activo
  var h;
  if(state.mood==="pkay"){
    h=section("pkay",PAS_TENSES.map(function(k){return tenseCard(k,true);}).join(""));
  } else {
    h=section(state.mood,moodCards(state.mood));
  }
  $("sections").innerHTML=h;
  // pestañas
  var mn=$("mnav");mn.innerHTML="";
  nav.forEach(function(n){
    var b=document.createElement("button");b.type="button";b.textContent=n[1];
    b.className=(n[0]===state.mood?"active":"");
    b.setAttribute("aria-pressed",n[0]===state.mood?"true":"false");
    b.addEventListener("click",function(){switchMood(n[0]);});
    mn.appendChild(b);
  });
  $("sections").querySelectorAll(".cell").forEach(function(b){
    b.addEventListener("click",function(){state.sel=b.getAttribute("data-key");markSel();renderSheet();});
  });
  $("sections").querySelectorAll(".i").forEach(function(b){
    b.addEventListener("click",function(e){
      e.stopPropagation();
      var abierto=b.classList.contains("show");
      $("sections").querySelectorAll(".i.show").forEach(function(o){o.classList.remove("show");});
      if(!abierto) b.classList.add("show");
    });
  });
}
function markSel(){
  $("sections").querySelectorAll(".cell").forEach(function(b){
    b.setAttribute("aria-pressed",b.getAttribute("data-key")===state.sel?"true":"false");
  });
}

function renderHead(){
  var t=$("title"),m=$("meta");
  if(!P.ok){t.innerHTML="Conjugación del verbo";m.innerHTML="";return;}
  var stem=P.root+state.derivs.join(""),inf=stem+"y";
  t.innerHTML='Conjugación del verbo <em>'+esc(inf)+'</em>';
  var mean=VMEAN[P.inf];
  var cls=state.derivs.length?"verbo compuesto":"verbo base";
   var items = [
    ["Clase", cls],
    ["Raíz", P.root + "-"],
    ["Infinitivo base", P.inf],
    ["Sufijos", state.derivs.length ? state.derivs.map(function(d){ return "-" + d; }).join(" ") : "ninguno"]
  ];
  if (state.derivs.length) items.push(["Raíz con sufijos", stem + "-"]);
  items.push(["Significado", mean ? mean : "—"]);
  items.push(["Participio (-sqa)", stem + "sqa"]);
  m.innerHTML=items.map(function(x){return '<div><span>'+esc(x[0])+'</span><b>'+esc(x[1])+'</b></div>';}).join("");
}

function renderApplied(){
  var a=$("applied");a.innerHTML="";
  $("sufbadge").textContent=state.derivs.length?state.derivs.length+" aplicado(s)":"";
  if(!state.derivs.length) return;
  state.derivs.forEach(function(f,idx){
    var p=document.createElement("span");p.className="pill";
    p.appendChild(document.createTextNode((idx+1)+". -"+f));
    var x=document.createElement("button");x.type="button";x.setAttribute("aria-label","Quitar -"+f);x.textContent="×";
    x.addEventListener("click",function(){state.derivs.splice(idx,1);state.sel=null;update();});
    p.appendChild(x);a.appendChild(p);
  });
  var c=document.createElement("button");c.type="button";c.className="linkbtn";c.textContent="Quitar todos";
  c.addEventListener("click",function(){state.derivs=[];state.sel=null;update();});
  a.appendChild(c);
}

function renderSufGroups(){
  var box=$("sufgroups");box.innerHTML="";
  SUFFIXES.forEach(function(g){
    var d=document.createElement("div");d.className="grp";
    d.innerHTML="<h4>"+esc(g.cat)+"</h4>";
    g.items.forEach(function(s){
      var b=document.createElement("button");b.type="button";b.className="sbtn";b.title=s.es;
      b.innerHTML="<b>-"+esc(s.f)+"</b><small>"+esc(s.name||s.es.split(/[;,:]/)[0])+"</small>";
      b.addEventListener("click",function(){addSuffix(s.f);});
      d.appendChild(b);
    });
    box.appendChild(d);
  });
}
function addSuffix(f){
  if(state.derivs.length>=3) return;
  if(state.derivs.indexOf(f)!==-1) return;      // no repetir el mismo sufijo
  state.derivs.push(f);
  state.derivs=sortSuffixes(state.derivs);       // colocar en el orden de Quiroz
  state.sel=null;update();
}

function renderSufList(){
  var h="";
  // --- Función didáctica: estructura de la palabra verbal y orden de sufijos ---
  h+='<section class="order-guide">';
  h+='<h2>¿En qué orden van los sufijos?</h2>';
  h+='<p class="note" style="margin:0 0 14px">El verbo quechua se arma por capas. Los sufijos derivativos van entre la raíz y la terminación, y siempre en un orden fijo: cuanto más cerca de la raíz, antes aparece.</p>';
  // esquema de bloques
  h+='<div class="word-scheme">'
    +'<span class="blk r">raíz</span>'
    +'<span class="arrow">+</span>'
    +'<span class="blk d">sufijos derivativos</span>'
    +'<span class="arrow">+</span>'
    +'<span class="blk t">tiempo / modo</span>'
    +'<span class="arrow">+</span>'
    +'<span class="blk p">persona</span>'
    +'</div>';
  // secuencia ordenada de todos los sufijos
  var ordered=[];
  SUFFIXES.forEach(function(g){g.items.forEach(function(s){ordered.push(s);});});
  ordered.sort(function(a,b){return a.ord-b.ord;});
  h+='<p class="note" style="margin:16px 0 8px"><b>Orden completo de los sufijos derivativos</b> (de la raíz hacia afuera):</p>';
  h+='<div class="order-chain">';
  ordered.forEach(function(s,idx){
    if(idx) h+='<span class="chain-arrow">→</span>';
    h+='<span class="chain-item" title="'+esc(s.name||"")+'">-'+esc(s.f)+'</span>';
  });
  h+='</div>';
  h+='<p class="note" style="margin:12px 0 0">Por ejemplo, <em>-chi</em> (causativo) va antes que <em>-ku</em> (reflexivo), y este antes que <em>-chka</em> (progresivo): <b>mikhu-chi-ku-chka-ni</b>. Al aplicar varios sufijos en la herramienta, se colocan solos en este orden.</p>';
  h+='</section>';
  // --- Lista de sufijos por categoría ---
  SUFFIXES.forEach(function(g){
    h+='<section class="mood"><h2>'+esc(g.cat)+'</h2><div class="sgrid">';
    g.items.forEach(function(s){
      h+='<div class="scard"><b>-'+esc(s.f)+'</b>'+(s.name?'<span class="sname">'+esc(s.name)+'</span>':'')+'<div>'+esc(s.es)+'</div><div class="ex">'+esc(s.ex)+'</div><button type="button" data-f="'+esc(s.f)+'">Aplicar al verbo</button></div>';
    });
    h+='</div></section>';
  });
  $("sufList").innerHTML=h;
  $("sufList").querySelectorAll("button[data-f]").forEach(function(b){
    b.addEventListener("click",function(){
      if(!P||!P.ok){$("verb").focus();return;}
      addSuffix(b.getAttribute("data-f"));setView("conj");window.scrollTo({top:0,behavior:"smooth"});
    });
  });
}

function renderQuick(){
  var q=$("quick");q.innerHTML="";
  // En la pestaña Participio + kay se muestran sus verbos; en el resto, una selección corta.
  var quick = isPkay()
    ? PASSIVE_VERBS.map(function(v){return v[0];})
    : ["takiy","mikhuy","puriy","llamk'ay","willay","tusuy","parlay","puñuy"];
  quick.forEach(function(v){
    var b=document.createElement("button");b.type="button";
    b.innerHTML=esc(v)+" <small>"+esc(VMEAN[v]||"")+"</small>";
    b.addEventListener("click",function(){$("verb").value=v;state.sel=null;setView("conj");update();});
    q.appendChild(b);
  });
  $("vlist").innerHTML=verbList().map(function(v){return '<option value="'+esc(v[0])+'">'+esc(v[1])+"</option>";}).join("");
}

/* ---------- Detalle ---------- */
function renderSheet(){
  var sh=$("sheet");
  if(!state.sel||!REG[state.sel]||!P.ok){sh.hidden=true;return;}
  var key=state.sel,cell=REG[key],pas=key.indexOf("pas-")===0;
  var parts=key.replace("pas-","").split(":"),k=parts[0],i=parseInt(parts[1],10);
  var d=state.derivs;
  var sub=(TENSES[k]?TENSES[k].name+" · "+PERSONS[i].q+" ("+PERSONS[i].es+")":k==="imp"?"Imperativo · "+PERSONS[i].q+" ("+PERSONS[i].es+")":NOPERS[i].n)+(pas?" · participio + kay":"");
  var word;
  if(cell.pas) word=mk(P.root,d,[S("sqa","t","")])+" "+mk("ka",[],cell.segs);
  else word=mk(P.root,d,cell.segs)+(cell.after?' <span class="aux">'+esc(cell.after)+"</span>":"");
  var h='<button type="button" class="x" id="xClose" aria-label="Cerrar">×</button><h3>'+word+'</h3><div class="sub">'+esc(sub)+'</div><ul>';
  h+='<li><span class="mm"><span class="m r">'+esc(P.root)+'-</span></span><span class="role">raíz (infinitivo '+esc(P.inf)+' sin la -y)</span></li>';
  d.forEach(function(f){var sf=SUF_BY_F[f];h+='<li><span class="mm"><span class="m d">-'+esc(f)+'</span></span><span class="role">'+(sf.name?esc(sf.name)+': ':'sufijo derivativo: ')+esc(sf.es)+'</span></li>';});
  if(cell.pas){
    h+='<li><span class="mm"><span class="m t">-sqa</span></span><span class="role">participio: forma del verbo que funciona como adjetivo (p. ej. qunqasqa "olvidado", llakisqa "triste")</span></li>';
    h+='<li><span class="mm"><span class="m r">ka-</span></span><span class="role">verbo kay ("ser/estar"), que se conjuga y aporta el tiempo y la persona</span></li>';
  }
  cell.segs.forEach(function(s){h+='<li><span class="mm"><span class="m '+s.c+'">-'+esc(s.t)+'</span></span><span class="role">'+esc(s.l)+'</span></li>';});
  if(cell.after) h+='<li><span class="mm"><span class="aux">'+esc(cell.after)+'</span></span><span class="role">'+esc(cell.afterLabel)+'</span></li>';
  if(cell.note) h+='<li><span class="mm">—</span><span class="role">'+esc(cell.note)+'</span></li>';
  h+="</ul>";
  $("sheetIn").innerHTML=h;sh.hidden=false;
  $("xClose").addEventListener("click",function(){state.sel=null;markSel();sh.hidden=true;});
}

/* ---------- Copiar ---------- */
function copyAll(){
  var msg=$("copyMsg"),out=[];
  document.querySelectorAll("#sections .mood").forEach(function(sec){
    out.push(sec.querySelector("h2").textContent.toUpperCase());
    sec.querySelectorAll(".tcard").forEach(function(c){
      out.push(c.querySelector("h3").firstChild.textContent);
      c.querySelectorAll(".row").forEach(function(r){
        var cellEl=r.querySelector(".cell");
        var alt=r.querySelector(".alt");
        var altTxt=alt&&/^o:/.test(alt.textContent)?" / "+alt.textContent.replace(/^o:\s*/,""):"";
        out.push("  "+r.querySelector(".pn").textContent+"\t"+cellEl.textContent.trim()+altTxt);
      });
    });
    out.push("");
  });
  var txt=out.join("\n");
  function done(ok){msg.textContent=ok?"Copiado":"No se pudo copiar";setTimeout(function(){msg.textContent="";},1800);}
  try{
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(function(){done(true);},function(){done(false);});}
    else done(false);
  }catch(e){done(false);}
}

/* ---------- Vistas y ciclo ---------- */
function setView(v){
  state.view=v;
  $("conjView").hidden=(v!=="conj");
  $("sufView").hidden=(v!=="suf");
  $("navConj").setAttribute("aria-current",v==="conj"?"page":"false");
  $("navSuf").setAttribute("aria-current",v==="suf"?"page":"false");
  if(v!=="conj") $("sheet").hidden=true; else renderSheet();
}
function applyMode(){
  var app=$("app");
  app.classList.toggle("split",state.split);
  app.classList.toggle("multi",state.multi);
  $("lead").innerHTML='<span><i class="m r">raíz</i></span><span><i class="m d">sufijo derivativo</i></span><span><i class="m t">tiempo / modo</i></span><span><i class="m p">persona</i></span>';
}
function update(){
  P=parseVerb($("verb").value);
  $("err").textContent=P.ok?"":P.msg;
  // Los sufijos derivativos no se muestran en la pestaña Participio + kay.
  var muestraSufijos=!isPkay();
  $("sufpanel").hidden=!muestraSufijos;
  $("applied").hidden=!muestraSufijos;
  renderApplied();
  renderHead();
  if(!P.ok){
    $("sections").innerHTML='<div class="empty" style="margin-top:16px">Escribe un verbo quechua en infinitivo para ver su conjugación.</div>';
    $("mnav").innerHTML="";$("sheet").hidden=true;return;
  }
  renderSections();
  renderSheet();
}

/* Cambia de pestaña (modo). La pestaña "Participio + kay" tiene su propia
   lista de verbos: al entrar carga qunqay y recuerda el verbo anterior;
   al salir lo restaura. */
function switchMood(m){
  if(state.mood===m) return;
  var entrandoPkay = (m==="pkay"), saliendoPkay = (state.mood==="pkay");
  if(entrandoPkay){
    if(P && P.ok) state.lastActive=$("verb").value;
    $("verb").value=PASSIVE_VERBS[0][0];   // carga qunqay
    state.derivs=[];                        // los sufijos no aplican aquí
  } else if(saliendoPkay){
    $("verb").value=state.lastActive||"takiy";
  }
  state.mood=m;
  state.sel=null;
  if(entrandoPkay||saliendoPkay) renderQuick();  // refresca lista de verbos
  update();
}

$("verb").addEventListener("input",function(){state.sel=null;update();});
$("verb").addEventListener("keydown",function(e){if(e.key==="Enter"){setView("conj");update();}});
$("go").addEventListener("click",function(){setView("conj");update();});
$("navConj").addEventListener("click",function(){setView("conj");});
$("navSuf").addEventListener("click",function(){setView("suf");window.scrollTo({top:0});});
$("optSplit").addEventListener("change",function(e){state.split=e.target.checked;applyMode();});
$("optMulti").addEventListener("change",function(e){state.multi=e.target.checked;applyMode();});
$("copyBtn").addEventListener("click",copyAll);

// Cerrar cualquier globito de ayuda al hacer clic fuera de un icono "i"
document.addEventListener("click",function(e){
  if(!e.target.closest(".i")){
    document.querySelectorAll(".i.show").forEach(function(o){o.classList.remove("show");});
  }
});

renderQuick();renderSufGroups();renderSufList();applyMode();update();