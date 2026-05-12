import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
dotenv.config();

const app=express();
app.use(express.json());
const PORT=process.env.PORT||3000;
const anthropic=new Anthropic({apiKey:process.env.ANTHROPIC_API_KEY});

app.post('/find',async(req,res)=>{
const {platform,niche,minscore,location}=req.body;
try{
const response=await anthropic.messages.create({model:'claude-sonnet-4-5',max_tokens:2000,messages:[{role:'user',content:`You are a crypto influencer research agent for $DC (DubaiCoin), a Solana-based Web3 ecosystem by Ben X Capital. Find 6 real mid-to-macro crypto influencers (50K-2M followers) on ${platform==='both'?'Twitter/X and Telegram':platform} focused on ${niche} ${location!=='global'?'based in or focused on '+location:''} who would be good long-term partners for $DC. Return ONLY a JSON array: [{"name":"Real name","handle":"@handle","platform":"Twitter or Telegram or Both","followers":"e.g. 250K","location":"Country or Region","niche":"e.g. Solana DeFi","engagement":0-100,"authenticity":0-100,"alignment":0-100,"partnership":0-100,"recommendation":"Strong match or Watch or Avoid","reason":"One sentence why","telegram":"@telegramhandle or null","email":"email if known or null","recenttopic":"Their most recent content topic"}] Only real known crypto influencers. JSON only, no other text.`}]});
const text=response.content[0].text.replace(/```json|```/g,'').trim();
const influencers=JSON.parse(text);
const filtered=influencers.filter(i=>i.partnership>=parseInt(minscore));
res.json({success:true,data:filtered});
}catch(err){res.json({success:false,error:err.message});}
});

app.post('/outreach',async(req,res)=>{
const {name,handle,platform,niche,location,recenttopic,followers}=req.body;
try{
const response=await anthropic.messages.create({model:'claude-sonnet-4-5',max_tokens:1500,messages:[{role:'user',content:`You are a partnership outreach specialist for $DC (DubaiCoin) by Ben X Capital. Founder: Nassreddine Ben Lassoued, CEO based in Dubai. $DC is on Solana with staking up to 35% APY, NFTs, DAO, presale soon. Token 2049 Singapore October 2026. Generate outreach kit for: Name: ${name}, Handle: ${handle}, Platform: ${platform}, Niche: ${niche}, Location: ${location}, Followers: ${followers}, Recent content: ${recenttopic}. Return ONLY a JSON object with these keys: email_subject, email_body, telegram_message, twitter_strategy, pitch_summary, best_channel. JSON only. JSON only.`}]});
const text=response.content[0].text.replace(/```json|```/g,'').trim();
const kit=JSON.parse(text);
res.json({success:true,data:kit});
}catch(err){res.json({success:false,error:err.message});}
});

