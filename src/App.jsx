import { useState } from "react";
import {
  BarcodeDetector,
  ZXING_WASM_VERSION,
  prepareZXingModule,
} from "barcode-detector/ponyfill";

prepareZXingModule({
  overrides: {
    locateFile: (path, prefix) => {
      if (path.endsWith(".wasm")) {
        return `https://unpkg.com/zxing-wasm@${ZXING_WASM_VERSION}/dist/reader/${path}`;
      }
      return prefix + path;
    },
  },
});

const barcodeDetector = new BarcodeDetector({
  formats: ["ean_13", "code_128", "upc_a", "upc_e"],
});

export default function App() {
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

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    barcodeDetector.detect(file).then((barcodes) => {
      console.log(barcodes);
      if (barcodes.length === 0) {
        return setForm({
          ...form,
          codigo: "000000000000",
        });
      }

      setForm({
        ...form,
        codigo: barcodes[0].rawValue,
      });
    });
  };

  return (
    <>
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
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhoto}
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
