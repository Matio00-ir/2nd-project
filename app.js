const defaultAthletes = [
  { id: 1, name: "امیر حسینی", initials: "ا ح", level: "Intermediate", program: "Foundations · هفته ۴", compliance: 91, last: "امروز، ۰۸:۴۲", status: "active", statusLabel: "فعال" },
  { id: 2, name: "سارا احمدی", initials: "س ا", level: "Advanced", program: "Performance · هفته ۷", compliance: 84, last: "دیروز، ۱۹:۱۵", status: "active", statusLabel: "فعال" },
  { id: 3, name: "رضا کریمی", initials: "ر ک", level: "Intermediate", program: "Strength Base · هفته ۲", compliance: 58, last: "۵ روز پیش", status: "attention", statusLabel: "نیازمند توجه" },
  { id: 4, name: "محمد مرادی", initials: "م م", level: "Beginner", program: "Foundations · هفته ۱", compliance: 76, last: "امروز، ۰۷:۱۰", status: "active", statusLabel: "فعال" },
  { id: 5, name: "نیما ابراهیمی", initials: "ن ا", level: "Advanced", program: "Performance · هفته ۹", compliance: 97, last: "امروز، ۰۶:۵۸", status: "active", statusLabel: "در حال پیشرفت" },
  { id: 6, name: "نگار رضایی", initials: "ن ر", level: "Beginner", program: "Foundations · هفته ۳", compliance: 42, last: "۸ روز پیش", status: "inactive", statusLabel: "غیرفعال" }
];
const athletes = JSON.parse(localStorage.getItem("coachly-athletes") || "null") || defaultAthletes;

const workouts = JSON.parse(localStorage.getItem("coachly-workouts") || "[]");
const state = {
  page: "dashboard",
  theme: localStorage.getItem("coachly-theme") || "light",
  lang: localStorage.getItem("coachly-lang") || "fa",
  calendar: localStorage.getItem("coachly-calendar") || "solar",
  completed: new Set(JSON.parse(localStorage.getItem("coachly-completed") || "[]")),
  athleteView: "table",
  calendarView: "month",
  calendarOffset: 0,
  favoriteExercises: new Set(JSON.parse(localStorage.getItem("coachly-favorites") || "[]")),
  customExercises: JSON.parse(localStorage.getItem("coachly-custom-exercises") || "[]"),
  selectedConversation: "امیر حسینی"
};
const navItems = [
  ["dashboard", "⌂", "داشبورد"], ["athletes", "♙", "ورزشکاران"], ["workouts", "▣", "برنامه و تمرین"], ["calendar", "□", "تقویم"],
  ["library", "◈", "کتابخانه حرکات"], ["checkins", "✓", "Check-in ها"], ["messages", "◌", "پیام‌ها"]
];

