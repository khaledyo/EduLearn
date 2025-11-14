<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\ExamQuestion;
use Illuminate\Http\Request;

class ExamQuestionController extends Controller
{
    /**
     * List all questions for an exam.
     */
    public function index(Request $request, Exam $exam)
    {
        abort_unless($exam->course->teacher_id === $request->user()->id, 403);
        return $exam->questions;
    }

    /**
     * Add a question to an exam.
     */
    public function store(Request $request, Exam $exam)
    {
        abort_unless($exam->course->teacher_id === $request->user()->id, 403);

        $request->validate([
            'question'       => 'required|string',
            'correct_answer' => 'nullable|string', // Optional reference answer for teacher
        ]);

        return $exam->questions()->create($request->only(['question', 'correct_answer']));
    }

    /**
     * Update a question.
     */
    public function update(Request $request, Exam $exam, ExamQuestion $question)
    {
        abort_unless($exam->course->teacher_id === $request->user()->id, 403);

        // Check if exam has been passed by students - if so, don't allow editing questions
        if ($exam->results()->exists()) {
            abort(403, 'Cannot edit questions in exam that has been taken by students');
        }

        $request->validate([
            'question'       => 'required|string',
            'correct_answer' => 'nullable|string', // Optional reference answer for teacher
        ]);

        $question->update($request->only(['question', 'correct_answer']));

        return $question;
    }

    /**
     * Delete a question.
     */
    public function destroy(Request $request, Exam $exam, ExamQuestion $question)
    {
        abort_unless($exam->course->teacher_id === $request->user()->id, 403);

        // Check if exam has been passed by students - if so, don't allow deleting questions
        if ($exam->results()->exists()) {
            abort(403, 'Cannot delete questions from exam that has been taken by students');
        }

        $question->delete();

        return response()->noContent();
    }
}