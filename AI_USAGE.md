# AI_USAGE

## কোন AI tool
Claude (Anthropic)

## কোথায় AI ব্যবহার করেছি
- Backend-এর কাঠামো (.NET + PostgreSQL), API route-এর খসড়া
- `SELECT ... FOR UPDATE` দিয়ে concurrency আটকানোর ধারণা
- React UI-র প্রথম খসড়া আর CSS-এর কাঠামো
- Docker, docker-compose, README, ASSUMPTIONS-এর খসড়া
- Git ও Docker-এর সমস্যা সমাধানে সাহায্য

## যা নিজে করেছি
- Assignment পুরোটা পড়ে প্রয়োজন বুঝেছি এবং কাজ ধাপে ধাপে ভাগ করেছি।
- **UI design নিজে করেছি:** [রং, layout, spacing, font বা component-এ নিজে কী কী বদলেছেন, যেমন "header-এর রং বদলেছি", "card-এর আকার ঠিক করেছি", "mobile-এ দেখতে ঠিক করেছি"]।
- প্রতিটা ধাপ আলাদা commit করে GitHub-এ push করেছি।
- Docker চালিয়ে browser-এ সব flow হাতে যাচাই করেছি: class বানানো, আবেদন, উল্টো গোনা, ফি দেওয়া, বাতিল, "আমার আবেদন"।
- Concurrency test চালিয়ে ফল দেখেছি।

## AI কোথায় ভুল করেছিল আর কীভাবে ধরলাম
- Git-এর শুরুতে `frontend` folder-এর ভেতরে আলাদা `.git` ছিল। ফলে `git add .` শুধু একটা খালি লিংক commit করেছিল। `git status`-এর warning দেখে ধরেছি, ভেতরের `.git` মুছে আবার ঠিকভাবে commit করেছি।
- AI শুরুতে ধরে নিয়েছিল `frontend` folder নতুন, কিন্তু সেখানে আগে থেকে আলাদা structure ছিল। `git status -u` দেখে সেটা ধরা পড়েছে।
- Docker build-এ `read-only file system` আর পরে `EOF` error এসেছিল। কারণ C: drive-এ মাত্র ৩ GB জায়গা ছিল। Docker-এর storage D: drive-এ সরিয়ে ঠিক করেছি।
- `frontend/package.json` খালি ছিল (save হয়নি)। `npm install`-এর error দেখে ধরেছি।
- `.dockerignore` আর `format.js` file-এর নামে বানান ভুল ছিল। `git status` দেখে ধরে ঠিক করেছি।

## যাচাই
`docker compose --profile test run --rm tests` চালিয়ে ৪টা test পাস করেছি। Concurrency test-এ ২০ seat-এর class-এ ২০০টা একসাথে request পাঠিয়ে ঠিক ২০টা hold হয়েছে। `docker compose down` তারপর `up` করে দেখেছি data হারায়নি।