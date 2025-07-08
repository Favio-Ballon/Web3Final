from django.urls import path, include
from rest_framework import routers

from eleccion.apis import PuntoViewSet, SeccionViewSet, EleccionViewSet, RecintoViewSet, MesaViewSet, CargoViewSet, CandidaturaViewSet, VotanteViewSet

router = routers.DefaultRouter()
router.register('puntos', PuntoViewSet)
router.register('secciones', SeccionViewSet)
router.register('elecciones', EleccionViewSet)
router.register('recintos', RecintoViewSet)
router.register('mesas', MesaViewSet)
router.register('cargos', CargoViewSet)
router.register('candidaturas', CandidaturaViewSet)
router.register('votantes', VotanteViewSet)
urlpatterns = [
    path('', include(router.urls)),
]