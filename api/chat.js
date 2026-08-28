export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY 환경변수가 없습니다.' });
  try {
    const { messages = [] } = req.body || {};
    const response = await fetch('https://api.openai.com/v1/responses', { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.OPENAI_API_KEY}`}, body:JSON.stringify({ model:'gpt-4o-mini', input:messages.map(m=>({role:m.role,content:m.content})) }) });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error:data.error?.message||'OpenAI API 오류' });
    const text=data.output_text||data.output?.flatMap(item=>item.content||[]).filter(item=>item.type==='output_text').map(item=>item.text).join('\n')||'';
    return res.status(200).json({ text });
  } catch (error) { return res.status(500).json({ error:error.message||'서버 오류' }); }
}
