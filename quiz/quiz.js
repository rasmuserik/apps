import { setStyle, log, sleep, shuffled } from "../util/util.js";
import { template, load_templates } from "./templates.js";

let http_cache = {};
async function load_quiz(quiz_url) {
  if (!http_cache[quiz_url]) {
    http_cache[quiz_url] = (async () => {
      return {
        ...(await (await fetch(quiz_url)).json()),
        url: quiz_url,
      };
    })();
  }
  return await http_cache[quiz_url];
}

function randomize_questions(quiz) {
  let questions = shuffled(quiz.questions).slice(0, 6);
  for (const q of questions) {
    let wrong_answers = [...q.wrong_answers];
    if (q.silly_answers && Math.random() < 0.7) {
      wrong_answers.push(
        q.silly_answers[(Math.random() * q.silly_answers.length) | 0],
      );
    }
    wrong_answers = shuffled(wrong_answers).slice(0, 5);
    q.answers = shuffled([
      { answer: q.correct_answer, correct: true },
      ...wrong_answers.map((a) => ({ answer: a, correct: false })),
    ]);
  }
  return questions;
}

let default_messages = {
  back: "Back",
  correct_answer: "(Your response was correct).",
  wrong_answer: "(Your response was wrong).",
  next_question: "👍 \xa0 Next question",
  report_wrong_question: "👎 \xa0 Report wrong question",
  what_is_wrong: "What is wrong with this question?",
  correct: "correct",
  done_retry: "Retry quiz",
  done_randomize: "Randomize quiz",
};

let default_feedback = {
  everything_correct:
    "Congratulations! You answered all the questions correctly. Your understanding of the material is impressive. Keep up the good work!",
  very_good:
    "Well done! You've answered most of the questions correctly. This shows your solid understanding of the material. A little more practice and you'll perfect it.",
  good: "Good job! You've answered many questions correctly. Continue studying to improve your grasp on the more challenging aspects of the material.",
  bad: "You got several questions wrong. There's definitely room for improvement. Review the material and try again. Don't get discouraged - learning is a process.",
  very_bad:
    "You've missed most of the questions. It seems like you might need to revisit the material and spend more time understanding it. Remember, persistence is key in learning.",
  everything_wrong:
    "It looks like you didn't get any of the questions correct this time. That's okay, though. Everyone has to start somewhere. Take some time to go over the material and try again. You can only go up from here!",
};

