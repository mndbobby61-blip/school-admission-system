import { useState } from 'react'

const ITEMS = [
  {
    q: 'আবেদন করলে seat কতক্ষণ আটকে থাকে?',
    a: 'আবেদনের পর seat নির্দিষ্ট সময়ের (সাধারণত ১০ মিনিট) জন্য আপনার সন্তানের নামে আটকে থাকে। এই সময়ের মধ্যে ভর্তি ফি না দিলে seat আবার অন্যদের জন্য খুলে যায়।',
  },
  {
    q: 'ভর্তি কীভাবে নিশ্চিত হয়?',
    a: 'আবেদনের অবস্থা পাতায় "ভর্তি ফি দিন" বোতাম চাপলে ভর্তি নিশ্চিত হয়। মেয়াদ শেষ হওয়ার আগেই এটা করতে হবে।',
  },
  {
    q: 'আবেদন বাতিল করা যায় কি?',
    a: 'হ্যাঁ, মেয়াদের মধ্যে "বাতিল" বোতাম চাপলে seat সঙ্গে সঙ্গে খালি হয়ে যায়। ভর্তি নিশ্চিত হয়ে গেলে আর বাতিল করা যায় না।',
  },
  {
    q: 'একই শিক্ষার্থী একাধিক আবেদন করতে পারে?',
    a: 'একই class-এ একসাথে একটাই সক্রিয় আবেদন থাকতে পারে। তবে ভিন্ন class বা shift-এ আলাদা আবেদন করা যায়।',
  },
  {
    q: 'মেয়াদ শেষ হয়ে গেলে কী করব?',
    a: 'আবেদনটি "মেয়াদ শেষ" দেখাবে। seat খালি থাকলে আবার নতুন করে আবেদন করতে পারবেন।',
  },
]

export default function Faq() {
  const [open, setOpen] = useState(0)

  return (
    <section className="section">
      <h2 className="page-title">সাধারণ প্রশ্ন</h2>
      <p className="page-sub">আবেদন নিয়ে যা জানতে চান।</p>

      <div className="faq">
        {ITEMS.map((item, i) => (
          <div className={'faq-item' + (open === i ? ' open' : '')} key={item.q}>
            <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
              <span>{item.q}</span>
              <span className="faq-icon">{open === i ? '−' : '+'}</span>
            </button>
            {open === i && <div className="faq-a">{item.a}</div>}
          </div>
        ))}
      </div>
    </section>
  )
}