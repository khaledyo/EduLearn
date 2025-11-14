<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /* 1.  users  (base table) */
        Schema::create('users', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('email')->unique();
            $t->string('password');
            $t->enum('role', ['admin', 'teacher', 'student'])->default('student');
            $t->timestamps();
        });

        /* 2.  classes  (owned by teacher) */
        Schema::create('classes', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->text('description')->nullable();
            $t->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $t->timestamps();
        });

        /* 3.  class_student  (pivot) */
        Schema::create('class_student', function (Blueprint $t) {
            $t->id();
            $t->foreignId('class_id')->constrained()->cascadeOnDelete();
            $t->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $t->timestamps();
            $t->unique(['class_id', 'student_id']); // one enrolment per student
        });

        /* 4.  join_requests */
        Schema::create('join_requests', function (Blueprint $t) {
            $t->id();
            $t->foreignId('class_id')->constrained()->cascadeOnDelete();
            $t->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $t->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
            $t->timestamps();
            $t->unique(['class_id', 'student_id']); // only one request per student per class
        });

        /* 5.  courses  (public or class-private) */
        Schema::create('courses', function (Blueprint $t) {
            $t->id();
            $t->string('title');
            $t->text('description')->nullable();
            $t->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $t->foreignId('class_id')->nullable()->constrained()->nullOnDelete();
            $t->boolean('is_public')->default(true);
            $t->timestamps();
        });

        /* 6.  course_resources */
        Schema::create('course_resources', function (Blueprint $t) {
            $t->id();
            $t->foreignId('course_id')->constrained()->cascadeOnDelete();
            $t->string('type'); // pdf, image, video …
            $t->string('path'); // url or storage path
            $t->timestamps();
        });

        /* 7.  quizzes */
        Schema::create('quizzes', function (Blueprint $t) {
            $t->id();
            $t->string('title');
            $t->foreignId('course_id')->constrained()->cascadeOnDelete();
            $t->timestamps();
        });

        /* 8.  quiz_questions */
        Schema::create('quiz_questions', function (Blueprint $t) {
            $t->id();
            $t->foreignId('quiz_id')->constrained()->cascadeOnDelete();
            $t->text('question');
            $t->string('option_a');
            $t->string('option_b');
            $t->string('option_c');
            $t->string('option_d');
            $t->string('correct_option'); // a, b, c or d
            $t->timestamps();
        });

        /* 9.  exams */
        Schema::create('exams', function (Blueprint $t) {
            $t->id();
            $t->string('title');
            $t->foreignId('course_id')->constrained()->cascadeOnDelete();
            $t->timestamps();
        });

        /* 10.  exam_questions */
        Schema::create('exam_questions', function (Blueprint $t) {
            $t->id();
            $t->foreignId('exam_id')->constrained()->cascadeOnDelete();
            $t->text('question');
            $t->string('correct_answer');
            $t->timestamps();
        });

        /* 11.  quiz_results  (optional but usually needed) */
        Schema::create('quiz_results', function (Blueprint $t) {
            $t->id();
            $t->foreignId('quiz_id')->constrained()->cascadeOnDelete();
            $t->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $t->float('score');
            $t->timestamps();
            $t->unique(['quiz_id', 'student_id']); // one result per student
        });

        /* 12.  exam_results  (optional but usually needed) */
        Schema::create('exam_results', function (Blueprint $t) {
            $t->id();
            $t->foreignId('exam_id')->constrained()->cascadeOnDelete();
            $t->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $t->float('score');
            $t->timestamps();
            $t->unique(['exam_id', 'student_id']);
        });
    }

    public function down(): void
    {
        /* drop in reverse order to satisfy FK constraints */
        Schema::dropIfExists('exam_results');
        Schema::dropIfExists('quiz_results');
        Schema::dropIfExists('exam_questions');
        Schema::dropIfExists('exams');
        Schema::dropIfExists('quiz_questions');
        Schema::dropIfExists('quizzes');
        Schema::dropIfExists('course_resources');
        Schema::dropIfExists('courses');
        Schema::dropIfExists('join_requests');
        Schema::dropIfExists('class_student');
        Schema::dropIfExists('classes');
        Schema::dropIfExists('users');
    }
};