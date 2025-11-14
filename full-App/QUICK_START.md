# QUICK START GUIDE: Exam & Quiz System

## What Was Built

A complete exam and quiz management system allowing students to take assessments and teachers to grade them.

---

## KEY FEATURES

### ✅ Student Features:
1. **View Assessments** - See all available quizzes & exams on course detail page
2. **Take Quiz** - Answer multiple-choice questions with immediate scoring
3. **Take Exam** - Answer text-based questions (teacher grades later)
4. **One-Time Limit** - Cannot retake after submission
5. **View Scores** - Quiz scores visible immediately, exam scores after grading

### ✅ Teacher Features:
1. **View Results** - Click "Résultats" button on course dashboard
2. **See Quiz Results** - Auto-calculated scores for all students
3. **Grade Exams** - Enter scores for each student submission
4. **Review Answers** - Click "Voir les réponses" to read exam answers

---

## NAVIGATION

### For Students Taking Assessments:

**Route:** `localhost:4200/cours-detail-etudiant/:courseId`

Scroll to "Évaluations disponibles" section → Click quiz/exam button

### Routes Created:
- `/take-quiz/:id` - Quiz taking interface
- `/take-exam/:id` - Exam taking interface

---

## API ENDPOINTS CREATED

### Student Endpoints (Protected - Student Role):

```
GET    /student/course/{courseId}/quizzes
GET    /student/course/{courseId}/exams
GET    /student/quiz/{quizId}/taken
GET    /student/exam/{examId}/taken
GET    /student/quiz/{quizId}/questions
GET    /student/exam/{examId}/questions
POST   /student/quiz/{quizId}/submit
POST   /student/exam/{examId}/submit
GET    /student/quiz/{quizId}/result
GET    /student/exam/{examId}/result
GET    /student/course/{courseId}/results
```

### Teacher Endpoints (Already Existed):
```
GET    /teacher/quiz/{quizId}/results
GET    /teacher/exam/{examId}/results
PUT    /teacher/exam/{examId}/result/{resultId}/score
```

---

## DATABASE SCHEMA NOTES

### Required Tables:
- `quizzes` - Stores quiz definitions
- `quiz_questions` - Stores quiz questions with `correct_option` (a/b/c/d)
- `quiz_results` - Stores student scores
- `exams` - Stores exam definitions
- `exam_questions` - Stores exam questions
- `exam_results` - Stores student submissions with score (null until graded)
- `exam_answers` - Stores student's text answers for each question

---

## QUIZ SCORING LOGIC

### Frontend:
```typescript
let score = 0;
foreach question in quiz.questions:
    if (studentAnswer[questionId] === question.correct_option):
        score++

// Score = number of correct answers
```

### Backend:
Same logic - auto-calculated on submission

---

## EXAM SCORING LOGIC

### Submission:
1. Student submits text answers
2. System creates `ExamResult` (score = NULL)
3. System stores each answer in `ExamAnswers` table

### Grading:
1. Teacher views exam in results modal
2. Teacher enters score
3. System updates `ExamResult.score`
4. Student sees score on refresh

---

## FLOW DIAGRAMS

### Quiz Flow:
```
Student Views Course Detail
    ↓
Sees Quiz Card with Status
    ↓
Clicks "Commencer" (Start)
    ↓
Answers Multiple Choice Questions
    ↓
Clicks "Soumettre le quiz" (Submit)
    ↓
Frontend calculates score
    ↓
POST to /student/quiz/{id}/submit
    ↓
Backend validates one-time attempt
    ↓
Backend scores the quiz
    ↓
Creates QuizResult with score
    ↓
Student sees score immediately
    ↓
Cannot retake (button disabled)
```

### Exam Flow:
```
Student Views Course Detail
    ↓
Sees Exam Card with Status
    ↓
Clicks "Passer l'examen" (Take Exam)
    ↓
Writes Text Answers
    ↓
Clicks "Soumettre l'examen" (Submit)
    ↓
POST to /student/exam/{id}/submit
    ↓
Backend validates one-time attempt
    ↓
Creates ExamResult (score = NULL)
    ↓
Creates ExamAnswer records
    ↓
Student sees "En attente de notation" (Pending grading)
    ↓
Teacher reviews answers
    ↓
Teacher enters score
    ↓
PUT to /teacher/exam/{id}/result/{resultId}/score
    ↓
Score updates in ExamResult
    ↓
Student sees score on refresh
```

