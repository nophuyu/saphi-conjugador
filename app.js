var PERSONS = [
  {q:"ñuqa",es:"yo"},{q:"qam",es:"tú"},{q:"pay",es:"él, ella"},
  {q:"ñuqanchik",es:"nosotros (incl.)"},{q:"ñuqayku",es:"nosotros (excl.)"},
  {q:"qamkuna",es:"ustedes"},{q:"paykuna",es:"ellos, ellas"}
];
var PRES_END = ["ni","nki","n","nchik","yku","nkichik","nku"];
var RQA_END  = ["ni","nki","","nchik","yku","nkichik","nku"];
var FUT = [{f:"saq"},{f:"nki"},{f:"nqa"},{f:"sun",alt:"sunchik"},{f:"sayku",alt:"saqku"},{f:"nkichik"},{f:"nqanku"}];

var SUFFIXES = [
  {cat:"Causa, inicio, beneficio, dirección y continuidad", items:[
    {f:"chi",es:"hacer que otro ejecute la acción",ex:"mikhuy → mikhuchiy «hacer comer»"},
    {f:"ri",es:"empezar a…, lentitud, cortesía o cariño",ex:"rimay → rimariy «empezar a hablar»"},
    {f:"pu",es:"en beneficio de otro; retorno",ex:"t'aqsay → t'aqsapuy «lavar para otro»"},
    {f:"mu",es:"hacia el hablante; ir a hacer",ex:"apay → apamuy «traer aquí»"},
    {f:"ra",es:"continuidad, ir realizando la acción",ex:"llamiy → llamiray «ir probando»"}]},
  {cat:"Rapidez, ayuda y acción en curso", items:[
    {f:"rqu",es:"cortesía y acción rápida",ex:"willay → willarquy «avisar rápidamente»"},
    {f:"ysi",es:"cooperación: ayudar en la acción",ex:"mikhuy → mikhuysiy «ayudar a comer»"},
    {f:"yku",es:"acción con prontitud",ex:"mikhuy → mikhuykuy «comer rápidamente»"},
    {f:"chka",es:"estar ejecutando la acción",ex:"puriy → purichkay «estar caminando»"}]},
  {cat:"Otros sufijos compuestos", items:[
    {f:"kamu",es:"ir a realizar la acción (reflexivo)",ex:"takiy → takikamuy «ir a cantarse»"},
    {f:"ykacha",es:"acción en varias direcciones; repetición",ex:"qhaway → qhawaykachay «mirar de un lado a otro»"},
    {f:"rpari",es:"acción llevada completamente hasta el final",ex:"pallay → pallarpariy «recoger todo»"},
    {f:"raya",es:"larga duración, sin interrupción",ex:"puñuy → puñurayay «dormir más de lo normal»"},
    {f:"naya",es:"deseo o inclinación",ex:"tusuy → tusunayay «tener ganas de bailar»"},
    {f:"kipa",es:"repetir la acción",ex:"tarpuy → tarpukipay «sembrar de nuevo»"},
    {f:"kampu",es:"ir a hacer la acción",ex:"puñuy → puñukampuy «ir a dormirse»"},
    {f:"kapu",es:"acción por uno mismo, casi inmediata",ex:"munay → munakapuy «amárselo»"},
    {f:"paya",es:"frecuencia, a veces persistencia",ex:"takiy → takipayay «cantar con frecuencia»"},
    {f:"tata",es:"fuerza, violencia, cólera",ex:"chuqay → chuqatatay «arrojar con fuerza»"}]},
  {cat:"Reflexivo y recíproco", items:[
    {f:"ku",es:"reflexivo: la acción vuelve sobre el sujeto",ex:"takiy → takikuy «cantarse uno mismo»"},
    {f:"naku",es:"recíproco: la acción se da entre varios sujetos",ex:"much'ay → much'anakuy «besarse»"}]}
];
var SUF_BY_F = {};
SUFFIXES.forEach(function(g){g.items.forEach(function(s){SUF_BY_F[s.f]=s;});});

