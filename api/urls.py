# -*- coding: utf-8 -*-
from django.views.generic import TemplateView

import api

__author__ = 'mateuszdargacz@gmail.com'
__date__ = '4/21/16 / 9:40 PM'
__git__ = 'https://github.com/mateuszdargacz'


from django.conf.urls import include, url
from django.contrib import admin

urlpatterns = [
    url(r'^get_address/(?P<code>\d{2}-\d{3})/', 'api.views.get_address', name='get_address'),

]
