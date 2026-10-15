"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type View = "overview" | "connection" | "messages" | "visits" | "profile";
type Language = "en" | "ja";
type IconName = View | "bell" | "shield" | "language" | "panel" | "send" | "lock" | "check" | "pin" | "calendar" | "photo" | "phone";

const navigation: { id: View; en: string; ja: string }[] = [
  { id: "overview", en: "Overview", ja: "ホーム" },
  { id: "connection", en: "Connection", ja: "つながり" },
  { id: "messages", en: "Messages", ja: "メッセージ" },
  { id: "visits", en: "Visits", ja: "訪問" },
  { id: "profile", en: "My Page", ja: "マイページ" },
];

const copy = {
  en: {
    familyAccount: "Family account",
    welcome: "Good morning, Mika.",
    welcomeText: "Here is how your mother's GENECT Buddy connection is going.",
    support: "Help & safety",
    nextVisit: "NEXT APPROVED-VENUE VISIT",
    noVisit: "Your next visit can be requested after connection progress reaches 60.",
    currentConnection: "Current connection",
    progress: "Connection progress",
    updates: "Family updates",
    membership: "Membership",
    activeMatch: "Active match",
    bridgeStandard: "Bridge Standard",
    membershipNote: "Demo membership — price and entitlements are not final.",
    profileComplete: "Profile complete",
    matchedBy: "Matched by GENECT staff",
    companion: "Companion",
    approved: "Approved & trained",
    connectionIntro: "A staff-confirmed match built around shared interests, language, and availability.",
    sharedInterests: "Shared interests",
    languages: "Languages",
    availability: "Availability",
    aboutAoi: "Aoi studies community wellbeing and enjoys listening to family stories over tea.",
    introduction: "Introduction",
    permission: "Communication permissions",
    photoOptional: "Real profile photo",
    photoOptionalText: "Optional. Each person controls whether their own photo is revealed.",
    imageSharing: "Image sharing",
    videoSharing: "Video sharing",
    callsMeetings: "Calls & meeting requests",
    available: "Available",
    locked: "Locked",
    mutualPermission: "Mutual permission required",
    formulaNote: "Progress measures reciprocal interaction. It is not a safety or trust score.",
    conversations: "qualifying conversations",
    prompts: "shared prompts",
    promptTitle: "Complete introductions together",
    promptOne: "What would you enjoy doing together?",
    promptTwo: "Which approved venue would suit you?",
    answered: "Both answered",
    answerPrompt: "Complete demo prompt",
    messagesTitle: "Messages with Aoi",
    messagesIntro: "Text chat is available for this staff-confirmed match.",
    guardianNotice: "If a linked guardian participates, their messages always show the guardian as the actual sender and do not count as the minor's progress.",
    writeMessage: "Write a message…",
    send: "Send",
    mediaLocked: "Media requires the progress threshold and mutual permission.",
    safetyMessage: "Do not share home addresses, financial information, or emergency details in chat.",
    venuesTitle: "Plan a visit",
    venuesIntro: "Choose only from active locations approved by GENECT.",
    venueApproved: "GENECT-approved venue",
    accessible: "Step-free access",
    openingHours: "Opening hours",
    capacity: "Booking limit",
    selectVenue: "Select venue",
    selected: "Selected",
    requestVisit: "Request this visit",
    meetingLocked: "Reach 60 progress before requesting a meeting.",
    eligibility: "Meeting eligibility",
    matchConfirmed: "Staff-confirmed match",
    companionApproved: "Companion approved",
    progressRequired: "Connection progress 60",
    venueRequired: "Active approved venue",
    consentRequired: "Mutual meeting permission",
    recordPermission: "Record demo mutual permission",
    closureNote: "If a venue closes or availability changes, GENECT will cancel or help reschedule. A visit is never moved to a private home.",
    visitHistory: "Visit history",
    visitEmpty: "No completed visits yet. Visit reports and consented family photos will appear here.",
    profileTitle: "Yuki's profile",
    profileIntro: "Information shared by Mika for staff-supported matching and visits.",
    familyRelationship: "Family relationship",
    daughterPayer: "Daughter · membership payer",
    olderAdultAccount: "Older adult access",
    notDecided: "Not enabled in this demo",
    preferences: "Preferences",
    routine: "Enjoys quiet mornings, tea, local history, and short craft activities.",
    accessibility: "Accessibility",
    accessibilityText: "Prefers step-free venues and seating near an entrance.",
    language: "Language",
    languageText: "Choose the interface language. User messages remain in their original language.",
    privacy: "Privacy & consent",
    privacyText: "Health and emergency information is restricted. Family payment, support, and guardian permissions are separate.",
    updateOne: "Aoi's training and identity review are complete.",
    updateTwo: "Your match was confirmed by GENECT coordinator Emi.",
    updateThree: "Complete both introduction prompts to unlock a meeting request.",
    today: "Today",
    thisWeek: "This week",
    demoOnly: "Buddy experience demo · Dummy data only",
  },
  ja: {
    familyAccount: "家族アカウント",
    welcome: "おはようございます、ミカさん。",
    welcomeText: "お母さまのGENECT Buddyでのつながりをご確認いただけます。",
    support: "ヘルプ・安全",
    nextVisit: "次回の承認会場での訪問",
    noVisit: "つながり進捗が60になると、訪問をリクエストできます。",
    currentConnection: "現在のつながり",
    progress: "つながり進捗",
    updates: "家族へのお知らせ",
    membership: "メンバーシップ",
    activeMatch: "有効なマッチ",
    bridgeStandard: "Bridge Standard",
    membershipNote: "デモプランです。料金と内容は未確定です。",
    profileComplete: "プロフィール完了",
    matchedBy: "GENECTスタッフが確認済み",
    companion: "コンパニオン",
    approved: "承認・研修済み",
    connectionIntro: "共通の興味、言語、予定をもとにスタッフが確認したマッチです。",
    sharedInterests: "共通の興味",
    languages: "言語",
    availability: "対応可能時間",
    aboutAoi: "アオイさんは地域福祉を学び、お茶を飲みながら家族の話を聞くことが好きです。",
    introduction: "紹介",
    permission: "コミュニケーション権限",
    photoOptional: "本人プロフィール写真",
    photoOptionalText: "任意です。自分の写真を公開するかは本人が決めます。",
    imageSharing: "画像共有",
    videoSharing: "動画共有",
    callsMeetings: "通話・面会リクエスト",
    available: "利用可能",
    locked: "ロック中",
    mutualPermission: "双方の許可が必要",
    formulaNote: "進捗は相互交流の目安です。安全性や信頼性の評価ではありません。",
    conversations: "成立した会話",
    prompts: "共有プロンプト",
    promptTitle: "一緒に自己紹介を進める",
    promptOne: "一緒に何を楽しみたいですか？",
    promptTwo: "どの承認会場がよいですか？",
    answered: "双方回答済み",
    answerPrompt: "デモ回答を完了",
    messagesTitle: "アオイさんとのメッセージ",
    messagesIntro: "スタッフ確認済みのつながりでテキストチャットを利用できます。",
    guardianNotice: "連携された保護者が参加する場合、送信者は必ず保護者として表示され、未成年者本人の進捗には加算されません。",
    writeMessage: "メッセージを書く…",
    send: "送信",
    mediaLocked: "メディアには進捗条件と双方の許可が必要です。",
    safetyMessage: "自宅住所、金融情報、緊急連絡先をチャットで共有しないでください。",
    venuesTitle: "訪問を計画",
    venuesIntro: "GENECTが承認した有効な会場から選択してください。",
    venueApproved: "GENECT承認会場",
    accessible: "段差のないアクセス",
    openingHours: "営業時間",
    capacity: "予約上限",
    selectVenue: "会場を選択",
    selected: "選択中",
    requestVisit: "訪問をリクエスト",
    meetingLocked: "面会リクエストには進捗60が必要です。",
    eligibility: "面会の利用条件",
    matchConfirmed: "スタッフ確認済みマッチ",
    companionApproved: "コンパニオン承認済み",
    progressRequired: "つながり進捗60",
    venueRequired: "有効な承認会場",
    consentRequired: "双方の面会許可",
    recordPermission: "デモの双方許可を記録",
    closureNote: "会場の閉鎖や予定変更時は、GENECTがキャンセルまたは再予約を支援します。個人宅へ変更することはありません。",
    visitHistory: "訪問履歴",
    visitEmpty: "完了した訪問はまだありません。訪問レポートと同意済み写真がここに表示されます。",
    profileTitle: "ユキさんのプロフィール",
    profileIntro: "スタッフによるマッチングと訪問支援のためにミカさんが共有した情報です。",
    familyRelationship: "家族関係",
    daughterPayer: "娘・メンバーシップ支払者",
    olderAdultAccount: "シニア本人のアクセス",
    notDecided: "このデモでは未設定",
    preferences: "希望",
    routine: "静かな朝、お茶、地域の歴史、短い工作活動が好きです。",
    accessibility: "アクセシビリティ",
    accessibilityText: "段差がなく、入口に近い席のある会場を希望します。",
    language: "言語",
    languageText: "表示言語を選択します。ユーザーのメッセージは元の言語のままです。",
    privacy: "プライバシーと同意",
    privacyText: "健康・緊急情報は制限されています。支払い、支援、保護者の権限は別々です。",
    updateOne: "アオイさんの研修と本人確認が完了しました。",
    updateTwo: "GENECTコーディネーターのエミさんがマッチを確認しました。",
    updateThree: "2つの紹介プロンプトを完了すると面会リクエストが利用できます。",
    today: "今日",
    thisWeek: "今週",
    demoOnly: "Buddy体験デモ・ダミーデータのみ",
  },
} as const;

