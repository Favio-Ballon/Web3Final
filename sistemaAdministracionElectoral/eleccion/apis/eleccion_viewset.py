from rest_framework import serializers, viewsets
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions
from rest_framework.response import Response
from rest_framework.decorators import action
from eleccion.models import Eleccion, Seccion
from eleccion.apis import SeccionSerializer

class EleccionSerializer(serializers.ModelSerializer):
    # lecturas salen anidadas
    seccion = SeccionSerializer(read_only=True)
    # escribe el id en la FK
    seccion_id = serializers.PrimaryKeyRelatedField(
        queryset=Seccion.objects.all(),
        source='seccion',  # apunta al atributo .seccion del modelo
        write_only=True
    )
    class Meta:
        model = Eleccion
        fields = '__all__'



class EleccionViewSet(viewsets.ModelViewSet):
    # permission_classes = [IsAuthenticated]
    queryset = Eleccion.objects.all()
    serializer_class = EleccionSerializer

