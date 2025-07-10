from rest_framework import serializers, viewsets, status
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions
from rest_framework.response import Response
from rest_framework.decorators import action
import json
from eleccion.models import Seccion, Punto


class SeccionSerializer(serializers.ModelSerializer):
    puntos = serializers.SerializerMethodField()

    class Meta:
        model  = Seccion
        # Incluye 'puntos' junto con los demás campos
        fields = ('id', 'nombre','tipo', 'puntos')

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
        puntos_raw = request.data.get('puntos')

        if not nombre:
            return Response({'error': 'El campo nombre es obligatorio'}, status=400)
        if not tipo:
            return Response({'error': 'El campo tipo es obligatorio'}, status=400)
        if not puntos_raw:
            return Response({'error': 'Debe enviar puntos'}, status=400)

        # Si viniera como string JSON, parsealo
        if isinstance(puntos_raw, str):
            try:
                puntos_list = json.loads(puntos_raw)
            except json.JSONDecodeError:
                return Response({'error': 'puntos no es JSON válido'}, status=400)
        else:
            puntos_list = puntos_raw

        # Crea la sección
        seccion = Seccion.objects.create(nombre=nombre, tipo=tipo)

        # Recorre y crea cada Punto
        for idx, punto in enumerate(puntos_list):
            lat_s = str(punto.get('latitud', '')).replace(',', '.')
            lng_s = str(punto.get('longitud', '')).replace(',', '.')
            try:
                lat = float(lat_s)
                lng = float(lng_s)
            except ValueError:
                # si falla el parseo, borra la sección y aborta
                seccion.delete()
                return Response(
                    {'error': f'Coordenadas inválidas en el punto #{idx + 1}'},
                    status=400
                )
            Punto.objects.create(seccion=seccion, latitud=lat, longitud=lng)

        serializer = SeccionSerializer(seccion)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