const venues = [
  { id: "beppu", name: "Beppu Community Center", ja: "別府コミュニティセンター", address: "2-10 Uenoguchi, Beppu", hours: "Tue–Sat · 10:00–17:00", hoursJa: "火〜土 · 10:00〜17:00", limit: "4 pairs", limitJa: "4組" },
  { id: "university", name: "GENECT University Lounge", ja: "GENECT大学ラウンジ", address: "Jumonjibaru, Beppu", hours: "Wed & Fri · 13:00–18:00", hoursJa: "水・金 · 13:00〜18:00", limit: "6 pairs", limitJa: "6組" },
];

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    overview: <><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></>,
    connection: <><circle cx="8" cy="9" r="3"/><circle cx="17" cy="9" r="3"/><path d="M3 20c.5-3.5 2.2-5 5-5s4.5 1.5 5 5M12 20c.4-2.8 2-4.2 5-4.2 2.3 0 3.7 1.4 4 4.2"/></>,
    messages: <><path d="M4 5h16v11H9l-5 4z"/></>,
    visits: <><rect x="4" y="6" width="16" height="14" rx="2"/><path d="M8 3v6M16 3v6M4 11h16"/></>,
    profile: <><circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4.2 3.5-6.2 8-6.2s7.2 2 8 6.2"/></>,
    bell: <><path d="M6 17h12l-1.5-2V10a4.5 4.5 0 0 0-9 0v5zM10 20h4"/></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.3 8.2-8 10-4.7-1.8-8-5-8-10V6z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></>,
    language: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></>,
    panel: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/></>,
    send: <><path d="m3 11 18-8-7 18-3-7zM11 14l5-6"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    check: <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></>,
    pin: <><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11z"/><circle cx="12" cy="10" r="2"/></>,
    calendar: <><rect x="4" y="6" width="16" height="14" rx="2"/><path d="M8 3v6M16 3v6M4 11h16"/></>,
    photo: <><rect x="3" y="5" width="18" height="15" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m5 18 5-5 3 3 2-2 4 4"/></>,
    phone: <><path d="M7 3 4 5c0 7.5 6.5 14 14 14l2-3-4-3-2 2c-2.5-1-4-2.5-5-5l2-2z"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

