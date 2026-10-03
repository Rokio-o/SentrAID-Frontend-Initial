import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";

type Screen =
  | "login"
  | "citizen-home"
  | "capture"
  | "processing"
  | "result"
  | "confirmation"
  | "completed-report"
  | "dashboard"
  | "incident"
  | "notifications"
  | "history"
  | "lgu";

type IconName =
  | "alert"
  | "arrow"
  | "bell"
  | "camera"
  | "check"
  | "clock"
  | "dashboard"
  | "download"
  | "file"
  | "history"
  | "image"
  | "location"
  | "logout"
  | "map"
  | "menu"
  | "notification"
  | "search"
  | "send"
  | "shield"
  | "upload"
  | "user";

// Photos are loaded from /public/samples/*.jpg (add your own Quezon City photos there).
// If a file is missing, the stock placeholder below is shown instead.
const incidentImage = "/samples/flooding.jpg";

const fallbackPhotos: Record<string, string> = {
  "/samples/accident.jpg": "https://dzrh-bucket.s3.ap-southeast-1.amazonaws.com/featuredimage/suv-crashes-into-13-vehicles-on-un-avenue-6-injured/462551869_1109885090635901_4870204170229000554_n.jpg",
  "/samples/fire-smoke.jpg": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOL2jr1FUvT_x4Z-ZJC684kWRPzTdbgF06NNbr0K-_14MEp2x13m-T2cZj&s=10",
  "/samples/road-damage.jpg": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDdNv2WP8DdvL450aPptc3X36ihPNDxySxmVEV102WBxoaNX4FkK20dIL4&s=10",
  "/samples/road-obstruction.jpg": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCtMv2eVXX741UTvG7IWjFtP4Y7sEujAkbdFScJaXk0Os7KiJ-9cvW8plS&s=10",
  "/samples/flooding.jpg": "https://media.philstar.com/photos/2025/07/21/7_2025-07-21_20-55-15.jpg",
  "/samples/structural-damage.jpg": "https://www.journaldailynewsonline.com.ph/wp-content/uploads/2025/08/he4r1era.png",
  "/samples/normal.jpg": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsIUJwrqZTHhv2icR9i57DWjLs4plUcpHfRyXdnjyxtYHe-5PqURpxKVg&s=10",
};

function Photo({ src, alt = "", className }: { src: string; alt?: string; className?: string }) {
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      onError={(e) => {
        const fallback = fallbackPhotos[src];
        if (fallback && e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
      }}
    />
  );
}

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    alert: <path d="M12 3 2.8 20h18.4L12 3Zm0 6v5m0 3h.01" />,
    arrow: <path d="m9 18 6-6-6-6" />,
    bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />,
    camera: <><path d="M4 7h3l2-3h6l2 3h3v12H4V7Z" /><circle cx="12" cy="13" r="4" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    download: <path d="M12 3v12m-5-5 5 5 5-5M4 20h16" />,
    file: <><path d="M6 3h8l4 4v14H6V3Z" /><path d="M14 3v5h5M9 13h6m-6 4h6" /></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5m4-1v5l3 2" /></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m4 18 5-5 3 3 3-3 5 5" /></>,
    logout: <path d="M9 4H5v16h4m5-12 4 4-4 4m4-4H9" />,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" /><path d="M9 3v15m6-12v15" /></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    notification: <><path d="M5 5h14v11H9l-4 4V5Z" /><path d="M9 9h6m-6 3h4" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    send: <path d="m3 11 18-8-8 18-2-8-8-2Zm8 2 4-4" />,
    shield: <><path d="M12 2 4 5v6c0 5 3.4 9 8 11 4.6-2 8-6 8-11V5l-8-3Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>,
    upload: <path d="M12 16V4m-5 5 5-5 5 5M4 20h16" />,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="logo">
      <span className="logo-name" style={{ fontSize: compact ? 22 : 32 }}>Sentr<span>AID</span></span>
    </div>
  );
}

function Button({ children, onClick, variant = "primary", icon, className = "", type = "button" }: {
  children: ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "danger" | "ghost"; icon?: IconName; className?: string; type?: "button" | "submit";
}) {
  return <button type={type} className={`btn btn-${variant} ${className}`} onClick={onClick}>{icon && <Icon name={icon} />}<span>{children}</span></button>;
}

