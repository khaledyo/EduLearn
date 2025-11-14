<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
class RequireStudent
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->user()->role !== 'student') abort(403, 'Student only');
        return $next($request);
    }
}