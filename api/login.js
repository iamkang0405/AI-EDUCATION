export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  const { password } = req.body || {};
  const expected = process.env.SITE_PASSWORD;
  if (!expected) return res.status(500).json({ ok: false, message: 'SITE_PASSWORD 환경 변수가 설정되지 않았습니다.' });
  if (password !== expected) return res.status(401).json({ ok: false, message: '비밀번호가 올바르지 않습니다.' });
  res.setHeader('Set-Cookie', 'site_access=granted; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400');
  return res.status(200).json({ ok: true });
}
