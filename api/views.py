from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q

from .models import (
    Restaurant,
    Category,
    FoodItem,
    Cart,
    CartItem,
    Order,
    OrderItem
)

from .serializers import (
    UserSerializer,
    RestaurantSerializer,
    CategorySerializer,
    FoodItemSerializer,
    CartSerializer,
    OrderSerializer
)


# =========================
# AUTHENTICATION APIS
# =========================

class RegisterAPI(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username", "").strip()
        email = request.data.get("email", "").strip()
        password = request.data.get("password", "")
        name = request.data.get("name", "").strip()

        if not username or not password:
            return Response(
                {"error": "Username and password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {"error": "A user with this username already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=name
        )

        refresh = RefreshToken.for_user(user)
        return Response({
            "message": "Registration successful",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "name": user.get_full_name() or user.username,
                "is_staff": user.is_staff
            }
        }, status=status.HTTP_201_CREATED)


class LoginAPI(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username", "").strip()
        password = request.data.get("password", "")

        if not username or not password:
            return Response(
                {"error": "Username and password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=username, password=password)
        if not user:
            return Response(
                {"error": "Invalid username or password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            "message": "Login successful",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "name": user.get_full_name() or user.username,
                "is_staff": user.is_staff
            }
        })


class UserProfileAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "name": user.get_full_name() or user.username,
            "is_staff": user.is_staff
        })


# =========================
# RESTAURANT API
# =========================

class RestaurantAPI(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        restaurants = Restaurant.objects.all()
        search = request.query_params.get("search", "").strip()

        if search:
            restaurants = restaurants.filter(
                Q(name__icontains=search) | Q(address__icontains=search)
            )

        serializer = RestaurantSerializer(restaurants, many=True)
        return Response(serializer.data)


# =========================
# CATEGORY API
# =========================

class CategoryAPI(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)


# =========================
# FOOD API
# =========================

class FoodAPI(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        foods = FoodItem.objects.filter(available=True)

        category_id = request.query_params.get("category")
        restaurant_id = request.query_params.get("restaurant")
        search = request.query_params.get("search", "").strip()

        if category_id:
            foods = foods.filter(category_id=category_id)

        if restaurant_id:
            foods = foods.filter(restaurant_id=restaurant_id)

        if search:
            foods = foods.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(category__name__icontains=search)
            )

        serializer = FoodItemSerializer(foods, many=True)
        return Response(serializer.data)


# =========================
# CART API
# =========================

class CartAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(customer=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def delete(self, request):
        cart, _ = Cart.objects.get_or_create(customer=request.user)
        cart.items.all().delete()
        serializer = CartSerializer(cart)
        return Response({
            "message": "Cart cleared successfully",
            "cart": serializer.data
        })


# =========================
# ADD TO CART API
# =========================

class AddToCartAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        food_id = request.data.get("food")
        quantity = int(request.data.get("quantity", 1))

        if not food_id:
            return Response(
                {"error": "Food item ID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            food = FoodItem.objects.get(id=food_id)
        except FoodItem.DoesNotExist:
            return Response(
                {"error": "Food item not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        cart, _ = Cart.objects.get_or_create(customer=request.user)
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            food=food
        )

        if not created:
            cart_item.quantity += quantity
        else:
            cart_item.quantity = max(1, quantity)

        cart_item.save()

        cart_serializer = CartSerializer(cart)
        return Response(
            {
                "message": f"{food.name} added to cart",
                "cart_item_id": cart_item.id,
                "food": food.name,
                "quantity": cart_item.quantity,
                "cart": cart_serializer.data
            },
            status=status.HTTP_201_CREATED
        )


# =========================
# UPDATE CART ITEM API
# =========================

class UpdateCartItemAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart_item_id = request.data.get("cart_item_id")
        food_id = request.data.get("food_id")
        quantity = int(request.data.get("quantity", 1))

        cart, _ = Cart.objects.get_or_create(customer=request.user)

        cart_item = None
        if cart_item_id:
            cart_item = CartItem.objects.filter(cart=cart, id=cart_item_id).first()
        elif food_id:
            cart_item = CartItem.objects.filter(cart=cart, food_id=food_id).first()

        if not cart_item:
            return Response(
                {"error": "Cart item not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if quantity <= 0:
            cart_item.delete()
        else:
            cart_item.quantity = quantity
            cart_item.save()

        serializer = CartSerializer(cart)
        return Response({
            "message": "Cart updated",
            "cart": serializer.data
        })


# =========================
# REMOVE CART ITEM API
# =========================

class RemoveCartItemAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart_item_id = request.data.get("cart_item_id")
        food_id = request.data.get("food_id")

        cart, _ = Cart.objects.get_or_create(customer=request.user)

        if cart_item_id:
            CartItem.objects.filter(cart=cart, id=cart_item_id).delete()
        elif food_id:
            CartItem.objects.filter(cart=cart, food_id=food_id).delete()

        serializer = CartSerializer(cart)
        return Response({
            "message": "Item removed from cart",
            "cart": serializer.data
        })


# =========================
# CLEAR CART API
# =========================

class ClearCartAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(customer=request.user)
        cart.items.all().delete()
        serializer = CartSerializer(cart)
        return Response({
            "message": "Cart cleared",
            "cart": serializer.data
        })


# =========================
# ORDER API
# =========================

class OrderAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(
            customer=request.user
        ).order_by('-created_at')

        serializer = OrderSerializer(
            orders,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):
        restaurant_id = request.data.get("restaurant")
        address = request.data.get("delivery_address", "").strip()

        if not address:
            address = "Standard Delivery Address"

        cart, _ = Cart.objects.get_or_create(customer=request.user)
        cart_items = cart.items.all()

        if not cart_items.exists():
            return Response(
                {"error": "Your cart is empty. Add food items before placing an order."},
                status=status.HTTP_400_BAD_REQUEST
            )

        restaurant = None
        if restaurant_id:
            restaurant = Restaurant.objects.filter(id=restaurant_id).first()

        if not restaurant and cart_items.exists():
            restaurant = cart_items.first().food.restaurant

        if not restaurant:
            restaurant = Restaurant.objects.first()

        total = sum(item.total_price() for item in cart_items)

        order = Order.objects.create(
            customer=request.user,
            restaurant=restaurant,
            total_amount=total,
            status='PLACED',
            delivery_address=address
        )

        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                food=item.food,
                quantity=item.quantity,
                price=item.food.price
            )

        # Clear cart after successful order placement
        cart_items.delete()

        serializer = OrderSerializer(order)
        return Response(
            {
                "message": "Order placed successfully!",
                "order": serializer.data
            },
            status=status.HTTP_201_CREATED
        )