const Config = {
  formsubmit: {
    endpoint: "https://formsubmit.co/ajax/",
    email: "rivkirmx@gmail.com",
    subject: "jawaban birthday questions dari zyan 💙"
  },
  timing: {
    pageFade: 480,
    questionFade: 300,
    endingStep: 1300,
    minLoading: 1400
  }
};

const Questions = [
  {
    id: "q1", type: "multi",
    text: "kalau lagi ulang tahun, kamu paling seneng kalau…",
    options: ["💌 dikasih ucapan panjang", "🎁 dikasih hadiah", "🌷 dikasih sesuatu yang kamu suka", "🤍 diinget dan diperhatiin"]
  },
  {
    id: "q2", type: "multi",
    text: "kalau lagi ngobrol sama seseorang, kamu lebih suka…",
    options: ["💬 chat panjang", "📞 call", "🎙️ voice note", "🤍 chat singkat tapi sering"]
  },
  {
    id: "q3", type: "multi",
    text: "kalau lagi bad mood, kamu lebih suka…",
    options: ["💬 ditemenin ngobrol", "🤍 dikasih waktu sendiri", "🫂 ada yang nemenin tanpa banyak nanya", "💌 ditanyain kabarnya"]
  },
  {
    id: "q4", type: "multi",
    text: "kalau ada orang yang bikin kamu nyaman, kamu lebih suka dia…",
    options: ["💬 sering ngajak ngobrol", "🤍 perhatian lewat hal-hal kecil", "💌 jadi tempat cerita", "🫂 nggak banyak nanya tapi selalu ada"]
  },
  {
    id: "q5", type: "multi",
    text: "menurut kamu, yang bikin seseorang jadi deket itu apa sih?",
    options: ["💬 sering ngobrol", "😂 sering bercanda", "💌 saling cerita", "🤍 saling perhatian"]
  },
  {
    id: "q6", type: "multi",
    text: "kalau tiba-tiba ngobrol lagi sama seseorang dari masa lalu…",
    options: ["biasa ajaa", "seneng", "jadi nostalgia", "🤭 malah nyaman lagi"]
  },
  {
    id: "q7", type: "multi",
    text: "kalau seseorang dari masa lalu ternyata masih bikin kamu nyaman…",
    options: ["yaudah temenan ajaa", "seru juga kalau ngobrol lagi", "mungkin masih ada rasa", "🤭 coba liat aja arahnya gimanaa"]
  },
  {
    id: "q8", type: "single",
    text: "nahh kalau soal hadiah ulang tahun, kamu paling mau yang mana?",
    options: ["🍵 susu matcha", "🍫 cokelat", "🍟 dijajanin", "🤭 mau aku ajaa?"]
  },
  {
    id: "q9", type: "text",
    text: "okee, pertanyaan terakhir nihh… ada sesuatu yang pengen kamu bilang ke orang yang bikin web ini?",
    placeholder: "tulis di sini yaa…"
  }
];

const Messages = {
  choose: "pilih dulu yaa 🤭",
  write: "tulis dulu yaa 🤭",
  failed: "yah, belum kekirim. coba lagi yaa"
};

const Nav = {
  current: null,
  busy: false,

  init() {
    this.current = document.querySelector(".page.active");
    this.stagger(this.current);
    requestAnimationFrame(() => this.current.classList.add("visible"));
    document.querySelectorAll("[data-go]").forEach((btn) => {
      btn.addEventListener("click", () => this.go(btn.dataset.go));
    });
  },

  stagger(page) {
    page.querySelectorAll(".line").forEach((el, i) => el.style.setProperty("--i", i));
  },

  go(id) {
    const next = document.getElementById(id);
    const prev = this.current;
    if (!next || next === prev || this.busy) return;
    this.busy = true;
    prev.classList.add("leaving");
    prev.classList.remove("visible");
    setTimeout(() => {
      prev.classList.remove("active", "leaving");
      this.stagger(next);
      next.classList.add("active");
      next.scrollTop = 0;
      void next.offsetWidth;
      next.classList.add("visible");
      this.current = next;
      this.busy = false;
      document.dispatchEvent(new CustomEvent("pagechange", { detail: id }));
    }, Config.timing.pageFade);
  }
};

