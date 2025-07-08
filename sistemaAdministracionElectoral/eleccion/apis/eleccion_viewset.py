from rest_framework import serializers, viewsets
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions
from rest_framework.response import Response
from rest_framework.decorators import action
from eleccion.models import Eleccion

class EleccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Eleccion
        fields = '__all__'


class EleccionViewSet(viewsets.ModelViewSet):
    # permission_classes = [IsAuthenticated]
    queryset = Eleccion.objects.all()
    serializer_class = EleccionSerializer