function initials(name) { return name.split(" ").map(p => p[0]).slice(0, 2).join(" "); }
function pageTitle() {
  return { dashboard: "داشبورد", athletes: "ورزشکاران", workouts: "برنامه و تمرین", calendar: "تقویم", library: "کتابخانه حرکات", checkins: "Check-in ها", messages: "پیام‌ها", athlete: "Today · امیر حسینی" }[state.page] || "داشبورد";
}
function appShell(content) {
  document.getElementById("app").innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <button class="brand" data-page="dashboard" aria-label="رفتن به داشبورد"><div class="brand-mark">C</div><div class="brand-name">Coachly</div></button>
        <button class="workspace" data-action="workspace-menu"><div class="avatar">ع ر</div><div><small>فضای کاری مربی</small><strong>علی رحیمی</strong></div><span style="margin-right:auto;color:var(--muted)">⌄</span></button>
        <div><div class="nav-title">WORKSPACE</div><nav class="nav">${navItems.map(([id, icon, label]) => `<button class="${state.page === id ? "active" : ""}" data-page="${id}"><span class="nav-icon">${icon}</span>${label}</button>`).join("")}</nav></div>
        <div class="sidebar-footer"><button data-page="settings">⚙ تنظیمات</button><button data-action="logout">↪ خروج از حساب</button></div>
      </aside>
      <main class="main">
        <header class="topbar"><div class="breadcrumbs">Coachly <span style="margin:0 7px">/</span> ${pageTitle()}</div><div class="top-actions"><button class="icon-btn" data-action="theme" title="تغییر تم">${state.theme === "light" ? "☾" : "☀"}</button><button class="icon-btn" data-action="notifications" title="اعلان‌ها">♢</button><button class="profile-chip" data-action="profile-menu"><span>علی رحیمی</span><div class="avatar">ع ر</div></button></div></header>
        <section class="content">${content}</section>
      </main>
    </div>
    <div class="modal-backdrop" id="modal"></div>`;
  bindEvents();
}

function dashboard() {
  return `
    <div class="page-head"><div><div class="eyebrow">دوشنبه، ۲۰ مرداد ۱۴۰۵</div><h1>صبح بخیر، علی</h1><p class="subtitle">اینجا ببینید امروز کدام ورزشکارها به توجه شما نیاز دارند.</p></div><div class="actions"><button class="btn btn-secondary" data-page="calendar">□ مشاهده تقویم</button><button class="btn btn-primary" data-action="add-athlete">＋ افزودن ورزشکار</button></div></div>
    <div class="grid stats-grid">
      ${stat("ورزشکار فعال", "۳۲", "↑ ۴ نفر نسبت به ماه قبل", "♙")}
      ${stat("تمرین‌های امروز", "۱۸", "۱۲ تمرین برنامه‌ریزی شده", "▣")}
      ${stat("تکمیل‌شده", "۷۲٪", "↑ ۸٪ نسبت به هفته قبل", "✓")}
      ${stat("Check-in در انتظار", "۷", "۳ مورد جدید امروز", "◌")}
    </div>
    <div class="grid main-grid">
      <div class="panel"><div class="panel-head"><h2>نیازمند توجه</h2><span class="tag danger">۴ مورد فعال</span></div><div class="attention-list">
        ${attention("رضا کریمی", "۵ روز است تمرینی ثبت نکرده", "danger", "مشاهده پروفایل")}
        ${attention("نگار رضایی", "Check-in هفتگی هنوز ارسال نشده", "warn", "ارسال یادآوری")}
        ${attention("پریسا محمدی", "نرخ پایبندی به ۵۸٪ رسیده", "warn", "بررسی روند")}
        ${attention("نیما ابراهیمی", "رکورد شخصی جدید در Back Squat", "success", "مشاهده دستاورد")}
      </div><div class="insight"><div class="insight-icon">✦</div><p><strong>بینش این هفته</strong><br>۳ ورزشکار هنوز تمرین برنامه‌ریزی‌شده امروز را کامل نکرده‌اند. یک پیام کوتاه می‌تواند شروع خوبی باشد.</p></div></div>
      <div class="panel"><div class="panel-head"><h2>برنامه امروز</h2><a class="link" data-page="calendar">همه برنامه‌ها ←</a></div><div class="schedule-list">
        ${schedule("۰۷:۰۰", "Morning Strength", "امیر حسینی · سارا احمدی", "۸ ورزشکار", "")}
        ${schedule("۱۰:۳۰", "Engine Builder", "گروه Performance", "۶ ورزشکار", "orange")}
        ${schedule("۱۷:۰۰", "Foundations W4", "محمد مرادی · ۴ نفر دیگر", "۶ ورزشکار", "")}
        ${schedule("۱۹:۳۰", "Weekly Check-in", "۷ پاسخ در انتظار", "Check-in", "orange")}
      </div></div>
      <div class="panel"><div class="panel-head"><h2>فعالیت اخیر</h2><a class="link" data-page="athletes">مشاهده همه</a></div><div class="activity-list">
        ${activity("ا ح", "<strong>امیر حسینی</strong> تمرین Morning Strength را کامل کرد", "۸ دقیقه پیش")}
        ${activity("ن ا", "<strong>نیما ابراهیمی</strong> رکورد جدید ثبت کرد: Back Squat · ۱۴۰kg", "۴۲ دقیقه پیش")}
        ${activity("س ا", "<strong>سارا احمدی</strong> Check-in هفتگی را ارسال کرد", "۱ ساعت پیش")}
        ${activity("م م", "<strong>محمد مرادی</strong> یک پیام جدید فرستاد", "۲ ساعت پیش")}
      </div></div>
    </div>`;
}
function stat(label, value, meta, icon) { return `<div class="stat-card"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon}</span></div><div class="stat-value">${value}</div><div class="stat-meta">${meta}</div></div>`; }
function attention(name, text, type, action) { return `<div class="attention-item" data-action="toast" data-message="${action} برای ${name}"><span class="attention-dot ${type}"></span><div class="item-main"><strong>${name}</strong><span>${text}</span></div><span class="item-arrow">‹</span></div>`; }
function schedule(time, title, copy, count, tone) { return `<div class="schedule-item"><div class="schedule-time">${time}</div><div class="item-main"><strong>${title}</strong><span>${copy}</span></div><span class="tag ${tone}">${count}</span></div>`; }
function activity(avatar, copy, time) { return `<div class="activity-item"><div class="activity-avatar">${avatar}</div><div class="activity-copy">${copy}<span>${time}</span></div></div>`; }

function athletesPage() {
  return `<div class="page-head"><div><div class="eyebrow">مدیریت ارتباط با ورزشکار</div><h1>ورزشکاران</h1><p class="subtitle">${athletes.length} ورزشکار در فضای کاری شما</p></div><div class="actions"><button class="btn btn-secondary" data-action="export-athletes">↓ خروجی CSV</button><button class="btn btn-primary" data-action="add-athlete">＋ افزودن ورزشکار</button></div></div>
  <div class="panel"><div class="table-toolbar"><div style="display:flex;gap:9px;flex-wrap:wrap"><input class="search" id="athlete-search" placeholder="جست‌وجوی نام یا برنامه..." /><select class="filter" id="status-filter"><option value="all">همه وضعیت‌ها</option><option value="active">فعال</option><option value="attention">نیازمند توجه</option><option value="inactive">غیرفعال</option></select></div><div class="actions"><button class="btn btn-secondary" data-action="toggle-athlete-view">▦ ${state.athleteView === "table" ? "نمای کارت" : "نمای جدول"}</button><button class="btn btn-secondary" data-action="more-athlete-filters">☷ فیلترها</button></div></div>
  ${state.athleteView === "table" ? `<div class="table-wrap"><table><thead><tr><th>ورزشکار</th><th>سطح</th><th>برنامه فعلی</th><th>پایبندی</th><th>آخرین فعالیت</th><th>وضعیت</th><th></th></tr></thead><tbody id="athletes-body">${athleteRows(athletes)}</tbody></table></div>` : `<div class="grid section-grid" id="athletes-cards">${athleteCards(athletes)}</div>`}</div>`;
}
function athleteRows(list) {
  return list.map(a => `<tr><td><div class="person"><div class="avatar">${a.initials}</div><div><strong>${a.name}</strong><div class="muted">${a.id === 1 ? "شروع از ۱۴۰۵/۰۲/۱۶" : "ورزشکار Coachly"}</div></div></div></td><td>${a.level}</td><td>${a.program}</td><td><strong>${a.compliance}%</strong></td><td class="muted">${a.last}</td><td><span class="status ${a.status}">${a.statusLabel}</span></td><td><button class="icon-btn" data-page="athlete" data-athlete-id="${a.id}" title="مشاهده پروفایل">←</button></td></tr>`).join("");
}
function athleteCards(list) {
  return list.map(a => `<div class="panel athlete-card"><div class="person"><div class="avatar">${a.initials}</div><div><strong>${a.name}</strong><div class="muted">${a.level}</div></div><span class="status ${a.status}" style="margin-right:auto">${a.statusLabel}</span></div><div class="card-row"><span>برنامه</span><strong>${a.program}</strong></div><div class="card-row"><span>پایبندی</span><strong>${a.compliance}%</strong></div><button class="btn btn-quiet" data-page="athlete" data-athlete-id="${a.id}">مشاهده پروفایل ←</button></div>`).join("");
}

function workoutsPage() {
  return `<div class="page-head"><div><div class="eyebrow">برنامه‌ریزی هوشمند</div><h1>برنامه و تمرین</h1><p class="subtitle">تمرین‌های امروز، قالب‌ها و برنامه‌های چند هفته‌ای را مدیریت کنید.</p></div><div class="actions"><button class="btn btn-secondary" data-action="view-templates">قالب‌ها</button><button class="btn btn-primary" data-action="create-workout">＋ ساخت تمرین</button></div></div>
  <div class="grid section-grid"><div class="panel"><div class="panel-head"><h2>تمرین‌های امروز</h2><span class="tag">۱۸ مورد</span></div>${workoutCard("Morning Strength", "Strength · 45 min", "۸ ورزشکار", "در حال اجرا")}${workoutCard("Engine Builder", "AMRAP · 24 min", "۶ ورزشکار", "برنامه‌ریزی‌شده")}</div><div class="panel"><div class="panel-head"><h2>برنامه‌های فعال</h2><a class="link" data-action="view-programs">همه ←</a></div>${programCard("CrossFit Foundations", "۸ هفته · ۱۲ ورزشکار", "هفته ۴ از ۸")}${programCard("Performance Track", "۱۲ هفته · ۱۴ ورزشکار", "هفته ۷ از ۱۲")}</div><div class="panel"><div class="panel-head"><h2>قالب‌های اخیر</h2><a class="link" data-action="view-templates">مشاهده همه</a></div>${templateCard("Lower Body Strength", "Strength · 6 حرکت")}${templateCard("Friday Metcon", "For Time · 5 حرکت")}</div></div>
  <div class="panel" style="margin-top:18px"><div class="panel-head"><h2>پیشنهاد سریع</h2><span class="muted" style="font-size:12px">با چند کلیک تمرین جدید بسازید</span></div><div class="workout-hero"><div><div class="eyebrow">START FROM TEMPLATE</div><h2>تمرین بعدی را آماده کنید</h2><p>از یک قالب شروع کنید و آن را برای هر ورزشکار شخصی‌سازی کنید.</p></div><button class="btn btn-secondary" data-action="create-workout">ساخت Workout ←</button></div></div>
  ${workouts.length ? `<div class="panel" style="margin-top:18px"><div class="panel-head"><h2>Workout های ساخته‌شده شما</h2><span class="tag">${workouts.length} مورد</span></div>${workouts.map(w => workoutCard(w.title, `${w.type} · ${w.duration}`, "آماده اختصاص دادن", "جدید")).join("")}</div>` : ""}`;
}
function workoutCard(title, meta, people, status) { return `<div class="attention-item" style="margin-bottom:10px"><span class="attention-dot success"></span><div class="item-main"><strong>${title}</strong><span>${meta} · ${people}</span></div><span class="tag">${status}</span></div>`; }
function programCard(title, meta, progress) { return `<div class="attention-item" style="margin-bottom:10px"><div class="stat-icon">↗</div><div class="item-main"><strong>${title}</strong><span>${meta}</span></div><span class="tag">${progress}</span></div>`; }
function templateCard(title, meta) { return `<div class="attention-item" style="margin-bottom:10px"><div class="stat-icon">▣</div><div class="item-main"><strong>${title}</strong><span>${meta}</span></div><span class="item-arrow">‹</span></div>`; }

function calendarPage() {
  const days = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
  const nums = ["۲۹", "۳۰", "۳۱", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹", "۱۰", "۱۱", "۱۲", "۱۳", "۱۴", "۱۵", "۱۶", "۱۷", "۱۸", "۱۹", "۲۰", "۲۱", "۲۲", "۲۳", "۲۴", "۲۵", "۲۶", "۲۷", "۲۸", "۲۹", "۳۰", "۳۱", "۱", "۲"];
  const monthTitle = state.calendarOffset === 0 ? "مرداد ۱۴۰۵" : state.calendarOffset > 0 ? "شهریور ۱۴۰۵" : "تیر ۱۴۰۵";
  return `<div class="page-head"><div><div class="eyebrow">تقویم ${state.calendar === "solar" ? "شمسی" : "میلادی"} · ${monthTitle}</div><h1>تقویم برنامه‌ریزی</h1><p class="subtitle">تمرین‌ها، Check-in ها و رویدادهای مهم را در یک نگاه ببینید.</p></div><div class="actions"><button class="btn btn-secondary" data-action="calendar-today">امروز</button><button class="btn btn-primary" data-action="create-workout">＋ رویداد جدید</button></div></div><div class="panel"><div class="panel-head"><div class="actions"><button class="btn btn-secondary" data-action="calendar-prev">‹</button><h2 style="min-width:160px;text-align:center">${monthTitle}</h2><button class="btn btn-secondary" data-action="calendar-next">›</button></div><div class="actions"><button class="btn ${state.calendarView === "month" ? "btn-quiet" : "btn-secondary"}" data-action="calendar-view" data-view="month">ماه</button><button class="btn ${state.calendarView === "week" ? "btn-quiet" : "btn-secondary"}" data-action="calendar-view" data-view="week">هفته</button><button class="btn ${state.calendarView === "day" ? "btn-quiet" : "btn-secondary"}" data-action="calendar-view" data-view="day">روز</button></div></div><div class="calendar">${days.map(d => `<div class="calendar-head">${d}</div>`).join("")}${nums.map((n, i) => `<div class="calendar-day ${i < 3 || i > 33 ? "muted-day" : ""} ${n === "۲۰" && state.calendarOffset === 0 ? "today" : ""}"><div class="day-number">${n}</div>${n === "۲۰" && state.calendarOffset === 0 ? '<div class="event" data-action="toast" data-message="Morning Strength باز شد">Morning Strength</div><div class="event orange" data-action="toast" data-message="Check-in ها باز شد">۷ Check-in</div>' : n === "۲۱" ? '<div class="event" data-action="toast" data-message="Engine Builder باز شد">Engine Builder</div>' : n === "۲۲" ? '<div class="event" data-action="toast" data-message="Rest Day">Rest Day</div>' : n === "۲۴" ? '<div class="event orange" data-action="toast" data-message="Team WOD باز شد">Team WOD</div>' : ""}</div>`).join("")}</div></div>`;
}

function libraryPage() {
  const exercises = [["Back Squat","Strength · هالتر","🏋️"],["Power Clean","Strength · هالتر","⚡"],["Toes-to-Bar","Gymnastics · وزن بدن","◒"],["Wall Ball","Conditioning · توپ مدیسن","◉"],["Double Under","Conditioning · طناب","〰"],["Strict Pull-up","Gymnastics · میله","◌"], ...state.customExercises];
  return `<div class="page-head"><div><div class="eyebrow">کتابخانه اختصاصی Coachly</div><h1>کتابخانه حرکات</h1><p class="subtitle">۳۸ حرکت آماده برای برنامه‌ریزی تمرین‌های CrossFit و Functional Fitness.</p></div><div class="actions"><button class="btn btn-secondary" data-action="add-exercise">＋ حرکت سفارشی</button></div></div><div class="panel"><div class="table-toolbar"><input class="search" id="exercise-search" placeholder="جست‌وجوی حرکت به فارسی یا انگلیسی..." /><div class="actions"><select class="filter" id="exercise-category"><option value="all">همه دسته‌بندی‌ها</option><option value="Strength">Strength</option><option value="Gymnastics">Gymnastics</option><option value="Conditioning">Conditioning</option></select><button class="btn btn-secondary" data-action="toggle-favorites">☆ علاقه‌مندی‌ها</button></div></div><div class="grid section-grid" id="exercise-grid">${exercises.map(e => `<div class="panel library-card" data-exercise="${e[0]}" data-category="${e[1].split(" · ")[0]}"><div class="exercise-visual">${e[2]}</div><div class="library-copy"><button class="favorite-btn ${state.favoriteExercises.has(e[0]) ? "is-favorite" : ""}" data-action="toggle-favorite" data-exercise-name="${e[0]}" aria-label="افزودن به علاقه‌مندی‌ها">${state.favoriteExercises.has(e[0]) ? "★" : "☆"}</button><span class="tag">${e[1]}</span><h3>${e[0]}</h3><p>نکات مربی‌گری، خطاهای رایج و ویدئوی آموزشی</p></div></div>`).join("")}</div></div>`;
}

function checkinsPage() {
  return `<div class="page-head"><div><div class="eyebrow">بازخورد هفتگی</div><h1>Check-in ها</h1><p class="subtitle">پاسخ‌های جدید را مرور کنید و گفت‌وگو را به موقع ادامه دهید.</p></div><button class="btn btn-primary" data-action="create-checkin">＋ ساخت فرم جدید</button></div><div class="grid main-grid"><div class="panel"><div class="panel-head"><h2>در انتظار بررسی <span class="tag danger" style="margin-right:8px">۷</span></h2><span class="muted" style="font-size:11px">مرتب‌سازی: جدیدترین</span></div>${["سارا احمدی","امیر حسینی","پریسا محمدی","نگار رضایی"].map((n,i)=>`<div class="attention-item" style="margin-bottom:10px"><div class="avatar">${initials(n)}</div><div class="item-main"><strong>${n}</strong><span>انرژی: ${i+3}/۵ · خواب: ${i+2}/۵ · ارسال ${i+1} ساعت پیش</span></div><button class="btn btn-quiet" data-action="open-checkin" data-athlete-name="${n}">بررسی</button></div>`).join("")}</div><div class="panel"><div class="panel-head"><h2>نمای کلی این هفته</h2></div><div class="stat-card" style="background:var(--surface-soft);box-shadow:none;margin-bottom:12px"><div class="stat-top"><span>نرخ پاسخ‌گویی</span><span class="tag">۸۳٪</span></div><div class="stat-value">۲۵ <small class="muted" style="font-size:12px;font-weight:400">از ۳۰ نفر</small></div></div><div class="insight" style="margin-top:0"><div class="insight-icon">◌</div><p>بیشترین موضوع این هفته: کاهش انرژی و خواب کمتر از ۷ ساعت.</p></div></div></div>`;
}

function messagesPage() {
  const conversations = ["امیر حسینی","سارا احمدی","رضا کریمی","نیما ابراهیمی"];
  return `<div class="page-head"><div><div class="eyebrow">ارتباط مستقیم</div><h1>پیام‌ها</h1><p class="subtitle">گفت‌وگوهای Coach و Athlete را در یک فضای متمرکز ادامه دهید.</p></div><button class="btn btn-primary" data-action="new-message">＋ پیام جدید</button></div><div class="grid main-grid"><div class="panel"><div class="table-toolbar"><input class="search" id="message-search" placeholder="جست‌وجوی گفتگو..." /></div><div id="conversation-list">${conversations.map((n,i)=>`<button class="attention-item conversation-item ${state.selectedConversation === n ? "selected" : ""}" data-action="select-conversation" data-conversation="${n}" style="width:100%;text-align:right;margin-bottom:10px"><div class="avatar">${initials(n)}</div><div class="item-main"><strong>${n}</strong><span>${["مرسی مربی، وزن جدید را ثبت کردم.","برای هفته بعد آماده‌ام.","در مورد زانویم یک سؤال داشتم.","رکورد امروز خیلی خوب پیش رفت!"][i]}</span></div><span class="muted" style="font-size:10px">${i+1} ساعت پیش</span></button>`).join("")}</div></div><div class="panel"><div class="panel-head"><h2>${state.selectedConversation}</h2><span class="tag">آنلاین</span></div><div class="insight" style="margin-top:0;margin-bottom:14px"><div class="insight-icon">↗</div><p><strong>متصل به Workout</strong><br>Morning Strength · Back Squat</p></div><div class="field"><textarea id="message-compose" rows="4" placeholder="پیام خود را بنویسید..."></textarea></div><div class="modal-actions"><button class="btn btn-primary" data-action="send-message">ارسال پیام</button></div></div></div>`;
}

function athletePage() {
  const movements = [["Back Squat","۵ ست × ۵ تکرار","۸۰ کیلو × ۸ · جلسه قبل"],["Strict Press","۴ ست × ۸ تکرار","۳۵ کیلو × ۸ · جلسه قبل"],["Row","۲۰۰۰ متر","۸:۱۲ · جلسه قبل"]];
  return `<div class="page-head"><div><div class="eyebrow">ATHLETE VIEW · امروز</div><h1>سلام امیر، آماده‌ای؟</h1><p class="subtitle">سه حرکت اصلی برای امروز داری. با تمرکز شروع کن.</p></div><div class="actions"><button class="btn btn-secondary" data-page="dashboard">← بازگشت به داشبورد</button></div></div><div class="workout-hero"><div><div class="eyebrow">TODAY'S WORKOUT · STRENGTH</div><h2>Morning Strength</h2><p>تمرکز امروز: قدرت پایه و کنترل حرکت</p></div><div class="hero-metric"><strong>۴۵</strong><span>دقیقه</span></div></div><div class="grid main-grid"><div class="panel"><div class="panel-head"><h2>حرکت‌های امروز</h2><span class="tag">۰ از ۳ کامل شده</span></div>${movements.map((m,i)=>`<div class="movement-row"><div class="movement-name"><strong>${m[0]}</strong><span>${m[1]}</span></div><div class="target"><strong>${m[2].split(" · ")[0]}</strong><span>${m[2].split(" · ")[1]}</span></div><button class="check ${state.completed.has(i) ? "done" : ""}" data-action="complete-movement" data-index="${i}">${state.completed.has(i) ? "✓" : "○"}</button></div>`).join("")}<div class="modal-actions"><button class="btn btn-primary" data-action="complete-workout">ثبت اتمام Workout</button></div></div><div class="panel"><div class="panel-head"><h2>یادداشت مربی</h2><span class="tag">Coach</span></div><div class="insight" style="margin-top:0"><div class="insight-icon">✦</div><p>در Back Squat، زانوها را در مسیر انگشتان پا نگه دار و بین ست‌ها حداقل ۹۰ ثانیه استراحت کن.</p></div><div style="margin-top:22px"><h3 style="margin-bottom:12px">پیشرفت این هفته</h3><div class="stat-card" style="background:var(--surface-soft);box-shadow:none"><div class="stat-top"><span>پایبندی</span><span class="stat-meta">↑ ۶٪</span></div><div class="stat-value">۹۱٪</div><div style="height:7px;background:var(--line);border-radius:20px;margin-top:9px"><div style="height:100%;width:91%;background:var(--primary);border-radius:20px"></div></div></div></div></div></div>`;
}

