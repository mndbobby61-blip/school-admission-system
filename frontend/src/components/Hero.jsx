export default function Hero() {
  return (
    <section className="hero">
      <h2>সহজ, স্বচ্ছ অনলাইন ভর্তি</h2>
      <p>
        প্রতিটা class-এর seat সীমিত এবং যে আগে আবেদন করবে সে-ই seat পাবে।
        আবেদনের পর নির্দিষ্ট সময় seat আপনার সন্তানের নামে আটকে থাকে, ভর্তি ফি দিলে ভর্তি নিশ্চিত হয়।
      </p>

      <div className="steps">
        <div className="step">
          <div className="step-no">১</div>
          <b>জন্ম নিবন্ধন নম্বর দিন</b>
          <span>উপরের ঘরে সন্তানের ১৭ অঙ্কের নম্বর লিখুন।</span>
        </div>
        <div className="step">
          <div className="step-no">২</div>
          <b>আবেদন করুন</b>
          <span>পছন্দের class আর shift বেছে seat আটকে রাখুন।</span>
        </div>
        <div className="step">
          <div className="step-no">৩</div>
          <b>সময়ের মধ্যে ফি দিন</b>
          <span>উল্টো গোনা শেষ হওয়ার আগে ভর্তি ফি দিয়ে নিশ্চিত করুন।</span>
        </div>
      </div>
    </section>
  )
}