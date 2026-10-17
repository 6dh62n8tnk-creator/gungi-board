const PIECES=["帥","大","中","小","謀","侍","忍","砲","筒","砦","弓","馬","槍","兵"];
const COLS="ABCDEFGHI";
const $=id=>document.getElementById(id);
let board=Array.from({length:81},()=>[]);
let selected=null,destination=null,history=[],logs=[];
const idx=(r,c)=>r*9+c, rc=i=>[Math.floor(i/9),i%9], pos=i=>COLS[i%9]+(Math.floor(i/9)+1);
const stateSnapshot=()=>JSON.stringify({board,side:$("side").value,logs});
function remember(){history.push(stateSnapshot());if(history.length>80)history.shift();}
function addLog(s){logs.unshift(s);logs=logs.slice(0,12);renderLog();}
function renderLog(){$("log").innerHTML="";for(const s of logs){const li=document.createElement("li");li.textContent=s;$("log").appendChild(li);}}
function initPieceSelect(){for(const p of PIECES){const o=document.createElement("option");o.value=p;o.textContent=p;$("piece").appendChild(o);}}
function top(i){return board[i][board[i].length-1]||null;}
function dirs(p){
 const d={
 "帥":[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]],
 "大":[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]],
 "中":[[-1,0],[1,0],[0,-1],[0,1]],
 "小":[[-1,0],[1,0],[0,-1],[0,1]],
 "謀":[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]],
 "侍":[[-1,0],[1,0],[0,-1],[0,1]],
 "忍":[[-1,-1],[-1,1],[1,-1],[1,1]],
 "砲":[[-1,0],[1,0],[0,-1],[0,1]],
 "筒":[[-1,-1],[-1,1],[1,-1],[1,1]],
 "砦":[[-1,0],[1,0],[0,-1],[0,1]],
 "弓":[[-1,0],[1,0],[0,-1],[0,1]],
 "馬":[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]],
 "槍":[[-1,0],[1,0],[0,-1],[0,1]],
 "兵":[[-1,0],[1,0],[0,-1],[0,1]]
 };return d[p]||[];
}
function candidates(i){
 const piece=top(i);if(!piece||piece.side!==$("side").value)return [];
 const [r,c]=rc(i),out=[];
 const sliding=["大","中","砲","筒","弓"].includes(piece.name);
 for(const [dr,dc] of dirs(piece.name)){
   for(let step=1;step<=(sliding?8:1);step++){
     const nr=r+dr*step,nc=c+dc*step;if(nr<0||nr>8||nc<0||nc>8)break;
     const j=idx(nr,nc);
     // This prototype only shows empty destination squares; stacks/attacks need full official rule validation.
     if(board[j].length===0)out.push(j);else break;
   }
 }
 return out;
}
function render(){
 const el=$("board");el.innerHTML="";
 const blank=document.createElement("div");blank.className="coord";el.appendChild(blank);
 for(const c of COLS){const d=document.createElement("div");d.className="coord";d.textContent=c;el.appendChild(d);}
 const legal=selected===null?[]:candidates(selected);
 for(let r=0;r<9;r++){
   const label=document.createElement("div");label.className="coord";label.textContent=r+1;el.appendChild(label);
   for(let c=0;c<9;c++){
     const i=idx(r,c),cell=document.createElement("button");cell.className="cell";cell.type="button";
     if((r+c)%2===0)cell.style.background="#e9e4d9";
     if(selected===i)cell.classList.add("selected");
     else if(legal.includes(i))cell.classList.add("legal");
     if(destination===i)cell.classList.add("destination");
     const p=top(i);
     if(p){cell.classList.add(p.side==="黒"?"black":"white");const span=document.createElement("span");span.className="piece";span.textContent=p.name;cell.appendChild(span);if(board[i].length>1){const st=document.createElement("span");st.className="stack";st.textContent=board[i].length+"段";cell.appendChild(st);}}
     else {cell.classList.add("empty");cell.textContent="·";}
     cell.setAttribute("aria-label",`${pos(i)} ${p? p.side+"の"+p.name:"空きマス"}`);
     cell.addEventListener("click",()=>clickCell(i));el.appendChild(cell);
   }
 }
 $("confirmMove").disabled=selected===null||destination===null;
 $("status").textContent=selected===null
 ? ($("mode").value==="place"?`${$("side").value}の${$("piece").value}を配置するマスを選んでください。`:"自分の駒をタップしてください。")
 : `${pos(selected)}の${top(selected).name}を選択中。${destination===null?"緑の候補マスをタップしてください。":"移動先："+pos(destination)+"。確定ボタンで反映します。"}`;
}
function clickCell(i){
 if($("mode").value==="place"){
   if(board[i].length>=3){$("status").textContent="1マスに置けるのは最大3段です。";return;}
   if(board[i].length && ($("stackAction").value==="off" || top(i).side!==$("side").value)){
     $("status").textContent="このマスには配置できません。相手の駒の上への配置は未実装です。";return;
   }
   remember();board[i].push({name:$("piece").value,side:$("side").value});addLog(`${$("side").value}：${pos(i)}に${$("piece").value}を配置（${board[i].length}段目）`);render();return;
 }
 if(selected===null){
   if(top(i)&&top(i).side===$("side").value){selected=i;destination=null;}
   else {$("status").textContent="自分の駒があるマスを選んでください。";}
 }else if(i===selected){selected=null;destination=null;}
 else if(candidates(selected).includes(i)){destination=i;}
 else if(top(i)&&top(i).side===$("side").value){selected=i;destination=null;}
 else {$("status").textContent="そのマスは簡易表示上の移動候補ではありません。";}
 render();
}
$("confirmMove").addEventListener("click",()=>{
 if(selected===null||destination===null)return;
 remember();const src=selected,dst=destination,p=board[src].pop();board[dst].push(p);
 addLog(`${p.side}：${pos(src)}→${pos(dst)} ${p.name}（簡易ルールで反映）`);
 $("side").value=p.side==="黒"?"白":"黒";selected=null;destination=null;render();
});
$("cancel").addEventListener("click",()=>{selected=null;destination=null;render();});
$("mode").addEventListener("change",()=>{selected=null;destination=null;render();});
$("side").addEventListener("change",()=>{selected=null;destination=null;render();});
$("piece").addEventListener("change",render);
$("newGame").addEventListener("click",()=>{if(!confirm("盤面を空にしますか？保存済みデータは削除されません。"))return;remember();board=Array.from({length:81},()=>[]);selected=null;destination=null;logs=[];addLog("新しい盤面を開始");render();});
$("undo").addEventListener("click",()=>{if(!history.length){$("status").textContent="戻せる手がありません。";return;}const s=JSON.parse(history.pop());board=s.board;$("side").value=s.side;logs=s.logs||[];selected=null;destination=null;renderLog();render();});
$("save").addEventListener("click",()=>{localStorage.setItem("gungi-save-v1",JSON.stringify({board,side:$("side").value,logs}));$("status").textContent="このブラウザに対局を保存しました。";});
$("load").addEventListener("click",()=>{const s=localStorage.getItem("gungi-save-v1");if(!s){$("status").textContent="保存データがありません。";return;}try{const x=JSON.parse(s);board=x.board;$("side").value=x.side||"黒";logs=x.logs||[];selected=null;destination=null;renderLog();render();$("status").textContent="保存データを読み込みました。";}catch(e){$("status").textContent="保存データを読み込めませんでした。";}});
$("export").addEventListener("click",()=>{const blob=new Blob([JSON.stringify({version:1,board,side:$("side").value,logs},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="gungi-save.json";a.click();URL.revokeObjectURL(a.href);});
$("importFile").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;try{const x=JSON.parse(await f.text());if(!Array.isArray(x.board)||x.board.length!==81)throw new Error();board=x.board;$("side").value=x.side||"黒";logs=x.logs||[];selected=null;destination=null;renderLog();render();$("status").textContent="ファイルから読み込みました。";}catch(err){$("status").textContent="このファイルは軍儀盤の保存データではありません。";}e.target.value="";});
if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
initPieceSelect();render();
