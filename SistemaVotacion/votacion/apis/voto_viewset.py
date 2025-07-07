from rest_framework import serializers, viewsets, status
from votacion.models import Voto
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Count


class VotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voto
        fields = '__all__'

class VotoViewSet(viewsets.ModelViewSet):
    # permission_classes = [IsAuthenticated, DjangoModelPermissions]
    queryset = Voto.objects.all()
    serializer_class = VotoSerializer

    @action(detail=False, methods=['get'], url_path='eleccion/(?P<eleccion_id>[^/.]+)/votante/(?P<votante_id>[^/.]+)')
    def get_cantidad_votos_eleccion (self, request, eleccion_id=None, votante_id=None):
        votos = self.queryset.filter(eleccion_id=eleccion_id, votante_id=votante_id)
        cantidad_votos = votos.count()
        return Response({'cantidad_votos': cantidad_votos}, status=200)

    @action(detail=False, methods=['get'], url_path='candidatura/(?P<candidatura_id>[^/.]+)')
    def get_cantidad_votos_candidatura(self, request, candidatura_id=None):
        votos = self.queryset.filter(candidatura_id=candidatura_id)
        cantidad_votos = votos.count()
        return Response({'cantidad_votos': cantidad_votos}, status=200)

    @action(detail=False, methods=['get'], url_path='cargo/(?P<cargo_id>\d+)/eleccion/(?P<eleccion_id>\d+)/candidaturas')
    def votos_por_candidaturas(self, request, cargo_id=None, eleccion_id=None):
        qs = (
            Voto.objects
            .filter(cargo_id=cargo_id, eleccion_id=eleccion_id)
            .values('candidatura_id')
            .annotate(cantidad=Count('id'))
            .order_by('-cantidad')
        )
        return Response(qs, status=status.HTTP_200_OK)