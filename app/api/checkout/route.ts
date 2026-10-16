import { getEnv,appOrigin,database } from '@/lib/server/env';
import { createSession,currentUser } from '@/lib/server/auth';
import { limitAuth } from '@/lib/server/auth-security';
import { createGuestUser } from '@/lib/server/guest-accounts';
import { sameOrigin,jsonBody } from '@/lib/server/security';
import { createCheckout } from '@/lib/server/payments';
import { api,ApiError } from '@/lib/server/errors';
import { creditPacks } from '@/content/pricing';

// Buying does not require sign-in: a visitor without a session gets a guest
// account bound to this browser, and the paid credits land there.
export const POST=api(async(request)=>{
 const env=await getEnv();sameOrigin(request,appOrigin(env));
 const body=await jsonBody(request);
 let user=await currentUser(request,env),sessionCookie:string|undefined;
 if(!user){
  if(!creditPacks.some(pack=>pack.id===body.packId))throw new ApiError(400,'Unknown credit pack.');
  const db=database(env);
  try{await limitAuth(db,request,'guest-checkout');}
  catch(error){if(error instanceof ApiError&&error.status===429)throw new ApiError(429,'Too many checkout attempts. Please try again in 15 minutes.');throw error;}
  user=await createGuestUser(db);
  sessionCookie=await createSession(user.id,env);
 }
 const headers=new Headers({'Cache-Control':'no-store'});
 if(sessionCookie)headers.append('Set-Cookie',sessionCookie);
 try{return Response.json(await createCheckout(env,user,body.packId,body.locale),{headers});}
 catch(error){
  // Keep the new guest session even when checkout fails, so a retry reuses it.
  if(!sessionCookie||!(error instanceof ApiError))throw error;
  return Response.json({error:error.message},{status:error.status,headers});
 }
});
