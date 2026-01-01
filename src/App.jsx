import { useState } from "react";
import { MyDocument } from "./pdf-template";
import { pdf } from "@react-pdf/renderer";

import JsBarcode from "jsbarcode";

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
  formats: ["upc_a", "ean_13", "code_128"],
});

export default function App() {
  const [form, setForm] = useState({
    descripcion: "",
    codigo: "",
    hechoPor: "",
    superviso: "",
    piezas: "",
    barcodeImg: null,
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
      barcodeImg: null,
    });
  };

  const eliminarItem = (id) => {
    setLista(lista.filter((item) => item.id !== id));
  };

  const limpiarLista = () => {
    setLista([]);
  };

  function generarBarcodeBlob(valor) {
    return new Promise((resolve, format) => {
      const canvas = document.createElement("canvas");

      JsBarcode(canvas, valor, {
        format: "CODE128",
        width: 2,
        height: 40,
        displayValue: false,
      });

      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/png");
    });
  }

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    console.log(file);
    if (!file) return;

    barcodeDetector.detect(file).then(async (barcodes) => {
      console.log(barcodes);

      if (barcodes.length === 0) {
        return setForm({
          ...form,
          codigo: "000000000000",
        });
      }

      const barcodeValue = barcodes[0].rawValue;
      const barcodeCleaned =
        String(barcodeValue)[0] === "0"
          ? String(barcodeValue).slice(1)
          : String(barcodeValue);

      const realFormat = barcodeCleaned.length === 12 ? "upc_a" : "ean_13";

      const barcodeImgBlob = await generarBarcodeBlob(
        String(barcodeCleaned),
        realFormat
      );

      const urlBarcode = URL.createObjectURL(barcodeImgBlob);

      console.log(barcodeImgBlob);
      console.log(urlBarcode);

      setForm({
        ...form,
        codigo: barcodeCleaned,
        barcodeImg: urlBarcode,
      });
    });
  };

  const generarPDF = async (items) => {
    const blob = await pdf(<MyDocument items={items} />).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "documento.pdf";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
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
      <h3>Lista - Marbetes: {lista.length}</h3>

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
          <button onClick={async () => generarPDF(lista)}>Imprimir</button>
        </>
      )}
    </div>
  );
}
