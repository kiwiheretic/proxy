from django.shortcuts import render
from django.http import HttpResponse
import requests

# Create your views here.
def index(request):
    if request.method == "POST":
        url = request.POST['url']
        r = requests.post('http://127.0.0.1:5001', data = {'url':url})
        json = r.json()
        content = json['content']
        return HttpResponse(content)
    else:
        return render(request, 'frontend/index.html')
