<?php
namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizQuestion;
use Illuminate\Http\Request;

class QuizQuestionController extends Controller
{
    public function index(Request $request, Quiz $quiz)
    {
        abort_unless($quiz->course->teacher_id === $request->user()->id, 403);
        return $quiz->questions;
    }

    public function store(Request $request, Quiz $quiz)
    {
        abort_unless($quiz->course->teacher_id === $request->user()->id, 403);
        $request->validate([
            'question'       => 'required|string',
            'option_a'       => 'required|string',
            'option_b'       => 'required|string',
            'option_c'       => 'required|string',
            'option_d'       => 'required|string',
            'correct_option' => 'required|in:a,b,c,d',
        ]);
        return $quiz->questions()->create($request->all());
    }

    public function update(Request $request, Quiz $quiz, QuizQuestion $question)
    {
        abort_unless($quiz->course->teacher_id === $request->user()->id, 403);
        $question->update($request->all());
        return $question;
    }

    public function destroy(Request $request, Quiz $quiz, QuizQuestion $question)
    {
        abort_unless($quiz->course->teacher_id === $request->user()->id, 403);
        $question->delete();
        return response()->noContent();
    }
}