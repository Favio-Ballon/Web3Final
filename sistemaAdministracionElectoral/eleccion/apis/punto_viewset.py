from rest_framework import serializers, viewsets
from eleccion.models import Punto

class PuntoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Punto
        fields = '__all__'

class PuntoViewSet(viewsets.ModelViewSet):
    # permission_classes = [IsAuthenticated]
    queryset = Punto.objects.all()
    serializer_class = PuntoSerializer