async function run_quiz({
  quiz_url,
  feedback = {},
  messages = {},
  questions,
  elem,
  back,
}) {
  setStyle("vdz-quiz-style", template("quiz_style"));
  let quiz = await load_quiz(quiz_url);
  feedback = { ...default_feedback, ...feedback, ...(quiz.feedback || {}) };
  messages = {
    ...default_messages,
    ...messages,
    ...(quiz.messages || {}),
    title: quiz.title || "",
  };

  //////////////////////////
  // Show list of quizzes //
  //////////////////////////

  if (quiz.quizzes) {
    let prefix = quiz_url.replace(/[^\/]*$/, "");
    let quiz_urls = quiz.quizzes.map((s) =>
      s.startsWith("./") ? prefix + s.slice(2) : s,
    );
    let quizzes = await Promise.all(quiz_urls.map(load_quiz));
    elem.innerHTML = template("quiz_list", { ...messages, ...quiz, quizzes });

    let back_to_this = () =>
      run_quiz({ quiz_url, feedback, messages, elem, back });
    elem.querySelectorAll(".quiz .button").forEach((e) =>
      e.addEventListener("click", () =>
        run_quiz({
          feedback,
          quiz_url: e.dataset.url,
          messages: messages,
          elem,
          back: back_to_this,
        }),
      ),
    );

    console.log(quizzes);
    return;
  }

  questions = questions || randomize_questions(quiz);

  /////////////////////////
  // Show quiz questions //
  /////////////////////////

  console.log("back", messages.back, back);
  let i = 1;
  let score = 0;
  for (const q of questions) {
    setStyle(
      "vdz-quiz-dynamic",
      `.quiz .answers div { opacity: 0; }
       .quiz .info { opacity: 0; height: 0; }`,
    );
    elem.innerHTML = template("question", {
      ...messages,
      question_number: `${i++} / ${questions.length}`,
      question: q.question,
      answer_buttons: q.answers
        .map((a) =>
          template("answer_button", {
            class: a.correct ? "correct" : "wrong",
            answer: a.answer,
          }),
        )
        .join(""),
      explanation: q.explanation,
    });
    let t0 = Date.now();

    await sleep(1000);
    setStyle(
      "vdz-quiz-dynamic",
      ` .quiz .answers div { opacity: 1; }
        .quiz .info { opacity: 0; height: 0}`,
    );
    let response = await new Promise((resolve) =>
      elem
        .querySelectorAll(".answers div")
        .forEach((e) =>
          e.addEventListener("click", () => resolve(e.dataset.answer)),
        ),
    );
    let response_time = Date.now() - t0;
    t0 = Date.now();
    let question_id = Math.random().toString(36).slice(2);
    let info = {
      question_id,
      question: q.question,
      answers: q.answers,
      explanation: q.explanation,
      response,
      response_time,
    };
    log("response", info);
    let ok = q.answers.find((a) => a.answer === response).correct;
    score += ok ? 1 : 0;
    // TODO escape corret_answer and wrong_answer
    document.querySelector(".quiz .response").innerHTML = ok
      ? messages.correct_answer
      : messages.wrong_answer;
    setStyle(
      "vdz-quiz-dynamic",
      `
    .quiz .answers div.correct { opacity: 0.5; }
    .quiz .answers div.wrong { 
        opacity: 0.0; height: 0px;
        min-height: 0px; margin: 0px;
        padding: 0px; }
    .quiz .info { opacity: 1; height: auto; } `,
    );
    await sleep(10);
    response = await Promise.race([
      new Promise((resolve) =>
        elem
          .querySelector(".quiz")
          .addEventListener("click", () => resolve("none")),
      ),
      new Promise((resolve) =>
        elem
          .querySelectorAll(".button")
          .forEach((e) =>
            e.addEventListener("click", () => resolve(e.dataset.response)),
          ),
      ),
    ]);
    setTimeout(
      () =>
        elem.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "start",
        }),
      100,
    );
    let question_error;
    if (response === "report") {
      question_error = prompt(messages.what_is_wrong);
    }

    info.feedback = response;
    let time = Date.now() - t0;
    log("feedback", { question_id, response, time, question_error });
    elem.innerHTML = "";
  }

  ///////////////////////////
  // Show feedback on quiz //
  ///////////////////////////

  let response =
    score === questions.length
      ? "everything_correct"
      : score === 0
      ? "everything_wrong"
      : ["very_bad", "bad", "good", "very_good"][
          Math.round(3 * ((score - 1) / (questions.length - 2)))
        ];
  response = feedback[response];
  elem.innerHTML = template("quiz_feedback", {
    ...messages,
    done_count: `${score} / ${questions.length} ` + messages.correct,
    feedback: response,
    done_retry: messages.done_retry,
    done_randomize: messages.done_randomize,
    done_back: back ? messages.back : false,
  });
  elem
    .querySelector(".retry")
    .addEventListener("click", () =>
      run_quiz({ quiz_url, feedback, messages, questions, elem, back }),
    );
  elem
    .querySelector(".randomize")
    .addEventListener("click", () =>
      run_quiz({ quiz_url, feedback, messages, elem, back }),
    );
  if (back) {
    elem.querySelector(".back").addEventListener("click", () => back());
  }
}

export default async function main(args) {
  await load_templates(
    import.meta.url.replace(/[^/]*$/, "") + "templates.html",
  );
  run_quiz(args);
}
