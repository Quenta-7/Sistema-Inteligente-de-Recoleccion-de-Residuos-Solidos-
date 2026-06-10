from django.shortcuts import render
from django.http import JsonResponse


def simple(request):
    return render(request, 'simple.html', {})

def dinamico(request, name):
    categories = ['Python', 'Django', 'JavaScript', 'React']
    context = {'name': name, 'categories': categories}
    return render(request, 'dinamico.html', context)

def saludo_api(request):
    data = {'message': '¡Hola desde la API!',
            'estado': 'success'}
    return JsonResponse(data)