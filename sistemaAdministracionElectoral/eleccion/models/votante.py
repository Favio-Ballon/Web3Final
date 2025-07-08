from django.db import models

class Votante(models.Model):
    voto = models.BooleanField(default=False)
    votante_id = models.IntegerField()
    eleccion = models.ForeignKey(
        'eleccion.Eleccion', on_delete=models.CASCADE, related_name='votantes'
    )
    mesa = models.ForeignKey(
        'eleccion.Mesa', on_delete=models.CASCADE, related_name='votantes'
    )

    def __str__(self):
        return f"Votante ID: {self.votante_id} - Elección ID: {self.eleccion_id} - Mesa ID: {self.mesa_id} - Voto: {'Sí' if self.voto else 'No'}"

