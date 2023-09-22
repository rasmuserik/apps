(async () => {
  let v = self.veduz;
  await v.load("deps/marked.js");
  await v.load("deps/mustache.js");

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
    return v.mustache.render(templates[name] || "", obj);
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
        Object.entries(obj).map(([k, v]) => [k, local(v, lang)])
      );
    }
    return obj;
  }

  let messages = {
    app_name: "DE/DK Kultur App",
    answer_all: {
      da: "Når du har gættet på hvor alle personerne bor kan du læse mere om emnet her.",
      de: "Wenn Sie geraten haben, wo alle Personen wohnen, können Sie hier mehr über das Thema lesen.",
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
<p>Nogle af illustrationerne kan være AI-genererede.</p>
`,
        de: `
<h2>Über die App</h2>
<p>Was denken Menschen in Deutschland, was in Dänemark? Und woran kann man erkennen, ob jemand irgendwo in Deutschland oder irgendwo in Dänemark wohnt, wenn die Sprache einem nicht hilft? Probieren Sie aus, wie gut Sie sich in Deutschland und Dänemark auskennen und raten Sie mit.</p>
<p>Deutschstudierende der Kopenhagener Uni und Dänischstudierende der Universitäten Göttingen und Frankfurt am Main haben zusammen ganz normale Menschen auf der Straße zu verschiedenen Themen befragt und ein paar interessante Aussagen ausgewählt. Die Aussagen können Sie auf Dänisch und Deutsch hören und lesen. Aber welche ist das Original und wo wohnt die Person? Probieren Sie es aus. Es ist nicht so einfach, denn wie überall sind die Menschen sehr verschieden. Aber was ist das Indiz, das sie verrät?</p>
<p>Nachdem Sie geraten haben, erfahren Sie, was andere getippt haben und können auch ein paar Hintergrundinformationen erhalten, natürlich sowohl auf Dänisch als auch auf Deutsch, ganz wie Sie möchten.</p>
<p>Viel Spaß beim Raten!</p>
<p>Einige der Illustrationen können KI-generiert sein.</p>
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
          country: "Germany",
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
        da: "Andre har gættet:",
        de: "Andere haben geraten:",
      },
      back: {
        da: "Tilbage til emnet",
        de: "Zurück zum Thema",
      },
    },
  };
  let language = "da";
  let rootElem;
  let topics = [];
  let topic_id;
  let person_id;
  let answers = {};

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async function start_screen() {
    rootElem.innerHTML = template("start_screen", messages);
    document.getElementById("danish").addEventListener("click", () => {
      language = "da";
      choose_topic();
    });
    document.getElementById("german").addEventListener("click", () => {
      language = "de";
      choose_topic();
    });
  }
  async function choose_topic() {
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
      topics.find((o) => o.id === topic_id),
      language
    );
    let msgs = local(messages, language);
    let unanswered = 0;
    if (topic?.people) {
      for (const person of topic.people) {
        let answer = answers[topic_id + "." + person.id];
        if (answer) {
          person.correct_answer = answer === person.country;
          person.wrong_answer = answer !== person.country;
        } else {
          unanswered++;
        }
      }
    }
    topic.background = v.marked.marked(topic.background || "");
    rootElem.innerHTML = template("topic", {
      topic,
      messages: msgs,
      all_answered: unanswered === 0,
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
      topics.find((o) => o.id === topic_id),
      language
    ).people.find((o) => o.id === person_id);
    rootElem.innerHTML = template("person", {
      person: persondata,
      messages: local(messages, language),
    });
    rootElem.querySelector("#listen_da").addEventListener("click", () => {
      language = "da";
      person();
      let audio = document.getElementById("audio");
      audio.src = "./data/files/" + person_id + "-da.mp3";
      audio.play();
    });
    rootElem.querySelector("#listen_de").addEventListener("click", () => {
      language = "de";
      person();
      let audio = document.getElementById("audio");
      audio.src = "./data/files/" + person_id + "-de.mp3";
      audio.play();
    });
    rootElem.querySelector("#answer_da").addEventListener("click", () => {
      answers[topic_id + "." + person_id] = "da";
      feedback();
    });
    rootElem.querySelector("#answer_de").addEventListener("click", () => {
      answers[topic_id + "." + person_id] = "de";
      feedback();
    });
  }
  async function feedback() {
    let person = local(
      topics.find((o) => o.id === topic_id),
      language
    ).people.find((o) => o.id === person_id);
    let msg = local(messages, language);
    let response = answers[topic_id + "." + person_id];
    let correct = Math.round(Math.random() * 100);
    rootElem.innerHTML = template("feedback", {
      person,
      messages: msg,
      feedback:
        response === person.country ? msg.feedback.correct : msg.feedback.wrong,
      from:
        person.country === "de"
          ? msg.feedback.from_germany
          : msg.feedback.from_denmark,
      stat_de: correct,
      stat_dk: 100 - correct,
    });
    rootElem.querySelector("#back").addEventListener("click", () => {
      topic();
    });
  }
  async function main({ elem }) {
    rootElem = elem;
    elem.className = "app";
    await load_templates("templates.html");
    topics = [
      await (await fetch("./topic1.json")).json(),
      { title: "Tema 2", id: "theme1" },
      { title: "Tema 3", id: "theme2" },
      { title: "Tema 4", id: "theme3" },
      { title: "Tema 5", id: "theme3" },
      { title: "Tema 6", id: "theme3" },
      { title: "...", id: "theme5" },
    ];
    setStyle("style", template("style", {}));
    language = "da";
    topic_id = "dubbing";
    person_id = "person1";
    await start_screen();
    //await topic();
    // await person();
    //await feedback();
  }

  let elem = document.createElement("div");
  document.body.appendChild(elem);
  main({ elem });
})();