function render() {
  if (state.page === "dashboard") appShell(dashboard());
  else if (state.page === "athletes") appShell(athletesPage());
  else if (state.page === "workouts") appShell(workoutsPage());
  else if (state.page === "calendar") appShell(calendarPage());
  else if (state.page === "library") appShell(libraryPage());
  else if (state.page === "checkins") appShell(checkinsPage());
  else if (state.page === "messages") appShell(messagesPage());
  else if (state.page === "athlete") appShell(athletePage());
  else if (state.page === "settings") appShell(settingsPage());
  else appShell(dashboard());
}

function settingsPage() {
  return `<div class="page-head"><div><div class="eyebrow">PREFERENCES</div><h1>تنظیمات</h1><p class="subtitle">Coachly را مطابق شیوه کار خودتان تنظیم کنید.</p></div><button class="btn btn-primary" data-action="save-settings">ذخیره تغییرات</button></div>
  <div class="grid main-grid"><div class="panel"><div class="panel-head"><h2>ظاهر و زبان</h2><span class="tag">پایدار</span></div>
    <div class="attention-item" style="margin-bottom:12px"><div class="stat-icon">☼</div><div class="item-main"><strong>پوسته برنامه</strong><span>بین حالت روشن و تاریک انتخاب کنید.</span></div><button class="btn btn-secondary" data-action="theme">${state.theme === "light" ? "حالت تاریک" : "حالت روشن"}</button></div>
    <div class="attention-item" style="margin-bottom:12px"><div class="stat-icon">文</div><div class="item-main"><strong>زبان رابط</strong><span>زبان اصلی رابط کاربری Coachly.</span></div><select class="filter" id="language-select"><option value="fa" ${state.lang === "fa" ? "selected" : ""}>فارسی</option><option value="en" ${state.lang === "en" ? "selected" : ""}>English</option></select></div>
    <div class="attention-item"><div class="stat-icon">□</div><div class="item-main"><strong>نوع تقویم</strong><span>تاریخ‌ها در همه‌جا با این تقویم نمایش داده می‌شوند.</span></div><select class="filter" id="calendar-select"><option value="solar" ${state.calendar === "solar" ? "selected" : ""}>شمسی (Solar Hijri)</option><option value="gregorian" ${state.calendar === "gregorian" ? "selected" : ""}>میلادی (Gregorian)</option></select></div>
  </div><div class="panel"><div class="panel-head"><h2>حساب مربی</h2><span class="tag">Coach</span></div><div class="field"><label>نام نمایشی</label><input value="علی رحیمی" /></div><div class="field" style="margin-top:13px"><label>تخصص</label><input value="CrossFit & Functional Fitness" /></div><div class="field" style="margin-top:13px"><label>معرفی کوتاه</label><textarea rows="4">کمک به ورزشکارها برای ساختن قدرت، عادت و اعتماد به نفس.</textarea></div></div></div>`;
}

