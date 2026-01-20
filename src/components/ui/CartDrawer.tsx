"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { X, Minus, Plus, Trash2, ShoppingBag, Check, ExternalLink } from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";
import { useState } from "react";

// Common shoe sizes for dropdown
const AVAILABLE_SIZES = ['38', '39', '40', '41', '42', '43', '44', '45'];

export function CartDrawer() {
    const {
        items,
        removeItem,
        updateQuantity,
        updateSize,
        closeCart,
        isOpen,
        itemCount,
        selectedItems,
        toggleItemSelection,
        selectAllItems,
        clearSelection,
        isItemSelected,
        selectedTotal,
        getSelectedItems
    } = useCart();

    const [editingSize, setEditingSize] = useState<string | null>(null);

    if (!isOpen) return null;

    const selectedCount = selectedItems.size;
    const allSelected = items.length > 0 && selectedCount === items.length;

    const handleSelectAll = () => {
        if (allSelected) {
            clearSelection();
        } else {
            selectAllItems();
        }
    };

    const handleSizeChange = (productId: string, oldSize: string | undefined, newSize: string) => {
        if (newSize !== oldSize) {
            updateSize(productId, oldSize, newSize);
        }
        setEditingSize(null);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 z-50 transition-opacity"
                onClick={closeCart}
            />

            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-full max-w-md bg-dark border-l border-primary/20 z-50 flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-primary/20">
                    <h2 className="font-heading text-xl uppercase text-white flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-accent" /> Your Cart
                        <span className="text-accent">({itemCount})</span>
                    </h2>
                    <button onClick={closeCart} className="text-text-secondary hover:text-white transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Select All */}
                {items.length > 0 && (
                    <div className="px-4 py-2 border-b border-primary/20 flex items-center justify-between">
                        <button
                            onClick={handleSelectAll}
                            className="flex items-center gap-2 text-sm text-text-secondary hover:text-white transition-colors"
                        >
                            <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${allSelected
                                ? 'bg-accent border-accent'
                                : 'border-white/30 hover:border-white/50'
                                }`}>
                                {allSelected && <Check className="h-3 w-3 text-dark" />}
                            </div>
                            Pilih Semua ({items.length})
                        </button>
                        {selectedCount > 0 && (
                            <span className="text-accent text-sm font-bold">
                                {selectedCount} dipilih
                            </span>
                        )}
                    </div>
                )}

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingBag className="h-16 w-16 mx-auto text-primary/50 mb-4" />
                            <p className="text-text-secondary">Your cart is empty</p>
                            <Button variant="outline" className="mt-4" onClick={closeCart}>
                                Continue Shopping
                            </Button>
                        </div>
                    ) : (
                        items.map((item) => {
                            const isSelected = isItemSelected(item.id, item.size);
                            const itemKey = `${item.id}-${item.size}`;
                            const isEditingThisSize = editingSize === itemKey;

                            return (
                                <div
                                    key={itemKey}
                                    className={`flex gap-3 p-3 border rounded-lg transition-all ${isSelected
                                        ? 'bg-accent/10 border-accent/50'
                                        : 'bg-white/5 border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    {/* Checkbox */}
                                    <div
                                        onClick={() => toggleItemSelection(item.id, item.size)}
                                        className={`flex-shrink-0 w-5 h-5 border-2 rounded flex items-center justify-center transition-all mt-7 cursor-pointer ${isSelected
                                            ? 'bg-accent border-accent'
                                            : 'border-white/30 hover:border-white/50'
                                            }`}
                                    >
                                        {isSelected && <Check className="h-3 w-3 text-dark" />}
                                    </div>

                                    {/* Image with Link to Product */}
                                    <Link
                                        href={`/products/${item.id}`}
                                        onClick={closeCart}
                                        className="relative w-16 h-16 flex-shrink-0 bg-gray-800 rounded overflow-hidden group"
                                    >
                                        <NextImage src={item.image} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                            <ExternalLink className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </Link>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-accent uppercase font-bold">{item.brand}</p>
                                        {/* Product Name with Link */}
                                        <Link
                                            href={`/products/${item.id}`}
                                            onClick={closeCart}
                                            className="block"
                                        >
                                            <h4 className="text-white text-sm font-heading line-clamp-2 hover:text-accent transition-colors">
                                                {item.name}
                                            </h4>
                                        </Link>

                                        {/* Size - Editable */}
                                        {item.size && (
                                            <div className="mt-1">
                                                {isEditingThisSize ? (
                                                    <select
                                                        value={item.size}
                                                        onChange={(e) => handleSizeChange(item.id, item.size, e.target.value)}
                                                        onBlur={() => setEditingSize(null)}
                                                        autoFocus
                                                        className="bg-dark border border-accent text-white text-xs px-2 py-1 rounded focus:outline-none"
                                                    >
                                                        {AVAILABLE_SIZES.map(size => (
                                                            <option key={size} value={size}>{size}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <button
                                                        onClick={() => setEditingSize(itemKey)}
                                                        className="inline-block bg-white/10 hover:bg-accent/20 px-2 py-0.5 rounded text-[10px] font-bold text-white hover:text-accent transition-colors"
                                                    >
                                                        SIZE: {item.size} ▼
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        <p className="text-white font-numeric font-bold mt-1">Rp {item.price.toLocaleString("id-ID")}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col items-end justify-between">
                                        <button onClick={() => removeItem(item.id, item.size)} className="text-danger hover:text-danger/80">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                        <div className="flex items-center gap-2 border border-white/20 rounded">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)} className="p-1 text-text-secondary hover:text-white">
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="text-white text-sm font-numeric w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)} className="p-1 text-text-secondary hover:text-white">
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-4 border-t border-primary/20 space-y-4">
                        <div className="flex justify-between text-sm text-text-secondary">
                            <span>Item dipilih: {selectedCount}</span>
                        </div>
                        <div className="flex justify-between text-lg">
                            <span className="text-text-secondary font-heading uppercase">Total</span>
                            <span className="text-white font-numeric font-bold">
                                Rp {selectedTotal.toLocaleString("id-ID")}
                            </span>
                        </div>
                        <Link
                            href={selectedCount > 0 ? `/checkout?selected=${encodeURIComponent(JSON.stringify(getSelectedItems().map(i => ({ id: i.id, size: i.size }))))}` : '#'}
                            onClick={(e) => {
                                if (selectedCount === 0) {
                                    e.preventDefault();
                                    return;
                                }
                                closeCart();
                            }}
                        >
                            <Button
                                variant="neon"
                                className="w-full text-lg"
                                disabled={selectedCount === 0}
                            >
                                {selectedCount === 0 ? 'Pilih Item' : `Checkout (${selectedCount})`}
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