function Badge({ children, tone = "navy" }: { children: ReactNode; tone?: "red" | "amber" | "green" | "navy" | "gray" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function PublicHeader({ onHome, onLogout }: { onHome: () => void; onLogout: () => void }) {
  return (
    <header className="public-header">
      <button className="plain-button" onClick={onHome} aria-label="Go to home"><Logo compact /></button>
      <div className="header-actions">
        <span className="secure-note"><Icon name="shield" size={17} /> Secure reporting</span>
        <button className="logout-btn" onClick={onLogout}><Icon name="logout" size={18} /> Log out</button>
      </div>
    </header>
  );
}

const recentReports = [
  { ref: "SA-2026-0841", category: "Road obstruction", location: "Commonwealth Ave.", time: "Today, 9:42 AM", status: "Responding", tone: "amber" as const, completed: false },
  { ref: "SA-2026-0838", category: "Fire / Smoke", location: "Brgy. Holy Spirit", time: "Today, 8:17 AM", status: "Received", tone: "navy" as const, completed: false },
  { ref: "SA-2026-0833", category: "Road damage", location: "Visayas Ave.", time: "Yesterday, 4:11 PM", status: "Submitted", tone: "gray" as const, completed: false },
  { ref: "SA-2026-0806", category: "Flooding", location: "Tandang Sora Ave.", time: "May 18, 2:16 PM", status: "Completed", tone: "green" as const, completed: true },
];

const accounts = [
  { email: "mariasantos@gmail.com", password: "Maria@2026", role: "resident" as const },
  { email: "juanreyes@qcdrrmo.gov.ph", password: "Responder@2026", role: "responder" as const },
];

type LoginErrors = { email?: string; password?: string; form?: string };

function Login({ onLogin }: { onLogin: (role: "resident" | "responder") => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});

  const signIn = (e: FormEvent) => {
    e.preventDefault();
    const next: LoginErrors = {};
    const mail = email.trim().toLowerCase();
    const account = accounts.find((a) => a.email === mail);
    if (!mail) next.email = "Please enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) next.email = "Enter a valid email address (e.g., name@email.com).";
    if (!password) next.password = "Please enter your password.";
    if (!next.email && !next.password) {
      if (!account) next.form = "No account found with this email address.";
      else if (account.password !== password) next.password = "Incorrect password. Please try again.";
    }
    setErrors(next);
    if (Object.keys(next).length === 0 && account) onLogin(account.role);
  };

  return (
    <main className="login-page">
      <section className="login-brand">
        <Logo />
        <div className="brand-copy">
          <Badge tone="amber">SDG 11 · Sustainable Cities</Badge>
          <h1>Faster reports.<br />Safer communities.</h1>
          <p>SentrAID connects residents and emergency teams through intelligent incident classification and coordinated response.</p>
        </div>
        <div className="flow-mini">
          <span><Icon name="camera" /> Capture</span><Icon name="arrow" />
          <span><Icon name="shield" /> Classify</span><Icon name="arrow" />
          <span><Icon name="send" /> Respond</span>
        </div>
        <p className="login-foot">Built for resilient, responsive communities in Quezon City.</p>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <div className="eyebrow">WELCOME TO SENTRAID</div>
          <h2>Sign in to continue</h2>
          <p className="muted">Your account automatically opens the correct portal.</p>
          <form onSubmit={signIn} noValidate style={{ marginTop: 24 }}>
            {errors.form && <div className="form-alert" role="alert"><Icon name="alert" size={18} />{errors.form}</div>}
            <label>Email address
              <input type="email" value={email} placeholder="Enter your email" autoComplete="off"
                className={errors.email || errors.form ? "invalid" : ""}
                onChange={(e) => { setEmail(e.target.value); setErrors({}); }} />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </label>
            <label>Password
              <div className="password-wrap">
                <input type={showPassword ? "text" : "password"} value={password} placeholder="Enter your password" autoComplete="off"
                  className={errors.password ? "invalid" : ""}
                  onChange={(e) => { setPassword(e.target.value); setErrors({}); }} />
                <button type="button" className="show-pass" onClick={() => setShowPassword((v) => !v)}>{showPassword ? "Hide" : "Show"}</button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </label>
            <div className="form-row"><label className="check-row"><input type="checkbox" /> Remember me</label><button type="button" className="text-button">Forgot password?</button></div>
            <Button type="submit" className="full" icon="arrow">Sign in securely</Button>
          </form>
        </div>
      </section>
    </main>
  );
}

function CitizenHome({ setScreen }: { setScreen: (s: Screen) => void }) {
  return (
    <div className="page-shell">
      <PublicHeader onHome={() => setScreen("citizen-home")} onLogout={() => setScreen("login")} />
      <main className="citizen-main">
        <section className="welcome-grid">
          <div>
            <div className="eyebrow">RESIDENT PORTAL</div>
            <h1>Good morning, Maria.</h1>
            <p className="lead">See something unsafe? Report it in under a minute. Your report helps responders act faster.</p>
          </div>
          <button className="report-cta" onClick={() => setScreen("capture")}><span className="cta-icon"><Icon name="camera" size={30} /></span><span><strong>Report Incident</strong><small>Capture or upload a photo</small></span><Icon name="arrow" size={25} /></button>
        </section>
        <section className="content-section">
          <div className="section-title"><div><h2>Your recent reports</h2><p>Track updates from local response teams.</p></div><Button variant="ghost">View all</Button></div>
          <div className="report-list">
            {recentReports.map((report) => (
              <button className="report-row" key={report.ref} onClick={() => setScreen(report.completed ? "completed-report" : "confirmation")}>
                <span className="report-icon"><Icon name="file" /></span>
                <span className="report-info"><strong>{report.category}</strong><small>{report.location} · {report.time}</small></span>
                <span className="ref">{report.ref}</span><Badge tone={report.tone}>{report.status}</Badge><Icon name="arrow" />
              </button>
            ))}
          </div>
        </section>
        <section className="safety-note"><Icon name="shield" size={24} /><div><strong>For life-threatening emergencies, call 911.</strong><p>SentrAID supports local incident coordination and does not replace emergency hotlines.</p></div></section>
      </main>
    </div>
  );
}

function StepHeader({ step, title, onBack, setScreen }: { step: string; title: string; onBack: () => void; setScreen: (s: Screen) => void }) {
  return (
    <>
      <PublicHeader onHome={() => setScreen("citizen-home")} onLogout={() => setScreen("login")} />
      <div className="step-header"><button className="back-button" onClick={onBack}>‹</button><div><span>{step}</span><h1>{title}</h1></div></div>
    </>
  );
}

function MapCard({ compact = false, pin }: { compact?: boolean; pin?: { x: number; y: number } }) {
  return (
    <div className={`map-card ${compact ? "compact" : ""}`} role="img" aria-label="Map showing location near Quezon Memorial Circle">
      <div className="map-road road-one" /><div className="map-road road-two" /><div className="map-road road-three" />
      <div className="map-park" /><div className="map-pin" style={pin ? { left: `${pin.x}%`, top: `${pin.y}%` } : undefined}><Icon name="location" size={24} /></div>
      {!compact && <div className="map-label"><strong>Auto-detected location</strong><span>Elliptical Rd., Diliman, Quezon City</span></div>}
    </div>
  );
}

function Capture({ setScreen }: { setScreen: (s: Screen) => void }) {
  return (
    <div className="page-shell">
      <StepHeader step="STEP 1 OF 3" title="Add incident photo" onBack={() => setScreen("citizen-home")} setScreen={setScreen} />
      <main className="form-layout">
        <section className="card capture-card">
          <div className="photo-preview">
            <Photo src={incidentImage} alt="Reported flooding on an urban street" />
            <Badge tone="green"><Icon name="check" size={14} /> Photo ready</Badge>
          </div>
          <div className="photo-actions"><Button variant="secondary" icon="camera">Take photo</Button><Button variant="secondary" icon="upload">Upload photo</Button></div>
          <p className="helper">Use a clear photo that safely shows the full incident area.</p>
        </section>
        <section className="details-column">
          <div className="card">
            <div className="card-title"><Icon name="location" /><div><h2>Incident location</h2><p>Detected from your device</p></div></div>
            <MapCard />
          </div>
          <div className="card detail-form">
            <label><span><Icon name="clock" size={18} /> Timestamp</span><input defaultValue="October 3, 2026 · 10:24 AM" /></label>
            <label><span><Icon name="file" size={18} /> Notes <small>(optional)</small></span><textarea defaultValue="Water is rising quickly and blocking the main road." /></label>
          </div>
          <Button className="full" icon="send" onClick={() => setScreen("processing")}>Submit for analysis</Button>
        </section>
      </main>
    </div>
  );
}

function Processing({ setScreen }: { setScreen: (s: Screen) => void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => setScreen("result"), 2400);
    return () => window.clearTimeout(timer);
  }, [setScreen]);
  return (
    <div className="center-screen">
      <Logo compact />
      <div className="processing-card">
        <div className="scan-image"><Photo src={incidentImage} alt="Submitted incident" /><span className="scan-line" /></div>
        <div className="ai-orbit"><Icon name="shield" size={30} /></div>
        <div className="eyebrow">SENTRAID INTELLIGENCE</div>
        <h1>Analyzing image...</h1>
        <p>Our classification model is identifying the incident type and assessing its urgency.</p>
        <div className="loading-bar"><span /></div>
        <p className="processing-state"><span /> Analyzing image with classification model...</p>
      </div>
      <p className="muted">Please keep this page open. This usually takes a few seconds.</p>
    </div>
  );
}

