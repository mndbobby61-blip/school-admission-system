# School Admission System

স্কুলের online ভর্তি ব্যবস্থা: seat সীমিত, "আগে আসলে আগে পাবে", আবেদনের পর নির্দিষ্ট সময় seat hold থাকে, ফি জমা দিলে ভর্তি নিশ্চিত হয়।

**Stack:** .NET 8 (C#), PostgreSQL 16, React 18 (Vite), Docker

## চালানোর নিয়ম

শুধু Docker দরকার।

```
docker compose up --build
```

| কী | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |

বন্ধ করতে `Ctrl + C`, তারপর `docker compose down`। Data volume-এ থাকে, তাই আবার `up` করলে data ফেরত পাওয়া যায়। Data মুছতে `docker compose down -v`।

## Environment variable

| নাম | কাজ | Default |
|---|---|---|
| `HOLD_DURATION_SECONDS` | আবেদনের মেয়াদ (সেকেন্ড) | 600 |
| `ConnectionStrings__Default` | PostgreSQL connection | compose-এ দেওয়া |
| `VITE_API_URL` | Frontend থেকে backend URL (build সময়) | http://localhost:8080 |

## Test চালানো

Compose নিজেই backend আর database তুলে দেয়:

```
docker compose --profile test run --rm tests
```

Concurrency test: ২০ seat-এর class-এ ২০০টা আলাদা শিক্ষার্থীর request একসাথে পাঠায়। ঠিক ২০টা `201`, বাকি ১৮০টা `409` হতে হবে।

## ব্যবহারের ধাপ

1. "Class তৈরি (Admin)" থেকে class বানান।
2. উপরের ঘরে ১৭ অঙ্কের জন্ম নিবন্ধন নম্বর লিখুন।
3. "Class তালিকা" থেকে "আবেদন করুন"।
4. আবেদনের অবস্থা page-এ উল্টো গোনা চলবে। "ভর্তি ফি দিন" চাপলে ভর্তি নিশ্চিত, "বাতিল" চাপলে seat ফেরত।
5. "আমার আবেদন"-এ সব আবেদন দেখা যায়।

## ডিজাইন সিদ্ধান্ত (সংক্ষেপে)

- **Overbooking আটকানো:** hold বানানোর সময় transaction-এর ভেতরে class-এর row-এ `SELECT ... FOR UPDATE` lock নেওয়া হয়। Lock database-এ থাকে, তাই একাধিক backend process থাকলেও কাজ করে।
- **Expiry:** background job নেই। Active hold মানে `status = HELD` এবং `expiresAt > now`। তাই মেয়াদ শেষ হলে seat নিজে থেকে ফিরে আসে।
- বিস্তারিত `ASSUMPTIONS.md`-তে।