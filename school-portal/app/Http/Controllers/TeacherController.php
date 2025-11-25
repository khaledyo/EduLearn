<?php
namespace App\Http\Controllers;

use App\Models\ClassModel;
use App\Models\JoinRequest;
use App\Models\Quiz;
use App\Models\Exam;
use App\Models\User;
use App\Models\QuizResult;
use App\Models\ExamResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TeacherController extends Controller
{
    public function joinRequests(Request $request)
    {
        $ids = ClassModel::where('teacher_id', $request->user()->id)->pluck('id');
        return JoinRequest::with(['student', 'class'])
            ->whereIn('class_id', $ids)
            ->where('status', 'pending')
            ->latest()
            ->get();
    }

    public function acceptRequest(Request $request, JoinRequest $joinRequest)
    {
        abort_unless($joinRequest->class->teacher_id === $request->user()->id, 403);
        $joinRequest->update(['status' => 'accepted']);
        $joinRequest->class->students()->attach($joinRequest->student_id);
        return response()->json(['message' => 'Student accepted']);
    }

    public function rejectRequest(Request $request, JoinRequest $joinRequest)
    {
        abort_unless($joinRequest->class->teacher_id === $request->user()->id, 403);
        $joinRequest->update(['status' => 'rejected']);
        return response()->json(['message' => 'Student rejected']);
    }

    public function createClass(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:191',
            'description' => 'nullable|string',
        ]);

        // Create a class request for admin approval instead of directly creating the class
        $classRequest = \App\Models\ClassRequest::create([
            'teacher_id' => $request->user()->id,
            'name' => $request->input('name'),
            'description' => $request->input('description'),
            'status' => 'pending'
        ]);

        return response()->json($classRequest, 201);
    }

    public function myClasses(Request $request)
    {
        return ClassModel::withCount('students')
            ->where('teacher_id', $request->user()->id)
            ->latest()
            ->get();
    }

    public function classStudents(Request $request, ClassModel $class)
    {
        abort_unless($class->teacher_id === $request->user()->id, 403);
        return $class->students()->get();
    }

    public function removeStudent(Request $request, ClassModel $class, User $student)
    {
        abort_unless($class->teacher_id === $request->user()->id, 403);
        $class->students()->detach($student->id);
        JoinRequest::where(['class_id' => $class->id, 'student_id' => $student->id])->delete();
        return response()->json(['message' => 'Student removed']);
    }

    public function searchStudent(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $student = User::where('email', $request->input('email'))
            ->where('role', 'student')
            ->first();

        if (!$student) {
            return response()->json(['message' => 'Student not found'], 404);
        }

        return response()->json($student);
    }

    public function addStudent(Request $request, ClassModel $class)
    {
        abort_unless($class->teacher_id === $request->user()->id, 403);
        
        $request->validate([
            'student_id' => 'required|integer|exists:users,id'
        ]);

        $studentId = $request->input('student_id');
        $student = User::findOrFail($studentId);
        
        // Check if student is already in the class using the pivot table directly
        $exists = DB::table('class_student')
            ->where('class_id', $class->id)
            ->where('student_id', $studentId)
            ->exists();
            
        if ($exists) {
            return response()->json(['message' => 'Student is already in this class'], 400);
        }

        // Add student directly (no request needed)
        $class->students()->attach($studentId);
        
        // Delete any pending join requests for this student and class
        JoinRequest::where(['class_id' => $class->id, 'student_id' => $studentId])->delete();

        return response()->json(['message' => 'Student added successfully', 'student' => $student]);
    }

    public function updateClass(Request $request, ClassModel $class)
    {
        abort_unless($class->teacher_id === $request->user()->id, 403);
        
        $request->validate([
            'name' => 'sometimes|required|string|max:191',
            'description' => 'nullable|string',
        ]);

        $class->update($request->only(['name', 'description']));
        
        return response()->json($class->loadCount('students'));
    }

    public function deleteClass(Request $request, ClassModel $class)
    {
        abort_unless($class->teacher_id === $request->user()->id, 403);
        
        // Delete all join requests for this class
        JoinRequest::where('class_id', $class->id)->delete();
        
        // Detach all students
        $class->students()->detach();
        
        // Delete the class
        $class->delete();
        
        return response()->json(['message' => 'Class deleted successfully']);
    }

    /**
     * Teacher requests creation of a class (admin must approve)
     */
    public function createClassRequest(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:191',
            'description' => 'nullable|string',
        ]);

        $classRequest = \App\Models\ClassRequest::create([
            'teacher_id' => $request->user()->id,
            'name' => $request->input('name'),
            'description' => $request->input('description'),
            'status' => 'pending'
        ]);

        return response()->json($classRequest, 201);
    }

    public function listMyClassRequests(Request $request)
    {
        return \App\Models\ClassRequest::where('teacher_id', $request->user()->id)->latest()->get();
    }

    public function classCourses(Request $request, ClassModel $class)
    {
        abort_unless($class->teacher_id === $request->user()->id, 403);
        
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

    public function quizResults(Request $request, Quiz $quiz)
    {
        abort_unless($quiz->course->teacher_id === $request->user()->id, 403);
        return QuizResult::with('student')
            ->where('quiz_id', $quiz->id)
            ->latest()
            ->get();
    }

    public function examResults(Request $request, Exam $exam)
    {
        abort_unless($exam->course->teacher_id === $request->user()->id, 403);
        return ExamResult::with(['student', 'answers.question'])
            ->where('exam_id', $exam->id)
            ->latest()
            ->get();
    }

    /**
     * Update exam result score
     */
    public function updateExamScore(Request $request, Exam $exam, $resultId)
    {
        \Illuminate\Support\Facades\Log::info('updateExamScore called', [
            'exam_id' => $exam->id,
            'result_id' => $resultId,
            'teacher_id' => $request->user()->id,
            'course_teacher_id' => $exam->course->teacher_id,
            'payload' => $request->all()
        ]);

        abort_unless($exam->course->teacher_id === $request->user()->id, 403);
        
        $request->validate([
            'score' => 'required|numeric|min:0|max:20'
        ]);

        $result = ExamResult::where('exam_id', $exam->id)
            ->where('id', $resultId)
            ->firstOrFail();

        \Illuminate\Support\Facades\Log::info('Updating result score', [
            'result_id' => $result->id,
            'old_score' => $result->score,
            'new_score' => $request->input('score')
        ]);

        $result->update(['score' => $request->input('score')]);

        \Illuminate\Support\Facades\Log::info('Result score updated', [
            'result_id' => $result->id,
            'new_score' => $result->score
        ]);

        return $result->load('student');
    }
}