from django.db import models

class Mesa(models.Model):
    jefe_id = models.IntegerField(null=True, blank=True)
    numero = models.IntegerField()
    cantidad = models.IntegerField(null=True, blank=True)
    recinto = models.ForeignKey(
        'eleccion.Recinto', on_delete=models.CASCADE, related_name='mesas'
    )
    eleccion = models.ForeignKey(
        'eleccion.Eleccion', on_delete=models.CASCADE, related_name='mesas'
    )

    class Meta:
        unique_together = ('numero', 'recinto', 'eleccion')

    def __str__(self):
        return f"Mesa {self.numero} - Recinto: {self.recinto.nombre} - Elección: {self.eleccion.nombre}"