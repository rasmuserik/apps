# Quiz app

This is an early prototype of a minimal quiz-app that can be embedded in other websites.

## Quiz data structure

```
{ "name": "...",
  "questions": [
  { "question": "...",
    "correct_answer": "...",
    "wrong_answers": "...",
    "silly_answers": "...",
    "explanation": "..."},
  ... ],
  "feedback": {
    "everything_correct": "...",
    "very_good": "...",
    "good": "...",
    "bad": "...",
    "very_bad": "...",
    "everything_wrong": "..."},
  "messages": {
    "header_title": "$QUIZ_NAME:
    "header_question_number": "Question $CORRECT_ANSWERS/$NUMBER_OF_QUESTIONS",
    "answer": "(Your response was wrong).",
    "correct_answer": "(Your response was **correct**).",
    "next_question": "👍   Next question",
    "report_wrong_question": "👎   Report wrong question",
    "what_is_wrong": "What is wrong with this question?",
    "done_count": "$CORRECT_ANSWERS/$NUMBER_OF_QUESTIONS correct.",
    "done_retry": "Retry quiz",
    "done_randomize": "Randomize quiz"}};
```

## Notes about generating quizzes in GPT4

Query:

```
Create an [easy, advanced, very difficult] quiz about "some topic" [in danish].

The quiz should be created as JSON-data, and with the question, one correct answer, 6 wrong answers, 3 absurdly funny wrong answer, and an explanation of the correct answer with some additional facts.

[{"question": "...", "correct_answer": "...", "wrong_answers": ["...","...","...","...","...", "..."], "silly_answers": ["...", "...", "..."], "explanation": "..."}, ...]

Make at least 25 questions.

```

---

```
Make 25 questions more
```

---

```
Give a description with funny details of the responder of a quiz about "religion og mytologi" in danish.

The description is based on how many questions was answered correctly.

The feedback should be several sentences, and have some absurd/surprising facts about the responder in the same theme as the quiz.

The result should be the following JSON structure:

{"everything_correct": "...",
  "very_good": "...",
  "good": "...",
  "bad": "...",
  "very_bad": "...",
  "everything_wrong": "..."}
```