const classSamples = [
  { category: "Accident", confidence: 91, image: "/samples/accident.jpg" },
  { category: "Fire / Smoke", confidence: 96, image: "/samples/fire-smoke.jpg" },
  { category: "Road Damage", confidence: 88, image: "/samples/road-damage.jpg" },
  { category: "Road Obstruction", confidence: 92, image: "/samples/road-obstruction.jpg" },
  { category: "Flooding / Natural Hazard", confidence: 94, image: "/samples/flooding.jpg" },
  { category: "Structural Damage", confidence: 89, image: "/samples/structural-damage.jpg" },
  { category: "Normal / No Incident", confidence: 98, image: "/samples/normal.jpg" },
];

const whatToDo: Record<string, string[]> = {
  "Accident": ["Move to a safe distance from the road and traffic.", "Call 911 if anyone is injured.", "Do not move injured people unless there is immediate danger.", "Stay nearby so responders can reach you."],
  "Fire / Smoke": ["Move away from the fire and smoke immediately.", "Call 911 and warn people nearby.", "Cover your nose and mouth; do not use elevators.", "Do not attempt to fight a large fire."],
  "Road Damage": ["Keep clear of the damaged section.", "Warn other motorists and slow down.", "Do not attempt to repair it yourself."],
  "Road Obstruction": ["Stay clear of the obstruction.", "Use hazard lights if driving and take an alternate route.", "Do not try to remove large objects yourself."],
  "Flooding / Natural Hazard": ["Move to higher ground if the water is rising.", "Avoid walking or driving through floodwater.", "Stay away from electrical lines and wet outlets."],
  "Structural Damage": ["Leave the building if it is safe to do so.", "Do not re-enter until cleared by responders.", "Keep away from falling debris."],
  "Normal / No Incident": ["No emergency was detected in this photo.", "If something still seems wrong, add a description so responders can review it.", "You can also retake the photo with a clearer view."],
};

function Result({ setScreen }: { setScreen: (s: Screen) => void }) {
  const [sample, setSample] = useState(classSamples[5]);
  const [manual, setManual] = useState(false);
  const [manualCategory, setManualCategory] = useState("Road Obstruction");
  return (
    <div className="page-shell">
      <StepHeader step="STEP 2 OF 3" title="Review classification" onBack={() => setScreen("capture")} setScreen={setScreen} />
      <main className="result-layout">
        <section className="result-image"><Photo src={sample.image} alt={`Sample for ${sample.category}`} /><div className="image-meta"><Icon name="location" size={18} /> Elliptical Rd., Diliman, Quezon City</div></section>
        <section className="card classification-card">
          <Badge tone="green"><Icon name="check" size={14} /> Analysis complete</Badge>
          <p className="label">PREDICTED CATEGORY</p>
          <h2>{sample.category}</h2>
          <div className="confidence"><div><span>Model confidence</span><strong>{sample.confidence}%</strong></div><div className="confidence-track"><span style={{ width: `${sample.confidence}%` }} /></div></div>
          <div className={`action-card ${sample.category.startsWith("Normal") ? "calm" : ""}`}>
            <div className="action-head"><Icon name="alert" /><strong>What to do now</strong></div>
            <ol>{whatToDo[sample.category].map((step) => <li key={step}>{step}</li>)}</ol>
          </div>
          {!manual ? <div className="button-stack"><Button icon="send" onClick={() => setScreen("confirmation")}>Submit report</Button><Button variant="ghost" icon="file" onClick={() => setManual(true)}>Add description or change category</Button></div> :
            <div className="manual-fill">
              <div className="manual-heading"><div><div className="eyebrow">MANUAL REPORT FILL-UP</div><h3>Correct the classification</h3></div><button onClick={() => setManual(false)}>Close</button></div>
              <label>Incident category<select value={manualCategory} onChange={(e) => setManualCategory(e.target.value)}>{classSamples.slice(0, 7).map((item) => <option key={item.category}>{item.category}</option>)}</select></label>
              <label>Description<textarea placeholder="Describe what happened and any immediate risks..." defaultValue="The outer lane is blocked and vehicles are merging into traffic." /></label>
              <Button className="full" icon="send" onClick={() => setScreen("confirmation")}>Submit manual report</Button>
            </div>}
        </section>
        <section className="class-samples">
          <div className="section-title"><div><h2>Classification samples</h2><p>Select a sample to preview each model class.</p></div></div>
          <div className="sample-grid">{classSamples.map((item) => <button className={sample.category === item.category ? "active" : ""} key={item.category} onClick={() => { setSample(item); setManual(false); }}><Photo src={item.image} alt="" /><span>{item.category}</span><small>{item.confidence}%</small></button>)}</div>
        </section>
      </main>
    </div>
  );
}

function DataFlow() {
  const items: { icon: IconName; label: string }[] = [
    { icon: "image", label: "Photo" }, { icon: "shield", label: "ML Classification" }, { icon: "dashboard", label: "Rule Recommendation" }, { icon: "file", label: "Database" }, { icon: "bell", label: "Responder Alert" },
  ];
  return <div className="data-flow">{items.map((item, i) => <div className="flow-item" key={item.label}><span><Icon name={item.icon} /></span><small>{item.label}</small>{i < items.length - 1 && <Icon name="arrow" size={16} />}</div>)}</div>;
}

