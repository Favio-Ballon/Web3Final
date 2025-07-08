from collections import deque
from django.db import transaction
from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response

from eleccion.models import Mesa, Recinto, Eleccion, Votante


class MesaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mesa
        fields = '__all__'


class MesaViewSet(viewsets.ModelViewSet):
    # permission_classes = [IsAuthenticated, DjangoModelPermissions]
    queryset = Mesa.objects.all()
    serializer_class = MesaSerializer

    @action(detail=False, methods=['get'], url_path='recinto/(?P<recinto_id>[^/.]+)/eleccion/(?P<eleccion_id>[^/.]+)')
    def get_mesas_por_recinto_y_eleccion(self, request, recinto_id=None, eleccion_id=None):
        mesas = Mesa.objects.filter(recinto_id=recinto_id, eleccion_id=eleccion_id)
        serializer = self.get_serializer(mesas, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='crear-distribuir')
    def crear_y_distribuir(self, request):
        """
        LOGICA
        en el front, se creara una eleccion y se decidira que tipo es, esto para
        sacar a los habilitados, luego se obtiene los recintos y el numero de mesas
        a traves de un array de recintos y mesas,se intenta equilibrar y se reparten
        creando la tabla, posteirormente para cada mesa, se elige a un jefe
        Payload esperado:
        {
          "eleccion": <eleccion_id>,
          "recintos": [
            { "recinto": <recinto_id>, "mesas": <n_mesas> },
            ...
          ],
          "votantes": [<votante_id1>, <votante_id2>, ...]
        }

        """
        eleccion_id = request.data.get('eleccion')
        recintos = request.data.get('recintos', [])
        votantes = request.data.get('votantes', [])

        # Validaciones básicas
        if not eleccion_id or not recintos or not votantes:
            return Response(
                {"error": "Debe enviar 'eleccion', 'recintos' y 'votantes'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            eleccion = Eleccion.objects.get(pk=eleccion_id)
        except Eleccion.DoesNotExist:
            return Response({"error": "Elección no encontrada."},
                            status=status.HTTP_404_NOT_FOUND)

        total_votantes = len(votantes)
        total_mesas = sum(r.get('mesas', 0) for r in recintos)

        if total_mesas < 1:
            return Response({"error": "Debe haber al menos una mesa."},
                            status=status.HTTP_400_BAD_REQUEST)
        if total_mesas > total_votantes:
            return Response(
                {"error": "Más mesas que votantes. Ajusta los datos."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # cálculo equitativo
        base = total_votantes // total_mesas
        extra = total_votantes % total_mesas
        # lista de tamaños: primero `extra` mesas tienen base+1, el resto base
        tamanos = [base + (1 if i < extra else 0) for i in range(total_mesas)]

        # cola de votantes para asignar
        cola = deque(votantes)

        with transaction.atomic():
            # limpiar datos pasados
            Mesa.objects.filter(eleccion=eleccion).delete()
            Votante.objects.filter(eleccion=eleccion).delete()

            mesas_creadas = []
            idx = 0
            # 1) crear mesas con su cantidad
            for r in recintos:
                recinto_id = r['recinto']
                num_mesas = r['mesas']
                try:
                    recinto = Recinto.objects.get(pk=recinto_id)
                except Recinto.DoesNotExist:
                    transaction.set_rollback(True)
                    return Response(
                        {"error": f"Recinto {recinto_id} no existe."},
                        status=status.HTTP_404_NOT_FOUND
                    )
                for num in range(1, num_mesas + 1):
                    mesa = Mesa.objects.create(
                        eleccion=eleccion,
                        recinto=recinto,
                        numero=num,
                        cantidad=tamanos[idx]
                    )
                    mesas_creadas.append(mesa)
                    idx += 1

            # 2) repartir votantes
            for mesa in mesas_creadas:
                for _ in range(mesa.cantidad):
                    vid = cola.popleft()
                    Votante.objects.create(
                        eleccion=eleccion,
                        votante_id=vid,
                        mesa=mesa
                    )

            # 3) asignar jefe de mesa (primer votante)
            for mesa in mesas_creadas:
                primer = mesa.votantes.first()
                if primer:
                    # si quieres el ID del votante (persona), usa primer.votante_id
                    mesa.jefe_id = primer.votante_id
                    mesa.save(update_fields=['jefe_id'])

        # devolver las mesas creadas
        data = MesaSerializer(mesas_creadas, many=True).data
        return Response(data, status=status.HTTP_201_CREATED)
