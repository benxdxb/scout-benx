import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
dotenv.config();

const app=express();
const PORT=process.env.PORT||3000;
const anthropic=new Anthropic({apiKey:process.env.ANTHROPIC_API_KEY});

app.get('/',async(req,res)=>{
const platform=req.query.platform||'both';
const niche=req.query.niche||'solana';
const minScore=parseInt(req.query.minscore||'70');

if(req.query.search){
try{
const response=await anthropic.messages.create({model:'claude-sonnet-4-5',max_tokens:2000,messages:[{role:'user',content:`You are a crypto influencer research agent for $DC (DubaiCoin), a Solana-based Web3 ecosystem by Ben X Capital.\n\nFind 6 real mid-to-macro crypto influencers (50K-2M followers) on ${platform==='both'?'Twitter/X and Telegram':platform} focused on ${niche} who would be good long-term partners for $DC.\n\nReturn ONLY a JSON array:\n[\n{\n"name":"Real name",\n"handle":"@handle",\n"platform":"Twitter or Telegram or Both",\n"followers":"e.g. 250K",\n"niche":"e.g. Solana DeFi",\n"engagement":0-100,\n"authenticity":0-100,\n"alignment":0-100,\n"partnership":0-100,\n"recommendation":"Strong match or Watch or Avoid",\n"reason":"One sentence why"\n}\n]\n\nOnly real known crypto influencers. JSON only, no other text.`}]});
const text=response.content[0].text.replace(/```json|```/g,'').trim();
const influencers=JSON.parse(text);
const filtered=influencers.filter(i=>i.partnership>=minScore);
return res.json({success:true,data:filtered});
}catch(err){return res.json({success:false,error:err.message});}
}

res.send(`<!DOCTYPE html>
<html>
<head>
<title>Scout — Ben X Capital</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,sans-serif;background:#0a0a0a;color:#fff;min-height:100vh}
.wrap{max-width:900px;margin:0 auto;padding:2rem 1rem}
h1{font-size:28px;font-weight:600;margin-bottom:4px}
.sub{color:#888;font-size:14px;margin-bottom:2rem}
.filters{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:1rem}
label{font-size:12px;color:#888;display:block;margin-bottom:6px}
select{width:100%;padding:10px;background:#1a1a1a;border:1px solid #333;border-radius:8px;color:#fff;font-size:14px}
.btn{width:100%;padding:14px;background:#f0b429;border:none;border-radius:8px;color:#000;font-size:16px;font-weight:600;cursor:pointer;margin-bottom:2rem}
.btn:hover{background:#e0a419}
.loading{text-align:center;padding:2rem;color:#888;display:none}
.cards{display:flex;flex-direction:column;gap:16px}
.card{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:1.25rem}
.card-top{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.avatar{width:44px;height:44px;border-radius:50%;background:#f0b429;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;color:#000;flex-shrink:0}
.name{font-weight:600;font-size:16px}
.handle{font-size:13px;color:#888}
.badges{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.badge{font-size:11px;padding:3px 10px;border-radius:20px;font-weight:500}
.b-platform{background:#1e3a5f;color:#60a5fa}
.b-size{background:#1a3a1a;color:#4ade80}
.b-niche{background:#3a2a00;color:#fbbf24}
.score-row{display:flex;align-items:center;gap:10px;margin-bottom:6px}
.score-label{font-size:12px;color:#888;width:120px;flex-shrink:0}
.bar{flex:1;height:4px;background:#2a2a2a;border-radius:2px;overflow:hidden}
.fill{height:100%;border-radius:2px}
.score-val{font-size:12px;font-weight:600;width:28px;text-align:right}
.card-footer{border-top:1px solid #2a2a2a;padding-top:12px;margin-top:12px;display:flex;justify-content:space-between;align-items:flex-start}
.rec-strong{color:#4ade80}
.rec-watch{color:#fbbf24}
.rec-avoid{color:#f87171}
.reason{font-size:12px;color:#888;margin-top:4px}
.empty{text-align:center;padding:3rem;color:#888}
@media(max-width:600px){.filters{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="wrap">
<h1>Scout</h1>
<p class="sub">Crypto Influencer Discovery Agent — Ben X Capital</p>
<div class="filters">
<div><label>Platform</label>
<select id="platform">
<option value="both">Both (X + Telegram)</option>
<option value="twitter">X / Twitter only</option>
<option value="telegram">Telegram only</option>
</select></div>
<div><label>Niche</label>
<select id="niche">
<option value="solana">Solana ecosystem</option>
<option value="defi">DeFi & staking</option>
<option value="web3">Web3 & NFTs</option>
<option value="presale">Token presales</option>
<option value="all">All crypto</option>
</select></div>
<div><label>Min partnership score</label>
<select id="minscore">
<option value="60">60+</option>
<option value="70" selected>70+</option>
<option value="80">80+</option>
<option value="90">90+</option>
</select></div>
</div>
<button class="btn" onclick="search()">Find influencers for $DC</button>
<div class="loading" id="loading">Searching... this may take 20-30 seconds</div>
<div class="cards" id="results"><div class="empty">Click "Find influencers" to discover crypto influencers for $DC partnerships</div></div>
</div>
<script>
async function search(){
const platform=document.getElementById('platform').value;
const niche=document.getElementById('niche').value;
const minscore=document.getElementById('minscore').value;
document.getElementById('loading').style.display='block';
document.getElementById('results').innerHTML='';
const res=await fetch('/?search=1&platform='+platform+'&niche='+niche+'&minscore='+minscore);
const data=await res.json();
document.getElementById('loading').style.display='none';
if(!data.success){document.getElementById('results').innerHTML='<div class="empty">Error: '+data.error+'</div>';return;}
const colors=['#f0b429','#60a5fa','#4ade80','#f87171','#a78bfa','#fb923c'];
const html=data.data.map((inf,i)=>{
const initials=inf.name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
const recClass=inf.recommendation==='Strong match'?'rec-strong':inf.recommendation==='Watch'?'rec-watch':'rec-avoid';
return '<div class="card"><div class="card-top"><div class="avatar" style="background:'+colors[i%6]+'">'+initials+'</div><div><div class="name">'+inf.name+'</div><div class="handle">'+inf.handle+' · '+inf.followers+' followers</div></div></div><div class="badges"><span class="badge b-platform">'+inf.platform+'</span><span class="badge b-size">'+inf.followers+'</span><span class="badge b-niche">'+inf.niche+'</span></div><div class="score-row"><span class="score-label">Engagement</span><div class="bar"><div class="fill" style="width:'+inf.engagement+'%;background:#60a5fa"></div></div><span class="score-val">'+inf.engagement+'</span></div><div class="score-row"><span class="score-label">Authenticity</span><div class="bar"><div class="fill" style="width:'+inf.authenticity+'%;background:#4ade80"></div></div><span class="score-val">'+inf.authenticity+'</span></div><div class="score-row"><span class="score-label">$DC alignment</span><div class="bar"><div class="fill" style="width:'+inf.alignment+'%;background:#f0b429"></div></div><span class="score-val">'+inf.alignment+'</span></div><div class="score-row"><span class="score-label">Partnership fit</span><div class="bar"><div class="fill" style="width:'+inf.partnership+'%;background:#a78bfa"></div></div><span class="score-val">'+inf.partnership+'</span></div><div class="card-footer"><div><span class="'+recClass+' " style="font-weight:600;font-size:13px">'+inf.recommendation+'</span><div class="reason">'+inf.reason+'</div></div></div></div>';
}).join('');
document.getElementById('results').innerHTML=html||'<div class="empty">No influencers found. Try lowering the minimum score.</div>';
}
</script>
</body>
</html>`);
});

app.listen(PORT,()=>console.log('Scout running on port',PORT));