function Confirmation({ setScreen, completed = false }: { setScreen: (s: Screen) => void; completed?: boolean }) {
  const steps = ["Submitted", "Received", "Responding", "Completed"];
  return (
    <div className="page-shell">
      <PublicHeader onHome={() => setScreen("citizen-home")} onLogout={() => setScreen("login")} />
      <main className="confirmation-main">
        <div className="success-icon"><Icon name="check" size={36} /></div>
        <div className="eyebrow">{completed ? "REPORT COMPLETED" : "REPORT SUBMITTED"}</div><h1>{completed ? "This incident has been resolved." : "Your report is on its way."}</h1><p>{completed ? "Review the action taken by the Quezon City response team." : "Quezon City responders have been alerted. You can follow progress below."}</p>
        <div className="reference-card"><span>REFERENCE NUMBER</span><strong>{completed ? "SA-2026-0806" : "SA-2026-0847"}</strong><button className="text-button">Copy</button></div>
        <section className="card tracker-card">
          <div className="section-title"><div><h2>Response status</h2><p>Last updated {completed ? "May 18 at 4:36 PM" : "just now"}</p></div><Badge tone={completed ? "green" : "amber"}>{completed ? "Completed" : "Received"}</Badge></div>
          <div className="tracker">{steps.map((step, i) => <div className={`track-step ${completed || i < 2 ? "done" : ""}`} key={step}><span>{completed || i < 2 ? <Icon name="check" size={16} /> : i + 1}</span><strong>{step}</strong><small>{completed ? ["2:16 PM", "2:18 PM", "2:31 PM", "4:36 PM"][i] : i === 0 ? "10:24 AM" : i === 1 ? "10:25 AM" : "Pending"}</small></div>)}</div>
          {completed ? <div className="resolution-summary"><div className="card-title"><Icon name="check" /><div><h2>Resolution summary</h2><p>Response team completion record</p></div></div><dl><div><dt>Action taken</dt><dd>Drainage inlet cleared; standing water pumped and affected lane reopened.</dd></div><div><dt>Responder</dt><dd>Rescue Unit 4 · Juan Reyes</dd></div><div><dt>Completed</dt><dd>May 18, 2026 · 4:36 PM</dd></div></dl></div> : <div className="update-note"><Icon name="bell" /><div><strong>Report received by Quezon City DRRMO</strong><p>A responder is reviewing your report and the recommended action.</p></div></div>}
        </section>
        <Button onClick={() => setScreen("citizen-home")}>Return to home</Button>
      </main>
    </div>
  );
}

/* ---------- Responder data ---------- */
type Status = "New" | "Received" | "Responding" | "Completed" | "Forwarded";
type Priority = "Urgent" | "High" | "Medium" | "Low";
type Tone = "red" | "amber" | "green" | "navy" | "gray";

type Incident = {
  id: string; category: string; confidence: number; location: string; area: string; coords: string;
  time: string; timestamp: string; priority: Priority; source: "ML" | "Manual";
  mlSuggested?: string; notes: string; status: Status; resolution?: string; resolvedBy?: string;
  pin: { x: number; y: number };
};

const priorityTone: Record<Priority, Tone> = { Urgent: "red", High: "amber", Medium: "navy", Low: "gray" };
const statusTone: Record<Status, Tone> = { New: "gray", Received: "navy", Responding: "amber", Completed: "green", Forwarded: "navy" };
const priorityOrder: Priority[] = ["Urgent", "High", "Medium", "Low"];

const baseIncidents: Incident[] = [
  { id: "SA-2026-0847", category: "Flooding / Natural Hazard", confidence: 94, location: "Elliptical Rd., Diliman", area: "Brgy. Central, Quezon City", coords: "14.6507° N, 121.0494° E", time: "2 min ago", timestamp: "October 3, 2026 · 10:24 AM", priority: "Urgent", source: "ML", notes: "Water is rising quickly and blocking the main road.", status: "New", pin: { x: 53, y: 34 } },
  { id: "SA-2026-0846", category: "Accident", confidence: 91, location: "EDSA cor. North Ave.", area: "Brgy. Bagong Pag-asa, Quezon City", coords: "14.6568° N, 121.0323° E", time: "7 min ago", timestamp: "May 21, 2026 · 10:19 AM", priority: "Urgent", source: "ML", notes: "Two vehicles collided. One lane is blocked and a driver looks hurt.", status: "New", pin: { x: 38, y: 48 } },
  { id: "SA-2026-0838", category: "Fire / Smoke", confidence: 96, location: "Brgy. Holy Spirit", area: "Commonwealth Ave., Quezon City", coords: "14.6860° N, 121.0780° E", time: "2 hr ago", timestamp: "May 21, 2026 · 8:17 AM", priority: "Urgent", source: "ML", notes: "Thick black smoke coming from a house near the main road.", status: "Received", pin: { x: 62, y: 28 } },
  { id: "SA-2026-0841", category: "Road Obstruction", confidence: 92, location: "Commonwealth Ave.", area: "Brgy. Tandang Sora, Quezon City", coords: "14.6790° N, 121.0560° E", time: "44 min ago", timestamp: "May 21, 2026 · 9:42 AM", priority: "High", source: "ML", notes: "Fallen tree partially blocking the northbound lane.", status: "Responding", pin: { x: 45, y: 22 } },
  { id: "SA-2026-0833", category: "Road Damage", confidence: 88, location: "Visayas Ave.", area: "Brgy. Vasra, Quezon City", coords: "14.6700° N, 121.0370° E", time: "Yesterday", timestamp: "May 20, 2026 · 4:11 PM", priority: "Medium", source: "ML", notes: "Large pothole near the intersection, motorcycles are swerving.", status: "New", pin: { x: 57, y: 52 } },
  { id: "SA-2026-0840", category: "Normal / No Incident", confidence: 98, location: "Katipunan Ave.", area: "Brgy. Loyola Heights, Quezon City", coords: "14.6400° N, 121.0780° E", time: "56 min ago", timestamp: "May 21, 2026 · 9:30 AM", priority: "Low", source: "ML", notes: "Not sure if this is a problem, the road looks wet.", status: "New", pin: { x: 66, y: 60 } },
  { id: "SA-2026-0843", category: "Accident", confidence: 90, location: "Quezon Ave. cor. Scout Borromeo", area: "Brgy. Sacred Heart, Quezon City", coords: "14.6340° N, 121.0235° E", time: "May 21 · 9:18 AM", timestamp: "May 21, 2026 · 9:18 AM", priority: "High", source: "ML", notes: "Motorcycle and taxi collision, driver is conscious.", status: "Completed", resolution: "Injured rider brought to hospital; vehicles cleared and lane reopened.", resolvedBy: "EMS Unit 3 · Juan Reyes", pin: { x: 40, y: 45 } },
  { id: "SA-2026-0839", category: "Road Obstruction", confidence: 52, location: "Aurora Blvd.", area: "Brgy. Immaculate Concepcion, Quezon City", coords: "14.6215° N, 121.0540° E", time: "May 21 · 8:42 AM", timestamp: "May 21, 2026 · 8:42 AM", priority: "Medium", source: "Manual", mlSuggested: "Normal / No Incident", notes: "Construction debris spilled on the right lane.", status: "Completed", resolution: "Debris cleared and roadway reopened to traffic.", resolvedBy: "Clearing Team 5 · Juan Reyes", pin: { x: 50, y: 55 } },
  { id: "SA-2026-0831", category: "Fire / Smoke", confidence: 93, location: "Project 4", area: "Brgy. Quirino 3-A, Quezon City", coords: "14.6280° N, 121.0680° E", time: "May 20 · 7:11 PM", timestamp: "May 20, 2026 · 7:11 PM", priority: "Urgent", source: "ML", notes: "Small fire in a vacant lot, spreading to dry grass.", status: "Forwarded", pin: { x: 60, y: 50 } },
  { id: "SA-2026-0824", category: "Road Damage", confidence: 87, location: "Batasan Rd.", area: "Brgy. Batasan Hills, Quezon City", coords: "14.6810° N, 121.0970° E", time: "May 20 · 2:06 PM", timestamp: "May 20, 2026 · 2:06 PM", priority: "Medium", source: "ML", notes: "Road surface collapsed near the drainage.", status: "Completed", resolution: "Area barricaded and road surface repaired by the engineering crew.", resolvedBy: "Road Repair Crew 2 · Juan Reyes", pin: { x: 72, y: 30 } },
  { id: "SA-2026-0806", category: "Flooding / Natural Hazard", confidence: 95, location: "Tandang Sora Ave.", area: "Brgy. Tandang Sora, Quezon City", coords: "14.6760° N, 121.0430° E", time: "May 18 · 2:16 PM", timestamp: "May 18, 2026 · 2:16 PM", priority: "High", source: "ML", notes: "Knee-deep floodwater in front of the bank.", status: "Completed", resolution: "Drainage inlet cleared; standing water pumped and affected lane reopened.", resolvedBy: "Rescue Unit 4 · Juan Reyes", pin: { x: 42, y: 36 } },
];

