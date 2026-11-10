# ASSUMPTIONS

Brief-এ যা স্পষ্ট বলা নেই, সেখানে যা ধরে নিয়েছি:

1. **Seat গণনা:** `heldSeats` = মেয়াদ না-পেরোনো `HELD` আবেদন। `confirmedSeats` = `CONFIRMED`। `availableSeats = totalSeats - heldSeats - confirmedSeats`।
2. **Overbooking আটকানো:** `POST /classes/{id}/holds`-এ transaction শুরু করে class-এর row `SELECT ... FOR UPDATE` দিয়ে lock করি। তারপর active সংখ্যা গুনে জায়গা থাকলে hold বানাই। একই class-এ সব request লাইন ধরে চলে। Lock PostgreSQL-এ থাকে, তাই দুটো backend process আলাদা port-এ চললেও `held + confirmed` কখনো `totalSeats` ছাড়ায় না।
3. **Expiry:** আলাদা job নেই। DB-তে status `HELD` থাকলেও `expiresAt <= now` হলে API তাকে `EXPIRED` দেখায় এবং seat গণনায় ধরে না। এতে কোনো request ছাড়াই seat ফেরত আসে।
4. **একই শিক্ষার্থী, একই class:** মেয়াদ না-পেরোনো `HELD` বা `CONFIRMED` থাকলে নতুন আবেদন `409` পায়। আগের আবেদন `EXPIRED` বা `CANCELLED` হলে আবার আবেদন করা যায়। ভিন্ন class-এ আলাদা আবেদন করতে পারে।
5. **Error code:** seat নেই → `409` (brief অনুযায়ী)। একই শিক্ষার্থীর দ্বিতীয় আবেদন → `409`। অন্য শিক্ষার্থীর hold দেখতে/confirm/বাতিল করতে চাইলে → `404`। `X-Student-Id` ঠিক ১৭ অঙ্ক না হলে বা না থাকলে → `400`। Class বা hold না থাকলে → `404`।
6. **Confirm:** শুধু মেয়াদ না-পেরোনো `HELD` confirm হয়। মেয়াদ শেষ হলে `409`। আগেই `CONFIRMED` হলে আবার confirm করলে `200` ফেরে কিন্তু `confirmedSeats` বাড়ে না। Hold row lock করে করা হয়, তাই একসাথে দুইবার confirm করলেও একবারই গোনা হয়।
7. **বাতিল (`DELETE`):** শুধু active `HELD` বাতিল হয় (`204`)। আগেই বাতিল হলে `204`। `CONFIRMED` হলে `409`, মেয়াদ শেষ হলে `409`।
8. **Hold-এর আচরণ:** `HOLD_DURATION_SECONDS` (default 600) থেকে `expiresAt` হিসাব করা হয়। সময় সবসময় UTC, format `yyyy-MM-ddTHH:mm:ssZ`।
9. **বাড়তি field:** hold-এর response-এ `className` যোগ করেছি (UI-র জন্য)। Brief-এর কোনো field বাদ বা নাম বদল করিনি।
10. **ID format:** class আর hold-এর ID GUID, string হিসেবে যায়।
11. **Class নাম:** নাম খালি হতে পারবে না, seat সংখ্যা ১ বা তার বেশি হতে হবে। একই নামে একাধিক class বানানো আটকাইনি।
12. **Payment:** "ভর্তি ফি দিন" চাপলেই সফল ধরা হয়, আসল payment নেই।
13. **Authentication:** login নেই। `X-Student-Id` header-ই পরিচয়। Admin screen-এর জন্য আলাদা পরিচয় নেই।
14. **Frontend সময়:** উল্টো গোনা browser-এর ঘড়ি দিয়ে চলে, প্রতি ৩ সেকেন্ডে server-এর অবস্থা আবার আনা হয়। সব অবস্থার সত্য উৎস server।
15. **Data টিকে থাকা:** PostgreSQL data Docker volume-এ থাকে।