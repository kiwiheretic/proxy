from django.shortcuts import render
from django.http import HttpResponse
import requests
import urllib

# Create your views here.
def index(request):
    if request.method == "POST":
        url = request.POST['url']
        r = requests.post('http://127.0.0.1:5001', data = {'url':url})
        print r.headers
        json = r.json()
        content = urllib.unquote(json['content'])
        return HttpResponse(content)
    else:
        return render(request, 'frontend/index.html')
