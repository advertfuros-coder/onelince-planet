// Temporary Cart Debug Component
// Add this to your cart page to help debug and clear cart

export function CartDebugger() {
    const clearCart = () => {
        localStorage.removeItem('cart');
        window.location.reload();
    };

    const showCartData = () => {
        const cart = localStorage.getItem('cart');
        console.log('=== CART DATA ===');
        console.log('Raw:', cart);
        if (cart) {
            const parsed = JSON.parse(cart);
            console.log('Parsed:', parsed);
            parsed.forEach((item, index) => {
                console.log(`Item ${index}:`, {
                    name: item.name,
                    image: item.image,
                    price: item.price,
                    seller: item.seller
                });
            });
        }
    };

    return (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border-2 border-red-500 z-50">
            <h3 className="font-semibold text-red-600 mb-2">Debug Tools</h3>
            <div className="flex flex-col gap-2">
                <button
                    onClick={showCartData}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Show Cart Data
                </button>
                <button
                    onClick={clearCart}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Clear Cart & Reload
                </button>
            </div>
        </div>
    );
}

// To use: Add this to your cart page
// import { CartDebugger } from './CartDebugger'
// Then add <CartDebugger /> at the end of your return statement
