(function(){
  var credits=+(localStorage.getItem('ai-companion_cr')||10);
  var root=document.getElementById('app');
  var lines=['오늘 하루 어땠어?','그 이야기 더 듣고 싶어.','잠깐 쉬어도 돼.','네가 주인공이야.','내일도 여기 있을게.'];
  var log=[];
  function save(){localStorage.setItem('ai-companion_cr',credits);}
  function render(){
    root.innerHTML='<div class="card" style="border-color:#f472b6"><b>18+</b> Fictional chat · 실관계 아님 · field#1 18+ pack</div>'
      +'<div class="card">크레딧 <b style="color:var(--gold)">'+credits+'</b><div id="chat" style="min-height:80px;margin:10px 0;font-size:14px">'+(log.slice(-5).join('<br>')||'…')+'</div>'
      +'<button id="talk">한 마디 (-1)</button><button class="sec" id="free">일일 +3</button></div>';
    document.getElementById('talk').onclick=function(){
      if(credits<=0)return; credits--; save();
      log.push('나: …'); log.push('AI: '+lines[Math.floor(Math.random()*lines.length)]);
      render(); try{legionTrack('activate',{})}catch(e){}
    };
    document.getElementById('free').onclick=function(){
      var k='ac_'+new Date().toDateString(); if(localStorage.getItem(k))return; localStorage.setItem(k,'1'); credits+=3; save(); render();
    };
  }
  try{legionTrack('session_start',{})}catch(e){}
  render();
})();
