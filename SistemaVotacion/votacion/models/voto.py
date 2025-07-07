from django.db import models

class Voto(models.Model):
    mesa_id = models.IntegerField()
    votante_id = models.IntegerField()
    candidatura_id = models.IntegerField()
    eleccion_id = models.IntegerField()
    cargo_id = models.IntegerField( null=True, blank=True)

    def __str__(self):
        return f"Voto: Mesa {self.mesa_id}, Votante {self.votante_id}, Candidatura {self.candidatura_id}, Elección {self.eleccion_id}"