type Rule = { rule: string; lead: string; support: string; unit: string; dispatch: string; resolution: string; steps: { t: string; d: string }[] };

const rules: Record<string, Rule> = {
  "Accident": { rule: "Collision + major road + possible injuries", lead: "QC EMS · QCPD Traffic", support: "MMDA · Nearest hospital", unit: "Ambulance 3", dispatch: "Dispatch EMS & traffic unit", resolution: "Injured persons attended to; vehicles cleared and lanes reopened.",
    steps: [{ t: "Dispatch ambulance and traffic unit", d: "Send the nearest EMS and QCPD traffic enforcers to the crash site." }, { t: "Notify MMDA for traffic management", d: "Request lane clearing and traffic diversion around the scene." }, { t: "Alert the nearest hospital", d: "Prepare the emergency room for possible incoming patients." }] },
  "Fire / Smoke": { rule: "Fire or smoke + residential area", lead: "Bureau of Fire Protection – QC", support: "QCDRRMD · Barangay Hall", unit: "Fire Truck 7", dispatch: "Dispatch fire unit", resolution: "Fire extinguished; area declared safe by the fire marshal.",
    steps: [{ t: "Dispatch fire truck", d: "Send the nearest BFP unit and request additional trucks on standby." }, { t: "Notify BFP and barangay", d: "Alert the barangay hall and fire marshal for coordination." }, { t: "Evacuate nearby structures", d: "Clear adjacent homes and keep access roads open for fire trucks." }] },
  "Road Damage": { rule: "Road damage + moderate traffic volume", lead: "QC Engineering Department", support: "MMDA · Barangay", unit: "Road Repair Crew 2", dispatch: "Dispatch road crew", resolution: "Hazard barricaded and road repaired by the engineering crew.",
    steps: [{ t: "Place warning signs and barricades", d: "Mark the damaged section to protect motorists." }, { t: "Create a road repair work order", d: "Forward the report to the City Engineering Department for inspection." }, { t: "Schedule permanent repair", d: "Assign a repair crew based on severity and traffic volume." }] },
  "Road Obstruction": { rule: "Obstruction + major road", lead: "MMDA · QC Traffic Management", support: "Barangay · QCPD", unit: "Clearing Team 5", dispatch: "Dispatch clearing team", resolution: "Obstruction removed and roadway reopened to traffic.",
    steps: [{ t: "Dispatch clearing team", d: "Send personnel with equipment to remove the obstruction." }, { t: "Divert traffic", d: "Coordinate with MMDA for alternate routes while clearing is ongoing." }, { t: "Verify the road is clear", d: "Confirm normal traffic flow before closing the report." }] },
  "Flooding / Natural Hazard": { rule: "Rainfall + road flooding + major thoroughfare", lead: "Quezon City DRRMD", support: "MMDA · Barangay", unit: "Rescue Unit 4", dispatch: "Dispatch flood response unit", resolution: "Drainage inlet cleared; standing water pumped and affected lane reopened.",
    steps: [{ t: "Dispatch flood response unit", d: "Send the nearest QCDRRMD rescue vehicle to verify water depth." }, { t: "Notify Barangay & MMDA", d: "Initiate traffic diversion for the affected lane." }, { t: "Prepare evacuation support", d: "Alert the nearby barangay hall if water reaches a critical level." }] },
  "Structural Damage": { rule: "Structural damage + occupied building", lead: "Office of the Building Official", support: "QCDRRMD · BFP", unit: "Rescue Unit 2", dispatch: "Dispatch building inspector", resolution: "Building evacuated and inspected; unsafe areas cordoned off.",
    steps: [{ t: "Evacuate and cordon the building", d: "Move occupants to safety and block access to damaged sections." }, { t: "Send a building official or engineer", d: "Assess structural integrity before anyone re-enters." }, { t: "Prepare rescue support", d: "Keep a rescue team on standby in case occupants are trapped." }] },
  "Normal / No Incident": { rule: "No incident detected (high confidence)", lead: "QC Command Center", support: "None required", unit: "No unit needed", dispatch: "Dismiss: no incident", resolution: "Reviewed by responder. No incident found.",
    steps: [{ t: "No dispatch required", d: "The classifier detected no emergency in the submitted photo." }, { t: "Review the resident's notes", d: "Check the description in case the photo does not show the issue." }, { t: "Notify the resident", d: "Ask for a clearer photo if the concern is still present." }] },
};

const photoFor = (category: string) => classSamples.find((c) => c.category === category)?.image ?? incidentImage;
const shortTime = (ts: string) => ts.replace(", 2026", "");

type RProps = {
  setScreen: (s: Screen) => void;
  incidents: Incident[];
  selected: Incident;
  open: (id: string, to?: Screen) => void;
  update: (id: string, patch: Partial<Incident>) => void;
};

