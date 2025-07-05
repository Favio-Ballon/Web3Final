from django.urls import path, include
from rest_framework import routers
from autenticacion.apis.user_viewset import UserViewSet

router = routers.DefaultRouter()
router.register('info', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),

]