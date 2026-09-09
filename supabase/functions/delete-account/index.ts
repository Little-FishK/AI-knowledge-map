import { createClient } from 'npm:@supabase/supabase-js@2';

function allowed(origin: string) {
  if(['https://ai-knowledge-map.com','https://www.ai-knowledge-map.com','https://little-fishk.github.io'].includes(origin))return true;
  try {const url=new URL(origin);return url.protocol==='http:'&&['127.0.0.1','localhost'].includes(url.hostname)&&Boolean(url.port);}
  catch{return false;}
}

Deno.serve(async request => {
  const origin=request.headers.get('origin') || '';
  const cors={'Access-Control-Allow-Origin':allowed(origin)?origin:'https://ai-knowledge-map.com','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Vary':'Origin'};
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(request.method!=='POST')return new Response(JSON.stringify({error:'Method not allowed'}),{status:405,headers:{...cors,'Content-Type':'application/json'}});
  if(origin && !allowed(origin))return new Response(JSON.stringify({error:'Origin not allowed'}),{status:403,headers:{...cors,'Content-Type':'application/json'}});
  const body=await request.json().catch(()=>null);
  if(body?.confirmation!=='delete-account')return new Response(JSON.stringify({error:'Confirmation required'}),{status:400,headers:{...cors,'Content-Type':'application/json'}});
  const authorization=request.headers.get('authorization');
  if(!authorization)return new Response(JSON.stringify({error:'Authentication required'}),{status:401,headers:{...cors,'Content-Type':'application/json'}});
  const url=Deno.env.get('SUPABASE_URL'),anon=Deno.env.get('SUPABASE_ANON_KEY'),service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(!url||!anon||!service)return new Response(JSON.stringify({error:'Service configuration missing'}),{status:500,headers:{...cors,'Content-Type':'application/json'}});
  const userClient=createClient(url,anon,{global:{headers:{Authorization:authorization}},auth:{persistSession:false}});
  const {data,error}=await userClient.auth.getUser();
  if(error||!data.user)return new Response(JSON.stringify({error:'Authentication required'}),{status:401,headers:{...cors,'Content-Type':'application/json'}});
  const admin=createClient(url,service,{auth:{persistSession:false}});
  const deleted=await admin.auth.admin.deleteUser(data.user.id);
  if(deleted.error)return new Response(JSON.stringify({error:'Account deletion failed'}),{status:500,headers:{...cors,'Content-Type':'application/json'}});
  return new Response(JSON.stringify({deleted:true}),{status:200,headers:{...cors,'Content-Type':'application/json'}});
});
