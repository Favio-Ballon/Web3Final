from rest_framework import serializers, viewsets
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions
from rest_framework.response import Response
from rest_framework.decorators import action
from eleccion.models import Votante


class VotanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Votante
        fields = '__all__'


class VotanteViewSet(viewsets.ModelViewSet):
    # permission_classes = [IsAuthenticated, DjangoModelPermissions]
    queryset = Votante.objects.all()
    serializer_class = VotanteSerializer
