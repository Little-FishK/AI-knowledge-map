'use strict';
const assert = require('node:assert/strict');
const {create} = require('../../assets/progress-supabase');
(async () => {
  const calls=[];
  const adapter=create({
    auth:{
      signInWithOtp:async input=>{calls.push(input);return {data:{session:null},error:null};},
      verifyOtp:async input=>{calls.push(input);return {data:{session:{user:{id:'a'}}},error:null};},
      signOut:async input=>{calls.push(input);return {error:null};},
    },
    rpc:async (name,input)=>{calls.push({name,input});return {data:{status:'applied'},error:null};},
    functions:{invoke:async(name,input)=>{calls.push({name,input});return {data:{deleted:true},error:null};}},
  });
  await adapter.sendCode('fixture@example.invalid');
  assert.deepEqual(calls.pop(),{email:'fixture@example.invalid',options:{shouldCreateUser:true}});
  await adapter.verifyCode('fixture@example.invalid','123456');
  assert.equal(calls.pop().type,'email');
  await adapter.apply({operationId:'test',nodeId:'supervised-learning',field:'read',value:false,expectedVersion:2});
  const sent=calls.pop();
  assert.equal(sent.input.p_value,false);
  assert.equal(sent.input.p_expected_version,2);
  assert(!Object.hasOwn(sent.input,'user_id'));
  assert.equal(sent.name,'apply_learning_operation');
  await adapter.signOut();assert.deepEqual(calls.pop(),{scope:'local'});
  await adapter.deleteAccount();assert.deepEqual(calls.pop(),{name:'delete-account',input:{body:{confirmation:'delete-account'}}});
  const failure=Error('rate limited');
  const failing=create({auth:{signInWithOtp:async()=>({error:failure})}});
  await assert.rejects(failing.sendCode('fixture@example.invalid'),error=>error===failure);
  let pages=0;
  const paginated=create({from(name){
    assert.equal(name,'learning_progress');
    return {select(){return this;},order(){return this;},async range(from,to){
      assert.equal(from,pages*500);assert.equal(to,from+499);
      pages++;
      return {data:Array.from({length:pages===1?500:1},()=>({node_id:'example',field:'read',value:true,version:1,content_revision:null})),error:null};
    }};
  }});
  assert.equal((await paginated.load()).length,501);
  assert.equal(pages,2);
  console.log('PASS: OTP, RPC, pagination, local signout and server-side account deletion call');
})().catch(error=>{console.error(error);process.exitCode=1;});