function bindEvents() {
  document.querySelectorAll("[data-page]").forEach(el => el.addEventListener("click", () => { state.page = el.dataset.page; render(); }));
  document.querySelectorAll("[data-action]").forEach(el => el.addEventListener("click", () => action(el.dataset.action, el.dataset)));
  const search = document.getElementById("athlete-search");
  const filter = document.getElementById("status-filter");
  if (search) {
    const apply = () => {
      const q = search.value.trim();
      const f = filter.value;
      const filtered = athletes.filter(a => (!q || a.name.includes(q) || a.program.toLowerCase().includes(q.toLowerCase())) && (f === "all" || a.status === f));
      const body = document.getElementById("athletes-body");
      const cards = document.getElementById("athletes-cards");
      if (body) body.innerHTML = athleteRows(filtered);
      if (cards) cards.innerHTML = athleteCards(filtered);
    };
    search.addEventListener("input", apply); filter.addEventListener("change", apply);
  }
  const exerciseSearch = document.getElementById("exercise-search");
  const exerciseCategory = document.getElementById("exercise-category");
  if (exerciseSearch && exerciseCategory) {
    const applyExercises = () => {
      const query = exerciseSearch.value.trim().toLowerCase();
      const category = exerciseCategory.value;
      document.querySelectorAll("[data-exercise]").forEach(card => {
        const matchesQuery = !query || card.dataset.exercise.toLowerCase().includes(query);
        const matchesCategory = category === "all" || card.dataset.category === category;
        card.style.display = matchesQuery && matchesCategory ? "" : "none";
      });
    };
    exerciseSearch.addEventListener("input", applyExercises);
    exerciseCategory.addEventListener("change", applyExercises);
  }
  const messageSearch = document.getElementById("message-search");
  if (messageSearch) messageSearch.addEventListener("input", () => {
    const q = messageSearch.value.trim();
    document.querySelectorAll(".conversation-item").forEach(item => { item.style.display = !q || item.dataset.conversation.includes(q) ? "" : "none"; });
  });
}
function action(type, data) {
  if (type === "theme") { state.theme = state.theme === "light" ? "dark" : "light"; document.body.classList.toggle("dark", state.theme === "dark"); localStorage.setItem("coachly-theme", state.theme); render(); }
  if (type === "notifications") toast("۳ اعلان جدید دارید");
  if (type === "toast") toast(data.message || "انجام شد");
  if (type === "add-athlete") showAddAthlete();
  if (type === "create-workout") showCreateWorkout();
  if (type === "view-templates") showTemplatesModal();
  if (type === "view-programs") toast("لیست برنامه‌های فعال در همین صفحه نمایش داده شد");
  if (type === "complete-movement") { state.completed.add(Number(data.index)); persistCompleted(); render(); }
  if (type === "complete-workout") { state.completed = new Set([0,1,2]); persistCompleted(); toast("Workout با موفقیت ثبت شد"); render(); }
  if (type === "logout") showLogout();
  if (type === "workspace-menu") showWorkspaceMenu();
  if (type === "profile-menu") state.page = "settings", render();
  if (type === "export-athletes") exportAthletes();
  if (type === "toggle-athlete-view") { state.athleteView = state.athleteView === "table" ? "cards" : "table"; render(); }
  if (type === "more-athlete-filters") toast("فیلترهای پیشرفته در نسخه بعدی با فیلتر سطح و برنامه تکمیل می‌شوند");
  if (type === "calendar-prev") { state.calendarOffset -= 1; render(); }
  if (type === "calendar-next") { state.calendarOffset += 1; render(); }
  if (type === "calendar-today") { state.calendarOffset = 0; state.calendarView = "month"; render(); toast("تقویم روی امروز تنظیم شد"); }
  if (type === "calendar-view") { state.calendarView = data.view; render(); toast(`نمای ${data.view === "month" ? "ماهانه" : data.view === "week" ? "هفتگی" : "روزانه"} فعال شد`); }
  if (type === "add-exercise") showExerciseModal();
  if (type === "toggle-favorites") { state.showFavorites = !state.showFavorites; document.querySelectorAll("[data-exercise]").forEach(card => { card.style.display = state.showFavorites && !state.favoriteExercises.has(card.dataset.exercise) ? "none" : ""; }); toast(state.showFavorites ? "فقط علاقه‌مندی‌ها نمایش داده شدند" : "همه حرکات نمایش داده شدند"); }
  if (type === "toggle-favorite") { const name = data.exerciseName; state.favoriteExercises.has(name) ? state.favoriteExercises.delete(name) : state.favoriteExercises.add(name); localStorage.setItem("coachly-favorites", JSON.stringify([...state.favoriteExercises])); render(); }
  if (type === "create-checkin") showCheckinModal();
  if (type === "open-checkin") showCheckinModal(data.athleteName);
  if (type === "new-message") showMessageModal();
  if (type === "select-conversation") { state.selectedConversation = data.conversation; render(); }
  if (type === "send-message") { const field = document.getElementById("message-compose"); if (!field?.value.trim()) return toast("ابتدا متن پیام را وارد کنید"); field.value = ""; toast(`پیام برای ${state.selectedConversation} ارسال شد`); }
  if (type === "save-settings") {
    const lang = document.getElementById("language-select")?.value || state.lang;
    const calendar = document.getElementById("calendar-select")?.value || state.calendar;
    state.lang = lang; state.calendar = calendar;
    localStorage.setItem("coachly-lang", lang); localStorage.setItem("coachly-calendar", calendar);
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    toast("تنظیمات با موفقیت ذخیره شد");
  }
}
function persistCompleted() { localStorage.setItem("coachly-completed", JSON.stringify([...state.completed])); }
function exportAthletes() {
  const rows = [["نام", "سطح", "برنامه", "پایبندی", "آخرین فعالیت", "وضعیت"], ...athletes.map(a => [a.name, a.level, a.program, `${a.compliance}%`, a.last, a.statusLabel])];
  const csv = "\uFEFF" + rows.map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  link.download = "coachly-athletes.csv"; link.click(); URL.revokeObjectURL(link.href); toast("خروجی CSV دانلود شد");
}
function showModal(inner) { const modal = document.getElementById("modal"); modal.innerHTML = `<div class="modal">${inner}</div>`; modal.classList.add("open"); modal.addEventListener("click", e => { if (e.target === modal) modal.classList.remove("open"); }, { once: true }); }
function showAddAthlete() {
  showModal(`<div class="modal-head"><div><div class="eyebrow">ATHLETE MANAGEMENT</div><h2>افزودن ورزشکار جدید</h2></div><button class="icon-btn" data-close>×</button></div><div class="form-grid"><div class="field"><label>نام</label><input id="athlete-first-name" placeholder="مثلاً امیر" /></div><div class="field"><label>نام خانوادگی</label><input id="athlete-last-name" placeholder="مثلاً حسینی" /></div><div class="field"><label>نام کاربری</label><input id="athlete-username" placeholder="amir.hosseini" /></div><div class="field"><label>رمز موقت</label><input id="athlete-password" placeholder="••••••••" /></div><div class="field"><label>سطح تمرینی</label><select id="athlete-level"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div><div class="field"><label>تاریخ شروع</label><input id="athlete-start-date" placeholder="۱۴۰۵/۰۵/۲۰" /></div><div class="field full"><label>یادداشت مربی</label><textarea id="athlete-notes" rows="3" placeholder="نکات اولیه درباره ورزشکار..."></textarea></div></div><div class="modal-actions"><button class="btn btn-secondary" data-close>انصراف</button><button class="btn btn-primary" data-submit-athlete>ساخت حساب ورزشکار</button></div>`);
  bindModalClose();
  document.querySelector("[data-submit-athlete]").addEventListener("click", () => {
    const first = document.getElementById("athlete-first-name").value.trim();
    const last = document.getElementById("athlete-last-name").value.trim();
    if (!first || !last) return toast("نام و نام خانوادگی را وارد کنید");
    const name = `${first} ${last}`;
    athletes.push({ id: Date.now(), name, initials: initials(name), level: document.getElementById("athlete-level").value, program: "بدون برنامه", compliance: 0, last: "هنوز فعالیتی ثبت نشده", status: "active", statusLabel: "جدید" });
    localStorage.setItem("coachly-athletes", JSON.stringify(athletes));
    closeModal(); state.page = "athletes"; render(); toast(`حساب ${name} ساخته شد`);
  });
}
function showCreateWorkout(templateTitle = "") {
  showModal(`<div class="modal-head"><div><div class="eyebrow">WORKOUT BUILDER</div><h2>ساخت تمرین سریع</h2></div><button class="icon-btn" data-close>×</button></div><div class="form-grid"><div class="field full"><label>عنوان تمرین</label><input id="workout-title" value="${templateTitle}" placeholder="مثلاً Friday Metcon" /></div><div class="field"><label>نوع تمرین</label><select id="workout-type"><option>Strength</option><option>AMRAP</option><option>EMOM</option><option>For Time</option></select></div><div class="field"><label>مدت تخمینی</label><input id="workout-duration" placeholder="۴۵ دقیقه" /></div><div class="field full"><label>توضیحات</label><textarea id="workout-description" rows="3" placeholder="هدف و دستورالعمل تمرین..."></textarea></div></div><div class="modal-actions"><button class="btn btn-secondary" data-close>انصراف</button><button class="btn btn-primary" data-submit-workout>ساخت Workout</button></div>`);
  bindModalClose();
  document.querySelector("[data-submit-workout]").addEventListener("click", () => {
    const title = document.getElementById("workout-title").value.trim();
    if (!title) return toast("عنوان تمرین را وارد کنید");
    workouts.push({ id: Date.now(), title, type: document.getElementById("workout-type").value, duration: document.getElementById("workout-duration").value || "۴۵ دقیقه", description: document.getElementById("workout-description").value.trim() });
    localStorage.setItem("coachly-workouts", JSON.stringify(workouts));
    closeModal(); state.page = "workouts"; render(); toast(`Workout «${title}» ساخته شد`);
  });
}
function showExerciseModal() {
  showModal(`<div class="modal-head"><div><div class="eyebrow">EXERCISE LIBRARY</div><h2>حرکت سفارشی</h2></div><button class="icon-btn" data-close>×</button></div><div class="form-grid"><div class="field"><label>نام انگلیسی</label><input id="exercise-name" placeholder="Ring Row" /></div><div class="field"><label>نام فارسی</label><input id="exercise-persian" placeholder="رینگ رو" /></div><div class="field full"><label>توضیحات</label><textarea id="exercise-description" rows="3" placeholder="توضیحات و نکات مربی‌گری..."></textarea></div></div><div class="modal-actions"><button class="btn btn-secondary" data-close>انصراف</button><button class="btn btn-primary" data-submit-exercise>افزودن به کتابخانه</button></div>`);
  bindModalClose();
  document.querySelector("[data-submit-exercise]").addEventListener("click", () => {
    const name = document.getElementById("exercise-name").value.trim();
    if (!name) return toast("نام حرکت را وارد کنید");
    state.customExercises.push([name, `Custom · ${document.getElementById("exercise-persian").value.trim() || "حرکت سفارشی"}`, "◉"]);
    localStorage.setItem("coachly-custom-exercises", JSON.stringify(state.customExercises));
    closeModal(); state.page = "library"; render(); toast(`حرکت ${name} به کتابخانه اضافه شد`);
  });
}
function showCheckinModal(athleteName = "") {
  showModal(`<div class="modal-head"><div><div class="eyebrow">WEEKLY CHECK-IN</div><h2>${athleteName ? `بررسی Check-in ${athleteName}` : "ساخت فرم Check-in"}</h2></div><button class="icon-btn" data-close>×</button></div><div class="field"><label>بازخورد مربی</label><textarea id="checkin-response" rows="5" placeholder="پاسخ، پیشنهاد یا سؤال بعدی خود را بنویسید..."></textarea></div><div class="modal-actions"><button class="btn btn-secondary" data-close>انصراف</button><button class="btn btn-primary" data-submit-checkin>${athleteName ? "ارسال پاسخ" : "ساخت فرم"}</button></div>`);
  bindModalClose();
  document.querySelector("[data-submit-checkin]").addEventListener("click", () => { if (!document.getElementById("checkin-response").value.trim()) return toast("متن بازخورد را وارد کنید"); closeModal(); toast(athleteName ? "پاسخ Check-in ارسال شد" : "فرم Check-in ساخته شد"); });
}
function showMessageModal() {
  showModal(`<div class="modal-head"><div><div class="eyebrow">MESSAGING</div><h2>پیام جدید</h2></div><button class="icon-btn" data-close>×</button></div><div class="form-grid"><div class="field full"><label>ورزشکار</label><select id="new-message-athlete">${athletes.slice(0, 6).map(a => `<option>${a.name}</option>`).join("")}</select></div><div class="field full"><label>متن پیام</label><textarea id="new-message-text" rows="4" placeholder="پیام خود را بنویسید..."></textarea></div></div><div class="modal-actions"><button class="btn btn-secondary" data-close>انصراف</button><button class="btn btn-primary" data-submit-message>ارسال پیام</button></div>`);
  bindModalClose();
  document.querySelector("[data-submit-message]").addEventListener("click", () => { const text = document.getElementById("new-message-text").value.trim(); if (!text) return toast("متن پیام را وارد کنید"); state.selectedConversation = document.getElementById("new-message-athlete").value; closeModal(); state.page = "messages"; render(); toast("پیام ارسال شد"); });
}
function bindModalClose() { document.querySelectorAll("[data-close]").forEach(el => el.addEventListener("click", closeModal)); }
function closeModal() { document.getElementById("modal")?.classList.remove("open"); }
function showLogout() { showModal(`<div class="modal-head"><h2>خروج از حساب</h2><button class="icon-btn" data-close>×</button></div><p class="subtitle">آیا مطمئن هستید که می‌خواهید از پنل خارج شوید؟</p><div class="modal-actions"><button class="btn btn-secondary" data-close>انصراف</button><button class="btn btn-primary" data-confirm-logout>خروج</button></div>`); bindModalClose(); document.querySelector("[data-confirm-logout]").addEventListener("click", () => { closeModal(); toast("از حساب خارج شدید"); }); }
function showWorkspaceMenu() { toast("فضای کاری فعلی: Coachly · علی رحیمی"); }
function showTemplatesModal() {
  showModal(`<div class="modal-head"><div><div class="eyebrow">WORKOUT TEMPLATES</div><h2>قالب‌های تمرین</h2></div><button class="icon-btn" data-close>×</button></div>${["Lower Body Strength", "Friday Metcon", "Engine Builder"].map(name => `<div class="attention-item" style="margin-bottom:10px"><div class="stat-icon">▣</div><div class="item-main"><strong>${name}</strong><span>قالب آماده برای استفاده مجدد</span></div><button class="btn btn-quiet" data-action="use-template" data-template="${name}">استفاده</button></div>`).join("")}<div class="modal-actions"><button class="btn btn-secondary" data-close>بستن</button></div>`);
  bindModalClose();
  document.querySelectorAll("[data-action='use-template']").forEach(el => el.addEventListener("click", () => { closeModal(); showCreateWorkout(el.dataset.template); }));
}
function toast(message) { const el = document.getElementById("toast"); el.textContent = message; el.classList.add("show"); clearTimeout(window.__toast); window.__toast = setTimeout(() => el.classList.remove("show"), 2800); }
document.body.classList.toggle("dark", state.theme === "dark");
document.documentElement.dir = state.lang === "fa" ? "rtl" : "ltr";
document.documentElement.lang = state.lang;
render();
