
(async function(){
 var main=document.querySelector('main'),nav=document.querySelector('nav');
 function fail(m){main.innerHTML='<p class="norec">'+m+'</p>'}
 var p=new URLSearchParams(location.hash.slice(1)),k=p.get('k');
 if(!k||!window.crypto||!crypto.subtle){fail('Abra pelo link recebido no grupo (o link completo contém a chave de acesso).');return}
 try{
  var raw=Uint8Array.from(atob(k.replace(/-/g,'+').replace(/_/g,'/')),function(c){return c.charCodeAt(0)});
  var key=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['decrypt']);
  var dec=async function(buf){var b=new Uint8Array(buf);return crypto.subtle.decrypt({name:'AES-GCM',iv:b.slice(0,12)},key,b.slice(12))};
  var data=JSON.parse(new TextDecoder().decode(await dec(await (await fetch('data.enc',{cache:'no-cache'})).arrayBuffer())));
 }catch(e){fail('Não foi possível abrir: link incompleto ou expirado.');return}
 document.title=data.title;document.querySelector('h1').textContent=data.title;document.querySelector('.sub').textContent=data.subtitle;
 function esc(t){var d=document.createElement('div');d.textContent=t;return d.innerHTML}
 data.songs.forEach(function(s,i){
  var id='s'+i;nav.insertAdjacentHTML('beforeend','<a href="#'+id+'" data-go="'+id+'">'+esc(s.heading)+'</a>');
  var sheet=s.lines.map(function(l){return l[1]?'<span class="ch">'+esc(l[0])+'</span>':(l[2]?'<b>'+esc(l[0])+'</b>':esc(l[0]))}).join('\n');
  var player=s.audio?'<audio controls preload="none"></audio><div class="ctl"><button data-rate="0.75">0,75×</button><button data-rate="1" class="on">1×</button><button data-loop>Repetir</button></div>':'<p class="norec">Sem gravação para esta música.</p>';
  main.insertAdjacentHTML('beforeend','<section id="'+id+'"><div class="moment">'+esc(s.heading)+'</div><h2>'+esc(s.title)+'</h2><div class="tom">'+s.tom_html+'</div>'+player+'<pre>'+sheet+'</pre><div class="src">Fonte: <a href="'+esc(s.url)+'">'+esc(s.url)+'</a></div></section>');
  var sec=document.getElementById(id),a=sec.querySelector('audio');
  if(a){var loaded=false;async function load(){if(loaded)return;loaded=true;
    var plain=await dec(await (await fetch(s.audio)).arrayBuffer());a.src=URL.createObjectURL(new Blob([plain],{type:'audio/mp4'}))}
   a.addEventListener('play',function(){if(!loaded){a.pause();load().then(function(){a.play()})}});
   load();
   sec.querySelectorAll('[data-rate]').forEach(function(b){b.onclick=function(){a.playbackRate=+b.dataset.rate;sec.querySelectorAll('[data-rate]').forEach(function(x){x.classList.toggle('on',x===b)})}});
   var l=sec.querySelector('[data-loop]');l.onclick=function(){a.loop=!a.loop;l.classList.toggle('on',a.loop)}}
 });
 nav.addEventListener('click',function(e){var t=e.target.closest('[data-go]');if(!t)return;e.preventDefault();document.getElementById(t.dataset.go).scrollIntoView({behavior:'smooth'})});
 var s=p.get('s');if(s!==null){var el=document.getElementById('s'+s);if(el)el.scrollIntoView()}
})();