const nav: { screen: Screen; label: string; icon: IconName }[] = [
  { screen: "dashboard", label: "Dashboard", icon: "dashboard" }, { screen: "incident", label: "Incidents", icon: "alert" }, { screen: "dashboard", label: "Map", icon: "map" }, { screen: "notifications", label: "Notifications", icon: "notification" }, { screen: "history", label: "History", icon: "history" },
];

function ResponderShell({ screen, setScreen, children }: { screen: Screen; setScreen: (s: Screen) => void; children: ReactNode }) {
  return (
    <div className="responder-shell">
      <aside className="sidebar">
        <Logo compact />
        <div className="portal-label">RESPONDER PORTAL</div>
        <nav>{nav.map((item, index) => <button key={`${item.label}-${index}`} className={screen === item.screen && item.label !== "Map" ? "active" : ""} onClick={() => setScreen(item.screen)}><Icon name={item.icon} /><span>{item.label}</span>{item.label === "Notifications" && <b>3</b>}</button>)}</nav>
        <div className="side-profile"><span>JR</span><div><strong>Juan Reyes</strong><small>QCDRRMO · Unit 4</small></div><button onClick={() => setScreen("login")} aria-label="Log out"><Icon name="logout" size={18} /></button></div>
      </aside>
      <div className="responder-content">
        <header className="responder-topbar"><div className="mobile-brand"><Logo compact /></div><div className="topbar-status"><span /><strong>Operations online</strong><small>Quezon City · October 3, 2026</small></div><button className="bell-button" onClick={() => setScreen("notifications")}><Icon name="bell" /><b>3</b></button></header>
        {children}
      </div>
    </div>
  );
}

function Dashboard({ setScreen, incidents, open }: RProps) {
  const active = incidents
    .filter((i) => i.status !== "Completed" && i.status !== "Forwarded")
    .sort((a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority));
  const count = (cats: string[]) => active.filter((i) => cats.includes(i.category));
  const cards = [
    { label: "Fire / Smoke", list: count(["Fire / Smoke"]), icon: "alert" as IconName },
    { label: "Flooding / Hazard", list: count(["Flooding / Natural Hazard"]), icon: "map" as IconName },
    { label: "Road incidents", list: count(["Accident", "Road Damage", "Road Obstruction"]), icon: "location" as IconName },
  ];
  return (
    <ResponderShell screen="dashboard" setScreen={setScreen}>
      <main className="responder-main">
        <div className="dashboard-heading"><div><div className="eyebrow">LIVE OPERATIONS</div><h1>Incident dashboard</h1><p>Monitor and coordinate active reports across Quezon City.</p></div><Button variant="secondary" icon="map">Open live map</Button></div>
        <section className="summary-grid">
          {cards.map((c) => {
            const urgent = c.list.filter((i) => i.priority === "Urgent").length;
            return (
              <div className={`summary-card ${urgent ? "urgent" : ""}`} key={c.label}>
                <span><Icon name={c.icon} /></span>
                <div><strong>{c.list.length}</strong><small>{c.label}</small></div>
                <em>{urgent ? `${urgent} urgent` : c.list.length ? "No urgent" : "None active"}</em>
              </div>
            );
          })}
        </section>
        <section className="dashboard-grid">
          <div className="card live-list">
            <div className="section-title"><div><h2>Live incidents</h2><p>Sorted by priority · click an incident to view its details</p></div><Badge tone="green"><span className="live-dot" /> Live</Badge></div>
            {active.map((incident) => (
              <button className="incident-row" key={incident.id} onClick={() => open(incident.id)}>
                <span className={`priority-line ${priorityTone[incident.priority]}`} />
                <Photo className="incident-thumb" src={photoFor(incident.category)} alt="" />
                <span className="incident-copy">
                  <span><Badge tone={priorityTone[incident.priority]}>{incident.priority}</Badge><Badge tone={statusTone[incident.status]}>{incident.status}</Badge><small>{incident.id}</small></span>
                  <strong>{incident.category}</strong>
                  <small><Icon name="location" size={14} />{incident.location}<i>·</i><Icon name="clock" size={14} />{incident.time}</small>
                </span>
                <Icon name="arrow" />
              </button>
            ))}
          </div>
          <div className="card map-panel"><div className="section-title"><div><h2>Active incident map</h2><p>{active.length} active incidents</p></div></div><MapCard compact />
            <div className="map-legend"><span><i className="red" />Urgent</span><span><i className="amber" />High</span><span><i className="navy" />Medium</span></div></div>
        </section>
      </main>
    </ResponderShell>
  );
}

