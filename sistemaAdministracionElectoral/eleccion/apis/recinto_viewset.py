from rest_framework import serializers, viewsets
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions
from rest_framework.response import Response
from rest_framework.decorators import action
from eleccion.models import Recinto


class RecintoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recinto
        fields = '__all__'


class RecintoViewSet(viewsets.ModelViewSet):
    # permission_classes = [IsAuthenticated, DjangoModelPermissions]
    queryset = Recinto.objects.all()
    serializer_class = RecintoSerializer

    @action(detail=False, methods=['get'], url_path='seccion/(?P<seccion_id>[^/.]+)')
    # Esta es la lista usada para mostrar los recintos que quieres anadir a una eleccion

    def get_recintos_por_seccion(self, request, seccion_id=None):
        recintos = Recinto.objects.filter(seccion_id=seccion_id)
        serializer = self.get_serializer(recintos, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='eleccion/(?P<eleccion_id>[^/.]+)')
    def get_recintos_por_eleccion(self, request, eleccion_id=None):
        recintos = Recinto.objects.filter(eleccion_id=eleccion_id)
        serializer = self.get_serializer(recintos, many=True)
        return Response(serializer.data)
