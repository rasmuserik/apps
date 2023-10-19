// Runner that makes it possible to run quizzes as:
//
// <script
//     src="https://veduz.com/quiz/script.js"
//     data-quiz="https://example.com/url/to/quiz-data.json"
// ></script>
//
let script = document.currentScript;
(async () => {
  let module = await import(script.src.replace(/[^\/]*$/, "") + "quiz.js");
  let elem = document.createElement("div");
  script.parentNode.insertBefore(elem, script);
  quiz_url = script.dataset.quiz;
  module.default({ quiz_url, elem });
})();
