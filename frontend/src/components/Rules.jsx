const RULES = [
  { icon: '⏱️', title: 'সময়ের সীমা', text: 'আবেদনের পর সীমিত সময় seat আটকে থাকে। উল্টো গোনা শেষ হলে আবেদন নিজে থেকেই মেয়াদোত্তীর্ণ হয়।' },
  { icon: '🥇', title: 'আগে আসলে আগে', text: 'যে আগে আবেদন করবে সে seat পাবে। seat শেষ হলে নতুন আবেদন নেওয়া হয় না।' },
  { icon: '🔒', title: 'নিরাপদ গণনা', text: 'একসাথে হাজার আবেদন এলেও seat সংখ্যার বেশি কখনো আটকানো হয় না।' },
  { icon: '♻️', title: 'seat ফেরত', text: 'বাতিল বা মেয়াদ শেষ হলে seat স্বয়ংক্রিয়ভাবে অন্যদের জন্য খালি হয়।' },
]

export default function Rules() {
  return (
    <section className="section">
      <h2 className="page-title">নিয়ম ও শর্ত</h2>
      <p className="page-sub">ভর্তি প্রক্রিয়ার মূল নিয়মগুলো।</p>

      <div className="rules">
        {RULES.map((r) => (
          <div className="rule" key={r.title}>
            <div className="rule-icon">{r.icon}</div>
            <b>{r.title}</b>
            <span>{r.text}</span>
          </div>
        ))}
      </div>
    </section>
  )
}