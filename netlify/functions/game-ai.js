exports.handler = async function(event) {
  const headers = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"POST, OPTIONS","Content-Type":"application/json; charset=utf-8"};
  if (event.httpMethod === "OPTIONS") return {statusCode:200,headers,body:""};
  if (event.httpMethod !== "POST") return {statusCode:405,headers,body:JSON.stringify({error:"Only POST"})};
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  if (!apiKey) return {statusCode:500,headers,body:JSON.stringify({error:"Missing OPENAI_API_KEY"})};
  let body; try { body = JSON.parse(event.body || "{}") } catch { return {statusCode:400,headers,body:JSON.stringify({error:"Invalid JSON"})}; }
  const schema = {type:"object",additionalProperties:false,properties:{
    story:{type:"string"},action_result:{type:"string"},
    stat_changes:{type:"object",additionalProperties:false,properties:{hp:{type:"integer"},hunger:{type:"integer"},thirst:{type:"integer"},hygiene:{type:"integer"},sanity:{type:"integer"},stamina:{type:"integer"},infection:{type:"integer"},money:{type:"integer"},reputation:{type:"integer"},danger:{type:"integer"}},required:["hp","hunger","thirst","hygiene","sanity","stamina","infection","money","reputation","danger"]},
    items_gained:{type:"array",items:{type:"string"}},items_lost:{type:"array",items:{type:"string"}},
    companions_gained:{type:"array",items:{type:"string",enum:["nurse","mechanic","child","soldier","dog"]}},
    companions_lost:{type:"array",items:{type:"string",enum:["nurse","mechanic","child","soldier","dog"]}},
    quest_updates:{type:"array",items:{type:"string"}},death:{type:"boolean"},death_reason:{type:"string"},
    next_day_options:{type:"array",items:{type:"string"},minItems:4,maxItems:4},difficulty_note:{type:"string"}},
    required:["story","action_result","stat_changes","items_gained","items_lost","companions_gained","companions_lost","quest_updates","death","death_reason","next_day_options","difficulty_note"]};
  const system = `你是末日丧尸生存网页文字游戏的AI主持人、编剧、数值平衡师。根据当前gameState和玩家action，返回一天结算JSON。规则：风格紧张压抑但不过度血腥；不要随意给大量资源；不要让所有选择都成功；根据职业、地点、物品、状态、伙伴判断成功率；自由输入过于模糊要低收益或轻微惩罚；创造性且合理可以奖励；stat_changes只表示本次行动变化，不包含每日固定消耗；可获得物品限常见生存物资；companions_gained只能是nurse, mechanic, child, soldier, dog。`;
  try{
    const r = await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({model,input:[{role:"system",content:system},{role:"user",content:JSON.stringify(body,null,2)}],text:{format:{type:"json_schema",name:"zombie_game_result",strict:true,schema}},temperature:.75,max_output_tokens:1300})});
    const data = await r.json();
    if(!r.ok) return {statusCode:r.status,headers,body:JSON.stringify({error:data.error?.message||"OpenAI request failed"})};
    let text = data.output_text;
    if(!text && Array.isArray(data.output)){ for(const item of data.output){ const f=item.content?.find(c=>c.type==="output_text"||c.text); if(f){text=f.text;break;} } }
    if(!text) return {statusCode:502,headers,body:JSON.stringify({error:"No model output"})};
    return {statusCode:200,headers,body:text};
  }catch(e){ return {statusCode:500,headers,body:JSON.stringify({error:e.message||"Server error"})}; }
};