export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <b>School Admission System</b>
          <div>Online ভর্তি ব্যবস্থাপনা</div>
        </div>
        <div>© {new Date().getFullYear()} · React, .NET 8 ও PostgreSQL দিয়ে তৈরি</div>
      </div>
    </footer>
  )
}