from rest_framework import serializers, viewsets
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions
from rest_framework.response import Response
from rest_framework.decorators import action
from eleccion.models import Recinto, Seccion
from eleccion.apis import SeccionSerializer

class RecintoSerializer(serializers.ModelSerializer):
    # lecturas salen anidadas
    seccion = SeccionSerializer(read_only=True)
    # escribe el id en la FK
    seccion_id = serializers.PrimaryKeyRelatedField(
        queryset=Seccion.objects.all(),
        source='seccion',  # apunta al atributo .seccion del modelo
        write_only=True
    )

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