var VERBS = [
  ["takiy","cantar"],["tusuy","bailar"],["mikhuy","comer"],["puñuy","dormir"],["upyay","beber"],
  ["lluqsiy","salir"],["llamk'ay","trabajar"],["pukllay","jugar"],["puriy","caminar"],["waqay","llorar"],
  ["rimay","hablar"],["ruway","hacer"],["willay","avisar"],["mask'ay","buscar"],["apay","llevar"],
  ["rantiy","comprar"],["kutay","moler"],["wayk'uy","cocinar"],["akllay","escoger"],["allay","cavar"],
  ["armay","bañar"],["asiy","reír"],["atiy","poder"],["awqay","guerrear"],["ayqiy","huir"],
  ["aysay","jalar"],["jampiy","curar"],["jamuy","venir"],["jap'iy","agarrar"],["jark'ay","atajar"],
  ["jatariy","levantarse"],["kawsay","vivir"],["kichay","abrir"],["kuchuy","cortar"],["kuyuy","moverse"],
  ["ñiy","decir"],["riy","ir"],["qhaway","mirar"],["sayay","pararse"],["siray","coser"],
  ["suyay","esperar"],["tarpuy","sembrar"],["mayllay","lavar"],["munay","querer"],["t'aqsay","lavar ropa"],
  ["ch'ipay","embalar"],["kanay","hacer fogata"],["kay","ser, estar"]
];
var VMEAN = {}; VERBS.forEach(function(v){VMEAN[v[0]]=v[1];});

var state = {derivs:[], view:"conj", voice:"act", sel:null, split:true, multi:false};

