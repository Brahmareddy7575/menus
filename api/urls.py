
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterAPI,
    LoginAPI,
    UserProfileAPI,
    RestaurantAPI,
    CategoryAPI,
    FoodAPI,
    CartAPI,
    AddToCartAPI,
    UpdateCartItemAPI,
    RemoveCartItemAPI,
    ClearCartAPI,
    OrderAPI
)

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', RegisterAPI.as_view(), name='auth_register'),
    path('auth/login/', LoginAPI.as_view(), name='auth_login'),
    path('auth/user/', UserProfileAPI.as_view(), name='auth_user'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Browsing endpoints
    path('restaurants/', RestaurantAPI.as_view(), name='restaurants'),
    path('categories/', CategoryAPI.as_view(), name='categories'),
    path('foods/', FoodAPI.as_view(), name='foods'),

    # Cart endpoints
    path('cart/', CartAPI.as_view(), name='cart'),
    path('cart/add/', AddToCartAPI.as_view(), name='cart_add'),
    path('cart/update/', UpdateCartItemAPI.as_view(), name='cart_update'),
    path('cart/remove/', RemoveCartItemAPI.as_view(), name='cart_remove'),
    path('cart/clear/', ClearCartAPI.as_view(), name='cart_clear'),

    # Orders endpoints
    path('orders/', OrderAPI.as_view(), name='orders'),
]