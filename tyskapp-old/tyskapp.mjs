import { marked } from "https://esm.sh/marked";
import mustache from "https://esm.sh/mustache";
import { call, log, mount, update, getCur } from "../veduz.mjs";

let templates = {};
async function load_templates(url) {
  let html = await (await fetch(url)).text();
  let parser = new DOMParser();
  let doc = parser.parseFromString(html, "text/html");
  templates = {};
  for (const elem of doc.querySelectorAll("body > *")) {
    if (elem.id) {
      templates[elem.id] = elem.innerHTML;
    }
  }
  return templates;
}
function template(name, obj = {}) {
  return mustache.render(templates[name] || "", obj);
}

function setStyle(name, style) {
  let elem = document.querySelector("#" + name);
  if (!elem) {
    elem = document.createElement("style");
    elem.id = name;
    document.head.appendChild(elem);
  }
  elem.innerHTML = style;
}
function local(obj, lang) {
  if (Array.isArray(obj)) return obj.map((o) => local(o, lang));
  if (typeof obj === "object") {
    if (obj[lang]) return obj[lang];
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, local(v, lang)]),
    );
  }
  return obj;
}

let messages = {
  app_name: "KulturSchmæck",
  answer_all: {
    da:
      "Når du har gættet på hvor personerne bor kan du læse mere om emnet her.",
    de:
      "Wenn Sie geraten haben, wo Personen wohnen, können Sie hier mehr über das Thema lesen.",
  },
  choose_topic: {
    intro: {
      da: `Vælg emne:`,
      de: `Wählen Sie ein Thema:`,
    },
    footer: {
      da: `
<h2>Om App'en</h2>
<p>Hvad tænker folk i Tyskland, hvad tænker de i Danmark? Og hvordan kan du se, om nogen bor et sted i Tyskland eller et sted i Danmark, hvis sproget ikke hjælper dig? Prøv, hvor godt du kender Tyskland og Danmark, og gæt med sammen med os.</p>
<p>Tyskstuderende fra Københavns Universitet og danskstuderende fra universiteterne i Göttingen og Frankfurt am Main har interviewet helt almindelige mennesker på gaden om forskellige emner og udvalgt et par interessante udsagn. Du kan høre og læse udsagnene på dansk og tysk. Men hvad er originalen, og hvor bor personen? Prøv dig frem. Det er ikke så let, for som alle andre steder er folk meget forskellige. Men hvad er den ledetråd, der afslører dem?</p>
<p>Når du har gættet, finder du ud af, hvad andre har gættet, og du kan også få lidt baggrundsinformation, selvfølgelig på både dansk og tysk, lige som du vil.</p>
<p>God fornøjelse med at gætte!</p>
`,
      de: `
<h2>Über die App</h2>
<p>Was denken Menschen in Deutschland, was in Dänemark? Und woran kann man erkennen, ob jemand irgendwo in Deutschland oder irgendwo in Dänemark wohnt, wenn die Sprache einem nicht hilft? Probieren Sie aus, wie gut Sie sich in Deutschland und Dänemark auskennen und raten Sie mit.</p>
<p>Deutschstudierende der Kopenhagener Uni und Dänischstudierende der Universitäten Göttingen und Frankfurt am Main haben zusammen ganz normale Menschen auf der Straße zu verschiedenen Themen befragt und ein paar interessante Aussagen ausgewählt. Die Aussagen können Sie auf Dänisch und Deutsch hören und lesen. Aber welche ist das Original und wo wohnt die Person? Probieren Sie es aus. Es ist nicht so einfach, denn wie überall sind die Menschen sehr verschieden. Aber was ist das Indiz, das sie verrät?</p>
<p>Nachdem Sie geraten haben, erfahren Sie, was andere getippt haben und können auch ein paar Hintergrundinformationen erhalten, natürlich sowohl auf Dänisch als auch auf Deutsch, ganz wie Sie möchten.</p>
<p>Viel Spaß beim Raten!</p>
`,
    },
  },
  change_topic: {
    da: "Vælg et andet emne",
    de: "Wählen Sie ein anderes Thema",
  },
  language_buttons: {
    da: [
      {
        listen: "Hør og læs på dansk",
        country: "Danmark",
        lang: "da",
        class: "danish",
      },
      {
        listen: "Auf&nbsp;Deutsch hören / lesen",
        country: "Tyskland",
        class: "german",
        lang: "de",
      },
    ],
    de: [
      {
        listen: "Auf&nbsp;Deutsch hören / lesen",
        country: "Deutschland",
        class: "german",
        lang: "de",
      },
      {
        listen: "Hør og læs på dansk",
        country: "Dänemark",
        lang: "da",
        class: "danish",
      },
    ],
  },
  choose_country: {
    da: "Denne person bor i:",
    de: "Diese Person lebt in:",
  },
  denmark: {
    da: "Danmark",
    de: "Dänemark",
  },
  germany: {
    da: "Tyskland",
    de: "Deutschland",
  },
  feedback: {
    correct: {
      da: "Svaret er korrekt!",
      de: "Die Antwort ist richtig!",
    },
    wrong: {
      da: "Svaret er forkert!",
      de: "Die Antwort ist falsch!",
    },
    from_denmark: {
      da: "Personen er fra Danmark.",
      de: "Die Person kommt aus Dänemark.",
    },
    from_germany: {
      da: "Personen er fra Tyskland.",
      de: "Die Person kommt aus Deutschland.",
    },
    stats: {
      da: "Folk har svaret:",
      de: "Leute haben geantwortet:",
    },
    back: {
      da: "Tilbage til emnet",
      de: "Zurück zum Thema",
    },
  },
};
let language = "da";
let rootElem;
function getTopics() {
  return globalThis.veduz.state.tyskapp.topics || [];
}
let topic_id;
let person_id;
let answers = {};
let start_language = "other";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function start_screen() {
  rootElem.innerHTML = template("start_screen", messages);
  document.getElementById("danish").addEventListener("click", () => {
    start_language = language = "da";
    choose_topic();
  });
  document.getElementById("german").addEventListener("click", () => {
    start_language = language = "de";
    choose_topic();
  });
}
async function choose_topic() {
  // remove first topic.
  let topics = getTopics().slice(1);
  let text = {
    messages: local(messages.choose_topic, language),
    topics: local(topics, language),
  };
  rootElem.innerHTML = template("choose_topic", text);
  for (const { id } of topics) {
    document.getElementById(id).addEventListener("click", () => {
      topic_id = id;
      topic();
    });
  }
}
async function topic() {
  let topic = local(
    getTopics().find((o) => o.id === topic_id),
    language,
  );
  let msgs = local(messages, language);
  let unanswered = 0;
  let answered = 0;
  if (topic?.people) {
    for (const person of topic.people) {
      let answer = answers[topic_id + "." + person.id];
      if (answer) {
        person.correct_answer = answer === (person.country || 'da');
        person.wrong_answer = answer !== (person.country || 'da');
        ++answered;
      } else {
        unanswered++;
      }
    }
  }
  topic.background = marked(topic.background || "");
  rootElem.innerHTML = template("topic", {
    topic,
    messages: msgs,
    show_explanation: (answered > 3) || (unanswered === 0),
  });
  if (topic?.people) {
    for (const { id } of topic.people) {
      document.getElementById(id).addEventListener("click", () => {
        person_id = id;
        person();
      });
    }
  }
  document.getElementById("change_topic").addEventListener("click", () => {
    choose_topic();
  });
}
function person() {
  let persondata = local(
    getTopics().find((o) => o.id === topic_id),
    language,
  ).people.find((o) => o.id === person_id);
  rootElem.innerHTML = template("person", {
    person: persondata,
    messages: local(messages, language),
  });
  rootElem.querySelector("#listen_da").addEventListener("click", () => {
    language = "da";
    person();
    let audio = document.getElementById("audio");
    audio.src = persondata.audio_da;
    audio.play();
  });
  rootElem.querySelector("#listen_de").addEventListener("click", () => {
    language = "de";
    person();
    let audio = document.getElementById("audio");
    audio.src = persondata.audio_de;
    audio.play();
  });
  rootElem.querySelector("#answer_da").addEventListener("click", () => {
    let isInitial = answers[topic_id + "." + person_id] === undefined;
    log(
      `tyskapp-answer:${isInitial}:${start_language}:${topic_id}:${person_id}:da`,
    );
    answers[topic_id + "." + person_id] = "da";
    feedback();
  });
  rootElem.querySelector("#answer_de").addEventListener("click", () => {
    let isInitial = answers[topic_id + "." + person_id] === undefined;
    log(
      `tyskapp-answer:${isInitial}:${start_language}:${topic_id}:${person_id}:de`,
    );
    answers[topic_id + "." + person_id] = "de";
    feedback();
  });
}
async function feedback() {
  let person = local(
    getTopics().find((o) => o.id === topic_id),
    language,
  ).people.find((o) => o.id === person_id);
  let msg = local(messages, language);
  let response = answers[topic_id + "." + person_id];

  let responses = { da: 0, de: 0 };
  for (
    const [orig, answer] of [
      ["da", "da"],
      ["da", "de"],
      ["de", "da"],
      ["de", "de"],
    ]
  ) {
    responses[answer] += await call(0, "log_count", {
      log_type:
        `CLIENT:tyskapp-answer:true:${orig}:${topic_id}:${person_id}:${answer}`,
    });
  }
  let count = responses.da + responses.de;
  // avoid division by zero
  if (count === 0) count = 1;

  rootElem.innerHTML = template("feedback", {
    person,
    messages: msg,
    feedback: response === (person.country || 'da')
      ? msg.feedback.correct
      : msg.feedback.wrong,
    from: 'de' === (person.country || 'da') 
      ? msg.feedback.from_germany
      : msg.feedback.from_denmark,
    stat_de: Math.round(responses.de * 100 / count),
    stat_dk: Math.round(responses.da * 100 / count),
  });
  rootElem.querySelector("#back").addEventListener("click", () => {
    topic();
  });
}
async function main({ elem }) {
  rootElem = elem;
  elem.className = "app";
  setStyle("style", template("style", {}));
  await start_screen();
}

export function init({ cur }) {
  console.log("init");
  (async () => {
    await load_templates("templates.html");
    update(cur.path(), ({ cur }) => cur.set("templates_loaded", true));
  })();
  cur = cur.set("../messages", messages);
  mount("veduz.com/apps/tyskapp/data/topics", cur.path() + "/../topics");
  language = "da";
  topic_id = "dubbing";
  person_id = "person1";
  return cur;
}
let started = false;
export function render({ elem, cur }) {
  console.log("render", cur.cd('..'));
  if (!cur.get("templates_loaded") || !cur.get("../messages") || !cur.get("../topics")) {
    return { html: "<h1>Loading...</h1>" };
  }
  if (started) return;
  started = true;
  main({ elem });
}
console.log(await call(0, "log_types", {}));
console.log(
  await call(0, "log_stat", {
    log_type: "CLIENT:tyskapp-answer:true:da:dubbing:person3:da",
  }),
);
