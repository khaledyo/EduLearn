<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\PostAnswer;

class PostController extends Controller
{
    // Student creates a post (question) for a course
    public function store(Request $request)
    {
        $request->validate([
            'course_id' => 'required|integer|exists:courses,id',
            'content' => 'required|string'
        ]);

        $post = Post::create([
            'course_id' => $request->input('course_id'),
            'student_id' => $request->user()->id,
            'content' => $request->input('content')
        ]);

        return response()->json($post->load('student'), 201);
    }

    // List posts by course with answers
    public function indexByCourse($courseId)
    {
        return Post::with(['student', 'answers.teacher'])->where('course_id', $courseId)->latest()->get();
    }

    // Teacher answers a post
    public function answer(Request $request, Post $post)
    {
        $request->validate(['content' => 'required|string']);

        $answer = PostAnswer::create([
            'post_id' => $post->id,
            'teacher_id' => $request->user()->id,
            'content' => $request->input('content')
        ]);

        return response()->json($answer->load('teacher'), 201);
    }
}
