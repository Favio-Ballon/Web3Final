from rest_framework import serializers, viewsets
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions
from rest_framework.response import Response
from rest_framework.decorators import action
from eleccion.models import Seccion, Punto


class SeccionSerializer(serializers.ModelSerializer):
    puntos = serializers.SerializerMethodField()

    class Meta:
        model  = Seccion
        # Incluye 'puntos' junto con los demás campos
        fields = ('id', 'nombre', 'puntos')

    def get_puntos(self, obj):
        return [
            {'latitud': p.latitud, 'longitud': p.longitud}
            for p in obj.puntos.all()
        ]


class SeccionViewSet(viewsets.ModelViewSet):
    #permission_classes = [IsAuthenticated]
    queryset = Seccion.objects.all()
    serializer_class = SeccionSerializer

    @action(detail=False, methods=['post'], url_path='crear')
    def crear_seccion_con_puntos(self, request):
        nombre = request.data.get('nombre')
        tipo = request.data.get('tipo')
        if not nombre:
            return Response({'error': 'El campo nombre es obligatorio'}, status=400)

        seccion = Seccion.objects.create(nombre=nombre, tipo=tipo)

        for punto in request.data.get('puntos', []):
            Punto.objects.create(
                seccion=seccion,
                latitud=punto.get('latitud'),
                longitud=punto.get('longitud'),
            )

        return Response(SeccionSerializer(seccion).data)
