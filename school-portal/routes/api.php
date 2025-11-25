<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\QuizQuestionController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\ExamQuestionController;
use App\Http\Controllers\Enseignant\CoursController;

/* ----------------------------------------------------------
   1.  AUTH  (no prefix)
---------------------------------------------------------- */
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

/* ----------------------------------------------------------
   2.  PUBLIC  (no prefix)
---------------------------------------------------------- */
Route::get('/public-courses', [PublicController::class, 'courses']);
Route::get('/public-courses/{id}', [PublicController::class, 'show']);

/* ----------------------------------------------------------
   3.  STUDENT  (auth only)
---------------------------------------------------------- */
Route::middleware(['auth:sanctum', 'student'])->group(function () {
    Route::get('/student/profile', [StudentController::class, 'profile']);
    Route::put('/student/profile', [StudentController::class, 'updateProfile']);
    Route::get('/student/my-classes', [StudentController::class, 'myClasses']);
    Route::get('/student/class/{class}/courses', [StudentController::class, 'classCourses']);
    Route::post('/student/join-request/{class}', [StudentController::class, 'joinRequest']);
    Route::get('/student/my-requests', [StudentController::class, 'myRequests']);
    Route::post('/student/quiz/{quiz}/attempt', [StudentController::class, 'attemptQuiz']);
    Route::post('/student/exam/{exam}/attempt', [StudentController::class, 'attemptExam']);
    Route::get('/student/my-grades', [StudentController::class, 'myGrades']);
    
   // New quiz/exam routes for students
    Route::get('/student/course/{courseId}/quizzes', [StudentController::class, 'quizzesByCourse']);
    Route::get('/student/course/{courseId}/exams', [StudentController::class, 'examsByCourse']);
    Route::get('/student/quiz/{quiz}/taken', [StudentController::class, 'hasQuizTaken']);
    Route::get('/student/exam/{exam}/taken', [StudentController::class, 'hasExamTaken']);
    Route::get('/student/quiz/{quiz}', [StudentController::class, 'getQuiz']);
    Route::get('/student/exam/{exam}', [StudentController::class, 'getExam']);
    Route::get('/student/quiz/{quiz}/questions', [StudentController::class, 'getQuizQuestions']);
    Route::get('/student/exam/{exam}/questions', [StudentController::class, 'getExamQuestions']);
    Route::post('/student/quiz/{quiz}/submit', [StudentController::class, 'submitQuiz']);
    Route::post('/student/exam/{exam}/submit', [StudentController::class, 'submitExam']);
    Route::get('/student/quiz/{quiz}/result', [StudentController::class, 'getQuizResult']);
    Route::get('/student/exam/{exam}/result', [StudentController::class, 'getExamResult']);
    Route::get('/student/course/{courseId}/results', [StudentController::class, 'getCourseResults']);
   // Posts (students create questions)
   Route::post('/posts', [\App\Http\Controllers\PostController::class, 'store']);
});

// Allow any authenticated user (student or teacher) to list posts for a course
Route::get('/posts/course/{courseId}', [\App\Http\Controllers\PostController::class, 'indexByCourse'])->middleware('auth:sanctum');

