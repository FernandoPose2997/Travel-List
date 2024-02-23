import { useState, useEffect } from "react";
import { openDB } from "idb";
import Logo from "./Logo";
import Form from "./Form";
import PackingList from "./PackingList";
import Stats from "./Stats";

export default function App() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchDataFromIndexedDB = async () => {
      const db = await openDB("packingListDB", 1, {
        upgrade(db) {
          db.createObjectStore("items", { keyPath: "id" });
        },
      });
      const itemsData = await db.getAll("items");
      setItems(itemsData);
    };
    fetchDataFromIndexedDB();
  }, []);

  async function handleAddItems(item) {
    const db = await openDB("packingListDB", 1);
    await db.add("items", item);
    setItems([...items, item]);
  }

  function handleDeleteItem(id) {
    setItems((items) => items.filter((item) => item.id !== id));
  }

  function handleCheckItem(id) {
    setItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, packed: !item.packed } : item
      )
    );
  }

  function handleClearList() {
    const confirmed = window.confirm(
      "Are you sure you want to delete all items?"
    );
    if (confirmed) {
      setItems([]);
      indexedDB.deleteDatabase("packingListDB");
    }
  }

  return (
    <div className="app">
      <Logo />
      <Form onAddItems={handleAddItems} />
      <PackingList
        items={items}
        onDeleteItem={handleDeleteItem}
        onCheckItems={handleCheckItem}
        onClearList={handleClearList}
      />
      <Stats items={items} />
    </div>
  );
}

export function Item({ item, onDeleteItem, onCheckItems }) {
  return (
    <li>
      <input
        type="checkbox"
        value={item.packed}
        onChange={() => onCheckItems(item.id)}
      ></input>
      <span style={item.packed ? { textDecoration: "line-through" } : {}}>
        {item.quantity}
        {item.description}
      </span>
      <button onClick={() => onDeleteItem(item.id)}>❌</button>
    </li>
  );
}
