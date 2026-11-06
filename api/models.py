from django.db import models
from django.contrib.auth.models import User


# =========================
# RESTAURANT
# =========================

class Restaurant(models.Model):

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='restaurants'
    )

    name = models.CharField(max_length=100)

    address = models.TextField()

    phone = models.CharField(max_length=15)

    image = models.ImageField(
        upload_to='restaurants/',
        null=True,
        blank=True
    )

    is_open = models.BooleanField(default=True)

    def __str__(self):
        return self.name


# =========================
# CATEGORY
# =========================

class Category(models.Model):

    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


# =========================
# FOOD ITEM
# =========================

class FoodItem(models.Model):

    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name='food_items'
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='food_items'
    )

    name = models.CharField(max_length=100)

    description = models.TextField()

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    image = models.ImageField(
        upload_to='food/',
        null=True,
        blank=True
    )

    available = models.BooleanField(default=True)

    def __str__(self):
        return self.name


# =========================
# CART
# =========================

class Cart(models.Model):

    customer = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='cart'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.customer.username}'s Cart"


# =========================
# CART ITEM
# =========================

class CartItem(models.Model):

    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items'
    )

    food = models.ForeignKey(
        FoodItem,
        on_delete=models.CASCADE
    )

    quantity = models.PositiveIntegerField(
        default=1
    )

    def total_price(self):
        return self.food.price * self.quantity


# =========================
# ORDER
# =========================

class Order(models.Model):

    STATUS_CHOICES = [
        ('PLACED', 'Placed'),
        ('ACCEPTED', 'Accepted'),
        ('PREPARING', 'Preparing'),
        ('OUT_FOR_DELIVERY', 'Out for Delivery'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
    ]

    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='orders'
    )

    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE
    )

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default='PLACED'
    )

    delivery_address = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"Order {self.id}"


# =========================
# ORDER ITEM
# =========================

class OrderItem(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )

    food = models.ForeignKey(
        FoodItem,
        on_delete=models.CASCADE
    )

    quantity = models.PositiveIntegerField()

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    def total_price(self):
        return self.price * self.quantity