<?php
namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\Course;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    public function index(Request $request)
    {
        $query = Quiz::with('course')->whereHas('course', fn($q) => $q->where('teacher_id', $request->user()->id));
        
        // Filter by course_id if provided
        if ($request->has('course_id')) {
            $query->where('course_id', $request->input('course_id'));
        }
        
        return $query->latest()->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'    => 'required|string|max:191',
            'course_id'=> 'required|exists:courses,id',
        ]);
        abort_unless(Course::find($request->input('course_id'))->teacher_id === $request->user()->id, 403);
        return Quiz::create($request->only(['title','course_id']));
    }

    public function show(Request $request, Quiz $quiz)
    {
        abort_unless($quiz->course->teacher_id === $request->user()->id, 403);
        return $quiz->load('questions');
    }

    public function update(Request $request, Quiz $quiz)
    {
        abort_unless($quiz->course->teacher_id === $request->user()->id, 403);
        $request->validate(['title' => 'required|string|max:191']);
        $quiz->update($request->only('title'));
        return $quiz;
    }

    public function destroy(Request $request, Quiz $quiz)
    {
        abort_unless($quiz->course->teacher_id === $request->user()->id, 403);
        $quiz->delete();
        return response()->noContent();
    }
}