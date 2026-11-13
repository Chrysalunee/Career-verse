@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

:root {
  color-scheme: dark;
  --bg: #09130f;
  --panel: #13231d;
  --card: #1b3027;
  --line: #355447;
  --ink: #f2f8f3;
  --muted: #c0d0c7;
  --mint: #9ef0c2;
  --gold: #ffda8a;
  --focus: #ffe27a;
  --deep: #082016;
  --shadow: 0 18px 50px rgba(0,0,0,0.35);
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  min-height: 100vh;
  background: radial-gradient(ellipse at 75% -10%, #2b5b43 0, transparent 36%), radial-gradient(ellipse at 0 42%, #12291f 0, transparent 32%), var(--bg);
  color: var(--ink);
  font: 17px/1.65 'DM Sans', system-ui, sans-serif;
}
button, h1, h2, h3, .eyebrow, .brand { font-family: 'DM Sans', system-ui, sans-serif; }
button {
  font: inherit;
  color: var(--ink);
  background: #29483a;
  border: 1px solid #547767;
  border-radius: 12px;
  padding: 11px 16px;
  cursor: pointer;
  transition: transform 0.18s, background 0.18s, border-color 0.18s;
}
button:hover {
  background: #365e49;
  border-color: #86c9a1;
  transform: translateY(-2px);
}
button:focus-visible, a:focus-visible, input:focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; }
button.primary {
  background: var(--mint);
  color: #082218;
  border-color: var(--mint);
  font-weight: 800;
  box-shadow: 0 7px 20px rgba(158, 240, 194, 0.3);
}
button.primary:hover { background: #c2f8d7; }
button[data-action='study'] { width: 100%; }

.topbar {
  position: sticky;
  top: 0;
  z-index: 3;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 12px max(22px, calc((100vw - 1120px) / 2));
  border-bottom: 1px solid rgba(255,255,255,0.12);
  background: rgba(9, 19, 15, 0.94);
  backdrop-filter: blur(16px);
}
.brand {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--ink);
  text-decoration: none;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--muted);
}
.import-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.import-button input { position: absolute; inset: 0; opacity: 0; }
.skip-link {
  position: absolute;
  top: -100px;
  left: 8px;
  z-index: 10;
  padding: 8px;
  background: var(--focus);
  color: #111;
}
.skip-link:focus { top: 8px; }

