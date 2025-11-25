<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\ClassModel;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\QuizResult;
use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\ExamAnswer;
use App\Models\ExamResult;
use App\Models\Post;
use App\Models\PostAnswer;
use App\Models\JoinRequest;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function stats(Request $request)
    {
        return [
            'users'   => User::count(),
            'courses' => Course::count(),
            'classes' => ClassModel::count(),
        ];
    }

    // List all classes for admin management
    public function listClasses(Request $request)
    {
        // Include soft-deleted classes so admin can manage them
        return ClassModel::withTrashed()->with('teacher', 'students')->latest()->get();
    }

    // List class requests pending approval
    public function listClassRequests(Request $request)
    {
        return \App\Models\ClassRequest::where('status', 'pending')->with('teacher')->latest()->get();
    }

    // List course requests (courses pending admin approval)
    public function listCourseRequests(Request $request)
    {
        return Course::where('status', 'pending')->with('teacher')->latest()->get();
    }

    // Approve a course (set status to approved)
    public function approveCourseRequest(Request $request, Course $course)
    {
        if ($course->status !== 'pending') {
            return response()->json(['message' => 'Course already processed'], 400);
        }

        try {
            DB::beginTransaction();
            
            $course->status = 'approved';
            $course->save();
            $course->refresh(); // Refresh to get updated data
            
            DB::commit();
            return response()->json([
                'success' => true,
                'course' => $course
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Error approving course: ' . $e->getMessage()
            ], 500);
        }
    }

    public function rejectCourseRequest(Request $request, Course $course)
    {
        try {
            DB::beginTransaction();
            
            if ($course->status === 'pending') {
                $course->status = 'rejected';
                $course->save();
                $course->refresh(); // Refresh to get updated data
                
                // Delete the course and all related data
                $this->deleteCourseCascade($course);
            }
            
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Course rejected and deleted successfully', 
                'course' => $course
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Error rejecting course: ' . $e->getMessage()
            ], 500);
        }
    }

    // Approve a class request: create class and mark request as approved
    public function approveClassRequest(Request $request, \App\Models\ClassRequest $requestRecord)
    {
        if ($requestRecord->status !== 'pending') {
            return response()->json(['message' => 'Request already processed'], 400);
        }

        try {
            DB::beginTransaction();
            
            $class = ClassModel::create([
                'name' => $requestRecord->name,
                'description' => $requestRecord->description,
                'teacher_id' => $requestRecord->teacher_id,
            ]);

            $requestRecord->update(['status' => 'approved']);
            $requestRecord->refresh(); // Refresh to get updated data
            
            DB::commit();
            return response()->json([
                'success' => true,
                'class' => $class, 
                'request' => $requestRecord
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Error approving class request: ' . $e->getMessage()
            ], 500);
        }
    }

    public function rejectClassRequest(Request $request, \App\Models\ClassRequest $requestRecord)
    {
        try {
            DB::beginTransaction();
            
            if ($requestRecord->status === 'pending') {
                $requestRecord->update(['status' => 'rejected']);
                $requestRecord->refresh(); // Refresh to get updated data
            }
            
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Class request rejected successfully', 
                'request' => $requestRecord
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Error rejecting class request: ' . $e->getMessage()
            ], 500);
        }
    }

    // Delete a teacher and cascade delete their classes and related data
    public function deleteTeacher(Request $request, User $user)
    {
        abort_if($user->role !== 'teacher', 403, 'User is not a teacher');

        try {
            DB::beginTransaction();

            // Get all classes belonging to this teacher
            $classes = ClassModel::where('teacher_id', $user->id)->get();

            foreach ($classes as $class) {
                $this->deleteClassData($class);
            }

            // Delete all class requests by this teacher
            \App\Models\ClassRequest::where('teacher_id', $user->id)->delete();

            // Delete the teacher user
            $user->delete();

            DB::commit();

            return response()->json(['message' => 'Teacher and all related data deleted successfully']);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => 'Error deleting teacher: ' . $e->getMessage()], 500);
        }
    }

    // Delete a class and cascade delete courses, quizzes, exams, and join requests
    public function deleteClass(Request $request, ClassModel $class)
    {
        try {
            DB::beginTransaction();

            $this->deleteClassData($class);

            DB::commit();

            return response()->json(['message' => 'Class and all related data deleted successfully']);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => 'Error deleting class: ' . $e->getMessage()], 500);
        }
    }

    // Delete a course and cascade delete quizzes, exams, posts
    public function deleteCourse(Request $request, Course $course)
    {
        try {
            DB::beginTransaction();

            $this->deleteCourseCascade($course);

            DB::commit();

            return response()->json(['message' => 'Course and all related data deleted successfully']);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => 'Error deleting course: ' . $e->getMessage()], 500);
        }
    }

    // Helper function to cascade delete course data
    private function deleteCourseCascade(Course $course)
    {
        // Delete quizzes and their questions/results
        $quizzes = Quiz::where('course_id', $course->id)->get();
        foreach ($quizzes as $quiz) {
            QuizQuestion::where('quiz_id', $quiz->id)->delete();
            QuizResult::where('quiz_id', $quiz->id)->delete();
            $quiz->delete();
        }

        // Delete exams and their questions/answers/results
        $exams = Exam::where('course_id', $course->id)->get();
        foreach ($exams as $exam) {
            ExamQuestion::where('exam_id', $exam->id)->delete();
            ExamAnswer::where('exam_id', $exam->id)->delete();
            ExamResult::where('exam_id', $exam->id)->delete();
            $exam->delete();
        }

        // Delete posts and answers
        Post::where('course_id', $course->id)->each(function ($post) {
            PostAnswer::where('post_id', $post->id)->delete();
        });
        Post::where('course_id', $course->id)->delete();

        // Delete the course itself
        $course->delete();
    }

    // Helper function to cascade delete class data
    private function deleteClassData(ClassModel $class)
    {
        // Delete all courses in this class
        $courses = Course::where('class_id', $class->id)->get();
        foreach ($courses as $course) {
            // Delete quizzes and their questions/results
            $quizzes = Quiz::where('course_id', $course->id)->get();
            foreach ($quizzes as $quiz) {
                QuizQuestion::where('quiz_id', $quiz->id)->delete();
                QuizResult::where('quiz_id', $quiz->id)->delete();
                $quiz->delete();
            }

            // Delete exams and their questions/answers/results
            $exams = Exam::where('course_id', $course->id)->get();
            foreach ($exams as $exam) {
                ExamQuestion::where('exam_id', $exam->id)->delete();
                ExamAnswer::where('exam_id', $exam->id)->delete();
                ExamResult::where('exam_id', $exam->id)->delete();
                $exam->delete();
            }

            // Delete posts and answers
            Post::where('course_id', $course->id)->each(function ($post) {
                PostAnswer::where('post_id', $post->id)->delete();
            });
            Post::where('course_id', $course->id)->delete();

            $course->delete();
        }

        // Delete all join requests for this class
        JoinRequest::where('class_id', $class->id)->delete();

        // Delete the class itself
        $class->delete();
    }
}