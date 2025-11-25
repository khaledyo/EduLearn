<?php
namespace App\Http\Controllers;

use App\Models\ClassModel;
use App\Models\JoinRequest;
use App\Models\Quiz;
use App\Models\Exam;
use App\Models\QuizResult;
use App\Models\ExamResult;
use App\Models\ExamAnswer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class StudentController extends Controller
{
    public function profile(Request $request)
    {
        return $request->user();
    }

    public function updateProfile(Request $request)
    {
        $request->validate(['name' => 'required|string|max:191']);
        $request->user()->update(['name' => $request->input('name')]);
        return $request->user();
    }

    /* ---------- join request ---------- */
    public function joinRequest(Request $request, ClassModel $class)
    {
        $user = $request->user();
        // one pending request max
        if (JoinRequest::where(['student_id' => $user->id, 'class_id' => $class->id])->exists()) {
            return response()->json(['message' => 'Request already sent'], 422);
        }
        $req = JoinRequest::create([
            'student_id' => $user->id,
            'class_id'   => $class->id,
            'status'     => 'pending',
        ]);
        return response()->json($req, 201);
    }

    public function myRequests(Request $request)
    {
        return JoinRequest::with('class')
            ->where('student_id', $request->user()->id)
            ->latest()
            ->get();
    }

    public function myClasses(Request $request)
    {
        $user = $request->user();
        return $user->classesAsStudent()->withCount('students')->latest()->get();
    }

    public function classCourses(Request $request, ClassModel $class)
    {
        $user = $request->user();
        
        // Check if student is in this class
        if (!$class->students()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'You are not enrolled in this class'], 403);
        }

        // Get courses for this class (class_id matches)
        $courses = \App\Models\Course::with('teacher', 'supports')
            ->where('class_id', $class->id)
            ->latest()
            ->get();

        // Transform to match frontend expectations
        return $courses->map(function($course) {
            $teacherName = $course->teacher->name ?? '';
            $nameParts = explode(' ', $teacherName, 2);
            $prenom = $nameParts[0] ?? '';
            $nom = $nameParts[1] ?? '';
            
            return [
                'id' => $course->id,
                'titre' => $course->title,
                'title' => $course->title,
                'description' => $course->description,
                'support' => $course->supports->pluck('path')->toArray(),
                'dateCreation' => $course->created_at,
                'created_at' => $course->created_at,
                'enseignantId' => $course->teacher_id,
                'teacher_id' => $course->teacher_id,
                'enseignantNom' => $nom,
                'enseignantPrenom' => $prenom,
                'duree' => null,
                'niveau' => null,
                'class_id' => $course->class_id,
            ];
        });
    }

    /* ---------- attempt quiz ---------- */
    public function attemptQuiz(Request $request, Quiz $quiz)
    {
        $user = $request->user();
        // must be enrolled in the class if private
        if (!$quiz->course->is_public && !$user->classes()->where('class_id', $quiz->course->class_id)->exists()) {
            abort(403, 'Not enrolled');
        }
        $answers = $request->input('answers');          // array [questionId => chosenOption]
        $score   = 0;
        foreach ($quiz->questions as $q) {
            if (($answers[$q->id] ?? null) === $q->correct_option) $score++;
        }
        $result = QuizResult::create([
            'quiz_id'    => $quiz->id,
            'student_id' => $user->id,
            'score'      => $score,
        ]);
        return response()->json(['score' => $score, 'total' => $quiz->questions->count()]);
    }

    /* ---------- attempt exam ---------- */
    public function attemptExam(Request $request, Exam $exam)
    {
        $user = $request->user();
        if (!$exam->course->is_public && !$user->classes()->where('class_id', $exam->course->class_id)->exists()) {
            abort(403, 'Not enrolled');
        }
        
        // Check if student already took this exam
        if (ExamResult::where('exam_id', $exam->id)->where('student_id', $user->id)->exists()) {
            abort(403, 'You have already taken this exam');
        }
        
        $answers = $request->input('answers');            // [questionId => textAnswer]
        
        // Create exam result (score will be set by teacher later)
        $result = ExamResult::create([
            'exam_id'    => $exam->id,
            'student_id' => $user->id,
            'score'      => 0, // Teacher will set the score
        ]);
        
        // Store student text answers
        foreach ($answers as $questionId => $answer) {
            \App\Models\ExamAnswer::create([
                'exam_result_id' => $result->id,
                'question_id'    => $questionId,
                'answer'         => $answer, // Text answer written by student
            ]);
        }
        
        return response()->json(['message' => 'Exam submitted successfully. Your score will be available after teacher review.']);
    }

    /* ---------- grades ---------- */
    public function myGrades(Request $request)
    {
        $user = $request->user();
        return [
            'quizzes' => QuizResult::with('quiz.course')->where('student_id', $user->id)->latest()->get(),
            'exams'   => ExamResult::with('exam.course')->where('student_id', $user->id)->latest()->get(),
        ];
    }

    /* ---------- get quizzes by course ---------- */
    public function quizzesByCourse(Request $request, $courseId)
    {
        // Get all quizzes for a course
        $quizzes = Quiz::where('course_id', $courseId)->get();
        return $quizzes;
    }

    /* ---------- get exams by course ---------- */
    public function examsByCourse(Request $request, $courseId)
    {
        // Get all exams for a course
        $exams = Exam::where('course_id', $courseId)->get();
        return $exams;
    }

    /* ---------- check if quiz taken ---------- */
    public function hasQuizTaken(Request $request, Quiz $quiz)
    {
        $user = $request->user();
        $taken = QuizResult::where('quiz_id', $quiz->id)
            ->where('student_id', $user->id)
            ->exists();
        return response()->json($taken);
    }

    /* ---------- check if exam taken ---------- */
    public function hasExamTaken(Request $request, Exam $exam)
    {
        $user = $request->user();
        $taken = ExamResult::where('exam_id', $exam->id)
            ->where('student_id', $user->id)
            ->exists();
        return response()->json($taken);
    }

    /* ---------- get quiz details ---------- */
    public function getQuiz(Request $request, Quiz $quiz)
    {
        return response()->json($quiz);
    }

    /* ---------- get exam details ---------- */
    public function getExam(Request $request, Exam $exam)
    {
        return response()->json($exam);
    }

    /* ---------- get quiz questions ---------- */
    public function getQuizQuestions(Request $request, Quiz $quiz)
    {
        return $quiz->questions;
    }

    /* ---------- get exam questions ---------- */
    public function getExamQuestions(Request $request, Exam $exam)
    {
        return $exam->questions;
    }

    /* ---------- submit quiz ---------- */
    public function submitQuiz(Request $request, Quiz $quiz)
    {
        $user = $request->user();
        
        // Check if already taken
        if (QuizResult::where('quiz_id', $quiz->id)->where('student_id', $user->id)->exists()) {
            abort(403, 'You have already taken this quiz');
        }

        $answers = $request->input('answers');          // array [questionId => chosenOption]
        $score   = 0;
        
        if (!$answers || !is_array($answers)) {
            return response()->json(['message' => 'No answers provided'], 422);
        }
        
        try {
            foreach ($quiz->questions as $q) {
                // Ensure we're comparing strings
                $selectedOption = $answers[$q->id] ?? null;
                $correctOption = $q->correct_option;
                
                if ($selectedOption && $selectedOption === $correctOption) {
                    $score++;
                }
            }
            
            $result = QuizResult::create([
                'quiz_id'    => $quiz->id,
                'student_id' => $user->id,
                'score'      => $score,
            ]);
            
            return response()->json(['score' => $score, 'total' => $quiz->questions->count()], 201);
        } catch (\Exception $e) {
            Log::error('Quiz submission error: ' . $e->getMessage(), [
                'quiz_id' => $quiz->id,
                'student_id' => $user->id,
                'exception' => $e
            ]);
            return response()->json(['message' => 'Error submitting quiz: ' . $e->getMessage()], 500);
        }
    }

    /* ---------- submit exam ---------- */
    public function submitExam(Request $request, Exam $exam)
    {
        $user = $request->user();
        
        // Check if already taken
        if (ExamResult::where('exam_id', $exam->id)->where('student_id', $user->id)->exists()) {
            abort(403, 'You have already taken this exam');
        }
        
        $answers = $request->input('answers');
        
        if (!$answers || !is_array($answers)) {
            return response()->json(['message' => 'No answers provided'], 422);
        }
        
        try {
            // Create exam result (score will be set by teacher later)
            $result = ExamResult::create([
                'exam_id'    => $exam->id,
                'student_id' => $user->id,
                'score'      => null, // Teacher will set the score
            ]);
            
            // Store student text answers
            if (is_array($answers) && count($answers) > 0) {
                foreach ($answers as $questionId => $answer) {
                    try {
                        $examAnswer = new ExamAnswer();
                        $examAnswer->exam_result_id = $result->id;
                        $examAnswer->question_id = (int)$questionId;
                        $examAnswer->answer = (string)($answer ?? '');
                        $examAnswer->save();
                    } catch (\Exception $e) {
                        Log::error('Error saving exam answer', [
                            'question_id' => $questionId,
                            'exam_result_id' => $result->id,
                            'error' => $e->getMessage()
                        ]);
                        // Continue with next answer
                    }
                }
            }
            
            return response()->json(['message' => 'Exam submitted successfully. Your score will be available after teacher review.'], 201);
        } catch (\Exception $e) {
            Log::error('Exam submission error: ' . $e->getMessage(), [
                'exam_id' => $exam->id,
                'student_id' => $user->id,
                'answers' => $answers,
                'exception' => $e
            ]);
            return response()->json(['message' => 'Error submitting exam: ' . $e->getMessage()], 500);
        }
    }

    /* ---------- get quiz result ---------- */
    public function getQuizResult(Request $request, Quiz $quiz)
    {
        $user = $request->user();
        $result = QuizResult::where('quiz_id', $quiz->id)
            ->where('student_id', $user->id)
            ->firstOrFail();
        
        // Add total number of questions
        $result->total = $quiz->questions()->count();
        
        return $result;
    }

    /* ---------- get exam result ---------- */
    public function getExamResult(Request $request, Exam $exam)
    {
        $user = $request->user();
        $result = ExamResult::with('answers.question')->where('exam_id', $exam->id)
            ->where('student_id', $user->id)
            ->firstOrFail();
        return $result;
    }

    /* ---------- get course results ---------- */
    public function getCourseResults(Request $request, $courseId)
    {
        $user = $request->user();
        return [
            'quizzes' => QuizResult::with('quiz')
                ->where('student_id', $user->id)
                ->whereHas('quiz', fn($q) => $q->where('course_id', $courseId))
                ->latest()
                ->get(),
            'exams'   => ExamResult::with('exam')
                ->where('student_id', $user->id)
                ->whereHas('exam', fn($q) => $q->where('course_id', $courseId))
                ->latest()
                ->get(),
        ];
    }
}