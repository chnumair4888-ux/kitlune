const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store, private','x-content-type-options':'nosniff','vary':'Authorization'}});
const fail=(message,status)=>json({error:message},status);
async function authorize(request,env){
  const header=request.headers.get('authorization')||'';
  const match=header.match(/^Bearer\s+(.+)$/i);
  if(!match)return {response:fail('Authentication required.',401)};
  const base=String(env.SUPABASE_URL||'').replace(/\/$/,'');
  const anon=String(env.SUPABASE_ANON_KEY||'');
  const allowed=String(env.STUDIO_ALLOWED_EMAIL||'').trim().toLowerCase();
  if(!base.startsWith('https://')||!anon||!allowed)return {response:fail('Server authentication is not configured.',503)};
  let userResponse;
  try{userResponse=await fetch(base+'/auth/v1/user',{headers:{apikey:anon,authorization:'Bearer '+match[1],accept:'application/json'},cache:'no-store'})}
  catch{return {response:fail('Authentication service unavailable.',502)}}
  if(!userResponse.ok)return {response:fail('Invalid or expired session.',401)};
  let user;try{user=await userResponse.json()}catch{return {response:fail('Invalid session response.',401)}}
  if(!user?.id||!user?.email)return {response:fail('Invalid session.',401)};
  if(String(user.email).trim().toLowerCase()!==allowed)return {response:fail('This account is not allowed.',403)};
  return {user};
}
const QUERY=`query StudioAnalytics($zoneTag:string!,$start:Date!,$end:Date!,$startTime:Time!,$endTime:Time!){viewer{zones(filter:{zoneTag:$zoneTag}){daily:httpRequests1dGroups(limit:1000,filter:{date_geq:$start,date_leq:$end},orderBy:[date_ASC]){dimensions{date}sum{requests pageViews}uniq{uniques}}countries:httpRequestsAdaptiveGroups(limit:100,filter:{datetime_geq:$startTime,datetime_lt:$endTime},orderBy:[count_DESC]){dimensions{clientCountryName}count}pages:httpRequestsAdaptiveGroups(limit:100,filter:{datetime_geq:$startTime,datetime_lt:$endTime},orderBy:[count_DESC]){dimensions{clientRequestPath}count}}}}`;
export async function onRequestGet({request,env}) {
  const url=new URL(request.url);
  if(url.pathname==='/studio/config')return json({supabaseUrl:env.SUPABASE_URL||'',supabaseAnonKey:env.SUPABASE_ANON_KEY||''});
  if(url.pathname!=='/studio/api')return fail('Not found.',404);
  const auth=await authorize(request,env);if(auth.response)return auth.response;
  if(!env.CF_API_TOKEN||!env.CF_ZONE_ID)return fail('Analytics secrets are not configured.',503);
  const now=new Date(),start=new Date(now);start.setUTCDate(start.getUTCDate()-29);
  const date=(d)=>d.toISOString().slice(0,10);
  const rangeStart=new Date(start);rangeStart.setUTCHours(0,0,0,0);const rangeEnd=new Date(now);rangeEnd.setUTCHours(0,0,0,0);rangeEnd.setUTCDate(rangeEnd.getUTCDate()+1);const variables={zoneTag:env.CF_ZONE_ID,start:date(start),end:date(now),startTime:rangeStart.toISOString(),endTime:rangeEnd.toISOString()};
  let response;try{response=await fetch('https://api.cloudflare.com/client/v4/graphql',{method:'POST',headers:{authorization:'Bearer '+env.CF_API_TOKEN,'content-type':'application/json'},body:JSON.stringify({query:QUERY,variables})})}catch{return fail('Cloudflare analytics could not be reached.',502)}
  if(!response.ok)return fail('Cloudflare analytics request failed.',502);
  let body;try{body=await response.json()}catch{return fail('Invalid analytics response.',502)}
  if(body.errors?.length||!body.data?.viewer?.zones?.[0]){return json({error:'Analytics query failed',details:(body.errors||[]).map(e=>e.message||'Unknown GraphQL error')},502);}
  const zone=body.data.viewer.zones[0],daily=zone.daily||[],byDate=new Map(daily.map(x=>[x.dimensions.date,x]));
  const today=new Date();today.setUTCHours(0,0,0,0);const periods={};
  for(const [name,days] of Object.entries({today:0,'7d':6,'30d':29})){let requests=0,pageViews=0,dailyUniqueTotal=0;for(let i=0;i<=days;i++){const d=new Date(today);d.setUTCDate(d.getUTCDate()-i);const row=byDate.get(date(d));if(row){requests+=Number(row.sum?.requests||0);pageViews+=Number(row.sum?.pageViews||0);dailyUniqueTotal+=Number(row.uniq?.uniques||0)}}periods[name]={requests,pageViews,dailyUniqueTotal}}
  const aggregate=(rows,key)=>{const map=new Map();for(const row of rows||[]){const name=row.dimensions?.[key]||'Unknown';map.set(name,(map.get(name)||0)+Number(row.count||0))}return [...map].map(([name,requests])=>({name,requests})).sort((a,b)=>b.requests-a.requests)};
  return json({periods,countries:aggregate(zone.countries,'clientCountryName').slice(0,15).map(x=>({country:x.name,requests:x.requests})),pages:aggregate(zone.pages,'clientRequestPath').slice(0,20).map(x=>({path:x.name,requests:x.requests})),generatedAt:new Date().toISOString()});
}
export async function onRequestPost({request,env}){const auth=await authorize(request,env);if(auth.response)return auth.response;return fail('Method not allowed.',405)}
export async function onRequest({request,env}){if(request.method!=='GET'&&request.method!=='POST')return fail('Method not allowed.',405);return request.method==='GET'?onRequestGet({request,env}):onRequestPost({request,env})}