.wrap {
  max-width: 1120px;
  margin: 0 auto;
  padding: 38px 22px 76px;
}
.eyebrow {
  color: var(--mint);
  font-size: 0.75rem;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  font-weight: 800;
}
.hero {
  position: relative;
  min-height: 300px;
  padding: 54px 34px 38px;
  margin-bottom: 50px;
  border: 1px solid rgba(102, 139, 113, 0.35);
  border-radius: 28px;
  overflow: hidden;
  background: linear-gradient(115deg, #183b2c 0%, #10231b 65%, #213e30 100%);
  box-shadow: var(--shadow);
}
.hero:after {
  content: '';
  position: absolute;
  width: 330px;
  height: 330px;
  right: -30px;
  top: -70px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(158,240,194,0.15), transparent 68%);
  pointer-events: none;
}
.hero h1 { max-width: 700px; }
.hero p { max-width: 650px; font-size: 1.08rem; }
.hero-art {
  position: absolute;
  right: 9%;
  top: 23%;
  font-size: clamp(5rem, 15vw, 9rem);
  opacity: 0.2;
  transform: rotate(-12deg);
}
.section-heading, .dashboard-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  margin: 10px 0 20px;
}
.section-heading h1, .section-heading h2, .dashboard-head h1 { margin: 6px 0; }
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 16px;
}
.card, .panel {
  background: linear-gradient(145deg, #1b3029, #13231e);
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 22px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}
.card { transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease; }
.card:hover {
  transform: translateY(-4px);
  border-color: #74b28d;
  box-shadow: var(--shadow);
}
.card h3 { margin: 0 0 8px; }
.card p { margin: 7px 0; }
.profession-card { position: relative; overflow: hidden; }
.profession-card:after {
  content: '';
  position: absolute;
  right: -28px;
  top: -45px;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: rgba(161, 236, 192, 0.08);
}
.card-icon { font-size: 2rem; margin-bottom: 12px; }
.card button { width: 100%; margin-top: 15px; }
.tag {
  display: inline-block;
  border: 1px solid #547767;
  border-radius: 99px;
  padding: 3px 10px;
  margin: 3px;
  color: var(--muted);
  font-size: 0.8rem;
}
.feature-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 28px;
  color: #d9eee0;
  font-size: 0.88rem;
}
.muted { color: var(--muted); }
.notice {
  border-left: 4px solid var(--mint);
  padding: 13px 17px;
  margin: 16px 0;
  border-radius: 0 12px 12px 0;
  background: rgba(26, 59, 46, 0.9);
  color: #e4f6e8;
}
.notice.warning {
  border-left-color: var(--gold);
  background: rgba(58, 49, 32, 0.95);
}
.stat-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0,1fr));
  gap: 12px;
  margin: 21px 0;
}
.stat {
  position: relative;
  background: #14251e;
  border: 1px solid #304a3c;
  border-radius: 16px;
  padding: 15px;
}
.stat span { display: block; color: var(--muted); font-size: 0.81rem; }
.stat strong { display: block; font-size: 1.23rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.stat strong small { font-size: 0.7rem; color: var(--muted); }
.stat-icon { float: right; font-size: 1.2rem; }
.money-stat { font-size: 1rem !important; }
.meter {
  height: 7px;
  background: #34443d;
  border-radius: 99px;
  overflow: hidden;
  margin-top: 8px;
}
.meter i {
  height: 100%;
  display: block;
  background: linear-gradient(90deg, #63ca91, var(--mint));
  border-radius: 99px;
}
.work-layout {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 15px;
}
.mission-card { background: linear-gradient(135deg, #214332, #162b20); }
.side-panel button { width: 100%; margin-top: 10px; }
.level-badge {
  background: linear-gradient(135deg, #cbf7d8, #72d69c);
  color: #0b2417;
  text-align: center;
  padding: 11px 17px;
  border-radius: 16px;
  font-size: 0.7rem;
  font-weight: 800;
  box-shadow: 0 8px 25px rgba(115, 212, 155, 0.3);
}
.level-badge strong { font-size: 1.7rem; }
.task-options {
  display: grid;
  gap: 10px;
  margin-top: 20px;
}
.task-options button {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  text-align: left;
  gap: 10px;
  background: #172b22;
  border-color: #3e5b4b;
  padding: 15px;
}
.task-options button:hover { background: #244534; }
.choice-index { color: var(--mint); font-weight: 800; font-size: 0.82rem; }
.choice-arrow { margin-left: auto; color: var(--mint); font-size: 1.2rem; }
.brief {
  padding: 20px;
  background: #20382c;
  border: 1px solid #41604d;
  border-radius: 16px;
  margin: 20px 0;
}
.brief h2 { margin-bottom: 0; }
.result-card {
  display: flex;
  gap: 24px;
  align-items: center;
  margin: 20px 0;
}
.score-ring {
  width: 105px;
  height: 105px;
  border: 7px solid var(--mint);
  border-radius: 50%;
  display: grid;
  place-content: center;
  text-align: center;
  box-shadow: 0 0 35px rgba(141, 240, 181, 0.2);
  flex-shrink: 0;
}
.score-ring strong { font-size: 2rem; }
.score-ring span { font-size: 0.75rem; color: var(--muted); }
.event-card { border-color: #896e38; background: linear-gradient(145deg, #342d1e, #1e251d); }
.promotion {
  border-color: #79d597;
  background: linear-gradient(135deg, #214b32, #162b20);
}
.offer-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin: 20px auto;
  padding: 24px;
  border: 1px solid #65af7d;
  border-radius: 20px;
  background: linear-gradient(145deg, #1e4932, #132b20);
  text-align: center;
  max-width: 400px;
}
.offer-card strong { font-size: 2rem; color: var(--mint); }
.timeline { border-left: 2px solid var(--line); padding-left: 22px; }
.timeline li { margin: 16px 0; color: var(--muted); }
.achievement-row { display: flex; flex-wrap: wrap; gap: 9px; }
.achievement {
  padding: 9px 13px;
  border: 1px solid #6fae83;
  border-radius: 12px;
  background: #193a28;
}
.mission-progress {
  display: flex;
  justify-content: space-between;
  max-width: 500px;
  font-size: 0.78rem;
  color: var(--mint);
  font-weight: 800;
  letter-spacing: 0.1em;
}
blockquote {
  margin: 20px 0 0;
  padding: 7px 15px;
  border-left: 3px solid var(--mint);
  color: #e2eee6;
}
hr { border: 0; border-top: 1px solid var(--line); margin: 22px 0; }
.footer {
  text-align: center;
  border-top: 1px solid rgba(255,255,255,0.12);
  padding: 24px;
  color: var(--muted);
  font-size: 0.85rem;
}
.footer a { color: var(--mint); }

@media (max-width: 750px) {
  .topbar {
    position: static;
    align-items: flex-start;
    flex-direction: column;
  }
  .wrap { padding: 24px 15px 48px; }
  .hero { padding: 35px 22px; min-height: unset; }
  .hero-art { right: 4%; top: 20%; font-size: 5rem; }
  .stat-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .work-layout { grid-template-columns: 1fr; }
  .dashboard-head, .section-heading { align-items: flex-start; flex-direction: column; }
  .result-card { flex-direction: column; align-items: flex-start; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    transition: none !important;
    animation: none !important;
  }
}
