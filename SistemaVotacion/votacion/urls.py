from django.urls import path, include
from rest_framework import routers

from votacion.apis import VotoViewSet

router = routers.DefaultRouter()
router.register('votos', VotoViewSet)
urlpatterns = [
    path('', include(router.urls)),
]