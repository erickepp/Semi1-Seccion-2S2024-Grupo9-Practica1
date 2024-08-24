from config.db_config import db

class User(db.Model):
    __tablename__ = 'Usuario'

    user_id = db.Column('id_usuario', db.Integer, primary_key=True, autoincrement=True)
    first_name = db.Column('nombre', db.String(150), nullable=False)
    last_name = db.Column('apellidos', db.String(150), nullable=False)
    photo = db.Column('foto', db.Text, nullable=False)
    email = db.Column('correo', db.String(150), unique=True, nullable=False)
    password = db.Column('contra', db.Text, nullable=False)
    confirm_password = db.Column('confirmar_contra', db.Text, nullable=False)
    birth_date = db.Column('fecha_nacimiento', db.Date)

    def to_dict(self):
        return {
            'user_id': self.user_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'photo': self.photo,
            'email': self.email,
            'birth_date': self.birth_date.strftime('%Y-%m-%d') if self.birth_date else None
        }
