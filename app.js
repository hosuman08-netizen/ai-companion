(function(){
  var credits=+(localStorage.getItem('ai-companion_cr')||10);
  var root=document.getElementById('app');
  var lines=['오늘 하루 어땠어?','그 이야기 더 듣고 싶어.','잠깐 쉬어도 돼.','네가 주인공이야.','내일도 여기 있을게.','한 치 더 가보자.','지금 이 순간이 중요해.','숨 한 번 크게.','그 선택, 나쁘지 않아.','내가 기억할게.','천천히 말해도 돼.','정진 중이네.','숨 고르자.','그 마음 알 것 같아.']; var msgs=+(localStorage.getItem('ac_msgs')||0); var sessions=+(localStorage.getItem('ac_sessions')||0); try{if(!sessionStorage.getItem('ac_once')){sessionStorage.setItem('ac_once','1');sessions++;localStorage.setItem('ac_sessions',sessions);}}catch(e){}
  var log=(function(){try{return JSON.parse(localStorage.getItem('ac_log')||'[]');}catch(e){return[];}})();
  var mood=localStorage.getItem('ac_mood')||'';
  function saveLog(){try{localStorage.setItem('ac_log',JSON.stringify(log.slice(-40)));}catch(e){}}
  var mem=(function(){try{return JSON.parse(localStorage.getItem('ac_mem')||'[]');}catch(e){return[];}})();
  function saveMem(){try{localStorage.setItem('ac_mem',JSON.stringify(mem.slice(0,8)));}catch(e){}}
  function todayTalks(){try{return +(localStorage.getItem('ac_talk_'+dayKey(0))||0);}catch(e){return 0;}}
  function bumpTalk(){try{localStorage.setItem('ac_talk_'+dayKey(0),String(todayTalks()+1));}catch(e){}}

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
      try{
        if(st.count===3 && !localStorage.getItem('ac_milestone_3')){
          localStorage.setItem('ac_milestone_3','1'); credits+=2; save();
          try{legionTrack('milestone',{d:3})}catch(e){}
        }
        if(st.count===7 && !localStorage.getItem('ac_milestone_7')){
          localStorage.setItem('ac_milestone_7','1'); credits+=5; save();
          try{legionTrack('milestone',{d:7})}catch(e){}
        }
      }catch(e){}
      return st;
    }catch(e){return {count:0};}
  }
  function fomoLeft(){
    var end=new Date(); end.setHours(24,0,0,0);
    var ms=Math.max(0,end-Date.now());
    return Math.floor(ms/3600000)+'h '+Math.floor((ms%3600000)/60000)+'m';
  }
    function pickReply(userTxt){
    var base=lines[Math.floor(Math.random()*lines.length)];
    if(userTxt){
      var tt=userTxt.slice(0,40);
      var echoes=["'"+tt+"' — 그 말 마음에 남네.",'방금 한 말, 내가 붙잡아둘게.',"'"+tt+"' 쪽을 더 파보자."];
      if(Math.random()<0.55) base=echoes[Math.floor(Math.random()*echoes.length)];
      if(tt.length>=2 && mem.indexOf(tt)<0 && Math.random()<0.4){ mem.unshift(tt); saveMem(); }
    } else if(mem.length && Math.random()<0.35){
      base='기억 한 조각: "'+mem[0]+'" — 이어서 말해볼까?';
    }
    if(mood) base='['+mood+'] '+base;
    return base;
  }
  function greetLine(){
    try{
      var last=localStorage.getItem('ac_last_visit');
      localStorage.setItem('ac_last_visit',dayKey(0));
      if(last && last!==dayKey(0) && mood) return '다시 왔네. 지난번 무드('+mood+') 이어서 갈까?';
      if(scBoot()>=3) return '연속 '+scBoot()+'일 · 오늘도 한 치.';
    }catch(e){}
    return '';
  }
  function scBoot(){try{return (JSON.parse(localStorage.getItem('ac_streak')||'{}').count)||0;}catch(e){return 0;}}
  function render(){
    var st=JSON.parse(localStorage.getItem('ac_streak')||'{}');
    var sc=st.count||0;
    var ready=!st.shieldLast||((new Date(dayKey(0))-new Date(st.shieldLast))/86400000)>=7;
    var freeUsed=!!localStorage.getItem('ac_'+new Date().toDateString());
    var moods=[{id:'calm',l:'평온'},{id:'spark',l:'설렘'},{id:'focus',l:'집중'},{id:'soft',l:'다정'}];
    var greet=greetLine();
    root.innerHTML='<div class="card" style="border-color:#f472b6"><b>18+</b> Fictional chat · 실관계 아님 · field#1 18+ pack</div>'
      +'<div class="card"><span class="chip">🔥 '+sc+'일'+(sc>=3&&ready?' · 🛡️':'')+'</span> <span class="chip">일일창 '+fomoLeft()+'</span>'
      +'<div style="margin-top:8px">크레딧 <b style="color:var(--gold)">'+credits+'</b> · 말 '+msgs+' · 세션 '+sessions+' · 오늘 대화 '+todayTalks()+'/3'+(mood?' · 무드 <b>'+mood+'</b>':'')+'</div>'
      +'<div style="height:6px;background:#1c1826;border-radius:4px;margin:8px 0 0;overflow:hidden" title="오늘 대화 목표 3"><i style="display:block;height:100%;width:'+Math.min(100,Math.round(todayTalks()/3*100))+'%;background:linear-gradient(90deg,#f472b6,#e0b552)"></i></div>'
      +(mem.length?'<div class="sub" style="margin-top:6px">기억: '+mem.slice(0,3).map(function(x){return String(x).replace(/</g,'&lt;');}).join(' · ')+'</div>':'')
      +(greet?'<p style="font-size:13px;opacity:.85;margin:8px 0 0">'+greet+'</p>':'')
      +'<div class="row" style="margin:8px 0;gap:6px">'+moods.map(function(m){return '<button class="sec" data-mood="'+m.id+'" style="padding:6px 10px;font-size:12px'+(mood===m.l?';border-color:var(--gold)':'')+'">'+m.l+'</button>';}).join('')+'</div>'
      +'<div id="chat" style="min-height:80px;margin:10px 0;font-size:14px">'+(log.slice(-6).join('<br>')||'<span style="opacity:.7">아직 대화 없음 — 한 마디로 시작</span>')+'</div>'
      +(function(){
        try{
          var keys=[];
          log.forEach(function(line){
            if(line.indexOf('나: ')===0){
              var w=line.slice(3).replace(/[^\w가-힣\s]/g,' ').trim().split(/\s+/).filter(function(x){return x.length>=2;});
              w.forEach(function(t){if(keys.indexOf(t)<0)keys.push(t);});
            }
          });
          keys=keys.slice(0,6);
          if(!keys.length) return '';
          return '<div class="sub" style="margin:4px 0 8px">기억 키워드 · '+keys.map(function(k){return '<span class="chip" data-kw="'+k+'" style="cursor:pointer">'+k+'</span>';}).join(' ')+'</div>';
        }catch(e){return '';}
      })()
      +'<input id="userIn" placeholder="하고 싶은 말 (선택)" style="width:100%;margin:6px 0;padding:10px;border-radius:10px;border:1px solid #2a2438;background:#0e0c14;color:#ece8f1"/>'
      +'<div class="row" style="gap:6px;margin-bottom:6px"><button id="talk" style="flex:1">한 마디 (-1)</button><button class="sec" id="undoChat"'+(log.length<2?' disabled style="opacity:.45"':'')+'>↩ 직전</button><button class="sec" id="free"'+(freeUsed?' disabled style="opacity:.5"':'')+'>'+(freeUsed?'오늘 받음 ✓':'일일 +3')+'</button></div>'
      +'<div class="row" style="gap:6px;margin-bottom:8px"><button class="sec" id="exportLog" style="flex:1;font-size:12px">⬇ 대화 백업</button><button class="sec" id="pinLast" style="flex:1;font-size:12px"'+(log.length?'':' disabled style="opacity:.45"')+'>📌 마지막 기억</button><button class="sec" id="clrMem" style="flex:1;font-size:12px"'+(mem.length?'':' disabled style="opacity:.45"')+'>기억 비우기</button></div>'
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
      var ui=document.getElementById('userIn');
      var ut=(ui&&ui.value||'').trim().slice(0,80);
      var line=pickReply(ut);
      log.push('나: '+(ut||'…')); log.push('AI: '+line); saveLog(); msgs++; localStorage.setItem('ac_msgs',msgs);
      bumpTalk(); bumpStreak();
      render();
      var peak=document.getElementById('sharePeak'); if(peak) peak.style.display='block';
      try{legionTrack('activate',{typed:!!ut})}catch(e){}
      try{legionTrack('share_peak_shown',{})}catch(e){}
      try{legionTrack('money_pipe_shown',{app:'companion'})}catch(e){}
    };
    document.getElementById('free').onclick=function(){
      var k='ac_'+new Date().toDateString(); if(localStorage.getItem(k))return; localStorage.setItem(k,'1'); credits+=3; save(); render();
      try{legionTrack('daily_free',{})}catch(e){}
    };
    var uc=document.getElementById('undoChat');
    if(uc) uc.onclick=function(){
      if(log.length<2)return;
      log.pop(); log.pop(); saveLog();
      msgs=Math.max(0,msgs-1); localStorage.setItem('ac_msgs',msgs);
      credits=Math.min(credits+1,99); save();
      render(); try{legionTrack('undo',{})}catch(e){}
    };
    var elg=document.getElementById('exportLog');
    if(elg) elg.onclick=function(){
      try{
        var payload={app:'ai-companion',exportedAt:new Date().toISOString(),mood:mood,msgs:msgs,log:log.slice(-40),mem:mem.slice(0,8)};
        var blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
        var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
        a.download='companion-log-'+dayKey(0)+'.json'; a.click();
        setTimeout(function(){URL.revokeObjectURL(a.href);},1500);
        try{legionTrack('export',{n:log.length})}catch(e){}
      }catch(e){}
    };
    var cm=document.getElementById('clrMem');
    if(cm) cm.onclick=function(){ mem=[]; saveMem(); render(); try{legionTrack('mem_clear',{})}catch(e){} };
    var pl=document.getElementById('pinLast');
    if(pl) pl.onclick=function(){
      try{
        var last='';
        for(var i=log.length-1;i>=0;i--){
          if(log[i].indexOf('나: ')===0){ last=log[i].slice(3).trim(); break; }
          if(log[i].indexOf('AI: ')===0 && !last) last=log[i].slice(4).replace(/^\[[^\]]+\]\s*/,'').trim();
        }
        if(!last) return;
        last=last.slice(0,40);
        if(mem.indexOf(last)<0) mem.unshift(last);
        saveMem(); render(); try{legionTrack('mem_pin',{})}catch(e){}
      }catch(e){}
    };
    Array.prototype.forEach.call(document.querySelectorAll('[data-kw]'),function(b){
      b.onclick=function(){
        var ui=document.getElementById('userIn');
        if(ui){ui.value=(ui.value?ui.value+' ':'')+b.getAttribute('data-kw'); ui.focus();}
      };
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-mood]'),function(b){
      b.onclick=function(){mood=b.textContent; localStorage.setItem('ac_mood',mood); render(); try{legionTrack('mood',{m:mood})}catch(e){};};
    });
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
