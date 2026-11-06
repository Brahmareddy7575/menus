from rest_framework import serializers
from django.contrib.auth.models import User

# pyrefly: ignore [missing-import]
from .models import (
    Restaurant,
    Category,
    FoodItem,
    Cart,
    CartItem,
    Order,
    OrderItem
)


# =========================
# USER SERIALIZER
# =========================

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


# =========================
# RESTAURANT
# =========================

class RestaurantSerializer(serializers.ModelSerializer):
    food_count = serializers.SerializerMethodField()

    class Meta:
        model = Restaurant
        fields = ['id', 'owner', 'name', 'address', 'phone', 'image', 'is_open', 'food_count']

    def get_food_count(self, obj):
        return obj.food_items.filter(available=True).count()


# =========================
# CATEGORY
# =========================

class CategorySerializer(serializers.ModelSerializer):
    food_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'food_count']

    def get_food_count(self, obj):
        return obj.food_items.filter(available=True).count()


# =========================
# FOOD
# =========================

class FoodItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)

    class Meta:
        model = FoodItem
        fields = [
            'id',
            'restaurant',
            'restaurant_name',
            'category',
            'category_name',
            'name',
            'description',
            'price',
            'image',
            'available'
        ]


# =========================
# CART ITEM
# =========================

class CartItemSerializer(serializers.ModelSerializer):
    food_name = serializers.CharField(
        source='food.name',
        read_only=True
    )
    food_description = serializers.CharField(
        source='food.description',
        read_only=True
    )
    price = serializers.DecimalField(
        source='food.price',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    food_image = serializers.ImageField(
        source='food.image',
        read_only=True
    )
    restaurant_id = serializers.IntegerField(
        source='food.restaurant.id',
        read_only=True
    )
    restaurant_name = serializers.CharField(
        source='food.restaurant.name',
        read_only=True
    )
    category_name = serializers.CharField(
        source='food.category.name',
        read_only=True
    )
    total = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            'id',
            'food',
            'food_name',
            'food_description',
            'price',
            'food_image',
            'restaurant_id',
            'restaurant_name',
            'category_name',
            'quantity',
            'total'
        ]

    def get_total(self, obj):
        return obj.total_price()


# =========================
# CART
# =========================

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(
        many=True,
        read_only=True
    )
    total_amount = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            'id',
            'customer',
            'created_at',
            'items',
            'total_amount',
            'item_count'
        ]

    def get_total_amount(self, obj):
        return sum(item.total_price() for item in obj.items.all())

    def get_item_count(self, obj):
        return sum(item.quantity for item in obj.items.all())


# =========================
# ORDER ITEM
# =========================

class OrderItemSerializer(serializers.ModelSerializer):
    food_name = serializers.CharField(
        source='food.name',
        read_only=True
    )
    food_image = serializers.ImageField(
        source='food.image',
        read_only=True
    )
    total = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'food',
            'food_name',
            'food_image',
            'quantity',
            'price',
            'total'
        ]

    def get_total(self, obj):
        return obj.total_price()


# =========================
# ORDER
# =========================

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(
        many=True,
        read_only=True
    )
    restaurant_name = serializers.CharField(
        source='restaurant.name',
        read_only=True
    )

    class Meta:
        model = Order
        fields = [
            'id',
            'customer',
            'restaurant',
            'restaurant_name',
            'total_amount',
            'status',
            'delivery_address',
            'created_at',
            'items'
        ]