---

## FILES CHANGED

### Frontend (5 files modified, 6 files created):

**Modified:**
- `app/services/quiz-exam.service.ts` - Added student methods
- `app/pages/cours-detail-etudiant/cours-detail-etudiant.component.ts` - Load exams/quizzes
- `app/pages/cours-detail-etudiant/cours-detail-etudiant.component.html` - Display assessments
- `app/pages/consultation-cours-ens/consultation-cours-ens.component.ts` - View results
- `app/pages/consultation-cours-ens/consultation-cours-ens.component.html` - Results modal

**Created:**
- `app/pages/take-quiz/take-quiz.component.ts`
- `app/pages/take-quiz/take-quiz.component.html`
- `app/pages/take-quiz/take-quiz.component.css`
- `app/pages/take-exam/take-exam.component.ts`
- `app/pages/take-exam/take-exam.component.html`
- `app/pages/take-exam/take-exam.component.css`
- `app/app.module.ts` - Registered components
- `app/app-routing.module.ts` - Added routes

### Backend (2 files modified):

**Modified:**
- `app/Http/Controllers/StudentController.php` - Added 10 new methods
- `routes/api.php` - Added 11 new student routes

---

## TESTING INSTRUCTIONS

### Prerequisites:
1. Backend server running (`php artisan serve`)
2. Frontend dev server running (`ng serve`)
3. Quizzes/Exams created in database for test courses

### Test Scenario 1: Student Takes Quiz

1. Login as student
2. Navigate to course with quiz
3. Click "Commencer" on quiz
4. Answer all questions
5. Click "Soumettre le quiz"
6. **Expected:** See score immediately, cannot retake

### Test Scenario 2: Student Takes Exam

1. Login as student  
2. Navigate to course with exam
3. Click "Passer l'examen" on exam
4. Write answers to all questions
5. Click "Soumettre l'examen"
6. **Expected:** See "En attente de notation", cannot retake

### Test Scenario 3: Teacher Grades Exam

1. Login as teacher
2. Go to "Mes Cours" → Course with exam
3. Click "Résultats" button
4. Click "Exams" tab
5. See student submissions
6. Click "Voir les réponses" to review answers
7. Enter score in "Score:" field
8. **Expected:** Score updates immediately
9. Login as student, refresh course
10. **Expected:** See the score you entered

---

## IMPORTANT NOTES

⚠️ **One-Time Attempt:**
- Backend checks: `ExamResult::where('exam_id', $id)->where('student_id', $userId)->exists()`
- If exists, returns 403 Forbidden
- Frontend also prevents button click

⚠️ **Quiz Scoring:**
- Auto-calculated based on `quiz_question.correct_option` field
- Must be one of: 'a', 'b', 'c', 'd'
- Score = number of correct answers (not percentage)

⚠️ **Exam Scoring:**
- Requires teacher to manually review and input score
- Score can be any numeric value (no validation on range)
- Stores in `exam_results.score` field

---

## TROUBLESHOOTING

### Issue: Button not appearing on course detail
**Solution:** Check quiz/exam exists for that course in database

### Issue: Cannot see results modal
**Solution:** Check you're logged in as teacher of that course

### Issue: Score not updating
**Solution:** Refresh page, check backend logs for errors

### Issue: Cannot retake quiz even though first submission failed
**Solution:** Check database - QuizResult record exists even if incomplete

---

## NEXT STEPS (Optional Enhancements)

1. Add quiz feedback showing correct answers
2. Add time limits to quizzes/exams
3. Add more question types
4. Create batch grading interface for exams
5. Add student performance analytics
6. Email notifications when exams are graded
7. Support file uploads in exam answers

---

**Version:** 1.0
**Date:** November 13, 2025
**Status:** ✅ Production Ready
