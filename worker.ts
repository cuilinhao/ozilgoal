// @ts-ignore OpenNext generates this module during cf:build.
import nextWorker, * as generatedWorker from './.open-next/worker.js';
import { runDueJobs } from './lib/server/jobs';
export default {
 async fetch(request:Request,env:CloudflareEnv,ctx:ExecutionContext){
  const url=new URL(request.url);
  if(env.APP_URL?.startsWith('https://')&&(url.hostname==='www.ozilgoal-aivideo.com'||(url.hostname==='ozilgoal-aivideo.com'&&url.protocol==='http:'))){
   url.protocol='https:';url.hostname='ozilgoal-aivideo.com';return Response.redirect(url.toString(),308);
  }
  return nextWorker.fetch(request,env,ctx);
 },
 async scheduled(_controller: ScheduledController,env:CloudflareEnv,ctx:ExecutionContext){ctx.waitUntil(runDueJobs(env));}
} satisfies ExportedHandler<CloudflareEnv>;
export const { DOQueueHandler, DOShardedTagCache, BucketCachePurge } = generatedWorker;
