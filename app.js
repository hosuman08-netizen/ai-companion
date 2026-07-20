(function(){
  var credits=+(localStorage.getItem('ai-companion_cr')||10);
  var root=document.getElementById('app');
  var lines=['오늘 하루 어땠어?','그 이야기 더 듣고 싶어.','잠깐 쉬어도 돼.','네가 주인공이야.','내일도 여기 있을게.','한 치 더 가보자.','지금 이 순간이 중요해.','숨 한 번 크게.','그 선택, 나쁘지 않아.','내가 기억할게.','천천히 말해도 돼.','정진 중이네.']; var msgs=+(localStorage.getItem('ac_msgs')||0);
  var log=[];
  var SHARE_BASE='https://hosuman08-netizen.github.io/ai-companion/';
  function save(){localStorage.setItem('ai-companion_cr',credits);}
  function dayKey(off){
    var d=new Date(); d.setDate(d.getDate()+(off||0));
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  function kId(){
    try{
      var id=localStorage.getItem('ac_k_id');
      if(!id){id='a'+Math.random().toString(36).slice(2,8);localStorage.setItem('ac_k_id',id);}
      return id;
    }catch(e){return 'share';}
  }
  function shareUrl(){return SHARE_BASE+'?utm_source=share&utm_medium=app&ref='+encodeURIComponent(kId());}
  function bumpStreak(){
    try{
      var st=JSON.parse(localStorage.getItem('ac_streak')||'{}');
      if(!st||typeof st!=='object')st={last:null,count:0};
      var t=dayKey(0);
      if(st.last===t) return st;
      var y=dayKey(-1),y2=dayKey(-2),froze=false;
      if(st.last && st.last!==y && st.last===y2 && (st.count||0)>=3){
        var ready=!st.shieldLast||((new Date(t)-new Date(st.shieldLast))/86400000)>=7;
        if(ready){st.shieldLast=t;st.last=y;froze=true;try{legionTrack('streak_freeze',{count:st.count})}catch(e){}}
      }
      st.count=(st.last===y)?(st.count||0)+1:1;
      st.last=t;
      localStorage.setItem('ac_streak',JSON.stringify(st));
      try{legionTrack('streak',{count:st.count,froze:froze})}catch(e){}
      return st;
    }catch(e){return {count:0};}
  }
  function fomoLeft(){
    var end=new Date(); end.setHours(24,0,0,0);
    var ms=Math.max(0,end-Date.now());
    return Math.floor(ms/3600000)+'h '+Math.floor((ms%3600000)/60000)+'m';
  }
  function render(){
    var st=JSON.parse(localStorage.getItem('ac_streak')||'{}');
    var sc=st.count||0;
    var ready=!st.shieldLast||((new Date(dayKey(0))-new Date(st.shieldLast))/86400000)>=7;
    root.innerHTML='<div class="card" style="border-color:#f472b6"><b>18+</b> Fictional chat · 실관계 아님 · field#1 18+ pack</div>'
      +'<div class="card"><span class="chip">🔥 '+sc+'일'+(sc>=3&&ready?' · 🛡️':'')+'</span> <span class="chip">일일창 '+fomoLeft()+'</span>'
      +'<div style="margin-top:8px">크레딧 <b style="color:var(--gold)">'+credits+'</b> · 말 '+msgs+'회</div>'
      +'<div id="chat" style="min-height:80px;margin:10px 0;font-size:14px">'+(log.slice(-5).join('<br>')||'<span style="opacity:.7">아직 대화 없음 — 한 마디로 시작</span>')+'</div>'
      +'<button id="talk">한 마디 (-1)</button><button class="sec" id="free">일일 +3</button>'
      +'<div id="sharePeak" style="display:none;margin-top:12px;padding:10px;border:1px solid #f472b644;border-radius:12px">'
      +'<p style="margin:0 0 6px;font-size:13px">✨ 지금 순간 공유</p>'
      +'<button class="sec" id="shareBtn">📤 공유</button></div>'
      +'<div id="moneyPipe" style="margin-top:12px;padding:10px;border:1px solid #c5a46e44;border-radius:12px;background:#16121c;text-align:center;font-size:12px">'
      +'<div style="color:#e0b552;font-weight:700;margin-bottom:4px">💎 크레딧 · 후원 (엔터 18+)</div>'
      +'<p style="opacity:.75;margin:0 0 6px">가상 크레딧 · 실관계 아님</p>'
      +'<a style="color:#ece8f1;margin:0 6px" href="mailto:hoyashi95@gmail.com?subject=%5BCompanion%5D%20credits">☕ 후원 문의</a>'
      +'<a style="color:#ece8f1;margin:0 6px" href="https://hosuman08-netizen.github.io/soft-paywall/?utm_source=companion&utm_medium=pipe">🔒 Soft Paywall</a>'
      +'<a style="color:#e0b552;margin:0 6px" href="https://hosuman08-netizen.github.io/legion-hub/?utm_source=companion&utm_medium=pipe">🎮 Arcade</a>'
      +'</div></div>';
    document.getElementById('talk').onclick=function(){
      if(credits<=0){
        document.getElementById('chat').innerHTML+='<br><span style="color:#f472b6">크레딧 없음 · 일일 +3 또는 후원 문의</span>';
        try{legionTrack('money_pipe_shown',{app:'companion',empty:1})}catch(e){}
        return;
      }
      credits--; save();
      var line=lines[Math.floor(Math.random()*lines.length)];
      log.push('나: …'); log.push('AI: '+line); msgs++; localStorage.setItem('ac_msgs',msgs);
      bumpStreak();
      render();
      var peak=document.getElementById('sharePeak'); if(peak) peak.style.display='block';
      try{legionTrack('activate',{})}catch(e){}
      try{legionTrack('share_peak_shown',{})}catch(e){}
      try{legionTrack('money_pipe_shown',{app:'companion'})}catch(e){}
    };
    document.getElementById('free').onclick=function(){
      var k='ac_'+new Date().toDateString(); if(localStorage.getItem(k))return; localStorage.setItem(k,'1'); credits+=3; save(); render();
    };
    var sb=document.getElementById('shareBtn');
    if(sb) sb.onclick=function(){
      var text='AI Companion (fictional 18+) · '+shareUrl();
      if(navigator.share) navigator.share({text:text,url:shareUrl()}).catch(function(){});
      else if(navigator.clipboard) navigator.clipboard.writeText(text);
      try{legionTrack('share_peak',{})}catch(e){}
    };
  }
  try{
    var q=new URLSearchParams(location.search||'');
    var ref=q.get('ref');
    if(ref && ref!=='share' && ref!==kId() && !localStorage.getItem('ac_k_from')){
      localStorage.setItem('ac_k_from',ref);
      try{legionTrack('k_link',{from:ref})}catch(e){}
    }
  }catch(e){}
  try{legionTrack('session_start',{})}catch(e){}
  render();
})();
