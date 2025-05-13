from django.shortcuts import redirect
from functools import wraps

def admin_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if request.user.is_authenticated and request.user.is_staff: 
            return view_func(request, *args, **kwargs)
        return redirect('adminlogin')
    return _wrapped_view