/* ----------------------------------------------------------
   4.  TEACHER  (auth only)
---------------------------------------------------------- */
Route::middleware(['auth:sanctum', 'teacher'])->group(function () {
    Route::get('/teacher/join-requests', [TeacherController::class, 'joinRequests']);
    Route::post('/teacher/join-requests/{request}/accept', [TeacherController::class, 'acceptRequest']);
    Route::post('/teacher/join-requests/{request}/reject', [TeacherController::class, 'rejectRequest']);
    Route::post('/teacher/class', [TeacherController::class, 'createClass']);
   Route::post('/teacher/class-requests', [TeacherController::class, 'createClassRequest']);
   Route::get('/teacher/class-requests', [TeacherController::class, 'listMyClassRequests']);
    Route::get('/teacher/my-classes', [TeacherController::class, 'myClasses']);
    Route::get('/teacher/search-student', [TeacherController::class, 'searchStudent']);
    Route::get('/teacher/class/{class}/students', [TeacherController::class, 'classStudents']);
    Route::get('/teacher/class/{class}/courses', [TeacherController::class, 'classCourses']);
    Route::post('/teacher/class/{class}/student', [TeacherController::class, 'addStudent']);
    Route::put('/teacher/class/{class}', [TeacherController::class, 'updateClass']);
    Route::delete('/teacher/class/{class}', [TeacherController::class, 'deleteClass']);
    Route::delete('/teacher/class/{class}/student/{student}', [TeacherController::class, 'removeStudent']);
    Route::apiResource('teacher/quiz', QuizController::class);
    Route::apiResource('teacher/exam', ExamController::class);
    
    // Quiz Questions routes
    Route::get('/teacher/question/quiz/{quiz}', [QuizQuestionController::class, 'index']);
    Route::post('/teacher/question/quiz/{quiz}', [QuizQuestionController::class, 'store']);
    Route::put('/teacher/question/quiz/{quiz}/{question}', [QuizQuestionController::class, 'update']);
    Route::delete('/teacher/question/quiz/{quiz}/{question}', [QuizQuestionController::class, 'destroy']);
    
    // Exam Questions routes
    Route::get('/teacher/question/exam/{exam}', [ExamQuestionController::class, 'index']);
    Route::post('/teacher/question/exam/{exam}', [ExamQuestionController::class, 'store']);
    Route::put('/teacher/question/exam/{exam}/{question}', [ExamQuestionController::class, 'update']);
    Route::delete('/teacher/question/exam/{exam}/{question}', [ExamQuestionController::class, 'destroy']);
    Route::get('/teacher/quiz/{quiz}/results', [TeacherController::class, 'quizResults']);
    Route::get('/teacher/exam/{exam}/results', [TeacherController::class, 'examResults']);
    Route::put('/teacher/exam/{exam}/result/{resultId}/score', [TeacherController::class, 'updateExamScore']);
   // Teachers answer posts
   Route::post('/posts/{post}/answer', [\App\Http\Controllers\PostController::class, 'answer']);
});

/* ----------------------------------------------------------
   5.  ADMIN  (auth only)
---------------------------------------------------------- */
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::apiResource('admin/users', AdminUserController::class);
    Route::get('/admin/stats', [AdminController::class, 'stats']);
    // Admin: list all classes
    Route::get('/admin/classes', [AdminController::class, 'listClasses']);
    // Admin: class requests approval
    Route::get('/admin/class-requests', [AdminController::class, 'listClassRequests']);
    // Use {requestRecord} to match the controller argument name for implicit route-model binding
    Route::post('/admin/class-requests/{requestRecord}/approve', [AdminController::class, 'approveClassRequest']);
    Route::post('/admin/class-requests/{requestRecord}/reject', [AdminController::class, 'rejectClassRequest']);
   // Admin: course requests approval
   Route::get('/admin/course-requests', [AdminController::class, 'listCourseRequests']);
   Route::post('/admin/course-requests/{course}/approve', [AdminController::class, 'approveCourseRequest']);
   Route::post('/admin/course-requests/{course}/reject', [AdminController::class, 'rejectCourseRequest']);
    // Admin: delete teacher (cascade)
    Route::delete('/admin/teachers/{user}', [AdminController::class, 'deleteTeacher']);
    // Admin: delete class (cascade)
    Route::delete('/admin/classes/{class}', [AdminController::class, 'deleteClass']);
    // Admin: delete course (cascade)
    Route::delete('/admin/courses/{course}', [AdminController::class, 'deleteCourse']);
});/* ----------------------------------------------------------
   6.  ENSEIGNANT/COURS  (original teacher course CRUD)
---------------------------------------------------------- */
Route::prefix('enseignant/cours')->middleware(['auth:sanctum'])->group(function () {
    Route::post('/', [CoursController::class, 'store']);
    Route::get('/', [CoursController::class, 'index']);
    Route::get('/recherche', [CoursController::class, 'search']);
    Route::get('/enseignant/{enseignantId}', [CoursController::class, 'byTeacher']);
    Route::get('/{id}', [CoursController::class, 'show']);
    Route::put('/{id}', [CoursController::class, 'update']);
    Route::post('/{id}/supports', [CoursController::class, 'addSupports']);
    Route::delete('/{id}', [CoursController::class, 'destroy']);
});