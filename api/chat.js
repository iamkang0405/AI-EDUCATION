export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY 환경변수가 없습니다.' });
  try {
    const { messages = [], webSearch = false, stream = false } = req.body || {};
    const upstream = await fetch('https://api.openai.com/v1/responses', { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.OPENAI_API_KEY}`}, body:JSON.stringify({ model:'gpt-5.6-luna', ...(webSearch ? {tools:[{type:'web_search'}]} : {}), ...(stream ? {stream:true} : {}), input:messages.map(m=>({role:m.role,content:m.content})) }) });
    if (!upstream.ok) { const error = await upstream.json(); return res.status(upstream.status).json({ error:error.error?.message||'OpenAI API 오류' }); }
    if (stream) { res.writeHead(200, {'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-transform','Connection':'keep-alive'}); const reader=upstream.body.getReader(),decoder=new TextDecoder(); while(true){const {done,value}=await reader.read();if(done)break;res.write(decoder.decode(value,{stream:true}))}return res.end(); }
    const data=await upstream.json(); const text=data.output_text||data.output?.flatMap(item=>item.content||[]).filter(item=>item.type==='output_text').map(item=>item.text).join('\n')||''; return res.status(200).json({text});
  } catch (error) { return res.status(500).json({ error:error.message||'서버 오류' }); }
}