app.get('/',(req,res)=>{
res.send(`<!DOCTYPE html>
<html>
<head>
<title>Scout — Ben X Capital</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,sans-serif;background:#0a0a0a;color:#fff;min-height:100vh}
.wrap{max-width:960px;margin:0 auto;padding:2rem 1rem}
h1{font-size:28px;font-weight:600;margin-bottom:4px}
.sub{color:#888;font-size:14px;margin-bottom:2rem}
.filters{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;gap:10px;margin-bottom:1rem}
label{font-size:12px;color:#888;display:block;margin-bottom:6px}
select{width:100%;padding:10px;background:#1a1a1a;border:1px solid #333;border-radius:8px;color:#fff;font-size:13px}
.btn{width:100%;padding:14px;background:#f0b429;border:none;border-radius:8px;color:#000;font-size:15px;font-weight:600;cursor:pointer;margin-bottom:2rem}
.btn:hover{background:#e0a419}
.loading{text-align:center;padding:2rem;color:#888;display:none}
.spinner{display:inline-block;width:20px;height:20px;border:2px solid #333;border-top-color:#f0b429;border-radius:50%;animation:spin 0.8s linear infinite;margin-right:8px;vertical-align:middle}
@keyframes spin{to{transform:rotate(360deg)}}
.cards{display:flex;flex-direction:column;gap:16px}
.card{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:1.25rem}
.card-top{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.avatar{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;flex-shrink:0}
.inf-name{font-weight:600;font-size:16px}
.inf-handle{font-size:13px;color:#888}
.badges{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.badge{font-size:11px;padding:3px 10px;border-radius:20px;font-weight:500}
.b-platform{background:#1e3a5f;color:#60a5fa}
.b-size{background:#1a3a1a;color:#4ade80}
.b-niche{background:#3a2a00;color:#fbbf24}
.b-location{background:#2a1a3a;color:#c084fc}
.score-row{display:flex;align-items:center;gap:10px;margin-bottom:6px}
.score-label{font-size:12px;color:#888;width:120px;flex-shrink:0}
.bar{flex:1;height:4px;background:#2a2a2a;border-radius:2px;overflow:hidden}
.fill{height:100%;border-radius:2px}
.score-val{font-size:12px;font-weight:600;width:28px;text-align:right}
.card-footer{border-top:1px solid #2a2a2a;padding-top:12px;margin-top:12px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.rec-strong{color:#4ade80;font-weight:600;font-size:13px}
.rec-watch{color:#fbbf24;font-weight:600;font-size:13px}
.rec-avoid{color:#f87171;font-weight:600;font-size:13px}
.reason{font-size:12px;color:#888;margin-top:4px}
.outreach-btn{padding:8px 16px;background:#f0b429;border:none;border-radius:8px;color:#000;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0}
.outreach-btn:hover{background:#e0a419}
.kit{background:#111;border:1px solid #2a2a2a;border-radius:10px;padding:1rem;margin-top:12px;display:none}
.kit-section{margin-bottom:14px}
.kit-label{font-size:11px;color:#f0b429;font-weight:600;text-transform:uppercase;margin-bottom:6px;letter-spacing:0.5px;display:flex;justify-content:space-between;align-items:center}
.kit-content{font-size:13px;color:#ccc;line-height:1.6;background:#1a1a1a;padding:10px;border-radius:6px;white-space:pre-wrap}
.kit-loading{text-align:center;padding:1rem;color:#888;font-size:13px}
.best-channel{background:#1e3a1e;border:1px solid #2a4a2a;border-radius:8px;padding:10px;font-size:13px;color:#4ade80;margin-bottom:12px}
.copy-btn{font-size:11px;padding:3px 10px;background:#2a2a2a;border:1px solid #333;border-radius:4px;color:#aaa;cursor:pointer}
.copy-btn:hover{color:#fff}
.empty{text-align:center;padding:3rem;color:#888}
@media(max-width:700px){.filters{grid-template-columns:1fr 1fr}}
</style>
</head>
<body>
<div class="wrap">
<h1>Scout</h1>
<p class="sub">Crypto Influencer Discovery + Outreach Agent — Ben X Capital</p>
<div class="filters">
<div><label>Platform</label>
<select id="platform">
<option value="both">Both (X + Telegram)</option>
<option value="twitter">X / Twitter</option>
<option value="telegram">Telegram</option>
</select></div>
<div><label>Niche</label>
<select id="niche">
<option value="solana">Solana ecosystem</option>
<option value="defi">DeFi and staking</option>
<option value="web3">Web3 and NFTs</option>
<option value="presale">Token presales</option>
<option value="all">All crypto</option>
</select></div>
<div><label>Location</label>
<select id="location">
<option value="global">Global</option>
<option value="UAE and Middle East">UAE and Middle East</option>
<option value="USA">USA</option>
<option value="Europe">Europe</option>
<option value="Asia">Asia</option>
<option value="Africa">Africa</option>
<option value="Latin America">Latin America</option>
</select></div>
<div><label>Min score</label>
<select id="minscore">
<option value="60">60+</option>
<option value="70" selected>70+</option>
<option value="80">80+</option>
<option value="90">90+</option>
</select></div>
<div style="display:flex;align-items:flex-end">
<button class="btn" style="margin:0" onclick="doSearch()">Find</button>
</div>
</div>
<div class="loading" id="loading"><span class="spinner"></span>Searching... 20-30 seconds</div>
<div class="cards" id="results"><div class="empty">Click Find to discover crypto influencers for $DC partnerships</div></div>
</div>
<script>
const colors=["#f0b429","#60a5fa","#4ade80","#f87171","#a78bfa","#fb923c"];
let currentData=[];
async function doSearch(){
const platform=document.getElementById("platform").value;
const niche=document.getElementById("niche").value;
const minscore=document.getElementById("minscore").value;
const location=document.getElementById("location").value;
document.getElementById("loading").style.display="block";
document.getElementById("results").innerHTML="";
try{
const res=await fetch("/find",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({platform,niche,minscore,location})});
const data=await res.json();
document.getElementById("loading").style.display="none";
if(!data.success){document.getElementById("results").innerHTML="<div class=empty>Error: "+data.error+"</div>";return;}
currentData=data.data;
renderCards();
}catch(e){document.getElementById("loading").style.display="none";document.getElementById("results").innerHTML="<div class=empty>Error: "+e.message+"</div>";}
}
function renderCards(){
const html=currentData.map((inf,i)=>{
const initials=inf.name.split(" ").map(w=>w[0]).join("").substring(0,2).toUpperCase();
const recClass=inf.recommendation==="Strong match"?"rec-strong":inf.recommendation==="Watch"?"rec-watch":"rec-avoid";
return "<div class=card id=card-"+i+"><div class=card-top><div class=avatar style='background:"+colors[i%6]+";color:#000'>"+initials+"</div><div><div class=inf-name>"+inf.name+"</div><div class=inf-handle>"+inf.handle+" - "+inf.followers+" followers</div></div></div><div class=badges><span class='badge b-platform'>"+inf.platform+"</span><span class='badge b-size'>"+inf.followers+"</span><span class='badge b-niche'>"+inf.niche+"</span><span class='badge b-location'>"+inf.location+"</span></div><div class=score-row><span class=score-label>Engagement</span><div class=bar><div class=fill style='width:"+inf.engagement+"%;background:#60a5fa'></div></div><span class=score-val>"+inf.engagement+"</span></div><div class=score-row><span class=score-label>Authenticity</span><div class=bar><div class=fill style='width:"+inf.authenticity+"%;background:#4ade80'></div></div><span class=score-val>"+inf.authenticity+"</span></div><div class=score-row><span class=score-label>$DC alignment</span><div class=bar><div class=fill style='width:"+inf.alignment+"%;background:#f0b429'></div></div><span class=score-val>"+inf.alignment+"</span></div><div class=score-row><span class=score-label>Partnership fit</span><div class=bar><div class=fill style='width:"+inf.partnership+"%;background:#a78bfa'></div></div><span class=score-val>"+inf.partnership+"</span></div><div class=card-footer><div><span class="+recClass+">"+inf.recommendation+"</span><div class=reason>"+inf.reason+"</div></div><button class=outreach-btn onclick='getOutreach("+i+")'>Get Outreach Kit</button></div><div class=kit id=kit-"+i+"></div></div>";
}).join("");
document.getElementById("results").innerHTML=html||"<div class=empty>No influencers found. Try lowering the minimum score.</div>";
}
async function getOutreach(idx){
const inf=currentData[idx];
const kit=document.getElementById("kit-"+idx);
kit.style.display="block";
kit.innerHTML="<div class=kit-loading><span class=spinner></span>Generating outreach kit...</div>";
try{
const res=await fetch("/outreach",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(inf)});
const data=await res.json();
if(!data.success){kit.innerHTML="<div class=kit-loading>Error: "+data.error+"</div>";return;}
const k=data.data;
window["kit"+idx]=k;
kit.innerHTML="<div class=best-channel>Best channel: "+k.best_channel+"</div>"+
"<div class=kit-section><div class=kit-label><span>Email subject</span><button class=copy-btn onclick='copyKit("+idx+",'email_subject')'>Copy</button></div><div class=kit-content id='ks-"+idx+"-email_subject'>"+k.email_subject+"</div></div>"+
"<div class=kit-section><div class=kit-label><span>Cold email</span><button class=copy-btn onclick='copyKit("+idx+",'email_body')'>Copy</button></div><div class=kit-content id='ks-"+idx+"-email_body'>"+k.email_body+"</div></div>"+
"<div class=kit-section><div class=kit-label><span>Telegram message</span><button class=copy-btn onclick='copyKit("+idx+",'telegram_message')'>Copy</button></div><div class=kit-content id='ks-"+idx+"-telegram_message'>"+k.telegram_message+"</div></div>"+
"<div class=kit-section><div class=kit-label><span>Twitter strategy</span></div><div class=kit-content>"+k.twitter_strategy+"</div></div>"+
"<div class=kit-section><div class=kit-label><span>$DC pitch for their audience</span></div><div class=kit-content>"+k.pitch_summary+"</div></div>";
}catch(e){kit.innerHTML="<div class=kit-loading>Error: "+e.message+"</div>";}
}
function copyKit(idx,field){
const el=document.getElementById("ks-"+idx+"-"+field);
navigator.clipboard.writeText(el.innerText);
event.target.textContent="Copied!";
setTimeout(()=>event.target.textContent="Copy",2000);
}
</script>
</body>
</html>`);
});

app.listen(PORT,()=>console.log("Scout running on port",PORT));
