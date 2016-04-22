# -*- coding: utf-8 -*-
import csv
import os

from django.http import JsonResponse
from django.shortcuts import render_to_response

__author__ = 'mateuszdargacz@gmail.com'
__date__ = '4/21/16 / 9:40 PM'
__git__ = 'https://github.com/mateuszdargacz'




def get_address(request, code):
    context = {}
    with open(os.path.join(os.path.dirname(__file__),'kody.csv'), 'r', encoding='utf-8') as csvfile:
        for row in csv.reader(csvfile, delimiter=';', quotechar='"'):
            if code in row[0]:
                context.update(code=code, city=row[2], success=True)
                break
    if not context:
        context.update(success=False)

    return JsonResponse(context)