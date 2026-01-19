import { Product } from "@/components/ui/product-card";

export const featuredProducts: Product[] = [
    {
        id: "1",
        name: "Phantom GX Elite FG - Neon Green",
        brand: "Nike",
        price: 3500000,
        originalPrice: 4200000,
        image: "/products/phantom_cleat_1768726433264.png",
        isNew: true
    },
    {
        id: "2",
        name: "Predator Accuracy.1 Low - Black/White",
        brand: "Adidas",
        price: 3200000,
        image: "/products/predator_cleat_1768726447576.png"
    },
    {
        id: "3",
        name: "Ultra Ultimate FG/AG - Electric Blue",
        brand: "Puma",
        price: 2800000,
        image: "/products/ultra_cleat_1768726464567.png",
        isNew: true
    },
    {
        id: "4",
        name: "Lightspeed Reborn - Red Blast",
        brand: "Specs",
        price: 599000,
        image: "/products/lightspeed_cleat_1768726502104.png"
    }
];

export const allProducts: Product[] = [
    ...featuredProducts,
    {
        id: "5",
        name: "Mercurial Vapor 15 Pro",
        brand: "Nike",
        price: 1800000,
        image: "/products/vapor.jpg"
    },
    {
        id: "6",
        name: "Copa Pure.3 TF",
        brand: "Adidas",
        price: 900000,
        image: "/products/copa.jpg"
    },
    {
        id: "7",
        name: "Top Sala Competition",
        brand: "Adidas",
        price: 1200000,
        image: "/products/topsala.jpg"
    },
    {
        id: "8",
        name: "React Gato - Orange",
        brand: "Nike",
        price: 1950000,
        originalPrice: 2300000,
        image: "/products/gato.jpg"
    }
];

export const userProfile = {
    name: "Andi Pratama",
    email: "andi@email.com",
    phone: "+62 812 3456 7890",
    address: "Jl. Sudirman No. 45, Jakarta Selatan, 12190"
};

// Order statuses in Indonesian
export type OrderStatus = "MENUNGGU_KONFIRMASI" | "DIKEMAS" | "DALAM_PENGIRIMAN" | "TELAH_TIBA" | "CANCELLED";

export interface Order {
    id: string;
    date: string;
    status: OrderStatus;
    total: number;
    items: Product[];
}

export const orders: Order[] = [
    {
        id: "ORD-2026-001",
        date: "2026-01-15",
        status: "DIKEMAS",
        total: 3500000,
        items: [featuredProducts[0]]
    },
    {
        id: "ORD-2026-002",
        date: "2026-01-16",
        status: "MENUNGGU_KONFIRMASI",
        total: 2800000,
        items: [featuredProducts[2]]
    },
    {
        id: "ORD-2025-089",
        date: "2025-12-20",
        status: "TELAH_TIBA",
        total: 1200000,
        items: [allProducts[5]]
    },
    {
        id: "ORD-2025-082",
        date: "2025-12-05",
        status: "DALAM_PENGIRIMAN",
        total: 1950000,
        items: [allProducts[7]]
    },
    {
        id: "ORD-2025-075",
        date: "2025-11-28",
        status: "CANCELLED",
        total: 599000,
        items: [featuredProducts[3]]
    }
];

// Status label mapping for display
export const statusLabels: Record<OrderStatus, string> = {
    "MENUNGGU_KONFIRMASI": "Menunggu Konfirmasi",
    "DIKEMAS": "Dikemas",
    "DALAM_PENGIRIMAN": "Dalam Pengiriman",
    "TELAH_TIBA": "Telah Tiba",
    "CANCELLED": "Cancelled"
};
