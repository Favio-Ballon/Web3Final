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

    @action(detail=False, methods=['post'], url_path='crear-mesas')
    def crear_mesas(self, request):
        # se espera un payload con recinto_id y cantidad_mesas
        recinto_id = request.data.get('recinto_id')
        try:
            cantidad_mesas = int(request.data.get('cantidad_mesas'))
        except (TypeError, ValueError):
            return Response(
                {"error": "cantidad_mesas debe ser un número válido"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not recinto_id or cantidad_mesas is None:
            return Response(
                {"error": "Debe enviar 'recinto_id' y 'cantidad_mesas'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            recinto = Recinto.objects.get(pk=recinto_id)
        except Recinto.DoesNotExist:
            return Response(
                {"error": "Recinto no encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )
        if cantidad_mesas < 1:
            return Response(
                {"error": "Debe haber al menos una mesa."},
                status=status.HTTP_400_BAD_REQUEST
            )
        mesas_creadas = []
        for num in range(1, cantidad_mesas + 1):
            mesa = Mesa.objects.create(
                recinto=recinto,
                numero=num,
                cantidad=0,  # inicialmente sin votantes
                eleccion=None  # se puede asignar después
            )
            mesas_creadas.append(mesa)
        data = MesaSerializer(mesas_creadas, many=True).data
        return Response(data, status=status.HTTP_201_CREATED)

    # get mesas por recinto
    @action(detail=False, methods=['get'], url_path='recinto/(?P<recinto_id>[^/.]+)')
    def get_mesas_por_recinto(self, request, recinto_id=None):
        if not recinto_id:
            return Response(
                {"error": "Debe enviar 'recinto_id'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            recinto = Recinto.objects.get(pk=recinto_id)
        except Recinto.DoesNotExist:
            return Response(
                {"error": "Recinto no encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )
        mesas = Mesa.objects.filter(recinto=recinto)
        serializer = self.get_serializer(mesas, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='asignar-jurado')
    def asignar_jurado(self, request):
        # payload esperado:mesaId, jefeId
        mesa_id = request.data.get('mesaId')
        jefe_id = request.data.get('jefeId')
        if not mesa_id or not jefe_id:
            return Response(
                {"error": "Debe enviar 'mesaId' y 'jefeId'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            mesa = Mesa.objects.get(pk=mesa_id)
        except Mesa.DoesNotExist:
            return Response(
                {"error": "Mesa no encontrada."},
                status=status.HTTP_404_NOT_FOUND
            )
        try:
            mesa.jefe_id = jefe_id
            mesa.save(update_fields=['jefe_id'])
            return Response(
                {"message": "Jefe de mesa asignado correctamente."},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": f"Error al asignar jefe de mesa: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'], url_path='asignar-eleccion')
    def asignar_eleccion(self, request):
        # payload esperado: seccionId, eleccionId
        seccion_id = request.data.get('seccionId')
        eleccion_id = request.data.get('eleccionId')
        
        # Validar que los IDs sean números válidos
        try:
            seccion_id = int(seccion_id)
            eleccion_id = int(eleccion_id)
        except (TypeError, ValueError):
            return Response(
                {"error": "seccionId y eleccionId deben ser números válidos"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not seccion_id or not eleccion_id:
            return Response(
                {"error": "Debe enviar 'seccionId' y 'eleccionId'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            recintos = Recinto.objects.filter(seccion_id=seccion_id)
            if not recintos.exists():
                return Response(
                    {"error": "No se encontraron recintos para la sección."},
                    status=status.HTTP_404_NOT_FOUND
                )
            eleccion = Eleccion.objects.get(pk=eleccion_id)
        except (Recinto.DoesNotExist, Eleccion.DoesNotExist) as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # El resto de la función sigue igual...
        mesas = Mesa.objects.filter(recinto__in=recintos, eleccion=None)
        if not mesas.exists():
            return Response(
                {"error": "No hay mesas disponibles para asignar a esta elección."},
                status=status.HTTP_404_NOT_FOUND
            )
        mesas.update(eleccion=eleccion)
        return Response(
            {"message": "Mesas asignadas a la elección correctamente."},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'], url_path='distribuir')
    def ditribuir(self, request):
        # payload esperado: seccionId, votantes
        seccion_id = request.data.get('seccionId')
        habilitados = request.data.get('votantes', [])
        if not seccion_id or not habilitados:
            return Response(
                {"error": "Debe enviar 'seccionId' y 'votantes'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            recintos = Recinto.objects.filter(seccion_id=seccion_id)
            if not recintos.exists():
                return Response(
                    {"error": "No se encontraron recintos para la sección."},
                    status=status.HTTP_404_NOT_FOUND
                )
            mesas = Mesa.objects.filter(recinto__in=recintos, eleccion=None)
            if not mesas.exists():
                return Response(
                    {"error": "No hay mesas disponibles para distribuir votantes."},
                    status=status.HTTP_404_NOT_FOUND
                )
            total_mesas = mesas.count()
            total_votantes = len(habilitados)
            if total_mesas < 1 or total_votantes < 1:
                return Response(
                    {"error": "Debe haber al menos una mesa y un votante."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            base = total_votantes // total_mesas
            extra = total_votantes % total_mesas
            tamanos = [base + (1 if i < extra else 0) for i in range(total_mesas)]
            cola = deque(habilitados)
            with transaction.atomic():
                # limpiar datos pasados
                Votante.objects.filter(mesa__in=mesas).delete()
                for mesa, cantidad in zip(mesas, tamanos):
                    mesa.cantidad = cantidad
                    mesa.save(update_fields=['cantidad'])
                    for _ in range(cantidad):
                        if cola:
                            vid = cola.popleft()  # obtiene un ID del listado de habilitados
                            Votante.objects.create(
                                eleccion=mesa.eleccion,  # se asignará después
                                votante_id=vid,  # aquí se guarda el ID que viene del otro backend
                                mesa=mesa
                            )
                # return no asignar jefe de mesa
                return Response(
                    {"message": "Votantes distribuidos correctamente."},
                    status=status.HTTP_200_OK
                )
        except Exception as e:
            return Response(
                {"error": f"Error al distribuir votantes: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )