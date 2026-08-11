# Coachly

نسخه اولیه رابط کاربری Coachly، یک پلتفرم مدیریت مربی و ورزشکار.

## اجرا

فایل `index.html` را مستقیماً در مرورگر باز کنید. این نسخه بدون وابستگی خارجی اجرا می‌شود و برای نمایش UX، Design System و جریان‌های اصلی محصول آماده شده است.

## مسیرهای آماده

- داشبورد Coach با بخش Needs Attention
- مدیریت ورزشکاران، جست‌وجو و فیلتر وضعیت
- Workout و Program overview
- Workout Builder در قالب Modal
- تقویم شمسی نمونه
- کتابخانه حرکات CrossFit
- Check-in ها
- Messaging
- Athlete Today و ثبت حرکات
- تغییر تم روشن/تیره با ذخیره در localStorage
- افزودن واقعی Athlete، Workout و Exercise سفارشی با ذخیره در localStorage
- خروجی CSV ورزشکاران
- جابه‌جایی ماه و نمای تقویم
- باز و پاسخ‌دادن به Check-in ها
- انتخاب گفتگو و ارسال پیام
- فیلتر زنده ورزشکار، حرکات و گفتگوها
- طراحی واکنش‌گرا برای موبایل و دسکتاپ

## مرحله بعدی فنی

برای اتصال به نسخه production، می‌توان همین UI را به Next.js + TypeScript، APIهای سمت سرور، PostgreSQL، احراز هویت Session-based و Storage abstraction منتقل کرد.
