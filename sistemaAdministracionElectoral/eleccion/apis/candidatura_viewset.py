from rest_framework import serializers, viewsets, status
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import serializers
from eleccion.models import Candidatura, Cargo, Eleccion
from eleccion.apis.cargo_viewset import CargoSerializer
from eleccion.apis.eleccion_viewset import EleccionSerializer


class CandidaturaSerializer(serializers.ModelSerializer):
    # Para mostrar datos anidados de lectura
    cargo = CargoSerializer(read_only=True)
    eleccion = EleccionSerializer(read_only=True)

    # Para permitir elegirlos en el form
    cargo_id = serializers.PrimaryKeyRelatedField(
        queryset=Cargo.objects.all(),
        source='cargo'
    )
    eleccion_id = serializers.PrimaryKeyRelatedField(
        queryset=Eleccion.objects.all(),
        source='eleccion'
    )

    class Meta:
        model = Candidatura
        fields = (
            'id',
            'partido_politico',
            'sigla',
            'candidato_id',
            'color',
            'cargo',  # nested read-only
            'cargo_id',  # select para escritura
            'eleccion',  # nested read-only
            'eleccion_id'  # select para escritura
        )


class CandidaturaViewSet(viewsets.ModelViewSet):
    # permission_classes = [IsAuthenticated, DjangoModelPermissions]
    queryset = Candidatura.objects.all()
    serializer_class = CandidaturaSerializer

    @action(detail=False, methods=['get'], url_path='cargo/(?P<cargo_id>[^/.]+)/eleccion/(?P<eleccion_id>[^/.]+)')
    def get_papeleta_cargo_eleccion(self, request, cargo_id=None, eleccion_id=None):
        candidaturas = self.queryset.filter(cargo_id=cargo_id, eleccion_id=eleccion_id)
        serializer = self.get_serializer(candidaturas, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
