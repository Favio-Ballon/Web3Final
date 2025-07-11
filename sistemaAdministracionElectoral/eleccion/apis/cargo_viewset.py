from rest_framework import serializers, viewsets
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions
from rest_framework.response import Response
from eleccion.models import Cargo, Seccion
from eleccion.apis import SeccionSerializer

class CargoSerializer(serializers.ModelSerializer):
    # lecturas salen anidadas
    seccion = SeccionSerializer(read_only=True)
    # escribe el id en la FK
    seccion_id = serializers.PrimaryKeyRelatedField(
        queryset=Seccion.objects.all(),
        source='seccion',
        write_only=True
    )
    class Meta:
        model = Cargo
        fields = '__all__'

class CargoViewSet(viewsets.ModelViewSet):
    # permission_classes = [IsAuthenticated, DjangoModelPermissions]
    queryset = Cargo.objects.all()
    serializer_class = CargoSerializer