function IncidentDetails({ setScreen, selected: inc, update }: RProps) {
  const rule = rules[inc.category];
  const [completing, setCompleting] = useState(false);
  const [summary, setSummary] = useState(rule.resolution);
  const [by, setBy] = useState("Rescue Unit 4 · Juan Reyes");
  const done = inc.status === "Completed";
  const isNormal = inc.category === "Normal / No Incident";
  const primary = () => {
    if (isNormal) update(inc.id, { status: "Completed", resolution: rule.resolution, resolvedBy: "QC Command Center · Juan Reyes" });
    else update(inc.id, { status: "Responding" });
  };
  return (
    <ResponderShell screen="incident" setScreen={setScreen}>
      <main className="responder-main">
        <button className="breadcrumb" onClick={() => setScreen("dashboard")}>‹ Back to incidents</button>
        <div className="incident-heading"><div><span><Badge tone={priorityTone[inc.priority]}>{inc.priority}</Badge><small>{inc.id}</small></span><h1>{inc.category}</h1><p>Reported {inc.time.toLowerCase()} by a verified resident</p></div><Badge tone={statusTone[inc.status]}>{inc.status === "New" ? "Awaiting dispatch" : inc.status}</Badge></div>
        <div className="incident-detail-grid">
          <section className="detail-left">
            <div className="incident-photo"><Photo src={photoFor(inc.category)} alt={`${inc.category} submitted by resident`} /><span>Resident submitted image</span></div>
            <div className="card info-grid">
              <div>
                <span>{inc.source === "ML" ? "ML CLASSIFICATION" : "RESIDENT-CORRECTED CATEGORY"}</span>
                <strong>{inc.category}</strong>
                {inc.source === "ML"
                  ? <div className="mini-confidence"><i style={{ background: `linear-gradient(90deg,var(--green) ${inc.confidence}%,#ddd ${inc.confidence}%)` }} /><small>{inc.confidence}% confidence</small></div>
                  : <small>ML suggested “{inc.mlSuggested}” ({inc.confidence}%). Corrected manually by the resident.</small>}
              </div>
              <div><span>TIMESTAMP</span><strong>{inc.timestamp}</strong><small>Received {inc.time.toLowerCase()}</small></div>
              <div><span>LOCATION</span><strong>{inc.location}</strong><small>{inc.area}</small></div>
              <div><span>RESIDENT NOTES</span><strong>{inc.notes}</strong><small>Report source: {inc.source === "ML" ? "ML classification" : "Manual report"}</small></div>
            </div>
            <div className="card"><div className="card-title"><Icon name="map" /><div><h2>Incident location</h2><p>{inc.coords} (sample coordinates)</p></div></div><MapCard compact pin={inc.pin} /></div>
          </section>
          <aside className="recommend-column">
            <div className="recommend-card">
              <div className="recommend-head"><span><Icon name="shield" /></span><div><div className="eyebrow">RULE INFERENCE ENGINE</div><h2>Recommended response</h2></div></div>
              <p>Based on category, confidence, location, and reported conditions:</p>
              <ol>{rule.steps.map((s, i) => <li key={s.t}><span>{i + 1}</span><div><strong>{s.t}</strong><small>{s.d}</small></div></li>)}</ol>
              <div className="rule-note"><Icon name="alert" /><span><strong>Rule triggered</strong>{rule.rule}</span></div>
            </div>
            {!done && <Button className="full" icon="send" onClick={primary}>{inc.status === "Responding" && !isNormal ? "Unit dispatched ✓" : rule.dispatch}</Button>}
            <Button className="full" variant="secondary" icon="file" onClick={() => setScreen("lgu")}>Forward to LGU</Button>
            {!done && <Button className="full" variant="ghost" icon="check" onClick={() => setCompleting(true)}>Mark Completed</Button>}
            {completing && !done && <div className="card completion-form"><div className="card-title"><Icon name="check" /><div><h2>Completion notes</h2><p>Required for the resident record</p></div></div><label>Resolution summary<textarea value={summary} onChange={(e) => setSummary(e.target.value)} /></label><label>Completed by<input value={by} onChange={(e) => setBy(e.target.value)} /></label><Button className="full" icon="check" onClick={() => { update(inc.id, { status: "Completed", resolution: summary, resolvedBy: by }); setCompleting(false); }}>Save & notify resident</Button></div>}
            {done && <div className="resolution-inline"><Icon name="check" /><div><strong>Incident completed</strong><small>{inc.resolution}</small><small>{inc.resolvedBy}</small></div></div>}
          </aside>
        </div>
      </main>
    </ResponderShell>
  );
}

function Notifications({ setScreen, open }: RProps) {
  type Note = { tab: string; tone: Tone; label: string; time: string; title: string; text: string; id: string; unread: boolean; urgent?: boolean; icon: IconName };
  const notes: Note[] = [
    { tab: "Urgent", tone: "red", label: "Urgent", time: "2 min ago", title: "New flooding report requires review", text: "Elliptical Rd., Diliman · ML confidence 94%. Rule triggered for a major thoroughfare.", id: "SA-2026-0847", unread: true, urgent: true, icon: "alert" },
    { tab: "Urgent", tone: "red", label: "Urgent", time: "7 min ago", title: "New accident report requires review", text: "EDSA cor. North Ave. · ML confidence 91%. Possible injuries reported.", id: "SA-2026-0846", unread: true, urgent: true, icon: "alert" },
    { tab: "Assignments", tone: "amber", label: "Assignment", time: "1 hr ago", title: "Fire Truck 7 dispatched to fire report", text: "Brgy. Holy Spirit · Estimated arrival in 6 minutes.", id: "SA-2026-0838", unread: true, icon: "send" },
    { tab: "Updates", tone: "navy", label: "New report", time: "44 min ago", title: "Road obstruction classified", text: "Commonwealth Ave. · Fallen tree partially blocking the northbound lane.", id: "SA-2026-0841", unread: false, icon: "file" },
    { tab: "Updates", tone: "green", label: "Completed", time: "3 hr ago", title: "Incident SA-2026-0839 completed", text: "Debris cleared from Aurora Boulevard. Roadway is now open.", id: "SA-2026-0839", unread: false, icon: "check" },
  ];
  const [tab, setTab] = useState("All");
  const shown = notes.filter((n) => tab === "All" || n.tab === tab);
  return (
    <ResponderShell screen="notifications" setScreen={setScreen}>
      <main className="responder-main narrow-page">
        <div className="dashboard-heading"><div><div className="eyebrow">ALERT CENTER</div><h1>Notifications</h1><p>New reports, urgent escalations, and response updates.</p></div><button className="text-button">Mark all as read</button></div>
        <div className="filter-tabs">{["All", "Urgent", "Assignments", "Updates"].map((t) => <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>{t}{t === "All" && <b>3</b>}</button>)}</div>
        <section className="notification-list">
          {shown.map((n) => (
            <button key={n.id + n.title} className={`notification-card ${n.unread ? "unread" : ""} ${n.urgent ? "urgent" : ""}`} onClick={() => open(n.id)}>
              <span className={`notice-icon ${n.tone === "green" ? "success" : ""}`}><Icon name={n.icon} /></span>
              <div><span><Badge tone={n.tone}>{n.label}</Badge><small>{n.time}</small></span><h2>{n.title}</h2><p>{n.text}</p><strong>View incident <Icon name="arrow" size={15} /></strong></div>
            </button>
          ))}
        </section>
      </main>
    </ResponderShell>
  );
}