const Hint = {
  el: null,
  timer: null,

  init() {
    this.el = document.getElementById("hint");
  },

  show(text) {
    this.el.textContent = text;
    this.el.classList.add("show");
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.hide(), 2600);
  },

  hide() {
    clearTimeout(this.timer);
    this.el.classList.remove("show");
  }
};

const Progress = {
  el: null,

  init() {
    this.el = document.getElementById("progress");
  },

  update(index) {
    this.el.textContent = (index + 1) + " / " + Questions.length;
  }
};

const Answers = {
  data: {},

  isSelected(id, value) {
    const list = this.data[id];
    return Array.isArray(list) && list.indexOf(value) > -1;
  },

  select(question, value, button, list) {
    if (question.type === "single") {
      this.data[question.id] = [value];
      list.querySelectorAll(".opt").forEach((opt) => this.paint(opt, opt === button));
      return;
    }
    const chosen = this.data[question.id] || [];
    const at = chosen.indexOf(value);
    if (at > -1) {
      chosen.splice(at, 1);
    } else {
      chosen.push(value);
    }
    this.data[question.id] = chosen;
    this.paint(button, at === -1);
  },

  paint(button, on) {
    button.classList.toggle("sel", on);
    button.setAttribute("aria-checked", on ? "true" : "false");
  },

  setText(id, value) {
    this.data[id] = value;
  },

  isValid(question) {
    if (question.type === "text") {
      return (this.data[question.id] || "").trim().length > 0;
    }
    return (this.data[question.id] || []).length > 0;
  },

  asText(question) {
    if (question.type === "text") return (this.data[question.id] || "").trim();
    return (this.data[question.id] || []).join(", ");
  }
};

const Quiz = {
  index: 0,
  locked: false,
  card: null,
  title: null,
  body: null,
  button: null,

  init() {
    this.card = document.getElementById("card");
    this.title = document.getElementById("qTitle");
    this.body = document.getElementById("qBody");
    this.button = document.getElementById("nextBtn");
    this.button.addEventListener("click", () => this.next());
    document.addEventListener("pagechange", (e) => {
      if (e.detail === "quiz") this.start();
    });
    this.start();
  },

  start() {
    this.index = 0;
    this.render();
  },

  render() {
    const q = Questions[this.index];
    Progress.update(this.index);
    Hint.hide();
    this.title.textContent = q.text;
    this.body.innerHTML = "";
    if (q.type === "text") {
      this.body.appendChild(this.buildText(q));
    } else {
      this.body.appendChild(this.buildOptions(q));
    }
    this.button.textContent = this.index === Questions.length - 1 ? "kirim jawabanku →" : "lanjut →";
  },

  buildOptions(q) {
    const list = document.createElement("div");
    list.className = q.type === "single" ? "options single" : "options";
    list.setAttribute("role", q.type === "single" ? "radiogroup" : "group");
    q.options.forEach((label) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "opt";
      btn.setAttribute("role", q.type === "single" ? "radio" : "checkbox");
      const text = document.createElement("span");
      text.textContent = label;
      const mark = document.createElement("span");
      mark.className = "mark";
      btn.append(text, mark);
      Answers.paint(btn, Answers.isSelected(q.id, label));
      btn.addEventListener("click", () => {
        Answers.select(q, label, btn, list);
        Hint.hide();
      });
      list.appendChild(btn);
    });
    return list;
  },

  buildText(q) {
    const area = document.createElement("textarea");
    area.placeholder = q.placeholder;
    area.maxLength = 600;
    area.rows = 6;
    area.setAttribute("aria-label", q.text);
    area.value = Answers.data[q.id] || "";
    area.addEventListener("input", () => {
      Answers.setText(q.id, area.value);
      Hint.hide();
    });
    return area;
  },

  next() {
    if (this.locked) return;
    const q = Questions[this.index];
    if (!Answers.isValid(q)) {
      Hint.show(q.type === "text" ? Messages.write : Messages.choose);
      return;
    }
    if (this.index === Questions.length - 1) {
      Submit.run();
      return;
    }
    this.locked = true;
    this.card.classList.add("out");
    setTimeout(() => {
      this.index += 1;
      this.render();
      this.card.classList.remove("out");
      this.card.classList.add("pre");
      void this.card.offsetWidth;
      this.card.classList.remove("pre");
      this.locked = false;
    }, Config.timing.questionFade);
  }
};

