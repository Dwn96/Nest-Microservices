class OrderItem {
    productId: string
    quantity: number
    price: number
}

class Customer {
    name: string;
    email: string;
    shippingAddress: string;
}

enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
}

export class CreateOrderDto {
    customer: Customer;
    items: OrderItem [];
    totalAmount: number;
    status: OrderStatus;
}