function History({ setScreen, incidents, open }: RProps) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [stat, setStat] = useState("all");
  const records = incidents.filter((i) => i.status === "Completed" || i.status === "Forwarded");
  const rows = records.filter((r) =>
    (cat === "all" || r.category === cat) && (stat === "all" || r.status === stat) &&
    `${r.id} ${r.category} ${r.location}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <ResponderShell screen="history" setScreen={setScreen}>
      <main className="responder-main">
        <div className="dashboard-heading"><div><div className="eyebrow">RECORDS</div><h1>Incident history</h1><p>Search and review stored incident reports.</p></div><Button icon="download">Export report</Button></div>
        <div className="flow-caption">HOW A REPORT MOVES THROUGH SENTRAID</div>
        <DataFlow />
        <section className="card history-card">
          <div className="table-tools">
            <label className="search-box"><Icon name="search" /><input placeholder="Search ID, category, location..." value={query} onChange={(e) => setQuery(e.target.value)} /></label>
            <select value={cat} onChange={(e) => setCat(e.target.value)}><option value="all">All categories</option>{classSamples.map((c) => <option key={c.category} value={c.category}>{c.category}</option>)}</select>
            <select defaultValue="30"><option value="30">Last 30 days</option><option>Last 7 days</option></select>
            <select value={stat} onChange={(e) => setStat(e.target.value)}><option value="all">All statuses</option><option>Completed</option><option>Forwarded</option></select>
          </div>
          <div className="table-wrap"><table><thead><tr><th>ID</th><th>Image</th><th>Category</th><th>Source</th><th>Location</th><th>Time</th><th>Status</th></tr></thead><tbody>
            {rows.map((row) => <tr key={row.id} onClick={() => open(row.id)} className="clickable-row"><td><strong>{row.id}</strong></td><td><Photo className="table-image" src={photoFor(row.category)} alt="" /></td><td>{row.category}</td><td><Badge tone={row.source === "ML" ? "navy" : "gray"}>{row.source}</Badge></td><td><span className="location-cell"><Icon name="location" size={15} />{row.location}</span></td><td>{shortTime(row.timestamp)}</td><td><Badge tone={statusTone[row.status]}>{row.status}</Badge></td></tr>)}
            {rows.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--muted)" }}>No records match your filters.</td></tr>}
          </tbody></table></div>
          <div className="table-foot"><span>Showing {rows.length ? `1–${rows.length}` : 0} of {rows.length} stored reports</span><div><button disabled>‹</button><button className="active">1</button><button disabled>›</button></div></div>
        </section>
      </main>
    </ResponderShell>
  );
}

function LGUView({ setScreen, selected: inc, update }: RProps) {
  const rule = rules[inc.category];
  const forwarded = inc.status === "Forwarded";
  return (
    <ResponderShell screen="incident" setScreen={setScreen}>
      <main className="responder-main report-view">
        <button className="breadcrumb" onClick={() => setScreen("incident")}>‹ Back to incident</button>
        <section className="lgu-document">
          <header><div><Logo compact /><span>QUEZON CITY INCIDENT COORDINATION</span></div><Badge tone="navy">LGU COPY</Badge></header>
          <div className="document-title"><div><div className="eyebrow">STRUCTURED INCIDENT REPORT</div><h1>{inc.category}</h1><p>Report {inc.id} · Generated {inc.timestamp}</p></div><Badge tone={priorityTone[inc.priority]}>{inc.priority} priority</Badge></div>
          <div className="document-grid">
            <section><h2>Incident summary</h2><dl>
              <div><dt>Category</dt><dd>{inc.category}</dd></div>
              <div><dt>Location</dt><dd>{inc.location}, {inc.area}</dd></div>
              <div><dt>Coordinates</dt><dd>{inc.coords}</dd></div>
              <div><dt>Reported</dt><dd>{inc.timestamp}</dd></div>
              <div><dt>Classification</dt><dd>{inc.source === "ML" ? `ML · ${inc.confidence}% confidence` : `Manual (ML suggested ${inc.mlSuggested})`}</dd></div>
              <div><dt>Resident notes</dt><dd>{inc.notes}</dd></div>
            </dl></section>
            <Photo src={photoFor(inc.category)} alt={`Incident evidence: ${inc.category}`} />
          </div>
          <section className="document-section"><h2>Rule-based response recommendation</h2><div className="recommend-summary"><Icon name="shield" /><ol>{rule.steps.map((s) => <li key={s.t}>{s.t}: {s.d}</li>)}</ol></div></section>
          <section className="document-section"><h2>Coordination status</h2><div className="coordination-grid">
            <div><span>LEAD AGENCY</span><strong>{rule.lead}</strong><small>{inc.status === "New" ? "Awaiting dispatch" : inc.status}</small></div>
            <div><span>SUPPORT AGENCIES</span><strong>{rule.support}</strong><small>{forwarded ? "Notified" : "Notification pending"}</small></div>
            <div><span>ASSIGNED UNIT</span><strong>{inc.status === "New" || inc.status === "Received" ? "Unassigned" : rule.unit}</strong><small>Nearest unit: {rule.unit}</small></div>
          </div></section>
          <footer><span>Generated by SentrAID · Intelligent Emergency Incident Reporting</span><span>Page 1 of 1</span></footer>
        </section>
        {forwarded && <div className="forward-banner"><Icon name="check" size={18} /> This report has been forwarded to the LGU desk.</div>}
        <div className="document-actions"><Button variant="secondary" icon="download">Download PDF</Button>{!forwarded && inc.status !== "Completed" && <Button icon="send" onClick={() => update(inc.id, { status: "Forwarded" })}>Forward to LGU desk</Button>}</div>
      </main>
    </ResponderShell>
  );
}

const residentScreens: Screen[] = ["citizen-home", "capture", "processing", "result", "confirmation", "completed-report"];
const responderScreens: Screen[] = ["dashboard", "incident", "notifications", "history", "lgu"];

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [role, setRole] = useState<"resident" | "responder" | null>(null);
  const [overrides, setOverrides] = useState<Record<string, Partial<Incident>>>({});
  const [selectedId, setSelectedId] = useState(baseIncidents[0].id);

  const incidents = useMemo(() => baseIncidents.map((i) => ({ ...i, ...overrides[i.id] })), [overrides]);
  const selected = incidents.find((i) => i.id === selectedId) ?? incidents[0];

  const navigate = useCallback((next: Screen) => {
    if (next === "login") { setRole(null); setScreen("login"); return; }
    const allowed = role === "resident" ? residentScreens : role === "responder" ? responderScreens : [];
    if (allowed.includes(next)) setScreen(next);
  }, [role]);

  const open = useCallback((id: string, to: Screen = "incident") => { setSelectedId(id); navigate(to); }, [navigate]);
  const update = useCallback((id: string, patch: Partial<Incident>) => setOverrides((o) => ({ ...o, [id]: { ...o[id], ...patch } })), []);

  const handleLogin = (r: "resident" | "responder") => {
    setRole(r);
    setScreen(r === "resident" ? "citizen-home" : "dashboard");
  };

  const rp: RProps = { setScreen: navigate, incidents, selected, open, update };

  if (!role || screen === "login") return <Login onLogin={handleLogin} />;
  if (screen === "citizen-home") return <CitizenHome setScreen={navigate} />;
  if (screen === "capture") return <Capture setScreen={navigate} />;
  if (screen === "processing") return <Processing setScreen={navigate} />;
  if (screen === "result") return <Result setScreen={navigate} />;
  if (screen === "confirmation") return <Confirmation setScreen={navigate} />;
  if (screen === "completed-report") return <Confirmation setScreen={navigate} completed />;
  if (screen === "dashboard") return <Dashboard {...rp} />;
  if (screen === "incident") return <IncidentDetails key={selected.id} {...rp} />;
  if (screen === "notifications") return <Notifications {...rp} />;
  if (screen === "history") return <History {...rp} />;
  return <LGUView key={selected.id} {...rp} />;
}