const Submit = {
  sending: false,

  buildPayload() {
    const cfg = Config.formsubmit;
    const payload = {
      _subject: cfg.subject,
      _template: "table",
      _captcha: "false"
    };
    Questions.forEach((q, i) => {
      payload[(i + 1) + ". " + q.text] = Answers.asText(q);
    });
    return payload;
  },

  async send() {
    const cfg = Config.formsubmit;
    const res = await fetch(cfg.endpoint + encodeURIComponent(cfg.email), {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(this.buildPayload())
    });
    const json = await res.json();
    return { ok: res.ok && String(json.success) === "true", message: json.message || "status " + res.status };
  },

  setLoading(on) {
    const btn = document.getElementById("nextBtn");
    btn.disabled = on;
    btn.classList.toggle("loading", on);
    btn.textContent = on ? "mengirim" : "kirim jawabanku →";
  },

  async run() {
    if (this.sending) return;
    this.sending = true;
    this.setLoading(true);
    const started = Date.now();
    let result = { ok: false, message: "" };
    try {
      result = await this.send();
    } catch (err) {
      result = { ok: false, message: err.message };
    }
    const wait = Config.timing.minLoading - (Date.now() - started);
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    this.setLoading(false);
    this.sending = false;
    if (result.ok) {
      Nav.go("ending");
    } else {
      Hint.show(Messages.failed + " (" + result.message + ")");
    }
  }
};

const Fx = {
  layer: null,
  heartTimer: null,
  sparkleTimer: null,
  reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,

  moods: {
    opening: { heart: 2400, sparkle: 3200 },
    intro: { heart: 2800, sparkle: 3200 },
    quiz: { heart: 4800, sparkle: 5200 },
    ending: { heart: 1500, sparkle: 900 }
  },

  init() {
    this.layer = document.getElementById("floaters");
    if (this.reduced) return;
    for (let i = 0; i < 7; i++) this.bubble();
    this.mood("opening");
    document.addEventListener("pagechange", (e) => this.mood(e.detail));
  },

  rand(min, max) {
    return min + Math.random() * (max - min);
  },

  bubble() {
    const el = document.createElement("span");
    const size = this.rand(34, 110);
    el.className = "bubble";
    el.style.width = el.style.height = size + "px";
    el.style.left = this.rand(0, 92) + "%";
    el.style.top = this.rand(4, 90) + "%";
    el.style.setProperty("--d", this.rand(13, 22) + "s");
    el.style.setProperty("--dl", -this.rand(0, 14) + "s");
    this.layer.appendChild(el);
  },

  heart() {
    if (document.hidden || this.layer.querySelectorAll(".heart").length > 8) return;
    const el = document.createElement("span");
    el.className = "heart";
    el.textContent = "♥";
    el.style.setProperty("--x", this.rand(4, 92) + "%");
    el.style.setProperty("--s", this.rand(11, 20) + "px");
    el.style.setProperty("--d", this.rand(11, 17) + "s");
    el.style.setProperty("--sw", this.rand(-34, 34) + "px");
    el.addEventListener("animationend", () => el.remove());
    this.layer.appendChild(el);
  },

  sparkle() {
    if (document.hidden || this.layer.querySelectorAll(".sparkle").length > 7) return;
    const el = document.createElement("span");
    el.className = "sparkle";
    el.style.setProperty("--x", this.rand(4, 94) + "%");
    el.style.setProperty("--y", this.rand(4, 92) + "%");
    el.style.setProperty("--s", this.rand(9, 16) + "px");
    el.style.setProperty("--d", this.rand(3, 4.6) + "s");
    el.addEventListener("animationend", () => el.remove());
    this.layer.appendChild(el);
  },

  mood(name) {
    const m = this.moods[name];
    if (!m) return;
    clearInterval(this.heartTimer);
    clearInterval(this.sparkleTimer);
    this.heart();
    this.heartTimer = setInterval(() => this.heart(), m.heart);
    this.sparkleTimer = setInterval(() => this.sparkle(), m.sparkle);
  }
};

const Ending = {
  init() {
    document.addEventListener("pagechange", (e) => {
      if (e.detail === "ending") this.play();
    });
  },

  play() {
    document.querySelectorAll("#ending .reveal").forEach((el, i) => {
      setTimeout(() => el.classList.add("show"), 500 + i * Config.timing.endingStep);
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  Hint.init();
  Progress.init();
  Fx.init();
  Quiz.init();
  Ending.init();
  Nav.init();
});
