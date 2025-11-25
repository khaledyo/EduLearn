<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
class RequireAdmin
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->user()->role !== 'admin') abort(403, 'Admin only');
        return $next($request);
    }
}