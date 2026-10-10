const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','x-robots-tag':'noindex, nofollow, noarchive'}});
export async function onRequestGet({env}) {
  if(!env.SUPABASE_URL||!env.SUPABASE_ANON_KEY)return json({error:'Supabase public configuration is not set.'},503);
  return json({supabaseUrl:env.SUPABASE_URL,supabaseAnonKey:env.SUPABASE_ANON_KEY});
}
