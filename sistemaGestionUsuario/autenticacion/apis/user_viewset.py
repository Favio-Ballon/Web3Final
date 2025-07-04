from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User

from autenticacion.models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'first_name', 'last_name', 'username', 'is_staff', 'is_active', 'rol')

class UserViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

    @action(methods=['get'], detail=False, url_path='all')
    def get_all_users(self, request):
        if not request.user.is_superuser:
            return Response({'error': 'No tienes permiso para ver todos los usuarios'}, status=403)

        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    # now to create a user
    @action(methods=['post'], detail=False, url_path='create')
    def create_user(self, request):
        if not request.user.is_superuser:
            return Response({'error': 'No tienes permiso para crear usuarios'}, status=403)
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        username = request.data.get('username')
        rol = request.data.get(CustomUser.ROLE_CHOICES)

        if not email or not password or not username:
            return Response({'error': 'El email, contraseña y nombre de usuario son requeridos'}, status=400)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'El email ya está en uso'}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'El nombre de usuario ya está en uso'}, status=400)

        user = CustomUser.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            username=username,
            rol=rol
        )

        serializer = UserSerializer(user)
        return Response(serializer.data, status=201)  # Return created user data