export default function BuddyPlatform() {
  const [view, setView] = useState<View>("overview");
  const [language, setLanguage] = useState<Language>("en");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [promptCount, setPromptCount] = useState(0);
  const [photoPermission, setPhotoPermission] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState("beppu");
  const [meetingPermission, setMeetingPermission] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const c = copy[language];
  const conversations = 2;
  const progress = Math.min(60, conversations * 20 + promptCount * 10);
  const meetingReady = progress >= 60 && Boolean(selectedVenue) && meetingPermission;
  const currentVenue = venues.find((venue) => venue.id === selectedVenue) ?? venues[0];
  const pageLabel = navigation.find((item) => item.id === view)?.[language] ?? "";

  const notify = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(""), 2600);
  };

  const sendMessage = () => {
    const clean = message.trim();
    if (!clean) return;
    setMessages((current) => [...current, clean]);
    setMessage("");
    notify(language === "ja" ? "デモメッセージを送信しました" : "Demo message sent");
  };

  const completePrompt = () => {
    setPromptCount((count) => Math.min(2, count + 1));
    notify(language === "ja" ? "共有プロンプトを完了しました" : "Shared prompt completed");
  };

  const overview = useMemo(() => [
    { label: c.profileComplete, value: "100%", icon: "profile" as IconName },
    { label: c.currentConnection, value: c.activeMatch, icon: "connection" as IconName },
    { label: c.progress, value: `${progress} / 60`, icon: "shield" as IconName },
  ], [c, progress]);

  return <main className={`buddy-app${sidebarOpen ? "" : " nav-collapsed"}`}>
    <aside className="buddy-sidebar">
      <div className="sidebar-brand-row">
        <button className="buddy-brand" onClick={() => setView("overview")} aria-label="GENECT Buddy home">
          <img src="/genect-logo.png" alt=""/><span><b>GENECT</b><small>Buddy Platform</small></span>
        </button>
        <button className="icon-button collapse-button" onClick={() => setSidebarOpen(false)} aria-label="Hide navigation"><Icon name="panel"/></button>
      </div>
      <nav aria-label="Primary navigation">
        {navigation.map((item) => <button key={item.id} className={view === item.id ? "buddy-nav active" : "buddy-nav"} onClick={() => setView(item.id)} aria-current={view === item.id ? "page" : undefined}><Icon name={item.id}/><span>{item[language]}</span>{item.id === "messages" && <b>2</b>}</button>)}
      </nav>
      <div className="sidebar-lower">
        <div className="language-switch" aria-label={c.language}>
          <Icon name="language"/><button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button><button className={language === "ja" ? "active" : ""} onClick={() => setLanguage("ja")}>日本語</button>
        </div>
        <button className="support-link" onClick={() => setHelpOpen(true)}><Icon name="shield"/><span>{c.support}</span></button>
        <div className="account-card"><div className="account-avatar">M</div><div><strong>Mika Sato</strong><span>{c.familyAccount}</span></div></div>
        <small className="demo-label">{c.demoOnly}</small>
      </div>
    </aside>

    {!sidebarOpen && <button className="sidebar-reopen" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Icon name="panel"/></button>}

    <section className="buddy-shell">
      <header className="buddy-topbar">
        <button className="mobile-brand" onClick={() => setView("overview")}><img src="/genect-logo.png" alt=""/>GENECT <span>Buddy</span></button>
        <span className="page-label">{pageLabel}</span>
        <div className="topbar-actions"><div className="account-type"><span/> {c.familyAccount}</div><button className="icon-button notification-button" aria-label="Notifications" onClick={() => setView("overview")}><Icon name="bell"/><b>3</b></button><div className="top-avatar">M</div></div>
      </header>

      <div className="buddy-content">
        {view === "overview" && <>
          <section className="page-intro overview-intro"><div><span className="eyebrow">GENECT BUDDY</span><h1>{c.welcome}</h1><p>{c.welcomeText}</p></div><div className="intro-art"><div/><img src="/hero-grandmother.jpg" alt="Yuki smiling"/></div></section>

          <section className="metric-grid">{overview.map((item) => <article key={item.label}><span className="metric-icon"><Icon name={item.icon}/></span><div><small>{item.label}</small><strong>{item.value}</strong></div></article>)}</section>

          <section className="dashboard-grid">
            <article className="panel connection-summary"><div className="panel-heading"><div><span className="eyebrow">{c.currentConnection}</span><h2>Yuki & Aoi</h2></div><span className="status-pill"><i/> {c.matchedBy}</span></div><div className="people-pair"><div className="person"><img src="/hero-grandmother.jpg" alt="Yuki"/><span><b>Yuki Sato</b><small>{language === "ja" ? "シニア参加者" : "Older participant"}</small></span></div><span className="pair-line">✦</span><div className="person"><div className="illustrated-avatar">A</div><span><b>Aoi Nakamura</b><small>{c.companion}</small></span></div></div><p>{c.connectionIntro}</p><button className="text-link" onClick={() => setView("connection")}>{language === "ja" ? "つながりを見る →" : "View connection →"}</button></article>

            <article className="panel next-visit"><span className="eyebrow">{c.nextVisit}</span><div className="empty-calendar"><Icon name="calendar"/><div><h2>{progress >= 60 ? currentVenue.name : language === "ja" ? "訪問はまだありません" : "No visit requested"}</h2><p>{c.noVisit}</p></div></div><button className="secondary-button" onClick={() => setView("visits")}>{language === "ja" ? "承認会場を見る" : "View approved venues"}</button></article>
          </section>

          <section className="lower-dashboard">
            <article className="panel updates-panel"><div className="panel-heading"><div><span className="eyebrow">{c.updates}</span><h2>{language === "ja" ? "最近のお知らせ" : "Recent activity"}</h2></div></div>{[[c.updateOne,c.today],[c.updateTwo,c.thisWeek],[c.updateThree,c.thisWeek]].map(([text,date], index) => <div className="update-row" key={text}><span className="update-mark"><Icon name={index === 2 ? "lock" : "check"}/></span><div><p>{text}</p><small>{date}</small></div></div>)}</article>
            <article className="panel membership-card"><span className="eyebrow">{c.membership}</span><h2>{c.bridgeStandard}</h2><p>{c.membershipNote}</p><div className="membership-stripe"/><button className="text-link" onClick={() => setView("profile")}>{language === "ja" ? "メンバーシップを見る →" : "View membership →"}</button></article>
          </section>
        </>}

        {view === "connection" && <>
          <PageIntro eyebrow={c.currentConnection} title="Yuki & Aoi" text={c.connectionIntro}/>
          <section className="connection-layout">
            <article className="panel match-profile-card"><div className="profile-visual"><div className="illustrated-avatar large">A</div><span className="verified-badge"><Icon name="shield"/> {c.approved}</span></div><div className="profile-copy"><span className="eyebrow">{c.companion}</span><h2>Aoi Nakamura, 21</h2><p>{c.aboutAoi}</p><dl><div><dt>{c.sharedInterests}</dt><dd>{(language === "ja" ? ["地域の歴史","お茶","工作"] : ["Local history","Tea","Crafts"]).map((interest) => <span key={interest}>{interest}</span>)}</dd></div><div><dt>{c.languages}</dt><dd>日本語 · English</dd></div><div><dt>{c.availability}</dt><dd>{language === "ja" ? "水曜・金曜の午後" : "Wednesday & Friday afternoons"}</dd></div></dl></div></article>
            <article className="panel progress-panel"><div className="progress-title"><div><span className="eyebrow">{c.progress}</span><h2>{progress}<small>/60</small></h2></div><span className="status-pill"><i/> {c.activeMatch}</span></div><div className="progress-track"><span style={{ width: `${progress / 0.6}%` }}/></div><div className="progress-counts"><span><b>{conversations}/3</b>{c.conversations}</span><span><b>{promptCount}/2</b>{c.prompts}</span></div><p className="muted-note">{c.formulaNote}</p></article>
          </section>

          <section className="connection-detail-grid">
            <article className="panel prompt-panel"><span className="eyebrow">{c.introduction}</span><h2>{c.promptTitle}</h2>{[c.promptOne,c.promptTwo].map((prompt,index) => <div className="prompt-row" key={prompt}><span>{index + 1}</span><p>{prompt}</p>{index < promptCount ? <b><Icon name="check"/> {c.answered}</b> : <button onClick={completePrompt}>{c.answerPrompt}</button>}</div>)}</article>
            <article className="panel permission-panel"><span className="eyebrow">{c.permission}</span><PermissionRow icon="photo" title={c.photoOptional} note={c.photoOptionalText} unlocked={progress >= 20} active={photoPermission} action={() => setPhotoPermission((value) => !value)} language={language}/><PermissionRow icon="photo" title={c.imageSharing} note={c.mutualPermission} unlocked={progress >= 30} language={language}/><PermissionRow icon="photo" title={c.videoSharing} note={`25 MB · ${c.mutualPermission}`} unlocked={progress >= 40} language={language}/><PermissionRow icon="phone" title={c.callsMeetings} note={c.mutualPermission} unlocked={progress >= 60} language={language}/></article>
          </section>
        </>}

        {view === "messages" && <>
          <PageIntro eyebrow={language === "ja" ? "メッセージ" : "MESSAGES"} title={c.messagesTitle} text={c.messagesIntro}/>
          <section className="messages-layout">
            <aside className="conversation-list"><button className="active"><div className="illustrated-avatar small">A</div><span><strong>Aoi Nakamura</strong><small>{c.activeMatch}</small></span><b>2</b></button><button disabled><div className="illustrated-avatar small pale">E</div><span><strong>Emi · GENECT</strong><small>{language === "ja" ? "コーディネーター" : "Coordinator"}</small></span></button></aside>
            <article className="chat-panel"><header><div className="chat-person"><div className="illustrated-avatar small">A</div><div><h2>Aoi Nakamura</h2><span><i/> {c.approved}</span></div></div><button className="secondary-button" onClick={() => notify(language === "ja" ? "報告はコーディネーターが確認します" : "A coordinator will review your report")}>{language === "ja" ? "報告" : "Report"}</button></header><div className="chat-notice"><Icon name="shield"/><span>{c.safetyMessage}</span></div><div className="guardian-notice"><strong>{language === "ja" ? "送信者の表示" : "Sender identity"}</strong><p>{c.guardianNotice}</p><small>Aaronの保護者 / Aaron&apos;s Guardian</small></div><div className="thread"><div className="date-divider">{c.today}</div><div className="bubble theirs"><p>{language === "ja" ? "こんにちは、ユキさん。別府の古い写真のお話を楽しみにしています。" : "Hello Yuki. I’m looking forward to hearing about your old photographs of Beppu."}</p><span>Aoi · 10:16</span></div><div className="bubble mine"><p>{language === "ja" ? "ありがとうございます。母も楽しみにしています。" : "Thank you. My mother is looking forward to it too."}</p><span>Mika · 10:22</span></div>{messages.map((item,index) => <div className="bubble mine" key={`${item}-${index}`}><p>{item}</p><span>Mika · {language === "ja" ? "今" : "Now"}</span></div>)}</div><div className="composer-status"><span className={progress >= 30 ? "unlocked" : ""}><Icon name={progress >= 30 ? "photo" : "lock"}/>{progress >= 30 ? c.available : c.mediaLocked}</span></div><div className="composer"><button className="icon-button" disabled={progress < 30} aria-label={c.imageSharing}><Icon name="photo"/></button><input value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => event.key === "Enter" && sendMessage()} placeholder={c.writeMessage}/><button className="send-button" onClick={sendMessage} disabled={!message.trim()}><span>{c.send}</span><Icon name="send"/></button></div></article>
          </section>
        </>}

        {view === "visits" && <>
          <PageIntro eyebrow={language === "ja" ? "承認会場のみ" : "APPROVED VENUES ONLY"} title={c.venuesTitle} text={c.venuesIntro}/>
          <section className="visit-layout"><div className="venue-list">{venues.map((venue) => <article className={selectedVenue === venue.id ? "venue-card selected" : "venue-card"} key={venue.id}><div className="venue-art"><Icon name="pin"/><span>{c.venueApproved}</span></div><div><h2>{language === "ja" ? venue.ja : venue.name}</h2><p>{venue.address}</p><dl><div><dt>{c.accessible}</dt><dd>✓</dd></div><div><dt>{c.openingHours}</dt><dd>{language === "ja" ? venue.hoursJa : venue.hours}</dd></div><div><dt>{c.capacity}</dt><dd>{language === "ja" ? venue.limitJa : venue.limit}</dd></div></dl><button onClick={() => setSelectedVenue(venue.id)}>{selectedVenue === venue.id ? c.selected : c.selectVenue}</button></div></article>)}</div><aside className="panel eligibility-card"><span className="eyebrow">{c.eligibility}</span><h2>{meetingReady ? (language === "ja" ? "リクエスト可能" : "Ready to request") : progress < 60 ? c.meetingLocked : (language === "ja" ? "双方の許可が必要です" : "Mutual permission required")}</h2>{[[c.matchConfirmed,true],[c.companionApproved,true],[c.progressRequired,progress >= 60],[c.venueRequired,Boolean(selectedVenue)],[c.consentRequired,meetingPermission]].map(([label,ok]) => <div className={ok ? "eligibility-row done" : "eligibility-row"} key={String(label)}><Icon name={ok ? "check" : "lock"}/><span>{label}</span></div>)}{progress >= 60 && !meetingPermission && <button className="secondary-button permission-action" onClick={() => setMeetingPermission(true)}>{c.recordPermission}</button>}<button className="primary-button" disabled={!meetingReady} onClick={() => notify(language === "ja" ? "デモ訪問リクエストを送信しました" : "Demo visit request sent")}>{c.requestVisit}</button><p className="venue-warning"><Icon name="shield"/>{c.closureNote}</p></aside></section>
          <section className="panel visit-history"><span className="eyebrow">{c.visitHistory}</span><div className="empty-state"><Icon name="calendar"/><p>{c.visitEmpty}</p></div></section>
        </>}

        {view === "profile" && <>
          <PageIntro eyebrow={language === "ja" ? "マイページ" : "MY PAGE"} title={c.profileTitle} text={c.profileIntro}/>
          <section className="panel id-capture-entry">
            <div><span className="eyebrow">{language === "ja" ? "本人確認書類の撮影" : "ID CARD CAPTURE"}</span><h2>{language === "ja" ? "枠に合わせて、撮影。" : "Your card, clearly captured."}</h2><p>{language === "ja" ? "表面・厚み・上下の動きをカメラで撮影します。サンプルカード専用のプレビューです。" : "Capture the front, visible edge, and a gentle up-and-down movement. Sample-card preview only."}</p></div>
            <Link className="primary-button" href={`/identity?lang=${language}`}>{language === "ja" ? "撮影を始める" : "Start ID capture"} →</Link>
          </section>
          <section className="profile-layout"><article className="panel elder-profile"><div className="elder-heading"><img src="/hero-grandmother.jpg" alt="Yuki"/><div><span className="eyebrow">{language === "ja" ? "登録済みシニア" : "REGISTERED OLDER ADULT"}</span><h2>Yuki Sato</h2><p>Beppu, Oita</p></div></div><dl className="profile-details"><div><dt>{c.familyRelationship}</dt><dd>{c.daughterPayer}</dd></div><div><dt>{c.olderAdultAccount}</dt><dd>{c.notDecided}</dd></div><div><dt>{c.preferences}</dt><dd>{c.routine}</dd></div><div><dt>{c.accessibility}</dt><dd>{c.accessibilityText}</dd></div></dl></article><div className="settings-column"><article className="panel membership-card large"><span className="eyebrow">{c.membership}</span><h2>{c.bridgeStandard}</h2><p>{c.membershipNote}</p><span className="status-pill"><i/> {language === "ja" ? "デモ有効" : "Demo active"}</span></article><article className="panel setting-card"><div><Icon name="language"/><span><h3>{c.language}</h3><p>{c.languageText}</p></span></div><div className="language-switch large"><button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>English</button><button className={language === "ja" ? "active" : ""} onClick={() => setLanguage("ja")}>日本語</button></div></article><article className="panel setting-card"><div><Icon name="shield"/><span><h3>{c.privacy}</h3><p>{c.privacyText}</p></span></div><button className="text-link" onClick={() => setHelpOpen(true)}>{c.support} →</button></article></div></section>
        </>}
      </div>
    </section>

    <nav className="bottom-navigation" aria-label="Mobile navigation">{navigation.map((item) => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}><Icon name={item.id}/><span>{item[language]}</span>{item.id === "messages" && <b>2</b>}</button>)}</nav>

    {helpOpen && <div className="modal-backdrop" onClick={() => setHelpOpen(false)}><section className="support-modal" role="dialog" aria-modal="true" aria-labelledby="support-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setHelpOpen(false)} aria-label="Close">×</button><Icon name="shield"/><span className="eyebrow">GENECT SUPPORT</span><h2 id="support-title">{language === "ja" ? "いつでもサポートします。" : "We are here to help."}</h2><p>{language === "ja" ? "安全、マッチ、会場、またはアカウントについてのご質問はGENECTコーディネーターにご相談ください。緊急サービスではありません。" : "Contact a GENECT coordinator with questions about safety, matching, venues, or your account. This is not an emergency service."}</p><button className="primary-button" onClick={() => notify(language === "ja" ? "サポートリクエストを記録しました" : "Support request recorded")}>{language === "ja" ? "サポートを依頼" : "Request support"}</button></section></div>}
    {toast && <div className="buddy-toast" role="status" aria-live="polite">{toast}</div>}
  </main>;
}

function PageIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <section className="page-intro"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div></section>;
}

function PermissionRow({ icon, title, note, unlocked, active, action, language }: { icon: "photo" | "phone"; title: string; note: string; unlocked: boolean; active?: boolean; action?: () => void; language: Language }) {
  return <div className={unlocked ? "permission-row unlocked" : "permission-row"}><span><Icon name={unlocked ? icon : "lock"}/></span><div><strong>{title}</strong><small>{note}</small></div>{action && unlocked ? <button className={active ? "toggle active" : "toggle"} onClick={action} aria-pressed={active}><i/><em>{active ? (language === "ja" ? "許可済み" : "Allowed") : (language === "ja" ? "任意" : "Optional")}</em></button> : <b>{unlocked ? (language === "ja" ? "利用可能" : "Available") : (language === "ja" ? "ロック中" : "Locked")}</b>}</div>;
}
