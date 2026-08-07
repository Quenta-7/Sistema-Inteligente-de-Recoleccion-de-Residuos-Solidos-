from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication


class SingleSessionJWTAuthentication(JWTAuthentication):
    """Acepta exclusivamente el JWT de la sesión más reciente del usuario."""

    def get_user(self, validated_token):
        user = super().get_user(validated_token)
        token_session = validated_token.get('sid')
        if not token_session or not user.active_session_id or token_session != user.active_session_id:
            raise AuthenticationFailed('La sesión fue reemplazada por un inicio de sesión en otro dispositivo.')
        return user
