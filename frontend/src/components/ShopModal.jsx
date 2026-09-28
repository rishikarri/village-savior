const ITEMS = [
  {
    id: "health",
    buttonId: "health-potion-button",
    label: "Drink Health Potion",
    image: "/Images/health-potion.png",
    cost: 50,
    description: "Heals 3 HP!",
    action: "drinkHealthPotion",
  },
  {
    id: "fire",
    buttonId: "fire-arrows-button",
    label: "Upgrade to Flame Arrows",
    image: "/Images/fire-arrowUpgrade.png",
    cost: 300,
    description: "Ignites arrow tips on fire which deal more damage!",
    action: "giveHeroFireArrows",
    once: true,
  },
  {
    id: "speed",
    buttonId: "speed-potion-button",
    label: "Buy Speed Potion",
    image: "/Images/speed-potion.png",
    cost: 500,
    description: "Boost your speed!",
    action: "drinkSpeedPotion",
    once: true,
  },
  {
    id: "ninja",
    buttonId: "ninja-button",
    label: "Hire a Ninja",
    image: "/possible-enemies-allies/ninja2 store version.png",
    cost: 80,
    description: "Hire a Ninja who will loyally fight by your side until the end!",
    action: "hireNinja",
  },
];

export default function ShopModal({ open, onClose, snapshot, onBuy }) {
  if (!open) return null;

  const gold = snapshot?.gold ?? 0;
  const fireOwned = Boolean(snapshot?.fire_arrows);
  const speedOwned = snapshot?.speed > 1;

  return (
    <div id="modal-shop" className="modal-overlay" onClick={onClose}>
      <div className="modal-shop-content" onClick={(event) => event.stopPropagation()}>
        <span className="close-shop" role="button" aria-label="Close shop" onClick={onClose}>
          &times;
        </span>
        <p>
          Welcome to the Shop! Here we have help and supplies that should aid in
          your quest to protect the land!
        </p>

        <div id="shop-buttons">
          {ITEMS.map((item) => {
            const owned = (item.id === "fire" && fireOwned) || (item.id === "speed" && speedOwned);
            const disabled = owned || gold < item.cost;
            return (
              <div key={item.id} id={item.id === "health" ? "health-potion-div" : item.id === "fire" ? "fire-arrows-div" : undefined}>
                <button
                  id={item.buttonId}
                  disabled={disabled}
                  onClick={() => onBuy(item.action)}
                >
                  {item.label}
                </button>
                <img src={item.image} alt={item.label} />
                <p className="gold-text">{item.cost} gold</p>
                <p>{item.description}</p>
              </div>
            );
          })}
        </div>
        <p className="shop-notice">Gold on hand: {gold}</p>
      </div>
    </div>
  );
}
