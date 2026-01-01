import { useState } from "react";
import BarcodeScanner from "react-qr-barcode-scanner";

const bb = {
  stroke: "#fff",
  lineWidth: 4,
  radii: 10,
  gap: 0.5,
  margin: 0.1,
};

export default function App() {
  const [data, setData] = useState();
  const [form, setForm] = useState({
    descripcion: "",
    codigo: "",
    hechoPor: "",
    superviso: "",
    piezas: "",
  });

  const [lista, setLista] = useState([]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const agregarItem = () => {
    if (!form.descripcion || !form.codigo) return;

    setLista([...lista, { ...form, id: Date.now() }]);

    setForm({
      descripcion: "",
      codigo: "",
      hechoPor: form.hechoPor,
      superviso: form.superviso,
      piezas: "",
    });
  };

  const eliminarItem = (id) => {
    setLista(lista.filter((item) => item.id !== id));
  };

  const limpiarLista = () => {
    setLista([]);
  };

  return (
    <>
      <div className="UTCScreen" style={{ display: "flex" }}>
        <BarcodeScanner
          formats={["UPC_A"]}
          onUpdate={(err, result) => {
            if (result) setData(result.text);
          }}
        />
        <div className="data">{data}</div>
      </div>
      <div style={{ padding: 20, fontFamily: "Arial" }}>
        <h2>Registro</h2>

        {/* FORMULARIO */}
        <div style={{ marginBottom: 20 }}>
          <input
            name="descripcion"
            placeholder="Descripción"
            value={form.descripcion}
            onChange={handleChange}
          />
          <br />

          <input
            name="codigo"
            type="number"
            placeholder="Código numérico"
            value={form.codigo}
            onChange={handleChange}
          />
          <br />

          <input
            name="hechoPor"
            placeholder="Hecho por"
            value={form.hechoPor}
            onChange={handleChange}
          />
          <br />

          <input
            name="superviso"
            placeholder="Supervisó"
            value={form.superviso}
            onChange={handleChange}
          />
          <br />

          <input
            name="piezas"
            type="number"
            placeholder="Piezas"
            value={form.piezas}
            onChange={handleChange}
          />
          <br />
          <br />

          <button onClick={agregarItem}>Agregar</button>
        </div>

        {/* LISTA */}
        <h3>Lista</h3>

        {lista.length === 0 && <p>No hay registros</p>}

        {lista.map((item) => (
          <div
            key={item.id}
            style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}
          >
            <p>
              <b>Descripción:</b> {item.descripcion}
            </p>
            <p>
              <b>Código:</b> {item.codigo}
            </p>
            <p>
              <b>Hecho por:</b> {item.hechoPor}
            </p>
            <p>
              <b>Supervisó:</b> {item.superviso}
            </p>
            <p>
              <b>Piezas:</b> {item.piezas}
            </p>

            <button onClick={() => eliminarItem(item.id)}>Eliminar</button>
          </div>
        ))}

        {/* ACCIONES */}
        {lista.length > 0 && (
          <>
            <button onClick={limpiarLista}>Borrar lista</button>{" "}
            <button onClick={() => window.print()}>Imprimir</button>
          </>
        )}
      </div>
    </>
  );
}
