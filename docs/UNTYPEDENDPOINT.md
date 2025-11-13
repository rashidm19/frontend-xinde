# Untyped Endpoints Reference

All endpoints below require `Authorization: Bearer <token>` and belong to the Django Ninja router mounted under `/practice` or `/mock`.

## Practice Writing

### `GET /practice/writing`
- **Query**: `part` (int, required, either 1 or 2), `tag_id` (int, optional).
- **Response 200**: `{"data": [PracticeWritingOut]}` where each entry contains `writing_id`, `title`, `last_score`, `best_score`, `questions_count`, `attempts`.
- **Errors**: none specific beyond authentication.

### `GET /practice/writing/{id}`
- **Path**: `id` – identifier of a `MockWritingPart`.
- **Response 200**: `WritingPartOut` with `task`, `text`, `theme`, `question`, `picture` URL or `null`.
- **Errors**: `404` when the writing part does not exist.

### `POST /practice/writing/{id}`
- **Path**: `id` – identifier of the selected writing part.
- **Body**: JSON `WritingAnswerIn` → `{ "answer": "..." }`.
- **Response 200**: `PassedPracticeWritingOut` `{ "id": <practice_id>, "writing_id": <part_id>, "feedback_ready": false }`.
- **Errors**: `400` with `{ "message": "Practice requires active subscription or practice balance" }` if access is blocked; `404` if the writing part is missing.

### `GET /practice/writing/passed/{id}`
- **Path**: `id` – practice attempt identifier.
- **Response 200**: `PassedPracticeWritingFeedbackOut`, which includes overall scores (`score`, `task_score`, `coherence_score`, `lexical_score`, `grammar_score`), per-part feedback (`part_1`, `part_2` objects with `question`, `feedback`, `ml_output`), metadata (`task`, `text`, `theme`, `question`, `picture`) and the learner’s `user_answer`.
- **Errors**: `404` if the practice attempt or feedback is absent.

## Practice Speaking

### `GET /practice/speaking`
- **Query**: `part` (int, required, 1–3 depending on UI flow), `tag_id` (int, optional).
- **Response 200**: `{"data": [PracticeSpeakingOut]}` entries provide `speaking_id`, `title`, `last_score`, `best_score`, `questions_count`, `attempts`.

### `GET /practice/speaking/categories`
- **Response 200**: `{"data": [CategoryOut]}` where each category has `id`, `name`, and `tags` (array of `{id, name}`).

### `GET /practice/speaking/{id}`
- **Path**: `id` – identifier of the `MockSpeaking` bundle.
- **Query**: `part` (int, required) to choose between part 1 or combined parts 2+3.
- **Response 200**: `PracticeSpeakingPartOut` with `questions` (array of `SpeakingQuestionOut` containing `number`, `kind`, `question`, `question_url`, `intro`, `intro_url`).
- **Errors**: `404` if the speaking set is missing.

### `POST /practice/speaking/{id}` (begin)
- **Path**: `id` – identifier of the `MockSpeaking` bundle.
- **Query**: `part` (int, required) to indicate which part is being started.
- **Response 200**: `PracticeNotFinishedSpeakingOut` `{ "id": <practice_id> }`.
- **Errors**: `400` with `{ "message": "Practice requires active subscription or practice balance" }` if access is blocked; `404` if the speaking set does not exist.

### `POST /practice/send/speaking`
- **Body**: `multipart/form-data` containing `practice_id` (int) and `question` (int) as form fields plus `audio` (file upload).
- **Response 200**: `SpeakingAnswerOut` `{ "question": <number>, "audio": <answer_url> }`.
- **Errors**: `400` when the question number is invalid; `404` if the practice record is missing.

### `POST /practice/speaking/{id}/finish`
- **Path**: `id` – identifier of the speaking practice attempt.
- **Response 200**: `PracticeNotFinishedSpeakingOut` echoing the practice `id`; finishing also schedules ML feedback generation.
- **Errors**: `404` if the practice is not found.

### `GET /practice/speaking/passed/{id}`
- **Path**: `id` – identifier of a completed speaking practice.
- **Response 200**: `SpeakingFeedbackOut` with overall `score`, component scores (`grammar_score`, `vocabulary_score`, `fluency_score`), aggregated `feedback`, and per-part breakdowns in `parts` (each containing grouped questions, answer audio URLs, and raw ML output).
- **Errors**: `404` if the practice or feedback has not been generated yet.

## Practice Listening

### `GET /practice/listening/{id}` (e.g. `/practice/listening/1`)
- **Path**: `id` – identifier of the listening mock.
- **Response 200**: `ListeningOut` describing `rules`, `audio_url`, `questions_count`, and four `part_*` objects each with `questions_count` and structured blocks (`ListeningBlock*` variants).
- **Errors**: `404` when the listening mock is absent.

### `POST /practice/listening/{id}`
- **Path**: `id` – identifier of the listening mock.
- **Body**: JSON `ListeningAnswersIn` → `{ "answers": [{ "question": <number>, "answer": "..." }, ...] }`.
- **Response 200**: `PracticeListeningFullFeedbackOut` including `id`, `listening_id`, overall `score`, `correct_answers_count`, and `questions` (each with `answer`, `correct_answer`, `correct`).
- **Errors**: `400` when access is denied (`Message` with practice-balance text) or when a question is not found; `404` if the listening mock does not exist.

### `GET /practice/listening/passed/{id}`
- **Path**: `id` – identifier of a completed listening practice.
- **Response 200**: Same `PracticeListeningFullFeedbackOut` structure as above, populated from stored answers.
- **Errors**: `404` if the practice is missing.

## Mock Test

### `POST /mock/test`
- **Body**: none.
- **Response 200**: `MockOut` combining the active mock’s `listening`, `reading`, `writing`, and `speaking` payloads.
- **Errors**: `400` with `{ "message": "Mock access requires available mock balance" }` when no attempts remain; `404` if a mock cannot be created.

### `GET /mock/test`
- **Response 200**: Same `MockOut` as above for the in-progress mock.
- **Errors**: `404` if the user has no active mock assigned.