/* ---------- UTILIDADES ---------- */
function S(t,c,l){return {t:t,c:c,l:l};}
function pl(i){return "persona: "+PERSONS[i].es;}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function normalize(v){return v.trim().toLowerCase().replace(/[’ʼ`´‘]/g,"'");}
function $(id){return document.getElementById(id);}

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
  pot:{name:"Potencial presente",sub:"presente + -man",
    hint:"La acción como posible, dudosa o deseable. La 1.ª persona singular mantiene la forma del infinitivo.",
    cell:function(i){var a=i===0?S("y","p","persona: yo (mantiene la forma del infinitivo)"):S(PRES_END[i],"p",pl(i));
      return {segs:[a,S("man","t","modo potencial")]};}},
  potp:{name:"Potencial pasado",sub:"potencial + karqa",
    hint:"Potencial más la 3.ª persona del pretérito perfecto de kay: karqa.",
    cell:function(i){var c=TENSES.pot.cell(i);
      c.after="karqa";c.afterLabel="karqa: pretérito perfecto de kay; marca el pasado del potencial";return c;}}
};
var IMP=[
  {i:1,seg:S("y","tp","imperativo + 2.ª persona singular"),tr:"(tú) haz"},
  {i:5,seg:S("ychik","tp","imperativo + 2.ª persona plural"),tr:"(ustedes) hagan"},
  {i:2,seg:S("chun","tp","imperativo + 3.ª persona singular"),tr:"que él, ella haga"},
  {i:6,seg:S("chunku","tp","imperativo + 3.ª persona plural"),tr:"que ellos, ellas hagan"}
];
var NOPERS=[
  {n:"Infinitivo",seg:S("y","t","infinitivo: acción general e indeterminada")},
  {n:"Part. activo",seg:S("q","t","participio activo: agente o productor de la acción («el que…»)")},
  {n:"Part. pasivo",seg:S("sqa","t","participio pasivo: quien recibe o sufre la acción («lo …do»)")},
  {n:"Gerundio",seg:S("spa","t","gerundio: acción ya realizada para emprender otra («…ndo»)")}
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
  if(v==="jaku") return {ok:false,msg:"jaku («vamos») es una excepción y no se conjuga."};
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
  return '<article class="tcard"><div class="ct"><h3>'+esc(title)+(hint?'<span class="i" title="'+esc(hint)+'" aria-label="'+esc(hint)+'">i</span>':'')+'</h3><small>'+esc(sub)+'</small></div>'+rows+'</article>';
}
function tenseCard(tk,pas){
  var rows=PERSONS.map(function(p,i){
    var cell=pas?passCell(tk,i):TENSES[tk].cell(i);
    return rowHTML(p.q,p.es,(pas?"pas-":"")+tk+":"+i,cell);
  }).join("");
  var t=TENSES[tk];
  return cardHTML(t.name,pas?"participio en -sqa + kay":t.sub,t.hint,rows);
}
function section(id,title,cards){
  return '<section class="mood" id="mood-'+id+'"><h2>'+title+'</h2><div class="grid">'+cards+'</div></section>';
}

function renderSections(){
  REG={};
  var h="",nav=[];
  if(state.voice==="act"){
    h+=section("ind","Indicativo",["pres","rqa","sqa","fut"].map(function(k){return tenseCard(k,false);}).join(""));nav.push(["ind","Indicativo"]);
    h+=section("pot","Potencial",["pot","potp"].map(function(k){return tenseCard(k,false);}).join(""));nav.push(["pot","Potencial"]);
    var ir=IMP.map(function(x){var c={segs:[x.seg]};
      return '<div class="row"><span class="pn" title="'+esc(PERSONS[x.i].es)+'">'+esc(PERSONS[x.i].q)+'</span><span class="fw">'+cellHTML("imp:"+x.i,c)+'<span class="alt">'+esc(x.tr)+'</span></span></div>';}).join("");
    h+=section("imp","Imperativo",cardHTML("Presente","raíz + terminación","Orden, invitación, consejo, súplica o pedido. Solo existe para la 2.ª y la 3.ª persona.",ir));nav.push(["imp","Imperativo"]);
    var nr=NOPERS.map(function(x,i){return '<div class="row"><span class="pn">'+esc(x.n)+'</span><span class="fw">'+cellHTML("nop:"+i,{segs:[x.seg]})+'</span></div>';}).join("");
    h+=section("nop","Formas no personales",cardHTML("Sobre la raíz","raíz + sufijo","Formas sin persona: infinitivo, participios y gerundio.",nr));nav.push(["nop","No personales"]);
  } else {
    h+=section("ind","Indicativo · voz pasiva",PAS_TENSES.map(function(k){return tenseCard(k,true);}).join(""));nav.push(["ind","Indicativo"]);
  }
  $("sections").innerHTML=h;
  var mn=$("mnav");mn.innerHTML="";
  nav.forEach(function(n){
    var b=document.createElement("button");b.type="button";b.textContent=n[1];
    b.addEventListener("click",function(){var el=$("mood-"+n[0]);if(el) el.scrollIntoView({behavior:"smooth",block:"start"});});
    mn.appendChild(b);
  });
  $("sections").querySelectorAll(".cell").forEach(function(b){
    b.addEventListener("click",function(){state.sel=b.getAttribute("data-key");markSel();renderSheet();});
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
  var cls=state.derivs.length?"verbo compuesto":"verbo primitivo";
  var items=[
    ["Clase",cls],
    ["Raíz",P.root+"-"],
    ["Infinitivo base",P.inf],
    ["Sufijos",state.derivs.length?state.derivs.map(function(d){return "-"+d;}).join(" "):"ninguno"],
    ["Raíz",stem+"-"],
    ["Significado",mean?"«"+mean+"»":"—"],
    ["Auxiliar pasiva","kay"]
  ];
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
      b.innerHTML="<b>-"+esc(s.f)+"</b><small>"+esc(s.es.split(/[;,:]/)[0])+"</small>";
      b.addEventListener("click",function(){addSuffix(s.f);});
      d.appendChild(b);
    });
    box.appendChild(d);
  });
}
function addSuffix(f){
  if(state.derivs.length>=3) return;
  state.derivs.push(f);state.sel=null;update();
}

function renderSufList(){
  var h="";
  SUFFIXES.forEach(function(g){
    h+='<section class="mood"><h2>'+esc(g.cat)+'</h2><div class="sgrid">';
    g.items.forEach(function(s){
      h+='<div class="scard"><b>-'+esc(s.f)+'</b><div>'+esc(s.es)+'</div><div class="ex">'+esc(s.ex)+'</div><button type="button" data-f="'+esc(s.f)+'">Aplicar al verbo</button></div>';
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
  ["takiy","mikhuy","puriy","llamk'ay","willay","tusuy","rimay","puñuy"].forEach(function(v){
    var b=document.createElement("button");b.type="button";
    b.innerHTML=esc(v)+" <small>"+esc(VMEAN[v]||"")+"</small>";
    b.addEventListener("click",function(){$("verb").value=v;state.sel=null;setView("conj");update();});
    q.appendChild(b);
  });
  $("vlist").innerHTML=VERBS.map(function(v){return '<option value="'+esc(v[0])+'">'+esc(v[1])+"</option>";}).join("");
}

/* ---------- Detalle ---------- */
function renderSheet(){
  var sh=$("sheet");
  if(!state.sel||!REG[state.sel]||!P.ok){sh.hidden=true;return;}
  var key=state.sel,cell=REG[key],pas=key.indexOf("pas-")===0;
  var parts=key.replace("pas-","").split(":"),k=parts[0],i=parseInt(parts[1],10);
  var d=state.derivs;
  var sub=(TENSES[k]?TENSES[k].name+" · "+PERSONS[i].q+" ("+PERSONS[i].es+")":k==="imp"?"Imperativo · "+PERSONS[IMP[0].i===i?i:i].q:NOPERS[i].n)+(pas?" · voz pasiva":"");
  var word;
  if(cell.pas) word=mk(P.root,d,[S("sqa","t","")])+" "+mk("ka",[],cell.segs);
  else word=mk(P.root,d,cell.segs)+(cell.after?' <span class="aux">'+esc(cell.after)+"</span>":"");
  var h='<button type="button" class="x" id="xClose" aria-label="Cerrar">×</button><h3>'+word+'</h3><div class="sub">'+esc(sub)+'</div><ul>';
  h+='<li><span class="mm"><span class="m r">'+esc(P.root)+'-</span></span><span class="role">raíz (infinitivo '+esc(P.inf)+' sin la -y)</span></li>';
  d.forEach(function(f){h+='<li><span class="mm"><span class="m d">-'+esc(f)+'</span></span><span class="role">sufijo derivativo: '+esc(SUF_BY_F[f].es)+'</span></li>';});
  if(cell.pas){
    h+='<li><span class="mm"><span class="m t">-sqa</span></span><span class="role">participio pasivo: quien recibe la acción</span></li>';
    h+='<li><span class="mm"><span class="m r">ka-</span></span><span class="role">auxiliar kay («ser»), que se conjuga en lugar del verbo</span></li>';
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
  $("lead").innerHTML='<span><i class="m r">raíz</i></span><span><i class="m d">sufijo derivativo</i></span><span><i class="m t">tiempo / modo</i></span><span><i class="m p">persona</i></span><span><i class="m tp">tiempo + persona fusionados</i></span>';
}
function update(){
  P=parseVerb($("verb").value);
  $("err").textContent=P.ok?"":P.msg;
  renderApplied();
  renderHead();
  $("vAct").setAttribute("aria-pressed",state.voice==="act");
  $("vPas").setAttribute("aria-pressed",state.voice==="pas");
  if(!P.ok){
    $("sections").innerHTML='<div class="empty" style="margin-top:16px">Escribe un verbo quechua en infinitivo para ver su conjugación.</div>';
    $("mnav").innerHTML="";$("sheet").hidden=true;return;
  }
  renderSections();
  renderSheet();
}

$("verb").addEventListener("input",function(){state.sel=null;update();});
$("verb").addEventListener("keydown",function(e){if(e.key==="Enter"){setView("conj");update();}});
$("go").addEventListener("click",function(){setView("conj");update();});
$("navConj").addEventListener("click",function(){setView("conj");});
$("navSuf").addEventListener("click",function(){setView("suf");window.scrollTo({top:0});});
$("vAct").addEventListener("click",function(){state.voice="act";state.sel=null;update();});
$("vPas").addEventListener("click",function(){state.voice="pas";state.sel=null;update();});
$("optSplit").addEventListener("change",function(e){state.split=e.target.checked;applyMode();});
$("optMulti").addEventListener("change",function(e){state.multi=e.target.checked;applyMode();});
$("copyBtn").addEventListener("click",copyAll);

renderQuick();renderSufGroups();renderSufList();applyMode();update();
