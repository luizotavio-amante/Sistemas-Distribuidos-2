import { useEffect, useState } from "react";
import { ItemForm } from "./components/ItemForm";
import { ItemList } from "./components/ItemList";
import { createItem, listItems } from "./services/items";

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadItems() {
      try {
        setLoading(true);
        setError("");

        const data = await listItems();

        if (active) {
          setItems(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadItems();

    return () => {
      active = false;
    };
  }, []);

  async function addItem({ name, description }) {
    try {
      setSaving(true);
      setError("");

      const newItem = await createItem({
        name,
        description,
      });

      setItems((current) => [...current, newItem]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-xl space-y-6 p-4 sm:p-6">
      <h1 className="text-3xl font-bold">Gerenciador de Itens</h1>

      <ItemForm onAdd={addItem} />

      {saving && <p role="status">Salvando item...</p>}

      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}

      <section aria-labelledby="items-heading" className="space-y-3">
        <h2 id="items-heading" className="text-xl font-semibold">
          Itens cadastrados
        </h2>

        {loading ? (
          <p role="status">Carregando itens...</p>
        ) : (
          <ItemList items={items} />
        )}
      </section>
    </main>
  );
}
